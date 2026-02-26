'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { contacts as initialContacts, campaigns as initialCampaigns, activities as initialActivities } from '@/lib/data/mock-data';
import type { Contact, Campaign, Activity, PipelineStage } from '@/lib/types';

interface PortalContextType {
  contacts: Contact[];
  campaigns: Campaign[];
  activities: Activity[];
  enrollContact: (contactId: string, campaignIds: string[]) => void;
  assignAdvisor: (contactId: string, advisorName: string) => void;
  scheduleCall: (contactId: string, date: string, time: string, notes: string) => void;
  addCampaign: (campaign: Campaign) => void;
  toggleCampaignStatus: (campaignId: string) => void;
  moveContactStage: (contactId: string, newStage: PipelineStage) => void;
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

export function PortalProvider({ children }: { children: ReactNode }) {
  const [contacts, setContacts] = useState<Contact[]>(() => [...initialContacts]);
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => [...initialCampaigns]);
  const [activities, setActivities] = useState<Activity[]>(() => [...initialActivities]);

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

    const contact = initialContacts.find(c => c.id === contactId) || contacts.find(c => c.id === contactId);
    if (contact) {
      const newActivities = campaignIds.map(campId => {
        const camp = campaigns.find(c => c.id === campId);
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
      setActivities(prev => [...newActivities, ...prev]);
    }
  }, [contacts, campaigns]);

  const assignAdvisor = useCallback((contactId: string, advisorName: string) => {
    setContacts(prev => prev.map(c =>
      c.id === contactId ? { ...c, assignedRep: advisorName } : c
    ));

    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
      setActivities(prev => [{
        id: makeId(),
        contactId,
        contactName: `${contact.firstName} ${contact.lastName}`,
        type: 'note_added' as const,
        description: `${advisorName} assigned as advisor for ${contact.firstName} ${contact.lastName}`,
        timestamp: new Date().toISOString(),
      }, ...prev]);
    }
  }, [contacts]);

  const scheduleCall = useCallback((contactId: string, date: string, time: string, notes: string) => {
    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
      setActivities(prev => [{
        id: makeId(),
        contactId,
        contactName: `${contact.firstName} ${contact.lastName}`,
        type: 'appointment_scheduled' as const,
        description: `Call scheduled with ${contact.firstName} ${contact.lastName} on ${date} at ${time}${notes ? ` — ${notes}` : ''}`,
        timestamp: new Date().toISOString(),
      }, ...prev]);

      setContacts(prev => prev.map(c =>
        c.id === contactId ? { ...c, lastContactDate: new Date().toISOString() } : c
      ));
    }
  }, [contacts]);

  const addCampaign = useCallback((campaign: Campaign) => {
    setCampaigns(prev => [...prev, campaign]);
  }, []);

  const toggleCampaignStatus = useCallback((campaignId: string) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id !== campaignId) return c;
      return { ...c, status: c.status === 'active' ? 'paused' : 'active' };
    }));
  }, []);

  const moveContactStage = useCallback((contactId: string, newStage: PipelineStage) => {
    setContacts(prev => prev.map(c =>
      c.id === contactId ? { ...c, stage: newStage } : c
    ));

    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
      setActivities(prev => [{
        id: makeId(),
        contactId,
        contactName: `${contact.firstName} ${contact.lastName}`,
        type: 'stage_changed' as const,
        description: `${contact.firstName} ${contact.lastName} moved to ${newStage}`,
        timestamp: new Date().toISOString(),
      }, ...prev]);
    }
  }, [contacts]);

  return (
    <PortalContext.Provider value={{
      contacts, campaigns, activities,
      enrollContact, assignAdvisor, scheduleCall,
      addCampaign, toggleCampaignStatus, moveContactStage,
    }}>
      {children}
    </PortalContext.Provider>
  );
}
