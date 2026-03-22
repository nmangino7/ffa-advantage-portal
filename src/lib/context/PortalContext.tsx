'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { contacts as seedContacts, campaigns as seedCampaigns, activities as seedActivities, ADVISORS as seedAdvisors, STORAGE_VERSION } from '@/lib/data/mock-data';
import { loadState, debouncedSave, clearAllData } from '@/lib/storage';
import type { Advisor, Contact, Campaign, Activity, PipelineStage, EmailStep } from '@/lib/types';

// ─── Storage keys ────────────────────────────────────────────
const KEYS = {
  contacts: 'ffa-contacts',
  campaigns: 'ffa-campaigns',
  activities: 'ffa-activities',
  customTemplates: 'ffa-custom-templates',
  version: 'ffa-storage-version',
} as const;

// ─── Portal summary type (for AI Copilot) ───────────────────
export interface PortalSummary {
  totalContacts: number;
  byStage: Record<string, number>;
  topContacts: Array<{
    name: string;
    intentScore: number;
    stage: string;
    company: string;
    daysSinceContact: number;
  }>;
  campaigns: Array<{
    name: string;
    enrolled: number;
    openRate: number;
    status: string;
  }>;
  recentActivity: Array<{
    contactName: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
  warmLeads: number;
}

// ─── Context type ────────────────────────────────────────────
interface PortalContextType {
  contacts: Contact[];
  campaigns: Campaign[];
  activities: Activity[];
  customTemplates: EmailStep[];
  advisors: Advisor[];
  isHydrated: boolean;
  getPortalSummary: () => PortalSummary;
  enrollContact: (contactId: string, campaignIds: string[]) => void;
  assignAdvisor: (contactId: string, advisorName: string) => void;
  getAdvisorByName: (name: string) => Advisor | undefined;
  scheduleCall: (contactId: string, date: string, time: string, notes: string) => void;
  addCampaign: (campaign: Campaign) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  duplicateCampaign: (id: string) => Campaign | null;
  toggleCampaignStatus: (campaignId: string) => void;
  importContacts: (newContacts: Contact[]) => void;
  moveContactStage: (contactId: string, newStage: PipelineStage) => void;
  addTemplate: (template: EmailStep) => void;
  updateTemplate: (id: string, updates: Partial<EmailStep>) => void;
  deleteTemplate: (id: string) => void;
  resetToDefaults: () => void;
}

const PortalContext = createContext<PortalContextType | null>(null);

export function usePortal() {
  const ctx = useContext(PortalContext);
  if (!ctx) throw new Error('usePortal must be used within PortalProvider');
  return ctx;
}

function makeId() {
  return `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Hydration: load from localStorage or seed from mock data ─
function hydrateState() {
  const savedVersion = loadState<number>(KEYS.version);

  // If version doesn't match (or doesn't exist), seed with mock data
  if (savedVersion !== STORAGE_VERSION) {
    return {
      contacts: [...seedContacts],
      campaigns: [...seedCampaigns],
      activities: [...seedActivities],
      customTemplates: [] as EmailStep[],
      needsSeed: true,
    };
  }

  return {
    contacts: loadState<Contact[]>(KEYS.contacts) ?? [...seedContacts],
    campaigns: loadState<Campaign[]>(KEYS.campaigns) ?? [...seedCampaigns],
    activities: loadState<Activity[]>(KEYS.activities) ?? [...seedActivities],
    customTemplates: loadState<EmailStep[]>(KEYS.customTemplates) ?? [],
    needsSeed: false,
  };
}

export function PortalProvider({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [customTemplates, setCustomTemplates] = useState<EmailStep[]>([]);

  // Track whether initial hydration has happened
  const didHydrate = useRef(false);

  // ─── Hydrate on mount ──────────────────────────────────────
  useEffect(() => {
    if (didHydrate.current) return;
    didHydrate.current = true;

    // Intentional: hydrating client state from localStorage on mount.
    // This is a standard pattern for client-side state hydration.
    /* eslint-disable react-hooks/set-state-in-effect */
    const state = hydrateState();
    setContacts(state.contacts);
    setCampaigns(state.campaigns);
    setActivities(state.activities);
    setCustomTemplates(state.customTemplates);

    // If fresh seed, persist immediately
    if (state.needsSeed) {
      debouncedSave(KEYS.contacts, state.contacts, 0);
      debouncedSave(KEYS.campaigns, state.campaigns, 0);
      debouncedSave(KEYS.activities, state.activities, 0);
      debouncedSave(KEYS.customTemplates, state.customTemplates, 0);
      debouncedSave(KEYS.version, STORAGE_VERSION, 0);
    }

    setIsHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // ─── Auto-save on state changes ────────────────────────────
  // Use a render counter to skip saving during the first render after hydration,
  // since the data was just loaded from localStorage and doesn't need re-saving.
  const renderCount = useRef(0);

  useEffect(() => {
    if (!isHydrated) return;
    // Skip the first render after hydration (render 0) — data was just loaded
    if (renderCount.current === 0) {
      renderCount.current = 1;
      return;
    }
    debouncedSave(KEYS.contacts, contacts);
  }, [contacts, isHydrated]);

  useEffect(() => {
    if (!isHydrated || renderCount.current === 0) return;
    debouncedSave(KEYS.campaigns, campaigns);
  }, [campaigns, isHydrated]);

  useEffect(() => {
    if (!isHydrated || renderCount.current === 0) return;
    debouncedSave(KEYS.activities, activities);
  }, [activities, isHydrated]);

  useEffect(() => {
    if (!isHydrated || renderCount.current === 0) return;
    debouncedSave(KEYS.customTemplates, customTemplates);
  }, [customTemplates, isHydrated]);

  // ─── Actions ───────────────────────────────────────────────

  const enrollContact = useCallback((contactId: string, campaignIds: string[]) => {
    setContacts(prev => prev.map(c => {
      if (c.id !== contactId) return c;
      const newCampaigns = [...new Set([...c.campaigns, ...campaignIds])];
      return {
        ...c,
        campaigns: newCampaigns,
        stage: c.stage === 'dormant' ? 'education' as PipelineStage : c.stage,
        lastContactDate: new Date().toISOString(),
      };
    }));

    setCampaigns(prev => prev.map(camp => {
      if (!campaignIds.includes(camp.id)) return camp;
      return { ...camp, enrolledCount: camp.enrolledCount + 1 };
    }));

    setContacts(prev => {
      const contact = prev.find(c => c.id === contactId);
      if (contact) {
        setCampaigns(campPrev => {
          const newActivities = campaignIds.map(campId => {
            const camp = campPrev.find(c => c.id === campId);
            return {
              id: makeId(),
              contactId,
              contactName: `${contact.firstName} ${contact.lastName}`,
              type: 'campaign_enrolled' as const,
              description: `${contact.firstName} ${contact.lastName} enrolled in ${camp?.name || 'campaign'}`,
              timestamp: new Date().toISOString(),
              campaignId: campId,
              campaignName: camp?.name,
            };
          });
          setActivities(actPrev => [...newActivities, ...actPrev]);
          return campPrev;
        });
      }
      return prev;
    });
  }, []);

  const getAdvisorByName = useCallback((name: string): Advisor | undefined => {
    return seedAdvisors.find(a => `${a.firstName} ${a.lastName}` === name);
  }, []);

  const assignAdvisor = useCallback((contactId: string, advisorName: string) => {
    const advisor = seedAdvisors.find(a => `${a.firstName} ${a.lastName}` === advisorName);
    const advisorEmail = advisor?.email || null;
    setContacts(prev => {
      const updated = prev.map(c =>
        c.id === contactId ? { ...c, assignedRep: advisorName, assignedRepEmail: advisorEmail } : c
      );
      const contact = updated.find(c => c.id === contactId);
      if (contact) {
        setActivities(actPrev => [{
          id: makeId(),
          contactId,
          contactName: `${contact.firstName} ${contact.lastName}`,
          type: 'note_added' as const,
          description: `${advisorName} assigned as advisor for ${contact.firstName} ${contact.lastName}`,
          timestamp: new Date().toISOString(),
        }, ...actPrev]);
      }
      return updated;
    });
  }, []);

  const scheduleCall = useCallback((contactId: string, date: string, time: string, notes: string) => {
    setContacts(prev => {
      const contact = prev.find(c => c.id === contactId);
      if (contact) {
        setActivities(actPrev => [{
          id: makeId(),
          contactId,
          contactName: `${contact.firstName} ${contact.lastName}`,
          type: 'appointment_scheduled' as const,
          description: `Call scheduled with ${contact.firstName} ${contact.lastName} on ${date} at ${time}${notes ? ` — ${notes}` : ''}`,
          timestamp: new Date().toISOString(),
        }, ...actPrev]);
      }
      return prev.map(c =>
        c.id === contactId ? { ...c, lastContactDate: new Date().toISOString() } : c
      );
    });
  }, []);

  const addCampaign = useCallback((campaign: Campaign) => {
    setCampaigns(prev => [...prev, campaign]);
  }, []);

  const updateCampaign = useCallback((id: string, updates: Partial<Campaign>) => {
    setCampaigns(prev => prev.map(c =>
      c.id === id ? { ...c, ...updates } : c
    ));
  }, []);

  const duplicateCampaign = useCallback((id: string): Campaign | null => {
    let newCampaign: Campaign | null = null;
    setCampaigns(prev => {
      const original = prev.find(c => c.id === id);
      if (!original) return prev;
      newCampaign = {
        ...original,
        id: `camp-${Date.now()}`,
        name: `${original.name} (Copy)`,
        status: 'draft',
        enrolledCount: 0,
        openRate: 0,
        clickRate: 0,
        intentSignals: 0,
        createdAt: new Date().toISOString(),
        emailSequence: original.emailSequence.map(e => ({
          ...e,
          id: `e-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        })),
      };
      return [...prev, newCampaign];
    });
    return newCampaign;
  }, []);

  const toggleCampaignStatus = useCallback((campaignId: string) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id !== campaignId) return c;
      return { ...c, status: c.status === 'active' ? 'paused' : 'active' };
    }));
  }, []);

  const importContacts = useCallback((newContacts: Contact[]) => {
    setContacts(prev => {
      const existingEmails = new Set(prev.map(c => c.email.toLowerCase()));
      const unique = newContacts.filter(c => !existingEmails.has(c.email.toLowerCase()));
      if (unique.length === 0) return prev;

      // Create activity records for each imported contact
      const importActivities: Activity[] = unique.map(c => ({
        id: makeId(),
        contactId: c.id,
        contactName: `${c.firstName} ${c.lastName}`,
        type: 'note_added' as const,
        description: 'Contact imported from CSV/Excel',
        timestamp: new Date().toISOString(),
      }));
      setActivities(actPrev => [...importActivities, ...actPrev]);

      return [...prev, ...unique];
    });
  }, []);

  const moveContactStage = useCallback((contactId: string, newStage: PipelineStage) => {
    setContacts(prev => {
      const updated = prev.map(c =>
        c.id === contactId ? { ...c, stage: newStage } : c
      );
      const contact = updated.find(c => c.id === contactId);
      if (contact) {
        setActivities(actPrev => [{
          id: makeId(),
          contactId,
          contactName: `${contact.firstName} ${contact.lastName}`,
          type: 'stage_changed' as const,
          description: `${contact.firstName} ${contact.lastName} moved to ${newStage}`,
          timestamp: new Date().toISOString(),
        }, ...actPrev]);
      }
      return updated;
    });
  }, []);

  const addTemplate = useCallback((template: EmailStep) => {
    setCustomTemplates(prev => [...prev, template]);
  }, []);

  const updateTemplate = useCallback((id: string, updates: Partial<EmailStep>) => {
    setCustomTemplates(prev => prev.map(t =>
      t.id === id ? { ...t, ...updates } : t
    ));
  }, []);

  const deleteTemplate = useCallback((id: string) => {
    setCustomTemplates(prev => prev.filter(t => t.id !== id));
  }, []);

  const getPortalSummary = useCallback((): PortalSummary => {
    const now = Date.now();
    const dayMs = 86_400_000;

    const byStage: Record<string, number> = {};
    for (const c of contacts) {
      byStage[c.stage] = (byStage[c.stage] || 0) + 1;
    }

    const topContacts = [...contacts]
      .sort((a, b) => b.intentScore - a.intentScore)
      .slice(0, 10)
      .map(c => ({
        name: `${c.firstName} ${c.lastName}`,
        intentScore: c.intentScore,
        stage: c.stage,
        company: c.company,
        daysSinceContact: Math.round((now - new Date(c.lastContactDate).getTime()) / dayMs),
      }));

    const campaignSummaries = campaigns.map(c => ({
      name: c.name,
      enrolled: c.enrolledCount,
      openRate: c.openRate,
      status: c.status,
    }));

    const recentActivity = activities.slice(0, 10).map(a => ({
      contactName: a.contactName,
      type: a.type,
      description: a.description,
      timestamp: a.timestamp,
    }));

    const warmLeads = contacts.filter(c =>
      c.intentScore >= 60 || c.stage === 'intent' || c.stage === 'qualified'
    ).length;

    return {
      totalContacts: contacts.length,
      byStage,
      topContacts,
      campaigns: campaignSummaries,
      recentActivity,
      warmLeads,
    };
  }, [contacts, campaigns, activities]);

  const resetToDefaults = useCallback(() => {
    clearAllData();
    setContacts([...seedContacts]);
    setCampaigns([...seedCampaigns]);
    setActivities([...seedActivities]);
    setCustomTemplates([]);
    debouncedSave(KEYS.contacts, [...seedContacts], 0);
    debouncedSave(KEYS.campaigns, [...seedCampaigns], 0);
    debouncedSave(KEYS.activities, [...seedActivities], 0);
    debouncedSave(KEYS.customTemplates, [], 0);
    debouncedSave(KEYS.version, STORAGE_VERSION, 0);
  }, []);

  return (
    <PortalContext.Provider value={{
      contacts, campaigns, activities, customTemplates, advisors: seedAdvisors, isHydrated,
      getPortalSummary, enrollContact, assignAdvisor, getAdvisorByName, scheduleCall,
      addCampaign, updateCampaign, duplicateCampaign, toggleCampaignStatus,
      importContacts, moveContactStage, addTemplate, updateTemplate, deleteTemplate,
      resetToDefaults,
    }}>
      {children}
    </PortalContext.Provider>
  );
}
