import {
  Advisor,
  Contact,
  Campaign,
  Activity,
  PipelineStage,
  ServiceLine,
  ActivityType,
  CampaignStatus,
  EmailStep,
} from '../types';

// If this version changes, localStorage will be re-seeded with fresh mock data
export const STORAGE_VERSION = 2;

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

const firstNames = [
  'James','Mary','Robert','Patricia','John','Jennifer','Michael','Linda',
  'David','Elizabeth','William','Barbara','Richard','Susan','Joseph','Jessica',
  'Thomas','Sarah','Charles','Karen','Christopher','Lisa','Daniel','Nancy',
  'Matthew','Betty','Anthony','Margaret','Mark','Sandra','Donald','Ashley',
  'Steven','Kimberly','Paul','Emily','Andrew','Donna','Joshua','Michelle',
  'Kenneth','Carol','Kevin','Amanda','Brian','Dorothy','George','Melissa',
  'Timothy','Deborah','Ronald','Stephanie','Edward','Rebecca','Jason','Sharon',
  'Jeffrey','Laura','Ryan','Cynthia','Jacob','Kathleen','Gary','Amy',
  'Nicholas','Angela','Eric','Shirley','Jonathan','Anna','Stephen','Brenda',
];

const lastNames = [
  'Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis',
  'Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson',
  'Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson',
  'White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson','Walker',
  'Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores',
  'Green','Adams','Nelson','Baker','Hall','Rivera','Campbell','Mitchell',
  'Carter','Roberts','Phillips','Evans','Turner','Parker','Collins','Edwards',
];

const companies = [
  '','Self-Employed','Retired',
  'Pinnacle Wealth Management','Bayshore Medical Group','Coastal Real Estate Partners',
  'Metro Engineering Solutions','Suncoast Law Group','Premier Auto Dealerships',
  'Atlantic Construction Corp','Heritage Family Dental','Cornerstone Accounting',
  'Lakeside Hospitality Group','Meridian Tech Solutions','Gulf Coast Marine Services',
  'Evergreen Financial Partners','Brightstar Healthcare','Summit Property Management',
  'Ironbridge Manufacturing','Pacific Coast Ventures','Cardinal Education Group',
  'Bluewater Logistics','Redwood Capital Advisors',
];

const companyDomains: Record<string, string> = {
  'Pinnacle Wealth Management': 'pinnaclewm.com',
  'Bayshore Medical Group': 'bayshoremedical.com',
  'Coastal Real Estate Partners': 'coastalrep.com',
  'Metro Engineering Solutions': 'metroengsol.com',
  'Suncoast Law Group': 'suncoastlaw.com',
  'Premier Auto Dealerships': 'premierauto.com',
  'Atlantic Construction Corp': 'atlanticconstruction.com',
  'Heritage Family Dental': 'heritagedental.com',
  'Cornerstone Accounting': 'cornerstoneacct.com',
  'Lakeside Hospitality Group': 'lakesidehg.com',
  'Meridian Tech Solutions': 'meridiantech.com',
  'Gulf Coast Marine Services': 'gcmarine.com',
  'Evergreen Financial Partners': 'evergreenfinancial.com',
  'Brightstar Healthcare': 'brightstarhc.com',
  'Summit Property Management': 'summitproperty.com',
  'Ironbridge Manufacturing': 'ironbridgemfg.com',
  'Pacific Coast Ventures': 'pacificcoastventures.com',
  'Cardinal Education Group': 'cardinaledu.com',
  'Bluewater Logistics': 'bluewaterlogistics.com',
  'Redwood Capital Advisors': 'redwoodcapital.com',
};

const personalDomains = ['gmail.com','yahoo.com','outlook.com','hotmail.com','aol.com'];

export const ADVISORS: Advisor[] = [
  { id: 'adv-1', firstName: 'Nick', lastName: 'Mangino', email: 'nick.mangino@ffanorth.com', phone: '(561) 555-0101', title: 'Senior Financial Advisor', status: 'active', complianceApproved: true, assignedCount: 0 },
  { id: 'adv-2', firstName: 'Sarah', lastName: 'Mitchell', email: 'sarah.mitchell@ffanorth.com', phone: '(561) 555-0102', title: 'Financial Advisor', status: 'active', complianceApproved: true, assignedCount: 0 },
  { id: 'adv-3', firstName: 'David', lastName: 'Torres', email: 'david.torres@ffanorth.com', phone: '(561) 555-0103', title: 'Senior Financial Advisor', status: 'active', complianceApproved: true, assignedCount: 0 },
  { id: 'adv-4', firstName: 'Jennifer', lastName: 'Clark', email: 'jennifer.clark@ffanorth.com', phone: '(561) 555-0104', title: 'Financial Advisor', status: 'active', complianceApproved: true, assignedCount: 0 },
  { id: 'adv-5', firstName: 'Michael', lastName: 'Adams', email: 'michael.adams@ffanorth.com', phone: '(561) 555-0105', title: 'Wealth Management Advisor', status: 'active', complianceApproved: true, assignedCount: 0 },
  { id: 'adv-6', firstName: 'Lisa', lastName: 'Thompson', email: 'lisa.thompson@ffanorth.com', phone: '(561) 555-0106', title: 'Financial Advisor', status: 'active', complianceApproved: true, assignedCount: 0 },
  { id: 'adv-7', firstName: 'Robert', lastName: 'Green', email: 'robert.green@ffanorth.com', phone: '(561) 555-0107', title: 'Senior Financial Advisor', status: 'active', complianceApproved: true, assignedCount: 0 },
];

const advisorEmailMap: Record<string, string> = {};
ADVISORS.forEach(a => { advisorEmailMap[`${a.firstName} ${a.lastName}`] = a.email; });

const reps = [
  'Nick Mangino','Sarah Mitchell','David Torres','Jennifer Clark',
  'Michael Adams','Lisa Thompson','Robert Green',null,
];

const stages: PipelineStage[] = ['dormant','education','intent','qualified','licensed_rep'];
const stageWeights = [0.40,0.25,0.18,0.10,0.07];

function weightedStage(): PipelineStage {
  const r = rand();
  let cumulative = 0;
  for (let i = 0; i < stages.length; i++) {
    cumulative += stageWeights[i];
    if (r <= cumulative) return stages[i];
  }
  return 'dormant';
}

const stageNotes: Record<PipelineStage, string[]> = {
  dormant: [
    'Initial outreach — no response yet. Former client of competitor firm.',
    'Referral from existing client. Has significant life insurance portfolio.',
    'Met at industry event. Expressed interest in portfolio review.',
    'Called office once about rates, never followed up. Try re-engaging.',
    'Downloaded a whitepaper 6 months ago. No activity since.',
    'Former colleague of Nick Mangino. Reached out but went cold.',
    'Attended a local seminar we sponsored. Collected business card only.',
    'Inbound web inquiry from 2022. Could not reach by phone or email.',
  ],
  education: [
    'Opened 2 of 3 emails. Seems interested in retirement planning.',
    'Downloaded our annuity comparison guide. Follow up next week.',
    'Clicked through to scheduling page but didn\'t book. Re-engage.',
    'Watching engagement closely — opened every email in the series so far.',
    'Forwarded our insurance gap email to a colleague. Good sign.',
    'Opened initial email within 10 minutes of delivery. High engagement.',
    'Visited our website twice after receiving campaign emails.',
  ],
  intent: [
    'Called office asking about fees. Very price-conscious.',
    'Replied asking about timeline for insurance review process.',
    'Spouse also interested — may need joint consultation.',
    'Compared our services to competitor on phone. Wants fee transparency.',
    'Asked about credentials and certifications of our advisors.',
    'Mentioned upcoming retirement in 3 years. Needs comprehensive plan.',
    'Requested info packet be mailed to home address.',
  ],
  qualified: [
    'Advisor Sarah Mitchell conducting initial assessment.',
    'Reviewed current portfolio — significant gap in disability coverage.',
    'Scheduled for second meeting. Bringing financial documents.',
    'Has $850K in retirement accounts with high-fee funds. Strong opportunity.',
    'Business owner with no succession plan. Needs estate planning.',
    'Widowed last year — needs complete beneficiary and coverage overhaul.',
  ],
  licensed_rep: [
    'Meeting confirmed for Thursday 2pm. Prepare retirement projections.',
    'Documents received. Preparing comprehensive review.',
    'Very engaged — asking detailed questions about annuity options.',
    'Onboarding paperwork in progress. Target close by end of month.',
    'Consolidating 3 retirement accounts. Paperwork stage.',
    'Joint meeting with spouse completed. Both ready to proceed.',
  ],
};

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
    ? [] : pickN(['camp-1','camp-2','camp-3','camp-4','camp-5'], 1, 3);
  const assignedRep = ['qualified','licensed_rep'].includes(stage) ? pick(reps.filter(Boolean) as string[]) : null;
  const company = pick(companies);
  const domain = company && companyDomains[company]
    ? companyDomains[company]
    : pick(personalDomains);
  const emailLocal = company && companyDomains[company]
    ? `${firstName.toLowerCase()}.${lastName.toLowerCase()}`
    : `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(rand() * 99)}`;

  return {
    id: `contact-${(i + 1).toString().padStart(3, '0')}`,
    firstName, lastName,
    email: `${emailLocal}@${domain}`,
    phone: `(${Math.floor(200 + rand() * 800)}) ${Math.floor(200 + rand() * 800)}-${Math.floor(1000 + rand() * 9000)}`,
    company,
    lastContactDate: stage === 'dormant' ? randomDate(2019, 2023) : recentDate(180),
    stage, intentScore, campaigns: campaignIds,
    assignedRep,
    assignedRepEmail: assignedRep ? (advisorEmailMap[assignedRep] || null) : null,
    notes: pick(stageNotes[stage]),
    createdAt: randomDate(2018, 2023),
  };
});

// Update advisor assigned counts from generated contacts
ADVISORS.forEach(a => {
  const fullName = `${a.firstName} ${a.lastName}`;
  a.assignedCount = contacts.filter(c => c.assignedRep === fullName).length;
});

// ============================================
// FULL EMAIL TEMPLATES PER CAMPAIGN
// ============================================

const insuranceEmails: EmailStep[] = [
  { id:'e-1-1', subject:"When's the last time you reviewed your insurance coverage?", previewText:"Life changes. Your coverage should too.", sendDay:0, status:'active',
    body:`Hi {{first_name}},\n\nLife has a way of changing when we least expect it — a new home, a growing family, a career shift. But when was the last time your insurance coverage kept up?\n\nMany people set their policies years ago and haven't revisited them since. That can mean gaps in coverage you didn't know existed, or paying for protection you no longer need.\n\nAt Florida Financial Advisors, we believe everyone deserves a clear picture of where they stand. That's why we're offering a complimentary Insurance Coverage Review — no strings attached.\n\nIn just 15 minutes, we can help you:\n• Identify potential gaps in your current coverage\n• Make sure your beneficiaries are up to date\n• See if you're overpaying for what you have\n\nNo pressure. No sales pitch. Just clarity.\n\nWould that be helpful? Simply reply to this email and we'll set up a time that works for you.\n\nLooking forward to hearing from you,\nThe FFA North Team` },
  { id:'e-1-2', subject:"3 insurance gaps most people don't know they have", previewText:"Are you accidentally underinsured?", sendDay:3, status:'active',
    body:`Hi {{first_name}},\n\nDid you know that nearly 40% of Americans are underinsured — and most don't realize it until they need to file a claim?\n\nHere are 3 of the most common gaps we see:\n\n1. Liability Limits That Haven't Kept Up\nIf your net worth has grown since you set your policy, your liability coverage may not fully protect your assets anymore.\n\n2. Life Insurance That's Too Small (or Too Expensive)\nMany people either outgrew their coverage or are paying for a policy type that no longer makes sense for their situation.\n\n3. No Umbrella Policy\nAn umbrella policy is one of the most affordable ways to protect yourself from catastrophic claims — yet most people don't have one.\n\nThe good news? These are easy to fix once you know about them.\n\nWe'd love to help you take a closer look. Just reply "interested" and we'll reach out to schedule a quick, no-pressure review.\n\nWarm regards,\nThe FFA North Team` },
  { id:'e-1-3', subject:"Your insurance questions, answered", previewText:"We hear these questions all the time.", sendDay:7, status:'active',
    body:`Hi {{first_name}},\n\nWe talk to people about insurance every day, and the same questions come up again and again:\n\nQ: "Do I really need life insurance if my kids are grown?"\nA: It depends. Life insurance can also be a tool for estate planning, charitable giving, or leaving a legacy.\n\nQ: "Is my employer's coverage enough?"\nA: Usually not. Employer plans often cover only 1-2x your salary — far less than most families need.\n\nQ: "How often should I review my coverage?"\nA: At least every 2-3 years, or after any major life event.\n\nQ: "Can I save money without losing coverage?"\nA: Often, yes. We frequently find ways to restructure policies that maintain or improve coverage while reducing costs.\n\nHave a question we didn't cover? Just hit reply — we're here to help.\n\nBest,\nThe FFA North Team` },
  { id:'e-1-4', subject:"Last chance: Free insurance coverage review", previewText:"Let's make sure you're fully protected.", sendDay:14, status:'active',
    body:`Hi {{first_name}},\n\nThis is the last email in our series, and we wanted to reach out one more time.\n\nIf you've been meaning to review your insurance but haven't gotten around to it — we understand. Life's busy.\n\nHere's what a review with us looks like:\n✓ 15-minute phone or video call\n✓ We review your current policies together\n✓ You get a clear picture of where you stand\n✓ Zero obligation — it's completely free\n\nIf you'd like to take us up on this, simply reply with "Let's do it" and we'll get you scheduled.\n\nIf not, no hard feelings. We'll be here whenever you're ready.\n\nAll the best,\nThe FFA North Team` },
];

const annuityEmails: EmailStep[] = [
  { id:'e-2-1', subject:"Is your annuity still working as hard as you are?", previewText:"Annuities aren't set-it-and-forget-it.", sendDay:0, status:'active',
    body:`Hi {{first_name}},\n\nIf you own an annuity, you're already ahead of the game. But here's something many people don't realize: annuities aren't a "set it and forget it" product.\n\nOver time, your financial situation changes — and so does the annuity market. Newer products may offer better rates, lower fees, or features that align more closely with where you are today.\n\nThat doesn't mean your current annuity is wrong. It just means it's worth a checkup.\n\nWe help people evaluate their existing annuity positions every day. No cost, no obligation — just an honest look.\n\nWould a quick review be helpful? Reply to this email and we'll find a time.\n\nWarm regards,\nThe FFA North Team` },
  { id:'e-2-2', subject:"What most people don't know about their annuity fees", previewText:"Hidden costs could be eating into your returns.", sendDay:3, status:'active',
    body:`Hi {{first_name}},\n\nAnnuities are powerful financial tools — but they can also be complex. And complexity sometimes hides costs:\n\n• Mortality & Expense (M&E) Charges — can range from 0.5% to 1.5% per year\n• Surrender Charges — penalties you may not know about\n• Rider Fees — are you using the riders you're paying for?\n• Fund Expenses — underlying investments have their own fees too\n\nNone of this means your annuity is a bad deal — but a periodic review ensures you're getting the value you expect.\n\nWe're happy to walk through your annuity with you. Just reply if you're interested.\n\nBest,\nThe FFA North Team` },
  { id:'e-2-3', subject:"3 annuity questions you should be asking", previewText:"Make sure your annuity is right for you.", sendDay:7, status:'active',
    body:`Hi {{first_name}},\n\n1. "Am I past my surrender period?"\nIf yes, you have more flexibility than you think.\n\n2. "Am I maximizing my withdrawal strategy?"\nMany owners leave money on the table by not optimizing distributions.\n\n3. "Has my risk tolerance changed?"\nThe allocation inside your annuity should reflect who you are today.\n\nReply "review" if you'd like us to take a look. Free, confidential, about 20 minutes.\n\nTalk soon,\nThe FFA North Team` },
  { id:'e-2-4', subject:"One last thing about your annuity", previewText:"We're here when you're ready.", sendDay:14, status:'active',
    body:`Hi {{first_name}},\n\nOur Annuity Review is:\n✓ Free and confidential\n✓ Takes about 20 minutes\n✓ Covers fees, performance, and alternatives\n✓ No pressure to make any changes\n\nJust reply "I'm in" and we'll schedule a time.\n\nWarm regards,\nThe FFA North Team` },
];

const retirementEmails: EmailStep[] = [
  { id:'e-3-1', subject:"Are you retirement-ready? (A quick self-check)", previewText:"5 questions that reveal where you stand.", sendDay:0, status:'active',
    body:`Hi {{first_name}},\n\nNo matter where you are on the retirement timeline, these questions reveal a lot:\n\n1. Do you know your "number"?\n2. Are you maximizing your tax-advantaged accounts?\n3. Do you have a plan for healthcare before Medicare?\n4. Have you thought about Social Security timing?\n5. Is your portfolio allocated for where you are today?\n\nIf you answered "not sure" to any of these, you're not alone.\n\nWe'd love to help you get a clearer picture — no cost, no obligation.\n\nReply to this email if you'd like to chat.\n\nTo your future,\nThe FFA North Team` },
  { id:'e-3-2', subject:"The Social Security decision that could cost you $100K+", previewText:"When you claim matters more than you think.", sendDay:4, status:'active',
    body:`Hi {{first_name}},\n\nThe decision of when to claim Social Security can be worth over $100,000 in lifetime benefits.\n\n• Claim at 62: Benefits reduced by up to 30%\n• Claim at Full Retirement Age (66-67): Full benefit\n• Wait until 70: Grows ~8% per year past FRA\n\nThe "right" answer depends on your health, spouse, income sources, and overall plan.\n\nWe help people model this decision every day. Reply to this email if you'd like us to run the numbers.\n\nBest regards,\nThe FFA North Team` },
  { id:'e-3-3', subject:"The retirement expense most people forget", previewText:"It's not housing. It's not travel.", sendDay:8, status:'active',
    body:`Hi {{first_name}},\n\nThe expense that catches most retirees off guard is healthcare.\n\nThe average 65-year-old couple will spend roughly $315,000 on healthcare in retirement.\n\n• Medicare doesn't cover everything\n• Supplemental coverage costs vary wildly\n• Long-term care is the wildcard\n\nWith planning, you can prepare. Want to see how healthcare costs fit into your picture? Reply and we'll talk.\n\nWarm regards,\nThe FFA North Team` },
  { id:'e-3-4', subject:"Your free Retirement Readiness Review", previewText:"Let's build your retirement picture together.", sendDay:14, status:'active',
    body:`Hi {{first_name}},\n\nOur Retirement Readiness Review covers:\n✓ Where you stand vs. your goals\n✓ Social Security optimization\n✓ Income planning strategies\n✓ Healthcare cost projections\n✓ Tax-efficient withdrawal strategies\n\nIt's complimentary — about 30 minutes — and you'll walk away with clarity.\n\nReply "Let's do it" and we'll get you on the calendar.\n\nHere's to your future,\nThe FFA North Team` },
];

const investmentEmails: EmailStep[] = [
  { id:'e-4-1', subject:"How is your portfolio really performing?", previewText:"The answer might surprise you.", sendDay:0, status:'active',
    body:`Hi {{first_name}},\n\nHow did YOUR investments perform — after fees, after inflation, adjusted for risk?\n\nMost people can't answer that. We think you deserve to know.\n\nOur complimentary Portfolio Review gives you:\n• Your actual returns vs. benchmarks\n• Total fee breakdown\n• Risk alignment assessment\n• Opportunities you might be missing\n\nNo jargon. No sales pitch. Just clarity.\n\nReply to this email and we'll set up a time.\n\nBest regards,\nThe FFA North Team` },
  { id:'e-4-2', subject:"The hidden cost dragging down your returns", previewText:"Most investors don't realize what they're paying.", sendDay:4, status:'active',
    body:`Hi {{first_name}},\n\nFees could cost you hundreds of thousands over your investing lifetime:\n\n• $500K at 7% for 25 years (0.5% fees) = $2.71M\n• Same portfolio at 1.5% fees = $2.09M\n• That's a $620,000 difference — just from fees.\n\nWe help clients understand exactly what they're paying.\n\nIf you'd like a fee transparency review, just reply. Free, 20 minutes.\n\nTo your wealth,\nThe FFA North Team` },
  { id:'e-4-3', subject:"Is your portfolio actually diversified?", previewText:"Owning lots of funds doesn't mean you're diversified.", sendDay:8, status:'active',
    body:`Hi {{first_name}},\n\nCommon diversification mistakes:\n• Owning 5 large-cap growth funds and calling it "diversified"\n• Underexposed to international markets\n• Not enough fixed income near retirement\n• Concentrated positions in a single stock\n\nTrue diversification means assets that don't all move together.\n\nWe'd be happy to run a diversification analysis — free. Reply if interested.\n\nWarm regards,\nThe FFA North Team` },
  { id:'e-4-4', subject:"Your complimentary portfolio review awaits", previewText:"See how your investments really stack up.", sendDay:14, status:'active',
    body:`Hi {{first_name}},\n\nOur Portfolio Review includes:\n✓ Performance vs. benchmarks\n✓ Total fee transparency\n✓ Diversification assessment\n✓ Risk alignment check\n✓ Tax efficiency opportunities\n\nFree, 30 minutes, no obligation.\n\nReply "I'm ready" and we'll find a time.\n\nBest,\nThe FFA North Team` },
];

const secondOpinionEmails: EmailStep[] = [
  { id:'e-5-1', subject:"Thinking about a second opinion on your finances?", previewText:"You'd get one for your health. Why not your wealth?", sendDay:0, status:'active',
    body:`Hi {{first_name}},\n\nWhen you get a serious medical diagnosis, the first thing most people do is get a second opinion.\n\nBut when it comes to your financial plan — something that affects your family's entire future — most people never get one.\n\nA fresh set of eyes can reveal:\n• Tax strategies you haven't considered\n• Fees you didn't know you were paying\n• Risks you didn't realize you were taking\n• Benefits you're not taking advantage of\n\nOur Second Opinion Review is free, confidential, and zero pressure.\n\nReply to this email and let's set up a time.\n\nWarm regards,\nThe FFA North Team` },
  { id:'e-5-2', subject:"What a financial second opinion actually looks like", previewText:"No awkward sales pitch. Just answers.", sendDay:4, status:'active',
    body:`Hi {{first_name}},\n\nHere's exactly what happens:\n\nStep 1: Brief intro call (10 min) — we learn about your situation.\nStep 2: You share whatever documents you're comfortable with.\nStep 3: We do a comprehensive analysis — investments, insurance, tax, estate, retirement.\nStep 4: We walk you through findings in plain English.\nStep 5: You decide what to do with the information.\n\nThat's it. No hard sell. No "limited time offer."\n\nInterested? Reply and we'll get started.\n\nBest,\nThe FFA North Team` },
  { id:'e-5-3', subject:"5 things a second opinion might uncover", previewText:"The most common findings we see.", sendDay:8, status:'active',
    body:`Hi {{first_name}},\n\nAfter hundreds of second opinions, here are the top 5 findings:\n\n1. Tax Inefficiency — no tax-loss harvesting or Roth conversion strategy\n2. Overlapping Holdings — same stocks in multiple funds\n3. Outdated Beneficiaries — life changed, forms didn't\n4. Insurance Gaps — too little coverage or overpaying\n5. No Written Plan — hard to measure progress without one\n\nAll fixable. First step is knowing where you stand.\n\nReply if you'd like us to take a look. Free and confidential.\n\nTalk soon,\nThe FFA North Team` },
  { id:'e-5-4', subject:"Last call: Your free financial second opinion", previewText:"We're here when you're ready.", sendDay:14, status:'active',
    body:`Hi {{first_name}},\n\nLast email in the series. Here's our promise:\n\n✓ Genuinely free — no hidden fees, no bait-and-switch\n✓ Confidential — what you share stays between us\n✓ Yours to keep — the analysis belongs to you\n✓ Zero pressure — we'll never push you\n\nReply "second opinion" and let's find a time.\n\nOr save this email and reach out whenever you're ready.\n\nWarm regards,\nThe FFA North Team` },
];

const campaignDefs: { name: string; serviceLine: ServiceLine; description: string; status: CampaignStatus; emails: EmailStep[] }[] = [
  { name:'Insurance Portfolio Review', serviceLine:'Insurance Review', description:'A 4-email educational series targeting business owners and professionals aged 35-60 who likely haven\'t reviewed their insurance coverage in 3+ years. Addresses common pain points including outdated liability limits, insufficient life insurance for growing families, and the lack of umbrella policies. The goal is to move contacts from awareness to booking a complimentary 15-minute coverage review by positioning FFA as a no-pressure, education-first resource.', status:'active', emails:insuranceEmails },
  { name:'Annuity Optimization Insights', serviceLine:'Under-Serviced Annuities', description:'Targets existing annuity holders — typically ages 50-70 — who may be unaware of hidden fees, surrender period expirations, or better-performing alternatives. The 4-email sequence progressively educates contacts about M&E charges, rider fees, and withdrawal optimization strategies. Ideal persona: someone who purchased an annuity years ago through another advisor and hasn\'t had a review since. Outcome: book a free 20-minute annuity health check.', status:'active', emails:annuityEmails },
  { name:'Retirement Readiness Check', serviceLine:'Retirement Planning', description:'Designed for pre-retirees (ages 50-65) who feel uncertain about their retirement readiness. The 4-email campaign covers the five critical retirement questions, Social Security claiming strategy (potentially worth $100K+ in lifetime benefits), healthcare cost planning ($315K average for couples), and tax-efficient withdrawal strategies. Pain points addressed: "Am I saving enough?", "When should I claim Social Security?", and "What will healthcare cost me?" Outcome: schedule a complimentary 30-minute Retirement Readiness Review.', status:'active', emails:retirementEmails },
  { name:'Investment Planning Essentials', serviceLine:'Investment Planning', description:'A 4-email educational series for investors of all ages who want clarity on portfolio performance, fees, and diversification. Targets professionals and business owners who suspect they may be overpaying in fees or holding a poorly diversified portfolio but lack the tools or expertise to evaluate on their own. Highlights the compounding impact of fees ($620K difference over 25 years on a $500K portfolio) and common diversification mistakes. Outcome: book a complimentary 30-minute Portfolio Review with full fee transparency and benchmark comparison.', status:'active', emails:investmentEmails },
  { name:'Get a Second Opinion', serviceLine:'Second-Opinion Positioning', description:'A trust-building campaign for affluent individuals and families who already have a financial advisor but may not be getting the best advice. Targets high-net-worth contacts ($500K+ in investable assets) who value thoroughness and objectivity. Uses the medical second opinion analogy to normalize the idea of an independent financial review. The 4-email sequence walks contacts through exactly what the process looks like, the top 5 findings from past reviews, and a zero-pressure commitment. Outcome: book a free, confidential Second Opinion Review covering investments, insurance, tax strategy, and estate planning.', status:'draft', emails:secondOpinionEmails },
];

export const campaigns: Campaign[] = campaignDefs.map((def, i) => {
  const enrolled = contacts.filter(c => c.campaigns.includes(`camp-${i + 1}`)).length;
  return {
    id: `camp-${i + 1}`, name: def.name, serviceLine: def.serviceLine,
    description: def.description, status: def.status, emailSequence: def.emails,
    enrolledCount: enrolled,
    openRate: 15 + Math.floor(rand() * 35),
    clickRate: 3 + Math.floor(rand() * 15),
    intentSignals: Math.floor(enrolled * (0.05 + rand() * 0.15)),
    createdAt: randomDate(2024, 2025),
  };
});

const replyBodies = [
  `Hi, thanks for reaching out. I've been meaning to look into this — our current coverage hasn't been reviewed in years.`,
  `I'm interested but want to make sure this isn't a sales pitch. Can you tell me more about the process?`,
  `My wife and I were just discussing this. Can we set up a call for next week?`,
  `I got your email about annuity fees. Our current advisor hasn't mentioned anything about this.`,
  `Thanks for the information. I'd like to understand more about what a second opinion would involve.`,
  `We're planning to retire in 5 years and haven't done any real planning. This is timely.`,
  `I forwarded your email to my business partner. We both need to review our coverage.`,
  `Can you send me more details about the investment planning process? I'm comparing a few firms.`,
  `Just got back from vacation and catching up on emails. This is definitely something I want to explore.`,
  `Our company is growing and I'm not sure our current policies are adequate. Let's talk.`,
  `I appreciate the educational approach — most firms just try to sell us something right away.`,
  `My CPA suggested I look into annuity options. Your timing is perfect.`,
  `Thanks for the email. I'm interested in learning more about what you can offer. I've been with my current provider for years but haven't done a review in a while.`,
  `Hello, I received your email and this caught my attention. My wife and I have been discussing our retirement plans. Do you have any availability this month?`,
  `This is timely — I was just talking to a friend about getting a second opinion on my portfolio. What would a consultation look like?`,
  `Interesting timing on this email. I just rolled over a 401k from my previous employer and have been looking for guidance. What are my options?`,
  `Hi there. I'm open to having a conversation about this. My annuity hasn't been performing well and I'd love to understand what other options might be available.`,
  `We just had our first grandchild and it's made us think more seriously about estate planning. Is that something you help with?`,
  `I've been meaning to consolidate some old retirement accounts. Do you offer that kind of guidance?`,
  `Your email about hidden fees really got my attention. I had no idea those charges existed. When can we talk?`,
];

const infoRequestBodies = [
  `Could you send me more details about the insurance review? I'd like to understand what's covered before committing to a meeting.`,
  `I'm interested but want to know more first. Do you have a brochure or one-pager about your retirement planning services?`,
  `What are the fees associated with your advisory services? I want to compare before making any changes.`,
  `Can you provide some case studies or examples of how you've helped clients in similar situations?`,
  `I'd like more information about the annuity review process. How long does a typical review take?`,
  `Before I schedule a call, can you send over some information about your firm and the team I'd be working with?`,
  `Do you have a checklist of documents I should gather before a portfolio review? I want to be prepared.`,
  `Can you explain the difference between a fee-only and commission-based advisor? I want to understand your model.`,
  `I'd like to see a sample of the retirement readiness report you provide. Is that something you can share?`,
  `What certifications do your advisors hold? I want to make sure I'm working with qualified professionals.`,
  `Is there a minimum account size to work with your firm? I want to make sure I'm a good fit before we meet.`,
  `Can you send me the Social Security optimization analysis you mentioned? My spouse and I are trying to figure out timing.`,
  `Do you work with small business owners? I have both personal and business insurance needs.`,
  `I'd like more info on your annuity fee comparison tool. My current contract is hard to understand.`,
];

const emailSentSubjects = [
  "When's the last time you reviewed your coverage?",
  "3 insurance gaps most people don't know they have",
  "Is your annuity still working as hard as you are?",
  "Are you retirement-ready?",
  "How is your portfolio really performing?",
  "Thinking about a second opinion on your finances?",
  "The hidden cost dragging down your returns",
  "Your free Retirement Readiness Review",
];

const clickedLinks = [
  "'Schedule Free Review'",
  "'Download Retirement Guide'",
  "'See Fee Comparison'",
  "'Book a Consultation'",
  "'View Portfolio Analysis Sample'",
  "'Calculate Your Retirement Number'",
];

const dayLabels = ['Day 1 intro', 'Day 3 follow-up', 'Day 7 education', 'Day 14 final'];

const activityTypes: { type: ActivityType; desc: (c: Contact, camp?: Campaign) => string }[] = [
  { type:'email_sent', desc:(c,camp) => {
    const subj = pick(emailSentSubjects);
    return `Email sent: '${subj}' to ${c.firstName} ${c.lastName}${camp ? ` — ${camp.name}` : ''}`;
  }},
  { type:'email_opened', desc:(c,camp) => {
    const day = pick(dayLabels);
    return `${c.firstName} ${c.lastName} opened ${camp?.name || 'campaign'} email (${day})`;
  }},
  { type:'email_clicked', desc:(c,camp) => {
    const link = pick(clickedLinks);
    return `${c.firstName} ${c.lastName} clicked ${link} link in ${camp?.name || 'campaign'}`;
  }},
  { type:'reply_received', desc:(c) => {
    const snippets = [
      'Interested in scheduling a review',
      'Asking about advisor credentials',
      'Wants to discuss retirement timeline',
      'Requesting fee comparison details',
      'Interested but wants more info first',
    ];
    return `Reply from ${c.firstName} ${c.lastName}: ${pick(snippets)}`;
  }},
  { type:'info_requested', desc:(c) => {
    const resources = [
      'the retirement planning guide',
      'the annuity comparison worksheet',
      'the insurance gap checklist',
      'the portfolio review sample report',
      'the fee transparency one-pager',
    ];
    return `Info request: ${c.firstName} ${c.lastName} downloaded ${pick(resources)}`;
  }},
  { type:'appointment_scheduled', desc:(c) => {
    const types = [
      'Initial discovery call',
      'Portfolio review session',
      'Insurance coverage review',
      'Retirement planning consultation',
      'Second opinion meeting',
    ];
    return `Appointment booked: ${pick(types)} with ${c.firstName} ${c.lastName}`;
  }},
  { type:'campaign_enrolled', desc:(c,camp) => `${c.firstName} ${c.lastName} enrolled in ${camp?.name || 'campaign'}` },
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
    const act: Activity = {
      id: `act-${++actId}`, contactId: contact.id,
      contactName: `${contact.firstName} ${contact.lastName}`,
      type: actDef.type, description: actDef.desc(contact, camp),
      timestamp: recentDate(60), campaignId: campId, campaignName: camp?.name,
    };
    if (actDef.type === 'reply_received') {
      const campStep = camp?.emailSequence[Math.floor(rand() * (camp?.emailSequence.length || 1))];
      act.emailSubject = `Re: ${campStep?.subject || 'Your Financial Review'}`;
      act.emailBody = pick(replyBodies);
    } else if (actDef.type === 'info_requested') {
      const campStep = camp?.emailSequence[Math.floor(rand() * (camp?.emailSequence.length || 1))];
      act.emailSubject = `Re: ${campStep?.subject || 'Your Financial Review'}`;
      act.emailBody = pick(infoRequestBodies);
    }
    activities.push(act);
  }
}
activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
