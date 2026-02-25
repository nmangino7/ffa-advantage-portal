import {
  Contact,
  Campaign,
  Activity,
  PipelineStage,
  ServiceLine,
  ActivityType,
  CampaignStatus,
} from '../types';

// Deterministic seed helpers
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seededRandom(42);

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function pickN<T>(arr: T[], min: number, max: number): T[] {
  const n = min + Math.floor(rand() * (max - min + 1));
  const shuffled = [...arr].sort(() => rand() - 0.5);
  return shuffled.slice(0, n);
}

function randomDate(startYear: number, endYear: number): string {
  const start = new Date(startYear, 0, 1).getTime();
  const end = new Date(endYear, 11, 31).getTime();
  const d = new Date(start + rand() * (end - start));
  return d.toISOString();
}

function recentDate(daysBack: number): string {
  const now = Date.now();
  const d = new Date(now - rand() * daysBack * 86400000);
  return d.toISOString();
}

// Name pools
const firstNames = [
  'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda',
  'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Lisa', 'Daniel', 'Nancy',
  'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
  'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
  'Kenneth', 'Carol', 'Kevin', 'Amanda', 'Brian', 'Dorothy', 'George', 'Melissa',
  'Timothy', 'Deborah', 'Ronald', 'Stephanie', 'Edward', 'Rebecca', 'Jason', 'Sharon',
  'Jeffrey', 'Laura', 'Ryan', 'Cynthia', 'Jacob', 'Kathleen', 'Gary', 'Amy',
  'Nicholas', 'Angela', 'Eric', 'Shirley', 'Jonathan', 'Anna', 'Stephen', 'Brenda',
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
  'Carter', 'Roberts', 'Phillips', 'Evans', 'Turner', 'Parker', 'Collins', 'Edwards',
];

const companies = [
  '', 'Self-Employed', 'Retired', 'ABC Manufacturing', 'Sunshine Realty',
  'Gulf Coast Builders', 'Palm Bay Medical', 'Atlantic Financial Group',
  'Coastal Engineering', 'Bay Area Consulting', 'Florida Tech Solutions',
  'Southern Hospitality Inc', 'Emerald Coast Properties', 'Pinnacle Services',
  'Horizon Healthcare', 'Liberty Construction', 'Trident Marine', 'Apex Industries',
  'Summit Partners', 'Heritage Homes', 'Catalyst Group',
];

const reps = [
  'Nick Mangino', 'Sarah Mitchell', 'David Torres', 'Jennifer Clark',
  'Michael Adams', 'Lisa Thompson', 'Robert Green', null,
];

const stages: PipelineStage[] = ['dormant', 'education', 'intent', 'qualified', 'licensed_rep'];
const stageWeights = [0.40, 0.25, 0.18, 0.10, 0.07];

function weightedStage(): PipelineStage {
  const r = rand();
  let cumulative = 0;
  for (let i = 0; i < stages.length; i++) {
    cumulative += stageWeights[i];
    if (r <= cumulative) return stages[i];
  }
  return 'dormant';
}

// Generate 200 contacts
export const contacts: Contact[] = Array.from({ length: 200 }, (_, i) => {
  const firstName = pick(firstNames);
  const lastName = pick(lastNames);
  const stage = weightedStage();
  const intentScore = stage === 'dormant' ? 0
    : stage === 'education' ? Math.floor(rand() * 30)
    : stage === 'intent' ? 30 + Math.floor(rand() * 40)
    : stage === 'qualified' ? 70 + Math.floor(rand() * 20)
    : 85 + Math.floor(rand() * 15);

  const campaignIds: string[] = stage === 'dormant'
    ? []
    : pickN(['camp-1', 'camp-2', 'camp-3', 'camp-4', 'camp-5'], 1, 3);

  return {
    id: `contact-${(i + 1).toString().padStart(3, '0')}`,
    firstName,
    lastName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(rand() * 99)}@${pick(['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com'])}`,
    phone: `(${Math.floor(200 + rand() * 800)}) ${Math.floor(200 + rand() * 800)}-${Math.floor(1000 + rand() * 9000)}`,
    company: pick(companies),
    lastContactDate: stage === 'dormant' ? randomDate(2019, 2023) : recentDate(180),
    stage,
    intentScore,
    campaigns: campaignIds,
    assignedRep: ['qualified', 'licensed_rep'].includes(stage) ? pick(reps.filter(Boolean) as string[]) : null,
    notes: stage === 'dormant'
      ? 'Initial consultation - no follow up'
      : stage === 'intent'
      ? 'Showing interest in educational content'
      : '',
    createdAt: randomDate(2018, 2023),
  };
});

// Generate 5 campaigns
const campaignDefs: { name: string; serviceLine: ServiceLine; description: string; status: CampaignStatus }[] = [
  {
    name: 'Insurance Portfolio Review',
    serviceLine: 'Insurance Review',
    description: 'Educational series on evaluating current insurance coverage, identifying gaps, and understanding policy options.',
    status: 'active',
  },
  {
    name: 'Annuity Optimization Insights',
    serviceLine: 'Under-Serviced Annuities',
    description: 'Content series helping contacts understand their existing annuity positions and potential optimization strategies.',
    status: 'active',
  },
  {
    name: 'Retirement Readiness Check',
    serviceLine: 'Retirement Planning',
    description: 'Educational campaign focused on retirement preparedness, income planning, and Social Security optimization.',
    status: 'active',
  },
  {
    name: 'Investment Planning Essentials',
    serviceLine: 'Investment Planning',
    description: 'Educational series on portfolio fundamentals, market perspectives, and long-term wealth building strategies.',
    status: 'active',
  },
  {
    name: 'Get a Second Opinion',
    serviceLine: 'Second-Opinion Positioning',
    description: 'Encouraging contacts to get an independent review of their current financial plan with no obligation.',
    status: 'draft',
  },
];

export const campaigns: Campaign[] = campaignDefs.map((def, i) => {
  const enrolled = contacts.filter(c => c.campaigns.includes(`camp-${i + 1}`)).length;
  return {
    id: `camp-${i + 1}`,
    name: def.name,
    serviceLine: def.serviceLine,
    description: def.description,
    status: def.status,
    emailSequence: [
      { id: `email-${i + 1}-1`, subject: `Introduction: ${def.name}`, sendDay: 0, status: 'active' as const },
      { id: `email-${i + 1}-2`, subject: `Key Insights: What You Should Know`, sendDay: 3, status: 'active' as const },
      { id: `email-${i + 1}-3`, subject: `Common Questions Answered`, sendDay: 7, status: 'active' as const },
      { id: `email-${i + 1}-4`, subject: `Ready to Learn More? Here's How`, sendDay: 14, status: 'active' as const },
    ],
    enrolledCount: enrolled,
    openRate: 15 + Math.floor(rand() * 35),
    clickRate: 3 + Math.floor(rand() * 15),
    intentSignals: Math.floor(enrolled * (0.05 + rand() * 0.15)),
    createdAt: randomDate(2024, 2025),
  };
});

// Generate activities
const activityTypes: { type: ActivityType; desc: (c: Contact, camp?: Campaign) => string }[] = [
  { type: 'email_sent', desc: (c, camp) => `Email sent to ${c.firstName} ${c.lastName}${camp ? ` (${camp.name})` : ''}` },
  { type: 'email_opened', desc: (c, camp) => `${c.firstName} ${c.lastName} opened email${camp ? ` from ${camp.name}` : ''}` },
  { type: 'email_clicked', desc: (c, camp) => `${c.firstName} ${c.lastName} clicked link${camp ? ` in ${camp.name}` : ''}` },
  { type: 'reply_received', desc: (c) => `Reply received from ${c.firstName} ${c.lastName}` },
  { type: 'info_requested', desc: (c) => `${c.firstName} ${c.lastName} requested more information` },
  { type: 'appointment_scheduled', desc: (c) => `Appointment scheduled with ${c.firstName} ${c.lastName}` },
  { type: 'campaign_enrolled', desc: (c, camp) => `${c.firstName} ${c.lastName} enrolled in ${camp?.name || 'campaign'}` },
];

export const activities: Activity[] = [];
let actId = 0;

for (const contact of contacts) {
  if (contact.stage === 'dormant') continue;

  const numActivities = 1 + Math.floor(rand() * 5);
  for (let j = 0; j < numActivities; j++) {
    const actDef = pick(activityTypes);
    const campId = contact.campaigns.length > 0 ? pick(contact.campaigns) : undefined;
    const camp = campId ? campaigns.find(c => c.id === campId) : undefined;

    activities.push({
      id: `act-${++actId}`,
      contactId: contact.id,
      contactName: `${contact.firstName} ${contact.lastName}`,
      type: actDef.type,
      description: actDef.desc(contact, camp),
      timestamp: recentDate(60),
      campaignId: campId,
      campaignName: camp?.name,
    });
  }
}

activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
