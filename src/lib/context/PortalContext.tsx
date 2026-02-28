'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { contacts as seedContacts, campaigns as seedCampaigns, activities as seedActivities, STORAGE_VERSION } from '@/lib/data/mock-data';
import { loadState, debouncedSave, clearAllData } from '@/lib/storage';
import type { Contact, Campaign, Activity, PipelineStage, EmailStep } from '@/lib/types';

// ─── Storage keys ────────────────────────────────────────────
const KEYS = {
  contacts: 'ffa-contacts',
  campaigns: 'ffa-campaigns',
  activities: 'ffa-activities',
  customTemplates: 'ffa-custom-templates',
  version: 'ffa-storage-version',
} as const;

// ─── Context type ────────────────────────────────────────────
interface PortalContextType {
  contacts: Contact[];
  campaigns: Campaign[];
  activities: Activity[];
  customTemplates: EmailStep[];
  isHydrated: boolean;
  enrollContact: (contactId: string, campaignIds: string[]) => void;
  assignAdvisor: (contactId: string, advisorName: string) => void;
  scheduleCall: (contactId: string, date: string, time: string, notes: string) => void;
  addCampaign: (campaign: Campaign) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  duplicateCampaign: (id: string) => Campaign | null;
  toggleCampaignStatus: (campaignId: string) => void;
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
  }, []);

  // ─── Auto-save on state changes ────────────────────────────
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!isHydrated) return;
    debouncedSave(KEYS.contacts, contacts);
  }, [contacts, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    debouncedSave(KEYS.campaigns, campaigns);
  }, [campaigns, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    debouncedSave(KEYS.activities, activities);
  }, [activities, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
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

  const assignAdvisor = useCallback((contactId: string, advisorName: string) => {
    setContacts(prev => {
      const updated = prev.map(c =>
        c.id === contactId ? { ...c, assignedRep: advisorName } : c
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
      contacts, campaigns, activities, customTemplates, isHydrated,
      enrollContact, assignAdvisor, scheduleCall,
      addCampaign, updateCampaign, duplicateCampaign, toggleCampaignStatus,
      moveContactStage, addTemplate, updateTemplate, deleteTemplate,
      resetToDefaults,
    }}>
      {children}
    </PortalContext.Provider>
  );
}
