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
export const STORAGE_VERSION = 5;

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
    ? [] : pickN(['camp-1','camp-2','camp-3','camp-4','camp-5','camp-6','camp-7'], 1, 3);
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

// Add real contact for testing
contacts.unshift({
  id: 'contact-nick',
  firstName: 'Nick',
  lastName: 'Mangino',
  email: 'rolltide7107@gmail.com',
  phone: '(555) 000-0001',
  company: '',
  lastContactDate: new Date().toISOString().split('T')[0],
  stage: 'qualified',
  intentScore: 90,
  campaigns: [],
  assignedRep: 'Nick Mangino',
  assignedRepEmail: 'nick.mangino@ffanorth.com',
  notes: 'Test contact for email verification',
  createdAt: new Date().toISOString().split('T')[0],
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
  { id:'e-1-1', subject:"A quick question about your coverage", previewText:"When did you last take a close look at your policies?", sendDay:0, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>Here is something that caught my attention recently: according to industry data, nearly six in ten Americans have not reviewed their insurance policies in over three years. Meanwhile, most of those same people have gone through at least one major life change during that time.</p>
<p>It makes sense when you think about it. Insurance is one of those things we set up and then move on from. But life has a way of quietly shifting the ground beneath our coverage.</p>
<p>A few things worth considering:</p>
<ul>
<li><strong>Has your income, home value, or family size changed?</strong></li>
<li><strong>Are your beneficiary designations still accurate?</strong></li>
<li><strong>Does your liability coverage reflect your current net worth?</strong></li>
</ul>
<p>If any of those gave you pause, you are not alone. A brief review can help you see where things stand today and whether any adjustments make sense.</p>
<p>Would it be helpful to take a quick look together? I am happy to set aside 15 minutes whenever it works for you. Just reply to this email.</p>
<p>Warm regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">This is an educational communication from Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. Insurance products involve risk and may not be suitable for all individuals. Individual coverage needs vary.</p>` },
  { id:'e-1-2', subject:"Something most people overlook", previewText:"Three common coverage gaps that tend to surprise families.", sendDay:3, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>After working with hundreds of families over the years, we have noticed a pattern: most people are doing a solid job with their insurance, but nearly everyone has at least one blind spot. Not because of any mistake, but simply because life evolved and the policies did not keep up.</p>
<p>Here are three of the most common gaps we see:</p>
<ul>
<li><strong>Liability limits that have not kept pace with net worth.</strong> If your assets have grown since your policy was written, your current limits may leave you more exposed than you realize.</li>
<li><strong>Life insurance that no longer matches your life stage.</strong> Coverage purchased when the kids were young may not reflect today's responsibilities, whether that means aging parents, a business, or simply different financial goals.</li>
<li><strong>No umbrella policy.</strong> An umbrella policy adds a meaningful layer of protection and is often surprisingly affordable. Yet most families do not carry one.</li>
</ul>
<p>None of these are emergencies. But they are the kind of thing that is far better to discover on your own terms than at claim time.</p>
<p>If any of this resonated, I am happy to answer questions. Just reply to this email.</p>
<p>Best regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">This is an educational communication from Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. The information provided is for general educational purposes only. Individual coverage needs vary.</p>` },
  { id:'e-1-3', subject:"What a simple review uncovered", previewText:"A real story about one family's coverage checkup.", sendDay:7, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>I wanted to share a quick story because it illustrates something we see regularly.</p>
<p>A family in our area — we will call them the Garcias — came to us last year. They had auto, home, and life insurance through three different carriers, policies they had set up over the course of a decade. Nothing seemed broken, but they had not reviewed anything in about five years.</p>
<p>During a short review, we found two things:</p>
<ul>
<li><strong>Duplicate disability coverage.</strong> Mr. Garcia had both an employer plan and a private policy that overlapped almost entirely. Eliminating the redundancy saved them roughly $2,400 per year.</li>
<li><strong>Unbundled auto policies.</strong> A straightforward multi-policy adjustment with the same carrier saved another $800 annually, with no reduction in coverage.</li>
</ul>
<p>The Garcias kept the same protection across the board and redirected those savings toward their daughter's college fund. The whole process took less than a week.</p>
<p>Every family's situation is different, and results vary. But the Garcias told us they were glad they took that first step.</p>
<p>Would this kind of review be worth exploring for your situation? If so, just reply and we can find a time.</p>
<p>Best regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">This is an educational communication from Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. Names and details changed for privacy. Individual results vary.</p>` },
  { id:'e-1-4', subject:"A simple checklist worth five minutes", previewText:"Run through this on your own, no advisor needed.", sendDay:14, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>I know your time is valuable, so I put together a quick self-check you can run through entirely on your own. No appointment needed, no strings attached.</p>
<p><strong>Your 5-Minute Insurance Health Check:</strong></p>
<ul>
<li>When was each of your policies last updated?</li>
<li>Have your beneficiaries changed since your policies were written?</li>
<li>Has your home value, income, or family size changed significantly?</li>
<li>Do you have liability coverage that matches your current net worth?</li>
<li>Are you paying for any overlapping or redundant coverage?</li>
</ul>
<p>If you go through that list and everything checks out, that is great news. You will have peace of mind, and that is a win on its own.</p>
<p>If something gives you pause, we are here to help you think it through. No cost, no obligation.</p>
<p>And if this is simply not a priority right now, I completely understand. Save this email and come back to it whenever the timing feels right.</p>
<p>Warm regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">This is an educational communication from Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. This checklist is for general informational purposes only. Individual coverage needs vary.</p>` },
  { id:'e-1-5', subject:"Life changes your policies might miss", previewText:"Major milestones quietly reshape your coverage needs.", sendDay:21, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>Here is something we see often: someone comes in with a policy purchased years ago, before the second child, the new home, or the career change. On paper, they are covered. In practice, the coverage no longer fits their life.</p>
<p>A few life events that commonly create gaps:</p>
<ul>
<li><strong>Marriage or divorce</strong> — beneficiaries, ownership structures, and liability exposure all shift</li>
<li><strong>Buying or refinancing a home</strong> — replacement cost values change, and coverage should follow</li>
<li><strong>Starting or growing a business</strong> — personal policies rarely cover business-related liabilities</li>
<li><strong>Children reaching adulthood</strong> — your life insurance needs may look very different now</li>
</ul>
<p>The real cost of outdated coverage is not the premium you pay each month. It is the claim that gets denied because your policy no longer reflects your life.</p>
<p>If you have experienced any of these changes recently, it may be worth a quick review. Happy to chat if you would like to explore this further.</p>
<p>Best regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. Individual coverage needs vary.</p>` },
  { id:'e-1-6', subject:"Bundling: simple move, real savings", previewText:"Consolidating policies can simplify your life and your costs.", sendDay:28, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>If you carry auto, home, and other policies through different carriers, there is a good chance you are paying more than you need to. Bundling is one of those straightforward strategies that often gets overlooked.</p>
<p>Here is why it can make a difference:</p>
<ul>
<li><strong>Multi-policy discounts.</strong> Most carriers offer meaningful discounts when you consolidate policies under one roof. The savings can be substantial.</li>
<li><strong>Simplified management.</strong> One carrier, one bill, one point of contact. It makes renewals and claims easier to track.</li>
<li><strong>Better coordination.</strong> When your policies are designed to work together, you are less likely to end up with gaps or overlapping coverage.</li>
</ul>
<p>That said, bundling is not always the right move. Sometimes a specialized carrier offers better coverage for a specific need. The key is comparing your options with the full picture in view.</p>
<p>If you are curious whether bundling could benefit your situation, I am happy to walk through it with you. Just reply to this email.</p>
<p>Warm regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. Individual coverage needs and potential savings vary.</p>` },
  { id:'e-1-7', subject:"When was your last beneficiary check?", previewText:"Outdated designations can override even your will.", sendDay:35, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>Here is a fact that surprises many people: your beneficiary designations on insurance policies and retirement accounts typically override your will. That means if your designations are outdated, your assets may not go where you intend, regardless of what your estate documents say.</p>
<p>A few situations where this becomes critical:</p>
<ul>
<li><strong>After a divorce.</strong> If you have not updated your designations, an ex-spouse may still be listed as beneficiary on life insurance or retirement accounts.</li>
<li><strong>After the birth of a child.</strong> Newer children may not be included unless you have specifically updated your forms.</li>
<li><strong>After a family loss.</strong> If a named beneficiary has passed away, your assets could end up in probate rather than going to the people you choose.</li>
</ul>
<p>Reviewing your beneficiary designations takes just a few minutes and can prevent significant heartache for your family down the road.</p>
<p>If you would like a hand reviewing your current designations across all your policies, we are happy to help. Just reply to this email.</p>
<p>Best regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. This is general educational content and does not constitute legal advice. Consult an attorney for estate planning guidance.</p>` },
  { id:'e-1-8', subject:"The case for an umbrella policy", previewText:"Broad protection that costs less than you might think.", sendDay:42, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>If there is one type of insurance that consistently surprises people — both in how affordable it is and how much protection it provides — it is the personal umbrella policy.</p>
<p>An umbrella policy adds an extra layer of liability protection beyond your homeowners and auto coverage. It kicks in when you exhaust the limits on your underlying policies.</p>
<p>Here is why it deserves a closer look:</p>
<ul>
<li><strong>Lawsuits are unpredictable.</strong> A serious auto accident, an injury on your property, or even an incident involving your pet can result in a judgment that exceeds standard policy limits.</li>
<li><strong>Your assets are at stake.</strong> The more you have built, the more you stand to lose. Courts can go after savings, investments, and even future earnings.</li>
<li><strong>The cost is often modest.</strong> A $1 million umbrella policy typically runs between $200 and $500 per year, depending on your situation.</li>
</ul>
<p>This is general education, not a specific recommendation. But if you own a home, have investments, or have a teenage driver, an umbrella policy is worth considering.</p>
<p>Would it be helpful to explore whether this fits your situation? Just reply and we can talk it through.</p>
<p>Warm regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. Coverage availability and pricing vary by individual circumstances.</p>` },
  { id:'e-1-9', subject:"Is your home covered at today's value?", previewText:"Replacement costs may have shifted more than you realize.", sendDay:49, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>Construction costs and home values have shifted significantly in recent years. If your homeowners policy has not been updated to reflect those changes, you could find yourself underinsured at exactly the wrong moment.</p>
<p>Here are a few things worth checking:</p>
<ul>
<li><strong>Replacement cost vs. market value.</strong> Your policy should cover what it would cost to rebuild your home, not just what it would sell for. These two numbers can be very different.</li>
<li><strong>Renovations and additions.</strong> If you have updated your kitchen, added a room, or finished a basement, your coverage may not reflect the added value.</li>
<li><strong>Personal property limits.</strong> Standard policies cap coverage for jewelry, electronics, and collectibles. If your possessions have grown, you may need a rider.</li>
</ul>
<p>Taking a few minutes to verify your coverage now can save you a great deal of stress if you ever need to file a claim. Most carriers allow you to adjust mid-term without much hassle.</p>
<p>If you would like help assessing whether your current coverage keeps pace with your home's value, I would be happy to walk through it with you.</p>
<p>Best regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. Individual coverage needs and property values vary.</p>` },
  { id:'e-1-10', subject:"Disability coverage: the overlooked safety net", previewText:"Your ability to earn income may be your most valuable asset.", sendDay:56, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>Most people insure their home, their car, and their health. But surprisingly few have adequate coverage for something arguably more valuable: their ability to earn a living.</p>
<p>Consider this: according to the Social Security Administration, more than one in four of today's 20-year-olds will experience a disability before reaching retirement age. Yet disability insurance is one of the most commonly overlooked types of coverage.</p>
<p>A few things to keep in mind:</p>
<ul>
<li><strong>Employer coverage may not be enough.</strong> Group disability plans often cover only 50-60% of your base salary, may not include bonuses, and benefits are typically taxable if your employer pays the premiums.</li>
<li><strong>Watch for overlap.</strong> If you have both an employer plan and a private policy, make sure they complement rather than duplicate each other.</li>
<li><strong>Definition of disability matters.</strong> Some policies use an "own occupation" definition, while others use "any occupation." The difference can be significant when it comes to receiving benefits.</li>
</ul>
<p>Disability coverage is not the most exciting topic, but it is one of the most important pieces of a well-rounded protection plan.</p>
<p>Happy to chat if you would like to explore how this fits into your overall picture.</p>
<p>Warm regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. Individual coverage needs vary. This is educational content only.</p>` },
  { id:'e-1-11', subject:"Your annual review checklist", previewText:"A practical guide for staying on top of your coverage.", sendDay:63, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>Just like your car needs regular maintenance, your insurance portfolio benefits from an annual checkup. Here is a straightforward checklist you can use as a starting point:</p>
<ul>
<li><strong>Review all policy declarations pages.</strong> Confirm that coverage amounts, deductibles, and limits still make sense for your current situation.</li>
<li><strong>Update beneficiary designations.</strong> Check every policy and retirement account. Make sure the people listed are the ones you intend.</li>
<li><strong>Verify your home's replacement cost.</strong> Construction costs change, renovations add value, and your coverage should keep pace.</li>
<li><strong>Assess your liability exposure.</strong> Has your net worth grown? Do you have new assets, a rental property, or a teenage driver? Your liability limits should reflect your current risk profile.</li>
<li><strong>Check for overlapping coverage.</strong> Duplicate policies waste money. Make sure each policy serves a distinct purpose.</li>
<li><strong>Compare your premiums.</strong> Rates change. It is worth checking whether you are still getting competitive pricing for the coverage you carry.</li>
</ul>
<p>If you can check every item on this list with confidence, you are in good shape. If any of them give you pause, a professional review can help fill in the gaps.</p>
<p>Would it be helpful to go through this together? Just reply and we can set up a time.</p>
<p>Best regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. This checklist is for general informational purposes only.</p>` },
  { id:'e-1-12', subject:"Thought you'd find this helpful", previewText:"A final note and an open invitation from our team.", sendDay:70, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>This is the last email in our insurance education series, and I want to close with something simple.</p>
<p>Insurance is not glamorous. Nobody wakes up excited to review their policies. But the purpose behind it is deeply personal — it is about protecting the people, the home, and the future you have worked hard to build.</p>
<p>Over the past several weeks, we have covered:</p>
<ul>
<li>Why coverage gaps form quietly over time</li>
<li>How life changes can reshape your insurance needs</li>
<li>The role of umbrella policies and disability coverage</li>
<li>Why beneficiary reviews and annual checkups matter</li>
</ul>
<p>Whether you are ready for a conversation today or sometime down the road, our door is always open. We do not believe in high-pressure tactics — we believe in being here when you need us.</p>
<p>If you would ever like to schedule a complimentary review, simply reply to this email. We would be glad to help.</p>
<p>Thank you for your time, {{first_name}}. It has been a pleasure sharing these insights with you.</p>
<p>Warm regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. You are receiving this email because you opted in to educational content from Florida Financial Advisors.</p>` },
];

const annuityEmails: EmailStep[] = [
  { id:'e-2-1', subject:"A thought about your annuity", previewText:"When did you last check in on how it is performing?", sendDay:0, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>If you own an annuity, you have already taken an important step toward building financial stability. But here is something worth knowing: annuities are not a set-it-and-forget-it product.</p>
<p>Over time, both your financial situation and the annuity market evolve. Newer contracts may offer different features, fee structures, or benefits compared to what was available when you purchased yours.</p>
<p>That does not mean your current annuity is wrong. It simply means a periodic checkup can be valuable, just like a regular visit to your doctor.</p>
<p>A few questions worth considering:</p>
<ul>
<li><strong>Do you know your total annual fees?</strong></li>
<li><strong>Are you past your surrender period?</strong></li>
<li><strong>Does your annuity still align with your current goals?</strong></li>
</ul>
<p>Would a quick review be helpful? I am happy to walk through your annuity with you. Just reply to this email.</p>
<p>Warm regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. Annuity contracts involve fees and limitations. Individual situations vary.</p>` },
  { id:'e-2-2', subject:"Understanding your annuity fees", previewText:"Complexity sometimes hides costs worth knowing about.", sendDay:3, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>Annuities can be powerful financial tools, but their fee structures are often layered and not always easy to see on a statement. Here is a quick breakdown of the costs most annuity owners carry:</p>
<ul>
<li><strong>Mortality and Expense (M&E) charges</strong> — the insurance company's charge for providing guarantees, typically ranging from 0.50% to 1.50% annually</li>
<li><strong>Surrender charges</strong> — penalties for withdrawing more than the allowed amount during the surrender period, sometimes lasting seven to ten years</li>
<li><strong>Rider fees</strong> — optional benefits like income guarantees or enhanced death benefits carry their own annual charges, often 0.50% to 1.25% each</li>
<li><strong>Underlying fund expenses</strong> — for variable annuities, the sub-accounts have their own expense ratios on top of everything else</li>
</ul>
<p>Added together, total annual costs on some older contracts can exceed 3% per year. That is a meaningful drag on growth over time.</p>
<p>None of this means your annuity is a bad deal. But understanding what you are paying is the first step toward knowing whether you are getting fair value.</p>
<p>If you would like help decoding your fee structure, just reply to this email. We are happy to take a look.</p>
<p>Best regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. Fee examples are illustrative. Actual fees vary by contract.</p>` },
  { id:'e-2-3', subject:"Three questions every annuity owner should ask", previewText:"Simple checks that can reveal a lot about your contract.", sendDay:7, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>You do not need to be a financial expert to evaluate your annuity. These three questions can tell you a great deal about where you stand:</p>
<ul>
<li><strong>"Am I past my surrender period?"</strong> If yes, you have more flexibility than you may realize. Many owners do not check, and their surrender period quietly expires without anyone telling them.</li>
<li><strong>"Am I using all the riders I am paying for?"</strong> If you are paying for a guaranteed income rider but have no plans to annuitize, or a death benefit rider that is no longer necessary, you may be carrying costs that no longer serve you.</li>
<li><strong>"Has my risk tolerance changed?"</strong> The allocation inside a variable annuity should reflect who you are today, not who you were when you signed the paperwork years ago.</li>
</ul>
<p>If you could not answer any of these with confidence, you are far from alone. Most annuity owners we meet have not revisited these details since the day they purchased their contract.</p>
<p>We offer a complimentary annuity review that covers all three areas and more. It takes about 20 minutes and is completely confidential. Just reply if you are interested.</p>
<p>Best regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. Individual annuity features and fees vary by contract.</p>` },
  { id:'e-2-4', subject:"Your surrender schedule explained", previewText:"Knowing your timeline opens up options you may not expect.", sendDay:14, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>One of the most important but least understood features of an annuity is the surrender schedule. Here is a quick primer on what it means and why it matters.</p>
<p>When you purchase an annuity, the insurance company typically imposes a surrender period — usually five to ten years. During that time, withdrawals beyond a specified amount (often 10% of your account value per year) trigger a penalty called a surrender charge.</p>
<p>What many people do not realize:</p>
<ul>
<li><strong>Surrender charges decrease over time.</strong> They typically start high (6-8%) and drop by roughly one percentage point per year until they reach zero.</li>
<li><strong>Once the period ends, you have full flexibility.</strong> You can withdraw, transfer, or exchange your annuity without penalty.</li>
<li><strong>Many owners miss this milestone.</strong> Your insurance company is not required to notify you when your surrender period expires. It often passes unnoticed.</li>
</ul>
<p>Knowing where you stand on your surrender schedule is essential for making informed decisions about your annuity. It can be the difference between being locked in and having real choices.</p>
<p>If you are unsure where you are in your surrender period, I am happy to help you find out. Just reply to this email.</p>
<p>Warm regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. Surrender charges vary by contract. Consult your annuity documents for specific terms.</p>` },
  { id:'e-2-5', subject:"Income riders: are you using yours?", previewText:"A benefit you are paying for may be going untapped.", sendDay:21, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>Many annuity contracts include optional income riders — features designed to provide a predictable stream of income in retirement. They can be a valuable part of your financial plan, but they also come with costs that are worth understanding.</p>
<p>Here is what you should know:</p>
<ul>
<li><strong>Income riders have their own fees.</strong> These are typically charged annually, whether or not you have activated the rider. Over time, these costs reduce your account value.</li>
<li><strong>The benefit base is not your account value.</strong> Many owners confuse the two. Your income benefit base is a calculation used to determine your guaranteed withdrawal amount — it is not money you can take as a lump sum.</li>
<li><strong>Timing your activation matters.</strong> Starting withdrawals too early or too late can affect the value you ultimately receive from the rider.</li>
</ul>
<p>If you have an income rider on your annuity, it is worth reviewing whether you are getting value from it — and whether your activation strategy aligns with your retirement timeline.</p>
<p>Happy to chat if you would like to explore this further. Just reply to this email.</p>
<p>Best regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. Rider features and costs vary by contract. This is educational content only.</p>` },
  { id:'e-2-6', subject:"Fixed vs. variable: a quick comparison", previewText:"Understanding the key differences between annuity types.", sendDay:28, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>Not all annuities work the same way. If you own one or are evaluating your options, understanding the fundamental differences between the main types can help you make more informed decisions.</p>
<p><strong>Fixed annuities</strong> offer principal protection and a guaranteed interest rate for a set period. They provide predictable, stable growth but typically deliver lower long-term returns. They generally carry lower fees and are well suited for conservative investors.</p>
<p><strong>Variable annuities</strong> invest your money in sub-accounts similar to mutual funds. Returns depend on market performance, which means higher potential upside but also downside risk. They often include optional riders at additional cost and carry higher fee structures overall.</p>
<p><strong>Fixed indexed annuities</strong> are a hybrid. Your principal is protected, but returns are linked to a market index like the S&P 500, subject to caps and participation rates. The crediting methods can be complex and change from year to year.</p>
<p>The right type depends entirely on your goals, timeline, and comfort with risk. There is no single best answer for everyone.</p>
<p>If you would like help understanding how your current annuity fits your overall financial picture, I am happy to walk through it with you. Just reply to this email.</p>
<p>Warm regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. All annuity types involve trade-offs. Individual suitability varies.</p>` },
  { id:'e-2-7', subject:"Tax-deferred growth: what it means for you", previewText:"An annuity benefit that often goes underappreciated.", sendDay:35, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>One of the core benefits of an annuity is tax-deferred growth. Your investment earnings are not taxed until you withdraw them. Over many years, this can make a meaningful difference in how your money compounds.</p>
<p>Here is why it matters:</p>
<ul>
<li><strong>Compounding without annual tax drag.</strong> In a taxable account, you owe taxes each year on dividends and capital gains. Inside an annuity, those earnings continue compounding without being reduced by annual taxes.</li>
<li><strong>Control over timing.</strong> You decide when to take withdrawals, which gives you some control over when you recognize taxable income. This can be especially valuable in retirement when managing your tax bracket.</li>
<li><strong>Important caveat.</strong> When you do withdraw, earnings are taxed as ordinary income rather than at the lower capital gains rate. And withdrawals before age 59-1/2 may be subject to a 10% penalty.</li>
</ul>
<p>Tax-deferred growth is a genuine advantage, but it works best when it is part of a broader strategy that considers your other accounts, your expected tax bracket in retirement, and your withdrawal timeline.</p>
<p>If you would like to discuss how your annuity's tax benefits fit into your larger financial plan, just reply to this email.</p>
<p>Best regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. This is educational content and does not constitute tax advice. Consult your tax professional for guidance specific to your situation.</p>` },
  { id:'e-2-8', subject:"Legacy planning with your annuity", previewText:"Your contract may offer options for your beneficiaries.", sendDay:42, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>When most people think about annuities, they focus on income and growth. But your annuity may also play a role in your legacy planning — and it is worth understanding how.</p>
<p>A few things to consider:</p>
<ul>
<li><strong>Death benefit provisions.</strong> Most annuity contracts include a death benefit that passes to your named beneficiaries. Some offer an enhanced death benefit rider that can lock in a higher value, though this comes at an additional cost.</li>
<li><strong>Beneficiary designations matter.</strong> Like life insurance, annuity beneficiary designations typically override your will. Make sure they are current and reflect your wishes.</li>
<li><strong>Tax implications for heirs.</strong> Inherited annuities are generally subject to income tax on the gains. The rules differ depending on whether the beneficiary is a spouse or non-spouse, and the distribution options available can vary.</li>
</ul>
<p>Understanding how your annuity fits into your estate plan can help ensure your intentions are carried out the way you want. It is one of those details that is easy to overlook but important to get right.</p>
<p>If you would like to review the legacy provisions of your annuity contract, I would be glad to help. Just reply to this email.</p>
<p>Warm regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. This is educational content and does not constitute estate planning or tax advice.</p>` },
  { id:'e-2-9', subject:"What a review uncovered for one couple", previewText:"A real example of why periodic annuity checkups matter.", sendDay:49, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>I wanted to share a brief story that illustrates why we believe in regular annuity reviews. Names and details have been changed for privacy.</p>
<p>A couple in their early 60s — we will call them Jim and Diane — came to us with a variable annuity they had owned for nine years. They assumed it was performing well and had not reviewed it since the day they purchased it.</p>
<p>Here is what we found:</p>
<ul>
<li><strong>Two riders they were not using.</strong> They had added a guaranteed accumulation benefit and an enhanced death benefit at purchase. Combined rider fees totaled 1.85% per year, but their financial situation had changed and they no longer needed either feature.</li>
<li><strong>High-cost sub-accounts.</strong> The investment options inside their annuity had expense ratios averaging 1.10%, well above comparable alternatives.</li>
<li><strong>An expired surrender period.</strong> Their seven-year surrender period had ended two years earlier, giving them full flexibility they did not know they had.</li>
</ul>
<p>After a careful analysis, Jim and Diane were able to restructure their position and reduce their annual costs by approximately $8,000 while maintaining the protections they actually needed.</p>
<p>Every situation is unique, and past results do not predict future outcomes. But their experience shows what a fresh set of eyes can reveal.</p>
<p>Would a similar review be worthwhile for your situation? Just reply and we can set up a time.</p>
<p>Best regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. Names and details changed for privacy. Individual results vary.</p>` },
  { id:'e-2-10', subject:"RMDs and your annuity: what to know", previewText:"Required distributions add a layer of complexity worth planning for.", sendDay:56, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>If your annuity is held inside a qualified account like an IRA, Required Minimum Distributions (RMDs) are something you will need to plan for. Here is a quick overview of what that means.</p>
<ul>
<li><strong>RMDs apply to qualified annuities.</strong> If your annuity is inside a traditional IRA or other qualified account, you must begin taking distributions by age 73 (under current rules). Non-qualified annuities are not subject to RMDs.</li>
<li><strong>Annuitized contracts may satisfy RMDs.</strong> If your annuity is paying you regular income through annuitization, those payments may count toward your RMD requirement. But the rules are specific and worth confirming.</li>
<li><strong>Coordination is key.</strong> If you own multiple IRAs, you can take your total RMD from any combination of accounts. This flexibility can help you optimize which accounts you draw from and when.</li>
</ul>
<p>RMD planning is one of those areas where a little forethought can save you from unnecessary tax consequences and potential penalties. It is especially important if your annuity represents a significant portion of your retirement savings.</p>
<p>If you would like to discuss how your annuity fits into your RMD strategy, I am happy to help. Just reply to this email.</p>
<p>Warm regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. This is educational content and does not constitute tax advice. Consult your tax professional for your specific situation.</p>` },
  { id:'e-2-11', subject:"Benchmarking your annuity's performance", previewText:"How to know if your contract is delivering fair value.", sendDay:63, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>One of the most common questions we hear from annuity owners is: "How do I know if my annuity is performing well?" It is a fair question, and the answer requires looking beyond a single number.</p>
<p>Here is a simple framework for benchmarking your annuity:</p>
<ul>
<li><strong>Compare net returns, not gross.</strong> Your annuity's growth after all fees is what matters. A contract that shows 7% gross returns but charges 3% in total fees delivers only 4% net.</li>
<li><strong>Use the right benchmark.</strong> A fixed annuity should be compared to other fixed-income alternatives, not the stock market. A variable annuity should be compared to portfolios with a similar risk profile.</li>
<li><strong>Factor in the guarantees.</strong> If your annuity provides downside protection or guaranteed income, that has value. Pure return comparisons may not capture the full picture.</li>
<li><strong>Consider the alternatives.</strong> What would your money be doing if it were not in this annuity? That comparison helps you understand the opportunity cost.</li>
</ul>
<p>Performance evaluation is not about declaring your annuity good or bad. It is about making sure the value you receive justifies the costs you pay.</p>
<p>If you would like help running these numbers for your specific contract, just reply. We are happy to walk through it with you.</p>
<p>Best regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. Past performance does not predict future results. Individual contract features vary.</p>` },
  { id:'e-2-12', subject:"Thought you'd find this valuable", previewText:"A final note and an open invitation from our team.", sendDay:70, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>Over the past several weeks, we have shared what we believe every annuity owner should know — from understanding fee structures and surrender schedules to evaluating income riders, tax-deferred growth, and legacy planning.</p>
<p>Here is a quick recap of what we covered:</p>
<ul>
<li>How annuity fees are layered and what they add up to</li>
<li>The importance of knowing your surrender schedule</li>
<li>How income riders work and when to activate them</li>
<li>Key differences between fixed, variable, and indexed annuities</li>
<li>Tax-deferred growth benefits and RMD considerations</li>
<li>How to benchmark your contract's performance</li>
</ul>
<p>If any of these topics resonated with you, the natural next step is a personalized review. It takes about 20 minutes, is completely complimentary, and comes with no obligation. You will walk away with a clear understanding of where your annuity stands and what your options are.</p>
<p>Whether you are ready for that conversation today or sometime in the future, our door is always open. Simply reply to this email whenever the timing feels right.</p>
<p>Thank you for your time, {{first_name}}. It has been a pleasure sharing these insights with you.</p>
<p>Warm regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. You are receiving this email because you opted in to educational content from Florida Financial Advisors.</p>` },
];

const retirementEmails: EmailStep[] = [
  { id:'e-3-1', subject:"A quick retirement self-check", previewText:"Five questions that reveal more than you might expect.", sendDay:0, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>No matter where you are on the retirement timeline, these five questions can reveal a lot about your readiness:</p>
<ul>
<li><strong>Do you know your "number"?</strong> That is, the amount of savings you need to maintain your desired lifestyle in retirement.</li>
<li><strong>Are you maximizing your tax-advantaged accounts?</strong> Contributions to 401(k)s, IRAs, and HSAs can make a significant difference over time.</li>
<li><strong>Do you have a plan for healthcare before Medicare?</strong> If you retire before 65, this gap can be one of your largest expenses.</li>
<li><strong>Have you thought about Social Security timing?</strong> When you claim can affect your lifetime benefits by tens of thousands of dollars.</li>
<li><strong>Is your portfolio positioned for where you are today?</strong> The right allocation at 40 is very different from the right allocation at 60.</li>
</ul>
<p>If any of those gave you pause, you are not alone. Most people we talk to are uncertain about at least one or two of these areas.</p>
<p>Would it be helpful to talk through your answers together? I am happy to set aside some time. Just reply to this email.</p>
<p>Warm regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. This is educational content only. Individual retirement needs vary.</p>` },
  { id:'e-3-2', subject:"The Social Security timing question", previewText:"When you claim can be worth six figures over your lifetime.", sendDay:4, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>The decision of when to claim Social Security is one of the most impactful financial choices you will make in retirement. The difference between a good strategy and a suboptimal one can amount to tens of thousands — sometimes over $100,000 — in lifetime benefits.</p>
<p>Here is a simplified overview of the trade-offs:</p>
<ul>
<li><strong>Claim at 62:</strong> You receive benefits earlier, but they are permanently reduced by up to 30% compared to your full retirement age benefit.</li>
<li><strong>Claim at full retirement age (66-67):</strong> You receive your full calculated benefit.</li>
<li><strong>Delay until 70:</strong> Your benefit grows by approximately 8% per year past full retirement age. That is a meaningful increase in guaranteed lifetime income.</li>
</ul>
<p>The right answer depends on several factors: your health, your spouse's situation, your other income sources, and your overall financial plan. There is no one-size-fits-all answer.</p>
<p>We help people model this decision regularly. If you would like us to walk through the scenarios for your specific situation, just reply to this email.</p>
<p>Best regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. Social Security benefits vary by individual. This is educational content only.</p>` },
  { id:'e-3-3', subject:"The retirement cost most people miss", previewText:"It is not housing, travel, or daily living expenses.", sendDay:8, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>When people picture retirement expenses, they tend to think about housing, travel, and everyday living costs. But there is one expense that consistently catches retirees off guard: healthcare.</p>
<p>According to various industry estimates, a 65-year-old couple may need $300,000 or more to cover healthcare costs throughout retirement. That figure can vary widely depending on your health, location, and coverage choices.</p>
<p>A few realities worth planning for:</p>
<ul>
<li><strong>Medicare does not cover everything.</strong> There are premiums, deductibles, copays, and significant gaps — particularly for dental, vision, and hearing.</li>
<li><strong>Supplemental coverage varies.</strong> Medicare Supplement and Medicare Advantage plans have very different cost structures and trade-offs.</li>
<li><strong>Long-term care is the wild card.</strong> Neither Medicare nor most health insurance covers extended nursing home or assisted living stays.</li>
</ul>
<p>The good news is that with thoughtful planning, healthcare costs can be anticipated and managed. The key is building them into your retirement projections rather than hoping for the best.</p>
<p>Would it be helpful to look at how healthcare costs fit into your retirement picture? Just reply and we can set up a time.</p>
<p>Warm regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. Healthcare cost estimates are approximations and vary by individual. This is educational content only.</p>` },
  { id:'e-3-4', subject:"Income planning: beyond the savings number", previewText:"How you withdraw matters as much as how much you saved.", sendDay:14, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>Most retirement conversations focus on one question: "Do I have enough saved?" It is an important question, but it is only half the picture. Equally important is how you turn those savings into reliable income.</p>
<p>Here are a few concepts worth understanding:</p>
<ul>
<li><strong>The 4% rule is a starting point, not a law.</strong> The idea of withdrawing 4% of your portfolio annually has been a common guideline, but it does not account for your specific tax situation, market conditions, or spending patterns.</li>
<li><strong>Multiple income sources add stability.</strong> Social Security, pensions, annuity income, and portfolio withdrawals can work together to create a more resilient income plan than relying on any single source.</li>
<li><strong>Sequence of returns matters.</strong> A market downturn in your first few years of retirement can have an outsized impact on how long your money lasts, even if long-term averages remain strong.</li>
</ul>
<p>Building a solid income distribution strategy before you retire gives you the confidence to enjoy your retirement rather than worry through it.</p>
<p>If you would like to explore what a retirement income plan could look like for your situation, I am happy to walk through it with you. Just reply to this email.</p>
<p>Best regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. Withdrawal strategies depend on individual circumstances. This is educational content only.</p>` },
  { id:'step-ret-5', subject:"Tax brackets in retirement", previewText:"Your tax situation may look different than you expect.", sendDay:21, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>
<p>Many people assume their tax rate will drop significantly in retirement. For some, that is true. But for others, the combination of Social Security benefits, Required Minimum Distributions, and other income sources can push them into a higher bracket than they anticipated.</p>
<p>A few things worth understanding:</p>
<ul>
<li><strong>Up to 85% of Social Security can be taxable.</strong> Depending on your total income, a significant portion of your Social Security benefits may be subject to federal income tax.</li>
<li><strong>RMDs create taxable income.</strong> Once you reach age 73, Required Minimum Distributions from traditional IRAs and 401(k)s are mandatory and fully taxable as ordinary income.</li>
<li><strong>Roth conversions can help.</strong> Converting traditional IRA funds to a Roth during lower-income years can reduce future RMDs and create a source of tax-free income in retirement.</li>
</ul>
<p>Tax bracket management is one of the most underappreciated aspects of retirement planning. A little foresight can make a meaningful difference in how much of your savings you actually get to keep.</p>
<p>If you would like to explore how taxes might affect your retirement income, I am happy to walk through it with you. Just reply to this email.</p>
<p>Best regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. This is educational content and does not constitute tax advice. Consult your tax professional.</p>` },
  { id:'step-ret-6', subject:"Catch-up contributions: a useful tool", previewText:"If you are 50 or older, you have extra options.", sendDay:28, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>
<p>If you are 50 or older, the IRS allows you to make additional "catch-up" contributions to your retirement accounts beyond the standard limits. It is one of those provisions that is easy to overlook but can make a real difference.</p>
<p>Here is a quick summary of the current opportunities:</p>
<ul>
<li><strong>401(k) and 403(b) plans</strong> allow an additional catch-up contribution on top of the standard employee limit for those 50 and older.</li>
<li><strong>Traditional and Roth IRAs</strong> also offer a smaller but still meaningful catch-up amount for the same age group.</li>
<li><strong>Health Savings Accounts (HSAs)</strong> allow additional contributions for those 55 and older, and HSA funds can be used tax-free for qualified medical expenses in retirement.</li>
</ul>
<p>These extra contributions compound over time. If you have ten or fifteen years until retirement, the additional savings can add up to a significant sum.</p>
<p>Even if you cannot maximize every account, contributing a little more where you can is a step worth considering. The key is understanding which accounts offer the most benefit for your specific tax and retirement situation.</p>
<p>Happy to chat if you would like to explore your options. Just reply to this email.</p>
<p>Warm regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. Contribution limits change annually. This is educational content only.</p>` },
  { id:'step-ret-7', subject:"Sequence of returns: a risk worth knowing", previewText:"When you retire can matter as much as how much you saved.", sendDay:35, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>
<p>Here is a concept that does not get enough attention: sequence of returns risk. It is the idea that the order in which you experience investment returns matters enormously when you are withdrawing from your portfolio.</p>
<p>Consider two retirees with identical savings and identical average returns over 20 years. If one experiences poor returns in the first few years of retirement while making withdrawals, their portfolio may run out of money years earlier than the other — even though the long-term average was the same.</p>
<p>Why does this happen?</p>
<ul>
<li><strong>Withdrawals during downturns lock in losses.</strong> When you sell investments at depressed prices to fund living expenses, those shares are no longer available to participate in the eventual recovery.</li>
<li><strong>The early years matter most.</strong> The first five to ten years of retirement have a disproportionate impact on whether your portfolio can sustain your withdrawals for the long term.</li>
<li><strong>Planning can mitigate the risk.</strong> Strategies like maintaining a cash reserve, using a bucket approach, or having guaranteed income sources can help buffer against poor early returns.</li>
</ul>
<p>Sequence risk is one of several reasons why a well-thought-out withdrawal strategy matters as much as how much you have saved.</p>
<p>If you would like to discuss how to build this kind of resilience into your retirement plan, just reply to this email.</p>
<p>Best regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. Investment returns are not guaranteed and past performance does not predict future results.</p>` },
  { id:'step-ret-8', subject:"Picturing your retirement lifestyle", previewText:"Planning works best when it starts with what matters to you.", sendDay:42, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>
<p>Most retirement planning conversations jump straight to numbers: savings rates, portfolio balances, withdrawal percentages. But the most effective planning starts with a different kind of question: <strong>What do you actually want your retirement to look like?</strong></p>
<p>Here are a few areas worth thinking about:</p>
<ul>
<li><strong>Where will you live?</strong> Staying in your current home, downsizing, relocating to a different state, or splitting time between two places all have very different financial implications.</li>
<li><strong>How will you spend your time?</strong> Travel, hobbies, volunteering, part-time work, or spending more time with family all shape your budget in different ways.</li>
<li><strong>What does "enough" look like?</strong> Some people want to maintain their current lifestyle exactly. Others are happy to simplify. Knowing your target makes the math much clearer.</li>
</ul>
<p>Once you have a clear picture of the life you want, building the financial plan to support it becomes much more straightforward. The numbers serve the vision, not the other way around.</p>
<p>If you would like to talk through what your ideal retirement looks like and what it might take to get there, I would enjoy that conversation. Just reply to this email.</p>
<p>Warm regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. Individual retirement needs and goals vary.</p>` },
  { id:'step-ret-9', subject:"Estate planning basics for retirement", previewText:"Protecting what you have built for the people you love.", sendDay:49, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>
<p>Estate planning is one of those topics people know is important but often put off. Retirement is an ideal time to get your plan in order — or to review one you created years ago.</p>
<p>Five things worth reviewing now:</p>
<ul>
<li><strong>Beneficiary designations.</strong> These override your will. If you have had a life change, your designations may be outdated. We see this more often than you might expect.</li>
<li><strong>Power of attorney.</strong> Both financial and healthcare powers of attorney ensure someone you trust can act on your behalf if you are unable to.</li>
<li><strong>Trust considerations.</strong> Depending on the size of your estate and your goals, a trust can help avoid probate, reduce estate taxes, and protect assets for your heirs.</li>
<li><strong>Inherited IRA rules.</strong> The SECURE Act changed the rules for inherited IRAs. Your beneficiaries may face a 10-year distribution window that could create a meaningful tax burden.</li>
<li><strong>Charitable giving strategies.</strong> Qualified Charitable Distributions and donor-advised funds can help you support causes you care about while potentially reducing your tax liability.</li>
</ul>
<p>Estate planning works best as part of a comprehensive retirement strategy, not in isolation. If you have not reviewed these areas recently, it may be time for a fresh look.</p>
<p>Happy to chat if you would like to discuss any of these topics. Just reply to this email.</p>
<p>Best regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. This is educational content and does not constitute legal or tax advice.</p>` },
  { id:'step-ret-10', subject:"Thinking about your legacy", previewText:"Retirement planning is not just about you — it is about what you leave behind.", sendDay:56, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>
<p>For many people, retirement planning is not only about funding their own lifestyle. It is also about the legacy they want to leave — for their children, grandchildren, or the causes they care about.</p>
<p>Here are a few legacy-related topics worth considering:</p>
<ul>
<li><strong>How much is "enough" for you vs. your heirs?</strong> Some people want to spend freely and leave whatever remains. Others have specific goals for what they want to pass on. Both approaches are valid, but they lead to very different financial strategies.</li>
<li><strong>Tax-efficient wealth transfer.</strong> The way you pass on assets matters. Roth accounts, life insurance, and trusts each have different tax implications for your beneficiaries.</li>
<li><strong>Charitable legacy.</strong> If giving is important to you, there are strategies that can benefit both the causes you support and your overall tax situation during your lifetime.</li>
</ul>
<p>Legacy planning is deeply personal. There is no right or wrong answer — only what is right for you and your family. The important thing is to be intentional about it rather than leaving things to chance.</p>
<p>If you would like to explore how legacy goals fit into your broader retirement plan, I would be happy to talk it through. Just reply to this email.</p>
<p>Warm regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. Individual estate and legacy planning needs vary. This is educational content only.</p>` },
  { id:'step-ret-11', subject:"Predictable income in retirement", previewText:"Understanding the building blocks of retirement income.", sendDay:63, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>
<p>One of the biggest concerns people have about retirement is outliving their money. Guaranteed income sources can help address that concern by providing a floor of predictable income that does not depend on market performance.</p>
<p>Here are the most common sources of guaranteed retirement income:</p>
<ul>
<li><strong>Social Security.</strong> For most retirees, this is the foundation. Benefits are adjusted for inflation and last a lifetime, making Social Security one of the most valuable assets in your retirement plan.</li>
<li><strong>Pensions.</strong> If you have one, it provides predictable monthly income. Understanding your payout options — lump sum vs. annuity, survivor benefits — is critical before making an election.</li>
<li><strong>Annuities.</strong> Insurance products that can convert a lump sum into a stream of guaranteed income. They come in many forms, each with different features, costs, and trade-offs.</li>
</ul>
<p>The right mix of guaranteed and portfolio-based income depends on your spending needs, risk tolerance, and other assets. Some people feel comfortable relying more heavily on their investment portfolio. Others sleep better knowing a larger portion of their expenses is covered by guaranteed sources.</p>
<p>If you would like to explore what role guaranteed income should play in your retirement plan, just reply to this email. I would be happy to walk through it with you.</p>
<p>Best regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. Guarantees are subject to the claims-paying ability of the issuing insurance company. This is educational content only.</p>` },
  { id:'step-ret-12', subject:"Your retirement roadmap starts here", previewText:"A personalized look at where you stand and where you are headed.", sendDay:70, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>
<p>Over the past several weeks, we have shared insights on some of the most important aspects of retirement planning — from Social Security timing and healthcare costs to tax strategies, legacy goals, and building reliable income.</p>
<p>Here is what we covered together:</p>
<ul>
<li>A retirement readiness self-assessment</li>
<li>Social Security claiming strategies</li>
<li>Healthcare cost planning and Medicare basics</li>
<li>Income distribution and tax bracket management</li>
<li>Sequence of returns risk and catch-up contributions</li>
<li>Estate planning, legacy goals, and guaranteed income</li>
</ul>
<p>If any of these topics resonated with you, the natural next step is a personalized Retirement Readiness Assessment. Here is what that looks like:</p>
<ul>
<li>A one-on-one conversation with one of our experienced advisors</li>
<li>A clear picture of where you stand relative to your goals</li>
<li>Specific, actionable ideas tailored to your situation</li>
</ul>
<p>The assessment takes about 30 minutes, is completely complimentary, and comes with no obligation. Whether you are five years from retirement or fifteen, having a clear roadmap makes a difference.</p>
<p>Would it be helpful to set up a time? Simply reply to this email and we will take it from there.</p>
<p>Thank you for your time, {{first_name}}. It has been a pleasure sharing these insights with you.</p>
<p>Warm regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. You are receiving this email because you opted in to educational content from Florida Financial Advisors.</p>` },
];

const investmentEmails: EmailStep[] = [
  { id:'e-4-1', subject:"A question about your investments", previewText:"How did your portfolio really perform last year?", sendDay:0, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>Here is a question that sounds simple but most investors cannot answer: How did your portfolio actually perform last year — after fees, after inflation, and adjusted for risk?</p>
<p>It is not a trick question. It is just that the number on your statement rarely tells the whole story. Understanding your real, net returns is the foundation of making informed decisions about your financial future.</p>
<p>A few things worth looking at:</p>
<ul>
<li><strong>Returns vs. an appropriate benchmark.</strong> How does your portfolio compare to a diversified index with a similar risk profile?</li>
<li><strong>Total fees paid.</strong> Fund expenses, advisory fees, and transaction costs all reduce what you actually earn.</li>
<li><strong>Risk-adjusted performance.</strong> A portfolio that earned 10% but took twice the risk of the market may not be as impressive as it appears.</li>
</ul>
<p>We believe every investor deserves clarity about how their money is really working. If you would like a straightforward look at your portfolio's performance, I am happy to walk through it with you.</p>
<p>Would that be helpful? Just reply to this email.</p>
<p>Best regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. Past performance does not predict future results. This is educational content only.</p>` },
  { id:'e-4-2', subject:"What risk tolerance really means", previewText:"It is more nuanced than most questionnaires suggest.", sendDay:4, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>Most investment questionnaires ask how you feel about risk. But your feelings are only one side of the coin. Equally important is your capacity to take risk — and the two do not always align.</p>
<p><strong>Risk tolerance</strong> is emotional. It is how much volatility you can stomach without losing sleep or making impulsive decisions.</p>
<p><strong>Risk capacity</strong> is financial. It is how much risk you can objectively afford given your income, savings, time horizon, and obligations.</p>
<p>Consider two scenarios:</p>
<ul>
<li>A 35-year-old with decades until retirement has high risk capacity but may have low tolerance after experiencing a market downturn. An overly conservative portfolio could cost them significant growth.</li>
<li>A 60-year-old nearing retirement may feel comfortable with aggressive investments but may not have the time horizon to recover from a major loss.</li>
</ul>
<p>The best investment strategy aligns both dimensions. A portfolio that ignores your tolerance will lead to poor decisions during downturns. A portfolio that ignores your capacity may leave you short of your goals.</p>
<p>If you are curious about how your current portfolio matches your actual risk profile, I am happy to discuss it. Just reply to this email.</p>
<p>Warm regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. Individual risk profiles vary. This is educational content only.</p>` },
  { id:'e-4-3', subject:"Diversification: beyond the basics", previewText:"Owning many funds does not always mean you are diversified.", sendDay:8, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>Diversification is one of the most talked-about concepts in investing, yet it is often misunderstood. Owning ten mutual funds does not necessarily mean you are diversified — especially if they all hold similar stocks.</p>
<p>Here are some common diversification gaps we see:</p>
<ul>
<li><strong>Style concentration.</strong> Owning multiple large-cap growth funds creates overlap, not diversification. True diversification includes different styles, sizes, and sectors.</li>
<li><strong>Home country bias.</strong> Many investors are heavily weighted toward domestic stocks, even though international markets represent roughly half of global market capitalization.</li>
<li><strong>Missing asset classes.</strong> A portfolio of only stocks and bonds misses opportunities in real estate, commodities, or inflation-protected securities that can improve resilience.</li>
<li><strong>Single stock risk.</strong> Concentrated positions — whether from company stock, inheritance, or past success — can create outsized risk that a diversified portfolio is designed to avoid.</li>
</ul>
<p>True diversification means owning assets that respond differently to the same economic conditions. The goal is not to find the single best performer — it is to build a portfolio that holds up across a range of scenarios.</p>
<p>If you would like to see how your portfolio's diversification measures up, I am happy to take a look. Just reply to this email.</p>
<p>Best regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. Diversification does not ensure a profit or protect against loss. This is educational content only.</p>` },
  { id:'e-4-4', subject:"The real impact of investment fees", previewText:"Small percentages can lead to surprisingly large differences.", sendDay:14, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>Investment fees are easy to overlook because they are expressed as small percentages. But over a lifetime of investing, those small percentages compound into significant sums.</p>
<p>Consider a hypothetical example: a $500,000 portfolio earning an average of 7% annually over 25 years.</p>
<ul>
<li><strong>At 0.5% total fees:</strong> the portfolio grows to approximately $2.71 million</li>
<li><strong>At 1.5% total fees:</strong> approximately $2.09 million</li>
<li><strong>The difference:</strong> roughly $620,000 — from the same starting point and the same market returns</li>
</ul>
<p>Most investors pay fees at multiple levels: fund expense ratios, advisory fees, transaction costs, and account fees. Many of these are not clearly itemized on your statements.</p>
<p>That said, fees are not inherently bad. Good financial advice, proper tax management, and behavioral coaching during volatile markets can be worth far more than their cost. The key is transparency — knowing what you pay and what you receive in return.</p>
<p>If you would like to understand the total fees you are currently paying, I am happy to walk through it with you. Just reply to this email.</p>
<p>Warm regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. The example above is hypothetical and for illustration only. Actual results will vary.</p>` },
  { id:'step-inv-5', subject:"Staying the course during volatility", previewText:"Your reaction matters more than the downturn itself.", sendDay:21, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>
<p>When markets drop sharply, every instinct tells us to do something — sell, move to cash, wait on the sidelines until things calm down. It feels like the safe choice. But decades of market data tell a different story.</p>
<p>Some of the market's strongest days have historically occurred shortly after its worst days. Investors who moved to cash during downturns and waited for things to settle often missed the recovery that followed.</p>
<p>Research has shown that missing just the ten best days in the market over a 20-year period could cut your total returns by more than half. The challenge is that no one can consistently predict which days those will be.</p>
<p>Here is what you can do instead:</p>
<ul>
<li><strong>Review your allocation.</strong> Make sure your portfolio reflects your actual time horizon, not your emotional state during a downturn.</li>
<li><strong>Rebalance thoughtfully.</strong> Market drops can create opportunities to buy assets at lower prices through disciplined rebalancing.</li>
<li><strong>Focus on what you can control.</strong> Your savings rate, tax strategy, and diversification are within your control. Market returns are not.</li>
</ul>
<p>Volatility is the price of admission for long-term growth. Having a plan and sticking to it has historically been one of the most effective investment strategies available.</p>
<p>If you would like to discuss how your portfolio is positioned for turbulent markets, just reply to this email.</p>
<p>Best regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. Past performance does not predict future results. This is educational content only.</p>` },
  { id:'step-inv-6', subject:"Asset allocation by life stage", previewText:"Your portfolio should evolve as your life evolves.", sendDay:28, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>
<p>Your investment needs at 35 are very different from your needs at 55 or 70. Yet many investors set their portfolio allocation once and rarely revisit it, even as their life circumstances change dramatically.</p>
<p>Here is a general framework for how allocation considerations tend to shift over time:</p>
<ul>
<li><strong>Early career (20s-30s).</strong> With decades until retirement, you generally have the capacity to take more risk. A heavier allocation to growth-oriented investments allows time for compounding to work in your favor.</li>
<li><strong>Mid-career (40s-50s).</strong> As retirement draws closer, gradually shifting toward a more balanced allocation can help protect what you have built while still pursuing growth.</li>
<li><strong>Pre-retirement (late 50s-60s).</strong> The transition from accumulation to distribution is one of the most critical periods. Reducing concentration risk and building income-producing positions becomes more important.</li>
<li><strong>In retirement (65+).</strong> The focus shifts to sustainability, income, and inflation protection. But even in retirement, maintaining some growth exposure is important for a portfolio that may need to last 25 to 30 years.</li>
</ul>
<p>These are generalizations, of course. Your personal situation — health, income needs, other assets, and goals — should drive the specifics.</p>
<p>If your portfolio has not been adjusted to reflect where you are in life today, it may be worth a conversation. Just reply to this email.</p>
<p>Warm regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. Asset allocation does not ensure a profit or protect against loss. Individual situations vary.</p>` },
  { id:'step-inv-7', subject:"Tax-efficient investing strategies", previewText:"What you keep after taxes matters more than what you earn.", sendDay:35, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>
<p>Many investors focus on gross returns, but what truly matters is what you keep after taxes. A few thoughtful strategies can make a meaningful difference in your after-tax wealth over time.</p>
<p>Here are some approaches worth knowing about:</p>
<ul>
<li><strong>Tax-loss harvesting.</strong> When an investment declines in value, selling it can generate a tax loss that offsets gains elsewhere in your portfolio. The proceeds can be reinvested in a similar holding to maintain your market exposure.</li>
<li><strong>Asset location.</strong> Placing tax-inefficient investments like taxable bonds in tax-advantaged accounts, and tax-efficient investments like index funds in taxable accounts, can improve your after-tax returns.</li>
<li><strong>Gain timing.</strong> Recognizing capital gains in years when your income is lower can reduce your tax rate on those gains. This is especially relevant around retirement transitions.</li>
<li><strong>Qualified Charitable Distributions.</strong> If you are over 70-1/2 and charitably inclined, donating directly from your IRA can satisfy your Required Minimum Distribution without increasing your taxable income.</li>
</ul>
<p>These strategies require ongoing attention and coordination between your investment management and tax planning. That is the kind of comprehensive approach that can add real value over time.</p>
<p>If you would like to discuss how tax-efficient strategies could apply to your portfolio, just reply to this email.</p>
<p>Best regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. This is educational content and does not constitute tax advice. Consult your tax professional.</p>` },
  { id:'step-inv-8', subject:"The discipline of rebalancing", previewText:"A simple habit that can improve long-term outcomes.", sendDay:42, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>
<p>Over time, market movements cause your portfolio to drift from its original allocation. Stocks that have done well grow to represent a larger share of your portfolio, while underperforming assets shrink. Left unchecked, your portfolio may take on more risk than you intended.</p>
<p>Rebalancing is the process of bringing your portfolio back to its target allocation. Here is why it matters:</p>
<ul>
<li><strong>It manages risk.</strong> After a strong stock market run, your portfolio may be more heavily weighted toward equities than you planned. Rebalancing restores the risk level you originally chose.</li>
<li><strong>It enforces discipline.</strong> Rebalancing essentially means selling some of what has risen and buying some of what has fallen. It is a systematic way to avoid chasing performance.</li>
<li><strong>It can be done tax-efficiently.</strong> Using new contributions, dividends, or tax-advantaged accounts to rebalance can minimize the tax impact of selling appreciated positions.</li>
</ul>
<p>There is no perfect rebalancing frequency. Some investors rebalance on a schedule (quarterly or annually), while others use threshold triggers (rebalancing when any asset class drifts more than a set percentage from its target). Both approaches can work well.</p>
<p>If you are unsure whether your portfolio has drifted from its intended allocation, I am happy to take a look. Just reply to this email.</p>
<p>Warm regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. Rebalancing does not ensure a profit or protect against loss. This is educational content only.</p>` },
  { id:'step-inv-9', subject:"The cost of waiting to invest", previewText:"Time in the market has historically mattered more than timing.", sendDay:49, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>
<p>One of the most common investment mistakes is not a bad stock pick or a poorly timed trade. It is simply waiting too long to get started or to make adjustments you know you should make.</p>
<p>Here is why delay can be so costly:</p>
<ul>
<li><strong>Compounding needs time to work.</strong> The earlier your money is invested, the more time it has to grow. Even modest returns can produce meaningful results over decades.</li>
<li><strong>Waiting for the "right time" rarely works.</strong> Research has consistently shown that time in the market tends to matter more than timing the market. Investors who try to wait for a perfect entry point often miss significant gains.</li>
<li><strong>Inaction is a decision.</strong> Keeping money in a savings account or an underperforming portfolio has an opportunity cost. The question is not just what you might lose by investing, but what you might miss by not investing.</li>
</ul>
<p>None of this means you should rush into anything without a plan. Thoughtful, informed action is always better than hasty decisions. But if you have been meaning to review your investment approach and keep putting it off, consider this a gentle nudge.</p>
<p>Happy to chat if you would like to explore what a more intentional investment strategy could look like for your situation. Just reply to this email.</p>
<p>Best regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. Investing involves risk including potential loss of principal. Past performance does not predict future results.</p>` },
  { id:'step-inv-10', subject:"Values-based investing: a growing trend", previewText:"Aligning your portfolio with what matters to you.", sendDay:56, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>
<p>A growing number of investors are interested in aligning their portfolios with their personal values — whether that means prioritizing environmental sustainability, social responsibility, or strong corporate governance. This approach is broadly known as ESG investing.</p>
<p>Here is a quick overview:</p>
<ul>
<li><strong>What it is.</strong> ESG investing considers environmental, social, and governance factors alongside traditional financial analysis when selecting investments. It is not about sacrificing returns — it is about incorporating a broader set of criteria into your decision-making.</li>
<li><strong>Performance considerations.</strong> Research on ESG performance is mixed and evolving. Some studies suggest ESG-focused portfolios can perform comparably to traditional portfolios over the long term, while others highlight trade-offs depending on the specific approach and time period.</li>
<li><strong>Implementation options.</strong> ESG strategies range from simple screening (excluding certain industries) to active engagement (investing in companies working to improve their practices). The right approach depends on your priorities and how actively you want your values reflected.</li>
</ul>
<p>Values-based investing is not for everyone, and it involves trade-offs worth understanding. But if aligning your investments with your values is important to you, there are more options available today than ever before.</p>
<p>If you are curious about how this might work within your portfolio, I am happy to discuss it. Just reply to this email.</p>
<p>Warm regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. ESG investing involves trade-offs and does not ensure a profit. This is educational content only.</p>` },
  { id:'step-inv-11', subject:"Why regular portfolio reviews matter", previewText:"Your investments should evolve as your life does.", sendDay:63, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>
<p>Your investments should evolve as your life evolves. Yet many people set their portfolio once and rarely revisit it — even as their circumstances change dramatically.</p>
<p>Here are some life events that typically warrant a portfolio review:</p>
<ul>
<li><strong>Career changes.</strong> A new job, promotion, or transition to self-employment can change your income, benefits, and retirement account options.</li>
<li><strong>Marriage or divorce.</strong> Combining or separating finances affects your tax situation, estate plan, and overall investment approach.</li>
<li><strong>Having children.</strong> Education funding, increased insurance needs, and a longer planning horizon all impact how your portfolio should be structured.</li>
<li><strong>Receiving an inheritance.</strong> A sudden increase in assets requires thoughtful integration to avoid concentration risk and tax surprises.</li>
<li><strong>Approaching retirement.</strong> The shift from accumulation to distribution is one of the most significant transitions in your financial life.</li>
</ul>
<p>Even without a major life event, an annual review helps ensure your portfolio stays aligned with your goals, risk profile, and time horizon. Markets shift, tax laws change, and new opportunities emerge.</p>
<p>If you have experienced a significant change recently or simply have not reviewed your portfolio in a while, it may be worth a conversation. Just reply to this email.</p>
<p>Best regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. Individual circumstances vary. This is educational content only.</p>` },
  { id:'step-inv-12', subject:"Thought you'd find this useful", previewText:"A final note and an open invitation from our team.", sendDay:70, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>
<p>Over the past several weeks, we have shared insights on portfolio performance, risk assessment, diversification, fees, market volatility, tax strategies, rebalancing, and the importance of aligning your investments with your life stage and values.</p>
<p>Here is what we covered together:</p>
<ul>
<li>How to evaluate your portfolio's real performance</li>
<li>Understanding risk tolerance vs. risk capacity</li>
<li>Diversification beyond the basics</li>
<li>The long-term impact of investment fees</li>
<li>Staying disciplined during market volatility</li>
<li>Tax-efficient investing strategies and rebalancing</li>
<li>Values-based investing and regular portfolio reviews</li>
</ul>
<p>If any of these topics resonated with you, the natural next step is a personalized portfolio analysis. It takes about 30 minutes, is completely complimentary, and comes with no obligation. You will walk away with a clear understanding of where you stand and specific ideas for improvement.</p>
<p>Whether you are ready for that conversation today or sometime in the future, our door is always open. Simply reply to this email whenever the timing feels right.</p>
<p>Thank you for your time, {{first_name}}. It has been a pleasure sharing these insights with you.</p>
<p>Warm regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. You are receiving this email because you opted in to educational content from Florida Financial Advisors.</p>` },
];

const secondOpinionEmails: EmailStep[] = [
  { id:'e-5-1', subject:"A fresh pair of eyes changes things", previewText:"What a second perspective could reveal about your plan.", sendDay:0, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>When something important is on the line, most people seek a second perspective. We do it with medical diagnoses, legal contracts, even home inspections. Yet when it comes to a financial plan that shapes our family's future, many of us never think to do the same.</p>

<p>A fresh set of eyes on your finances can surface things that are easy to miss from the inside:</p>

<ul>
  <li><strong>Tax-saving strategies</strong> that may not be part of your current approach</li>
  <li><strong>Overlooked fees</strong> quietly compounding against your returns</li>
  <li><strong>Coverage gaps</strong> that could leave your family exposed</li>
</ul>

<p>The goal is not to find fault with what you have. It is to make sure your plan is working as hard as it can for where you are today.</p>

<p>Would it be helpful to take a quick look together? Simply reply and we will find a convenient time.</p>

<p>Warm regards,<br/>The FFA North Team</p>` },
  { id:'e-5-2', subject:"What a review actually looks like", previewText:"No surprises. Here is the step-by-step process.", sendDay:4, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>One reason people hesitate to get a second opinion on their finances is uncertainty about what the process involves. So let us pull back the curtain.</p>

<p>Here is exactly how it works:</p>

<ul>
  <li><strong>A brief conversation.</strong> We spend about ten minutes learning what matters most to you right now.</li>
  <li><strong>You share what you are comfortable with.</strong> Statements, account summaries, insurance policies — whatever you would like us to review.</li>
  <li><strong>We do the analysis.</strong> Our team looks across investments, insurance, tax positioning, and estate coordination.</li>
  <li><strong>We walk you through findings in plain language.</strong> No jargon, no pressure — just clear observations.</li>
</ul>

<p>After that, the information is yours. You decide whether to act on it, file it away, or simply feel more confident about your current path.</p>

<p>Would it be helpful to take a quick look together? Reply to this email and we will get you scheduled.</p>

<p>Best regards,<br/>The FFA North Team</p>` },
  { id:'e-5-3', subject:"The five most common blind spots", previewText:"What financial reviews uncover again and again.", sendDay:8, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>After conducting hundreds of financial reviews, certain patterns come up again and again. These are not dramatic problems — they are quiet blind spots that accumulate over time.</p>

<p>Here are the five findings we see most often:</p>

<ul>
  <li><strong>Tax inefficiency.</strong> No tax-loss harvesting strategy or Roth conversion planning in place.</li>
  <li><strong>Overlapping holdings.</strong> Multiple funds owning the same underlying stocks, which reduces true diversification.</li>
  <li><strong>Outdated beneficiaries.</strong> Life changed, but the forms on file did not keep up.</li>
  <li><strong>Insurance mismatches.</strong> Either too little coverage or paying more than necessary for existing policies.</li>
</ul>

<p>The encouraging part is that every one of these is fixable once you know it is there. The first step is simply understanding where things stand today.</p>

<p>Would it be helpful to take a quick look together? Just reply to this email and we will set something up.</p>

<p>Warm regards,<br/>The FFA North Team</p>` },
  { id:'e-5-4', subject:"Why smart people seek second opinions", previewText:"It is not about doubt. It is about confidence.", sendDay:14, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>There is a common misconception that seeking a second opinion means something is wrong. In reality, the most financially confident people we meet are the ones who actively invite outside perspectives.</p>

<p>Think of it this way: a second opinion does not replace your current approach. It either confirms you are on the right track — which is valuable peace of mind — or it highlights adjustments worth considering.</p>

<ul>
  <li><strong>Confirmation</strong> means you can move forward with greater confidence</li>
  <li><strong>New insights</strong> mean you caught something early enough to act on it</li>
  <li><strong>Either way</strong>, you walk away better informed than before</li>
</ul>

<p>There is no downside to knowing more about your own financial picture. And the conversation is always confidential.</p>

<p>Would it be helpful to take a quick look together? Reply anytime — or save this email for when the timing feels right.</p>

<p>Best regards,<br/>The FFA North Team</p>` },
  { id:'e-5-5', subject:"The doctor analogy that changes minds", previewText:"A perspective shift that applies to your finances.", sendDay:21, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>If your doctor recommended a major procedure, you would probably want another physician to weigh in before moving forward. Not because you distrust your doctor — but because important decisions deserve more than one perspective.</p>

<p>The same logic applies to your financial plan. Here is why:</p>

<ul>
  <li><strong>Different eyes see different things.</strong> Two qualified advisors may identify entirely different opportunities in the same portfolio.</li>
  <li><strong>Approaches vary.</strong> There is rarely a single correct strategy. A second perspective can surface options your current plan may not include.</li>
  <li><strong>Confidence grows with confirmation.</strong> Even if a review validates your current path, that reassurance has real value.</li>
</ul>

<p>A financial second opinion is not about finding fault. It is about making sure your plan reflects where you are today — not where you were when it was first created.</p>

<p>Would it be helpful to take a quick look together? Simply reply and we will find a time that works for you.</p>

<p>Warm regards,<br/>The FFA North Team</p>` },
  { id:'e-5-6', subject:"Signs your plan may need a refresh", previewText:"A quick checklist worth running through.", sendDay:28, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>Even well-built financial plans can drift off course quietly. Life changes, tax laws shift, and strategies that made sense a few years ago may not fit today. Here are a few signals worth paying attention to:</p>

<ul>
  <li><strong>Your plan has not been updated in over two years.</strong> Markets evolve, regulations change, and your own goals may have shifted.</li>
  <li><strong>You are unsure what you are paying in fees.</strong> If your advisor's compensation structure is unclear, that gap is worth closing.</li>
  <li><strong>Your beneficiary designations may be outdated.</strong> Major life events can make existing designations incorrect without anyone noticing.</li>
  <li><strong>You do not have a written plan.</strong> Without a documented roadmap, it is difficult to measure progress or hold anyone accountable.</li>
</ul>

<p>If even one of these resonated, a fresh perspective could provide useful clarity. None of these issues are unusual — they are simply the natural result of time passing.</p>

<p>Would it be helpful to take a quick look together? Reply to this email and we will schedule a confidential conversation at your convenience.</p>

<p>Best regards,<br/>The FFA North Team</p>` },
  { id:'e-5-7', subject:"Fiduciary vs. suitable — big difference", previewText:"Not all financial advice is held to the same bar.", sendDay:35, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>There is a distinction in financial advice that many people are not aware of, and it can meaningfully affect the recommendations you receive. It comes down to two standards.</p>

<p><strong>Fiduciary standard:</strong> The advisor is legally required to act in your best interest and disclose any conflicts of interest.</p>

<p><strong>Suitability standard:</strong> The advisor must recommend products that are "suitable" for you — but not necessarily the best available option.</p>

<p>Here is why the difference matters:</p>

<ul>
  <li>Two products may both be suitable, yet one could carry significantly higher fees</li>
  <li>Under the suitability standard, either recommendation is acceptable</li>
  <li>Under the fiduciary standard, the advisor must prioritize your interests first</li>
</ul>

<p>Knowing which standard your advisor follows is one of the most valuable questions you can ask. It shapes every recommendation they make on your behalf.</p>

<p>Would it be helpful to take a quick look together at how your current advisory relationship is structured? Simply reply to this email.</p>

<p>Warm regards,<br/>The FFA North Team</p>` },
  { id:'e-5-8', subject:"What small fee differences really cost", previewText:"The math behind percentages may surprise you.", sendDay:42, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>Most investors focus on returns, which makes sense. But fees can have an equally powerful effect on long-term wealth — because they compound just like returns do, except in the wrong direction.</p>

<p>Consider a hypothetical $750,000 portfolio growing at 7% annually over 20 years at different fee levels:</p>

<ul>
  <li><strong>At 0.50% fees:</strong> approximately $2,534,000</li>
  <li><strong>At 1.00% fees:</strong> approximately $2,172,000</li>
  <li><strong>At 1.50% fees:</strong> approximately $1,860,000</li>
  <li><strong>At 2.00% fees:</strong> approximately $1,592,000</li>
</ul>

<p>That is a potential difference of nearly $942,000 on the same portfolio with the same market returns. These are hypothetical figures for illustration, and actual results will vary.</p>

<p>That said, lower fees do not always mean better value. Comprehensive planning, tax optimization, and proactive service can more than justify their cost. The key is understanding what you are paying and what you are receiving in return.</p>

<p>Would it be helpful to take a quick look together at your current fee structure? Reply to this email and we will walk through it with you.</p>

<p>Best regards,<br/>The FFA North Team</p>` },
  { id:'e-5-9', subject:"A simple way to evaluate any advisor", previewText:"Five questions that reveal a lot.", sendDay:49, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>Evaluating a financial advisor goes well beyond investment returns. Here is a straightforward framework you can use to assess whether your current advisory relationship is serving you well:</p>

<ul>
  <li><strong>Communication.</strong> Does your advisor reach out proactively with relevant updates, or do you only hear from them when you initiate contact?</li>
  <li><strong>Transparency.</strong> Can you clearly see what you are paying in fees and how your advisor is compensated?</li>
  <li><strong>Comprehensiveness.</strong> Is your advisor looking at your full picture — investments, insurance, tax strategy, and estate planning — or just one piece?</li>
  <li><strong>Alignment.</strong> Has your plan been updated to reflect major life changes?</li>
</ul>

<p>If your current advisor scores well across the board, that is a great sign. If there are gaps, they are worth understanding — even small improvements in any of these areas can make a meaningful difference over time.</p>

<p>Would it be helpful to walk through this framework together as it relates to your situation? Just reply to this email.</p>

<p>Warm regards,<br/>The FFA North Team</p>` },
  { id:'e-5-10', subject:"Questions worth asking any advisor", previewText:"Use these before making financial changes.", sendDay:56, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>Whether you are considering a new advisor, restructuring your portfolio, or making any significant financial move, the right questions upfront can save you from costly surprises down the road.</p>

<p>Here are a few worth keeping in your back pocket:</p>

<ul>
  <li>What are the total fees — including fund expenses, platform costs, and advisory charges?</li>
  <li>Are you a fiduciary, and will you put that in writing?</li>
  <li>How will you coordinate with my CPA and estate attorney?</li>
  <li>What does ongoing service look like after the initial plan is built?</li>
</ul>

<p>These questions apply to any advisor — including us. We believe informed clients make better decisions, and we welcome the scrutiny. The more you understand about how your advisor operates, the more confidence you will have in the relationship.</p>

<p>Would it be helpful to discuss any of these in the context of your own situation? Reply to this email and we will set up a time to talk.</p>

<p>Best regards,<br/>The FFA North Team</p>` },
  { id:'e-5-11', subject:"What the Chen family discovered", previewText:"A real story about the value of a fresh look.", sendDay:63, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>We recently worked with a family — we will call them the Chens — who had been with the same advisor for over a decade. They were not unhappy. They simply wanted confirmation that their plan was still on track as retirement drew closer.</p>

<p>Their foundation was solid, but our review uncovered a few areas where adjustments could help:</p>

<ul>
  <li><strong>Fee overlap.</strong> Multiple mutual funds held the same underlying stocks, meaning they were paying layered fees for similar exposure.</li>
  <li><strong>Unrealized tax opportunities.</strong> Several positions had losses that could have offset gains elsewhere in the portfolio.</li>
  <li><strong>Outdated beneficiaries.</strong> Two accounts still named a former spouse — an oversight with potentially serious consequences.</li>
</ul>

<p>Some findings confirmed their existing plan was sound. Others led to improvements they had not considered. The Chens told us the peace of mind alone was worth the conversation.</p>

<p>Every situation is different, and past results do not predict future outcomes. But a second opinion can surface what you did not know to look for. Would it be helpful to take a quick look together? Reply to this email — it is confidential and there is no obligation.</p>

<p>Warm regards,<br/>The FFA North Team</p>` },
  { id:'e-5-12', subject:"An open invitation, whenever you are ready", previewText:"A confidential review with no strings attached.", sendDay:70, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>Over the past several weeks, we have explored what a financial second opinion can reveal — from overlooked fees and tax strategies to beneficiary oversights and advisor evaluation tips. We hope you found value in those insights, whether or not you decide to take the next step.</p>

<p>If you are curious about how your plan looks through a fresh lens, here is what we offer:</p>

<ul>
  <li>A review of your current investments, insurance coverage, and retirement approach</li>
  <li>A clear picture of your total fees and how they compare</li>
  <li>Identification of any gaps or opportunities worth considering</li>
  <li>A written summary of findings that belongs to you, no matter what</li>
</ul>

<p>There is no cost, no obligation to make changes, and everything you share stays strictly confidential. Our role is to educate — the decisions are always yours.</p>

<p>Would it be helpful to take a quick look together? Reply to this email or reach out at (561) 555-0100 whenever the timing feels right. We look forward to the conversation.</p>

<p>Warm regards,<br/>The FFA North Team</p>` },
];

const crossSellingEmails: EmailStep[] = [
  { id:'e-6-1', subject:"We appreciate your trust", previewText:"And here is how we can help even more.", sendDay:0, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>We wanted to start by saying thank you. Working with you on your insurance needs has been a genuine pleasure, and it tells us something important about you — you take protecting your family seriously.</p>

<p>Over time, we have noticed that insurance is often one piece of a larger puzzle. When it is managed in isolation from the rest of your financial life, small gaps can develop without anyone noticing:</p>

<ul>
  <li><strong>Retirement planning</strong> that ensures your income lasts</li>
  <li><strong>Investment management</strong> aligned with your goals and risk tolerance</li>
  <li><strong>Tax strategy</strong> to help you keep more of what you earn</li>
  <li><strong>Estate coordination</strong> so your assets go where you intend</li>
</ul>

<p>Over the next few weeks, we will share some thoughts on how these pieces work together. No pressure — just insights we hope you will find useful.</p>

<p>Warm regards,<br/>The FFA North Team</p>` },
  { id:'e-6-2', subject:"The bridge from insurance to retirement", previewText:"How your coverage connects to your bigger picture.", sendDay:7, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>Most people manage their insurance, investments, and retirement planning as separate concerns. In practice, though, these areas are deeply connected — and when they are coordinated, each one reinforces the others.</p>

<p>Here is what that looks like:</p>

<ul>
  <li><strong>Insurance shapes investment risk.</strong> Strong disability and life coverage can allow you to take on more portfolio risk, because your downside is protected.</li>
  <li><strong>Investment growth shapes your timeline.</strong> Your portfolio's performance directly influences when retirement becomes feasible and how much income you can generate.</li>
  <li><strong>Retirement planning shapes insurance needs.</strong> As you approach retirement, you may need less life insurance but more long-term care coverage.</li>
</ul>

<p>When these pieces are not coordinated, you may be paying for protection you do not need — or missing coverage that could be critical. A quick alignment check can surface those disconnects before they become costly.</p>

<p>Would it be helpful to take a quick look together at how your strategies connect? Reply to this email and we will set something up.</p>

<p>Best regards,<br/>The FFA North Team</p>` },
  { id:'e-6-3', subject:"Three pillars of lasting security", previewText:"Most people have addressed one. Few have all three.", sendDay:14, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>After years of working with individuals and families, we have found that lasting financial security generally rests on three pillars. Most people have addressed at least one — but the gaps between them are where risk tends to hide.</p>

<ul>
  <li><strong>Protection.</strong> Your safety net — life insurance, disability coverage, liability protection, and an emergency fund. Without it, a single unexpected event can derail years of progress.</li>
  <li><strong>Growth.</strong> Your investment strategy — the engine that builds wealth over time through disciplined, diversified approaches aligned with your timeline and risk tolerance.</li>
  <li><strong>Income.</strong> Your retirement income plan — how you will convert accumulated assets into reliable income that lasts, including Social Security timing and tax-efficient withdrawals.</li>
</ul>

<p>When all three pillars work in concert, each one reinforces the others. When they are managed in isolation, even well-funded plans can have blind spots.</p>

<p>Would it be helpful to take a quick look together at how your three pillars stack up? Reply to this email and we will schedule a brief conversation.</p>

<p>Warm regards,<br/>The FFA North Team</p>` },
  { id:'e-6-4', subject:"When good plans quietly drift apart", previewText:"A common scenario that is worth checking for.", sendDay:21, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>Here is a scenario we see more often than you might expect. A client has a well-funded 401(k), adequate life insurance, and an advisor managing their portfolio. On paper, everything looks fine. But a closer look reveals:</p>

<ul>
  <li>Their investment allocation has not been revisited since they were fifteen years from retirement — now they are five years away</li>
  <li>A whole life policy purchased decades ago no longer aligns with their current estate plan</li>
  <li>There is no Roth conversion strategy, which means a potential opportunity to reduce future taxes is going unused</li>
  <li>Beneficiary designations across accounts contradict what the estate documents say</li>
</ul>

<p>None of these issues are catastrophic on their own. But together, they represent strategies that are quietly working against each other. A holistic review looks at all of your financial pieces as a connected system — not as isolated parts.</p>

<p>Would it be helpful to take a quick look together at whether your strategies are still in alignment? Reply to this email to start a conversation.</p>

<p>Best regards,<br/>The FFA North Team</p>` },
  { id:'e-6-5', subject:"What consolidation actually looks like", previewText:"A behind-the-scenes look at the review process.", sendDay:28, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>You may be wondering what a comprehensive financial review actually involves. We like to be transparent about the process, so here is what we cover:</p>

<ul>
  <li><strong>Insurance audit.</strong> A review of all current policies to identify gaps, overlaps, or opportunities for better coverage at lower cost.</li>
  <li><strong>Investment analysis.</strong> An evaluation of your portfolio for fees, diversification, tax efficiency, and alignment with your goals.</li>
  <li><strong>Retirement projection.</strong> Modeling your income from all sources and stress-testing it against different scenarios.</li>
  <li><strong>Tax strategy review.</strong> Identifying opportunities to reduce your tax burden through approaches like Roth conversions and tax-loss harvesting.</li>
</ul>

<p>The review typically takes about 45 minutes and results in a written summary of findings that is yours to keep. There is no cost and no obligation to act on anything we find.</p>

<p>Would it be helpful to see your complete financial picture in one place? Reply to this email and we will get you scheduled.</p>

<p>Warm regards,<br/>The FFA North Team</p>` },
  { id:'e-6-6', subject:"How the Johnsons connected the dots", previewText:"A real story about the power of a full-picture view.", sendDay:35, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>We recently worked with a couple — we will call them the Johnsons — who came to us for an insurance review. What we discovered went well beyond insurance.</p>

<p>The Johnsons had adequate life insurance, a 401(k) and IRA with a separate advisor, and no formal retirement income plan. Each piece had been set up independently over the years. When we looked at everything together, a few things stood out:</p>

<ul>
  <li><strong>Redundant coverage.</strong> Two disability policies with overlapping benefits meant they were paying more than necessary.</li>
  <li><strong>Elevated investment fees.</strong> Their IRA was in actively managed funds charging over 1.4% in combined expenses when comparable alternatives cost significantly less.</li>
  <li><strong>A tax planning window.</strong> Their current bracket was lower than it would likely be in retirement — an ideal time for partial Roth conversions.</li>
</ul>

<p>By addressing these issues together, the Johnsons were able to reduce unnecessary expenses and bring their entire plan into alignment. Every family's situation is unique, and results will vary. But the value of a full-picture view is consistent.</p>

<p>Would it be helpful to take a similar look at your situation? Simply reply to this email.</p>

<p>Best regards,<br/>The FFA North Team</p>` },
  { id:'e-6-7', subject:"A two-minute financial checkup", previewText:"Four questions that reveal a lot about your plan.", sendDay:42, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>Sometimes the most useful exercise is also the simplest. Here is a quick self-assessment you can do right now — no spreadsheet required. Just answer honestly for each area:</p>

<ul>
  <li><strong>Emergency fund:</strong> Could you cover 3-6 months of living expenses without touching your investments?</li>
  <li><strong>Insurance coverage:</strong> Are your life, disability, and liability policies current and adequate for your situation today?</li>
  <li><strong>Investment strategy:</strong> Is your portfolio diversified, tax-efficient, and aligned with your timeline?</li>
  <li><strong>Retirement readiness:</strong> Do you know, within a reasonable range, how much income you will need in retirement — and do you have a plan to get there?</li>
</ul>

<p>If you answered "not sure" to any of these, you are not alone. Each one represents an area where a brief conversation could provide real clarity and help you identify where small improvements make the biggest difference.</p>

<p>Would it be helpful to walk through your answers together? Reply to this email and we will schedule a conversation.</p>

<p>Warm regards,<br/>The FFA North Team</p>` },
  { id:'e-6-8', subject:"Bringing it all together", previewText:"Your finances as one connected plan, not scattered pieces.", sendDay:56, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>Over the past several weeks, we have explored how insurance, investments, retirement planning, and tax strategy work together as a system — and how gaps between them can quietly undermine even well-funded plans.</p>

<p>If you have been thinking about whether all the pieces of your financial life are truly working in concert, here is a simple next step we can offer:</p>

<ul>
  <li>A 45-minute conversation covering the major areas of your financial life</li>
  <li>An objective look at how your current strategies connect — and where they might not</li>
  <li>Identification of specific opportunities worth considering</li>
  <li>A written summary of findings that belongs to you, regardless of what you decide</li>
</ul>

<p>There is no cost and no obligation. Having the conversation does not commit you to anything — our role is to educate, and the decisions are always yours.</p>

<p>Would it be helpful to take a quick look together? Reply to this email or reach out at (561) 555-0100 whenever the timing feels right. We look forward to the conversation.</p>

<p>Warm regards,<br/>The FFA North Team</p>` },
];

const reEngagementEmails: EmailStep[] = [
  { id:'e-7-1', subject:"Just a quick hello", previewText:"It has been a while, and we wanted to check in.", sendDay:0, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>It has been a while since we last connected, and we simply wanted to say hello. No agenda — just a few updates we thought might be relevant to you.</p>

<ul>
  <li><strong>Expanded retirement planning.</strong> We have added Social Security optimization modeling and retirement income stress-testing to our complimentary review process.</li>
  <li><strong>New educational guides.</strong> We have published resources on tax-efficient withdrawal strategies, Medicare planning, and estate coordination — all available at no cost.</li>
  <li><strong>Same philosophy.</strong> We still believe informed people make the best decisions, and we will never pressure you into anything.</li>
</ul>

<p>If any of this sounds relevant to where you are today, we would enjoy reconnecting. And if the timing is not right, that is completely fine — we will be here whenever it is.</p>

<p>Simply reply if you would like to hear more.</p>

<p>Warm regards,<br/>The FFA North Team</p>` },
  { id:'e-7-2', subject:"Three trends worth watching right now", previewText:"Quick insights that may affect your planning.", sendDay:7, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>Whether or not you are actively working on your financial plan right now, a few trends are worth keeping on your radar. We thought you might find these useful:</p>

<ul>
  <li><strong>Shifting interest rates.</strong> The rate environment continues to evolve. If you have not reviewed your bond allocation or cash holdings recently, it may be a good time to check that your positioning still fits.</li>
  <li><strong>Tax provisions set to change.</strong> Several provisions from recent legislation are scheduled to sunset, which could affect tax brackets, estate exemptions, and retirement strategies. Planning ahead tends to work better than reacting.</li>
  <li><strong>Rising healthcare costs.</strong> Healthcare inflation continues to outpace general inflation. For those approaching retirement, building a realistic cost projection is more important than ever — Medicare does not cover everything.</li>
</ul>

<p>Each of these trends can create both challenges and opportunities depending on your situation. If you would like to discuss how any of them might affect you, we are happy to help.</p>

<p>Reply to this email anytime.</p>

<p>Best regards,<br/>The FFA North Team</p>` },
  { id:'e-7-3', subject:"Something useful in five minutes", previewText:"A quick exercise that can clarify your top priority.", sendDay:14, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>Sometimes the hardest part of financial planning is knowing where to start. Here is a simple exercise that takes about five minutes and can help you zero in on your biggest priority.</p>

<p>Answer each question with yes, no, or not sure:</p>

<ul>
  <li>Do you have enough saved to cover 3-6 months of expenses without touching investments?</li>
  <li>Have you reviewed your insurance coverage in the past two years?</li>
  <li>Do you know roughly how much income you will need in retirement?</li>
  <li>Have you looked at your investment fees and performance in the past year?</li>
</ul>

<p>If you answered "no" or "not sure" to any of these, you are in good company — most people have at least one area that could use some attention. Each one represents a straightforward topic where a brief conversation could provide real clarity.</p>

<p>Would it be helpful to talk through whichever question resonated most? Reply to this email and we will take it from there — no cost and no obligation.</p>

<p>Warm regards,<br/>The FFA North Team</p>` },
  { id:'e-7-4', subject:"A planning resource you might like", previewText:"Guides and checklists — yours to keep, no cost.", sendDay:21, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>We recently put together a collection of retirement planning resources and thought you might find them useful — whether you are actively planning or simply want to be better informed.</p>

<p>The toolkit includes:</p>

<ul>
  <li><strong>Retirement income gap worksheet.</strong> A simple way to estimate your projected income from all sources and compare it to anticipated expenses.</li>
  <li><strong>Social Security claiming guide.</strong> A plain-English overview of when and how to claim, including spousal strategies many people overlook.</li>
  <li><strong>Healthcare cost framework.</strong> A tool for projecting retirement healthcare expenses, including Medicare premiums and supplemental coverage.</li>
  <li><strong>Pre-retirement checklist.</strong> Key financial, legal, and administrative steps to consider in the years leading up to retirement.</li>
</ul>

<p>Everything is available at no cost. We created these resources because we believe better-informed people make better financial decisions — whether or not they work with us.</p>

<p>Reply to this email with "send toolkit" and we will get them to you right away.</p>

<p>Best regards,<br/>The FFA North Team</p>` },
  { id:'e-7-5', subject:"Seasonal planning reminders", previewText:"A few timely items worth having on your radar.", sendDay:28, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>Financial planning is not static — regulations shift, contribution limits change, and timely moves can make a meaningful difference. Here are a few seasonal reminders worth keeping on your radar:</p>

<ul>
  <li><strong>Retirement contribution limits.</strong> Annual limits for 401(k)s and IRAs are periodically adjusted. If you have not updated your contributions recently, you may be leaving tax-advantaged savings on the table.</li>
  <li><strong>RMD rule changes.</strong> Recent legislation adjusted when required minimum distributions begin and how inherited IRAs are handled. These changes can significantly impact withdrawal strategy and tax planning.</li>
  <li><strong>Estate exemption window.</strong> Current elevated exemption amounts are scheduled to change. If you have a sizable estate, discussing this with your advisor sooner rather than later may be valuable.</li>
</ul>

<p>Each of these can create both challenges and opportunities depending on your situation. Even a quick review of how they apply to you can be worthwhile.</p>

<p>Would it be helpful to walk through any of these together? Reply to this email and we will set up a brief conversation at no cost.</p>

<p>Warm regards,<br/>The FFA North Team</p>` },
  { id:'e-7-6', subject:"The question everyone asks us", previewText:"It comes up in nearly every conversation we have.", sendDay:35, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>After thousands of client conversations, one question comes up more than any other. It is asked in different ways — "Do I have enough?" "Can I afford to retire?" "Will my money last?" — but the underlying concern is the same. People want to know they are on solid ground.</p>

<p>Here is what we have learned:</p>

<ul>
  <li><strong>The question itself is healthy.</strong> Wondering about your financial future is a sign that you care. The people who should be concerned are the ones who never ask.</li>
  <li><strong>The answer is almost always actionable.</strong> Whether you are ahead of schedule or behind, there are concrete steps that can improve your position. The key is knowing where you stand.</li>
  <li><strong>Clarity reduces anxiety.</strong> The clients who feel most at peace are not always the wealthiest — they are the ones with a clear plan who understand their numbers.</li>
</ul>

<p>If you have been carrying this question around, a 30-minute conversation is often all it takes to move from uncertainty to clarity.</p>

<p>Would it be helpful to set up a time to talk? Reply to this email whenever you are ready.</p>

<p>Best regards,<br/>The FFA North Team</p>` },
  { id:'e-7-7', subject:"When is the right time for a review?", previewText:"The honest answer may not be what you expect.", sendDay:42, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>People often ask us when the "right" time is for a financial review. The honest answer is that there is no perfect moment — but there are situations that make it especially worthwhile:</p>

<ul>
  <li><strong>Your life has changed.</strong> Marriage, divorce, a new child, a job change, or an inheritance can all shift your financial priorities.</li>
  <li><strong>It has been more than two years.</strong> Even without a major event, tax laws and markets evolve. A plan that fit two years ago may need refreshing.</li>
  <li><strong>You feel uncertain.</strong> A nagging sense that something may be off is worth exploring — that instinct is usually pointing at something real.</li>
</ul>

<p>The truth is, a financial review is rarely wasted. At worst, it confirms you are on the right track. At best, it surfaces opportunities you did not know existed.</p>

<p>Would it be helpful to schedule a conversation? Reply to this email and we will find a time that works — no cost and no obligation.</p>

<p>Warm regards,<br/>The FFA North Team</p>` },
  { id:'e-7-8', subject:"The door is always open", previewText:"No rush, no pressure — just an open invitation.", sendDay:56, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>This is the last email in our series, and we want to leave you with something simple: an open invitation.</p>

<p>We understand that timing matters. Maybe right now is not the right moment to focus on your financial plan — and that is perfectly okay. Life has a way of demanding our attention in different places at different times.</p>

<p>Whenever the time does feel right — whether that is next week, next month, or next year — here is what we offer:</p>

<ul>
  <li>A complimentary, no-obligation financial review</li>
  <li>An experienced advisor who will listen and answer your questions</li>
  <li>A clear, written assessment that is yours to keep</li>
  <li>Zero pressure to make any changes or commitments</li>
</ul>

<p>We will not keep sending emails, but we wanted you to know the door is always open. Save this email, bookmark our number, or simply reply when the time feels right.</p>

<p>We genuinely wish you the best, {{first_name}}, and we hope to hear from you someday.</p>

<p>Warm regards,<br/>The FFA North Team<br/>(561) 555-0100</p>` },
];

const campaignDefs: { name: string; serviceLine: ServiceLine; description: string; status: CampaignStatus; emails: EmailStep[] }[] = [
  { name:'Insurance Portfolio Review', serviceLine:'Insurance Review', description:'A 12-email educational series targeting business owners and professionals aged 35-60 who likely haven\'t reviewed their insurance coverage in 3+ years. Addresses common pain points including outdated liability limits, insufficient life insurance for growing families, and the lack of umbrella policies. The 70-day progressive sequence moves contacts from awareness through education to action, covering coverage gaps, business insurance, umbrella policies, case studies, and second-opinion positioning. The goal is to book a complimentary 15-minute coverage review by positioning FFA as a no-pressure, education-first resource.', status:'active', emails:insuranceEmails },
  { name:'Annuity Optimization Insights', serviceLine:'Under-Serviced Annuities', description:'Targets existing annuity holders — typically ages 50-70 — who may be unaware of hidden fees, surrender period expirations, or better-performing alternatives. The 12-email, 70-day sequence progressively educates contacts about M&E charges, rider fees, withdrawal optimization strategies, fixed vs. variable annuity differences, interest rate impacts, and 1035 exchange considerations. Ideal persona: someone who purchased an annuity years ago through another advisor and hasn\'t had a review since. Includes real-world case studies and actionable checklists. Outcome: book a free 20-minute annuity health check.', status:'active', emails:annuityEmails },
  { name:'Retirement Readiness Check', serviceLine:'Retirement Planning', description:'A comprehensive 12-email educational series designed for pre-retirees (ages 50-65) who feel uncertain about their retirement readiness. The campaign progressively covers the five critical retirement questions, Social Security claiming and spousal coordination strategies, healthcare cost planning including Medicare and supplements, tax-efficient withdrawal sequencing and Roth conversions, inflation protection, estate planning essentials, and a real-world client case study. Pain points addressed: "Am I saving enough?", "When should I claim Social Security?", "What will healthcare cost me?", and "How do I make my money last?" Outcome: schedule a complimentary 30-minute Retirement Readiness Assessment.', status:'active', emails:retirementEmails },
  { name:'Investment Planning Essentials', serviceLine:'Investment Planning', description:'A comprehensive 12-email educational series for investors of all ages who want clarity on portfolio performance, fees, diversification, and tax efficiency. Targets professionals and business owners who suspect they may be overpaying in fees or holding a poorly diversified portfolio. The campaign progressively covers fee transparency and compounding impact, diversification beyond stocks and bonds, behavioral finance and staying disciplined during volatility, risk tolerance vs. risk capacity, tax-loss harvesting and year-round tax strategies, life milestone-triggered portfolio reviews, and a real-world case study demonstrating the value of a disciplined approach. Outcome: book a complimentary 30-minute Portfolio Analysis with full fee transparency, benchmark comparison, and actionable recommendations.', status:'active', emails:investmentEmails },
  { name:'Get a Second Opinion', serviceLine:'Second-Opinion Positioning', description:'A comprehensive 12-email trust-building campaign for affluent individuals and families who already have a financial advisor but may not be getting the best advice. Targets high-net-worth contacts ($500K+ in investable assets) who value thoroughness and objectivity. Uses the medical second opinion analogy to normalize the idea of an independent financial review. The sequence progressively covers what a second opinion looks like, common findings from past reviews, the fiduciary vs. suitability distinction, fee transparency and compounding impact, a 5-point advisor evaluation framework, essential questions to ask before making changes, an anonymized client case study, and a zero-pressure closing CTA. Outcome: book a free, confidential Second Opinion Review covering investments, insurance, tax strategy, and estate planning.', status:'active', emails:secondOpinionEmails },
  { name:'Cross-Selling Re-Engagement', serviceLine:'Insurance Review', description:'An 8-email educational series targeting contacts who initially engaged with one service line (typically insurance) but could benefit from a comprehensive financial approach. The campaign bridges the gap between siloed services — insurance, investments, and retirement planning — and educates contacts on how these areas work together for stronger financial outcomes. Covers the three pillars of financial security, strategy harmonization, comprehensive review benefits, an anonymized case study, and a financial health scorecard. Ideal for contacts aged 40-65 who have addressed one financial need but may have blind spots in other areas. Outcome: schedule a comprehensive financial planning session.', status:'active', emails:crossSellingEmails },
  { name:'Re-Engagement Nurture', serviceLine:'Retirement Planning', description:'An 8-email re-engagement campaign designed for dormant contacts who showed initial interest but have not responded to previous outreach. Uses a softer, value-first approach to re-establish the relationship without pressure. Covers current financial trends, a quick self-assessment tool, new resources and toolkits, industry changes, frequently asked questions, and timing considerations for financial reviews. The tone is patient, informative, and low-pressure — acknowledging that the contact may not have been ready before while keeping the door open. Outcome: re-engage dormant contacts and move them back into the education pipeline.', status:'active', emails:reEngagementEmails },
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
  "Beyond insurance: your complete financial picture",
  "The 3 pillars of financial security",
  "We noticed you have been quiet — here is what is new",
  "3 financial trends you should know about in 2026",
  "What fiduciary duty means for your money",
  "5 red flags that your financial plan needs a review",
];

const clickedLinks = [
  "'Schedule Free Review'",
  "'Download Retirement Guide'",
  "'See Fee Comparison'",
  "'Book a Consultation'",
  "'View Portfolio Analysis Sample'",
  "'Calculate Your Retirement Number'",
  "'Take Financial Health Assessment'",
  "'Download Retirement Toolkit'",
];

const dayLabels = ['Day 1 intro', 'Day 3 follow-up', 'Day 7 education', 'Day 14 mid-series', 'Day 21 deepdive', 'Day 28 checklist', 'Day 35 case study', 'Day 42 action'];

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
      'Wants to understand comprehensive planning',
      'Asking about fiduciary vs suitability',
      'Re-engaging after quiet period',
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
      'the financial health scorecard',
      'the retirement planning toolkit',
      'the comprehensive review overview',
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
      'Comprehensive financial review',
      'Re-engagement follow-up call',
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
