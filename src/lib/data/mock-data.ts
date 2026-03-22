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
  { id:'e-1-1', subject:"Quick question about your insurance coverage, {{first_name}}", previewText:"A 15-minute review could reveal surprises.", sendDay:0, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>I know you're busy, so I'll keep this brief.</p>
<p>I came across something that surprised me recently: <strong>according to industry research, nearly 6 in 10 Americans haven't reviewed their insurance policies in the last three years</strong> — even though most have experienced at least one major life change in that time. A new home, a growing family, a career move, or even changes in the market can quietly create gaps between what you <em>have</em> and what you actually <em>need</em>.</p>
<p>I'm not writing to sell you anything. I'm writing because we offer a <strong>complimentary Insurance Coverage Review</strong> — a quick, no-obligation conversation where we simply help you see where you stand today. Many people discover they're either overpaying or underprotected, and a fresh set of eyes can make a real difference.</p>
<p>The review takes about 15 minutes and covers:</p>
<ul>
<li>Whether your current coverage still aligns with your life today</li>
<li>Any gaps that may have developed over time</li>
<li>Opportunities to potentially reduce costs without sacrificing protection</li>
</ul>
<p><strong>There are three easy ways to connect — pick whichever feels right:</strong></p>
<ul>
<li>Reply to this email with a day and time that works for you</li>
<li>Call us directly at (561) 555-0100</li>
<li>Book online anytime at ffa.com/review</li>
</ul>
<p>No pressure at all. If now isn't the right time, I completely understand.</p>
<p>Warm regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">This is an educational communication from Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. Insurance products involve risk and may not be suitable for all individuals. No specific product recommendations are being made in this message. Past results do not guarantee future outcomes.</p>` },
  { id:'e-1-2', subject:"The hidden gap in most insurance plans (2-min read)", previewText:"73% of families we review discover at least one gap.", sendDay:3, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>No pitch today — just something I thought was worth sharing.</p>
<p>After reviewing hundreds of insurance portfolios over the years, we've noticed a pattern: <strong>73% of families we work with discover at least one meaningful gap in their coverage</strong>. Not because they made a mistake, but because life moved forward and their policies didn't.</p>
<p>Here are three of the most common hidden gaps we see — and they tend to catch people off guard:</p>
<ul>
<li><strong>Liability limits that haven't kept pace with net worth.</strong> If your assets have grown since your policy was written, you may be exposed in ways your current coverage wasn't designed to handle.</li>
<li><strong>Life insurance that no longer matches your life stage.</strong> Coverage purchased when the kids were small may not reflect your needs today — whether that means you're overpaying or, in some cases, underprotected for new responsibilities like aging parents or a business.</li>
<li><strong>The missing umbrella.</strong> An umbrella policy is one of the most cost-effective ways to add a significant layer of protection, yet most families don't have one. For many, it can cost less than a dollar a day.</li>
</ul>
<p>None of these are urgent emergencies. But they're the kind of thing that's <em>much</em> better to discover on your own terms than at claim time.</p>
<p>If any of this resonated, I'm happy to answer questions — just reply to this email. No strings attached.</p>
<p>Best,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">This is an educational communication from Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. The information provided is for general educational purposes only and does not constitute specific insurance advice. Individual coverage needs vary. Insurance products involve risk and may not be suitable for all individuals.</p>` },
  { id:'e-1-3', subject:"How a Tampa family saved $3,200/year on coverage", previewText:"A real story about what a simple review uncovered.", sendDay:7, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>I wanted to share a quick story — with permission — because it's a good example of what a fresh look at coverage can uncover.</p>
<p><strong>The situation:</strong> A family in the Tampa area (we'll call them the Garcias) came to us last year. They had auto, home, and life insurance through three different carriers — policies they'd set up over the course of a decade. They weren't unhappy, but they hadn't reviewed anything in about five years.</p>
<p><strong>What we found:</strong> During a 20-minute review, we discovered two things:</p>
<ul>
<li>They were carrying duplicate disability coverage — one through Mr. Garcia's employer and a private policy from years earlier that overlapped almost entirely. Eliminating the redundancy saved them <strong>$2,400 per year</strong>.</li>
<li>Their auto policies weren't bundled. A simple multi-policy adjustment with the same carrier saved another <strong>$800 annually</strong> — with no reduction in coverage.</li>
</ul>
<p><strong>The result:</strong> The Garcias kept the same (or better) protection across the board and redirected $3,200 a year toward their daughter's college savings plan. The whole process took less than a week.</p>
<p>Every family's situation is different, and not every review produces savings like this. But the Garcias told us they were glad they took that first step.</p>
<p><em>Would this kind of review be worth exploring for your situation?</em> If so, I'd be happy to set aside 15 minutes. Just reply and let me know.</p>
<p>All the best,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">This is an educational communication from Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. The story above is based on an actual client experience; names and details have been changed for privacy. Individual results vary — past outcomes do not guarantee future results. No specific product recommendations are being made in this message.</p>` },
  { id:'e-1-4', subject:"Still thinking it over? No pressure at all, {{first_name}}", previewText:"Plus a free checklist — yours to keep either way.", sendDay:14, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>I've sent a couple of emails over the past two weeks, and I realize you may not have had a chance to read them — or they might not have been relevant right now. Either way, <strong>completely fine</strong>.</p>
<p>I'm not here to follow up until you say yes. I'm here because I genuinely think a periodic insurance check-in is one of the most underrated financial moves a family can make — and most people simply don't have the time to initiate it on their own.</p>
<p>In case it's useful, I put together a quick <strong>"5-Minute Insurance Health Check"</strong> — a simple checklist you can run through on your own, no advisor needed:</p>
<ul>
<li>When was each of your policies last updated?</li>
<li>Have your beneficiaries changed since your policies were written?</li>
<li>Has your home value, income, or family size changed significantly?</li>
<li>Do you have liability coverage that matches your current net worth?</li>
<li>Are you paying for any overlapping or redundant coverage?</li>
</ul>
<p>If you go through that list and everything checks out — great. You'll have peace of mind, and that's a win.</p>
<p>If something gives you pause, we're here to help you think it through — no cost, no obligation.</p>
<p><strong>And if this just isn't a priority right now, I respect that.</strong> Simply reply <em>"later"</em> and I'll circle back in six months. No hard feelings whatsoever.</p>
<p>Wishing you and your family all the best,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">This is an educational communication from Florida Financial Advisors North · 1200 N Federal Hwy, Boca Raton, FL 33432. The checklist above is provided for general informational purposes only and does not constitute specific insurance advice. Individual coverage needs vary. Insurance products involve risk and may not be suitable for all individuals.</p>` },
  { id:'e-1-5', subject:"The hidden cost of outdated coverage", previewText:"Life changes create coverage gaps you can\u2019t afford to ignore.", sendDay:21, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>Here\u2019s something we see far too often: a client comes in with a policy they purchased ten years ago \u2014 before the second child, before the new home, before the business took off. On paper, they\u2019re \u201ccovered.\u201d In reality, they have significant gaps.</p>
<h2>Life Events That Quietly Change Your Insurance Needs</h2>
<ul>
<li><strong>Marriage or divorce</strong> \u2014 beneficiaries, ownership structures, and liability exposure all shift</li>
<li><strong>Buying or refinancing a home</strong> \u2014 replacement cost values change, and so should your coverage</li>
<li><strong>Starting or growing a business</strong> \u2014 personal policies rarely cover business-related liabilities</li>
<li><strong>Children reaching adulthood</strong> \u2014 your life insurance needs may look very different now</li>
<li><strong>Aging parents</strong> \u2014 if you\u2019ve become a caregiver, your own coverage needs may have expanded</li>
</ul>
<p>The cost of outdated coverage isn\u2019t the premium you pay each month \u2014 it\u2019s the claim that gets denied because your policy no longer reflects your life.</p>
<p>We offer a complimentary coverage gap review that takes about 15 minutes. No sales pitch \u2014 just a clear-eyed look at where you stand today.</p>
<p><strong>Reply to this email or call us at (561) 555-0100 to schedule yours.</strong></p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North \u00b7 1200 N Federal Hwy, Boca Raton, FL 33432</p>` },
  { id:'e-1-6', subject:"5 questions every business owner should ask about their insurance", previewText:"Your business is your livelihood \u2014 make sure it\u2019s protected.", sendDay:28, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>If you own or operate a business, your insurance needs go well beyond a standard homeowners or auto policy. Yet many business owners rely on coverage that was set up years ago and never revisited.</p>
<h2>Ask Yourself These 5 Questions</h2>
<ul>
<li><strong>1. Is my liability coverage keeping pace with revenue?</strong> A policy sized for a $500K operation may leave dangerous gaps at $2M.</li>
<li><strong>2. Do I have key-person insurance?</strong> If you or a critical employee were suddenly unable to work, could the business survive financially?</li>
<li><strong>3. Are my personal and business assets truly separated?</strong> Without proper coverage, a business lawsuit could put your personal assets at risk.</li>
<li><strong>4. When did I last review my workers\u2019 compensation?</strong> Rates and requirements change \u2014 and audits can result in unexpected bills.</li>
<li><strong>5. Do I have a business continuity plan?</strong> Insurance is one piece. Do you know what happens to your business if you can\u2019t run it for 90 days?</li>
</ul>
<p>If any of these gave you pause, you\u2019re not alone. Most business owners we work with discover at least one significant gap during their first review.</p>
<p><strong>Schedule a complimentary business coverage review \u2014 reply to this email or call (561) 555-0100.</strong></p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North \u00b7 1200 N Federal Hwy, Boca Raton, FL 33432</p>` },
  { id:'e-1-7', subject:"How a Tampa family saved $12K by modernizing their coverage", previewText:"A real-world example of what a policy review can uncover.", sendDay:35, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>We recently worked with a family in the Tampa area \u2014 let\u2019s call them the Martins \u2014 who hadn\u2019t reviewed their insurance in over seven years. They assumed everything was fine. Here\u2019s what we found:</p>
<h2>What the Review Uncovered</h2>
<ul>
<li><strong>Duplicate disability coverage</strong> \u2014 Mr. Martin had both an employer plan and a private policy covering the same benefit. Eliminating the overlap saved $3,200 per year.</li>
<li><strong>Outdated life insurance</strong> \u2014 Their term policy was sized for when they had a mortgage and two young children. With the house paid off and both kids in college, they right-sized the coverage and redirected $4,100 annually toward retirement savings.</li>
<li><strong>Missing umbrella policy</strong> \u2014 With a rental property and a teenage driver, their liability exposure was significant. We added a $1M umbrella policy for just $380 per year.</li>
<li><strong>Auto insurance savings</strong> \u2014 A simple multi-policy bundling adjustment saved another $4,300 annually.</li>
</ul>
<p><strong>Net result:</strong> Better coverage in every category, plus approximately $12,000 in annual savings redirected to their financial plan.</p>
<p>Every family\u2019s situation is different, and past results don\u2019t guarantee future outcomes. But the Martins\u2019 story illustrates why periodic reviews matter.</p>
<p><strong>Want to see what a review might reveal for you? Reply to this email to get started.</strong></p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North \u00b7 1200 N Federal Hwy, Boca Raton, FL 33432. Names and details changed to protect client privacy.</p>` },
  { id:'e-1-8', subject:"Understanding umbrella policies: affordable protection most people overlook", previewText:"One of the best-kept secrets in personal insurance.", sendDay:42, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>If there\u2019s one type of insurance that consistently surprises people \u2014 both in how affordable it is and how much protection it provides \u2014 it\u2019s the personal umbrella policy.</p>
<h2>What Is an Umbrella Policy?</h2>
<p>An umbrella policy provides an extra layer of liability protection beyond what your homeowners, auto, and other policies cover. It kicks in when you exhaust the liability limits on your underlying policies.</p>
<h2>Why It Matters More Than You Think</h2>
<ul>
<li><strong>Lawsuits are unpredictable.</strong> A serious auto accident, an injury on your property, or even a social media post can result in a judgment that exceeds your standard policy limits.</li>
<li><strong>Your net worth is the target.</strong> The more assets you have, the more you have to lose. Courts can go after savings, investments, and even future earnings.</li>
<li><strong>It\u2019s surprisingly affordable.</strong> A $1 million umbrella policy typically costs between $200 and $500 per year \u2014 far less than most people expect.</li>
</ul>
<h2>Who Should Consider One?</h2>
<p>If you own a home, have investment accounts, employ household help, own rental property, have a swimming pool, or have a teenage driver \u2014 an umbrella policy deserves serious consideration.</p>
<p>This is general education, not a recommendation for your specific situation. But if you\u2019d like to explore whether an umbrella policy makes sense for you, we\u2019re happy to help.</p>
<p><strong>Schedule a complimentary review \u2014 just reply to this email.</strong></p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North \u00b7 1200 N Federal Hwy, Boca Raton, FL 33432</p>` },
  { id:'e-1-9', subject:"Your annual insurance checkup is due", previewText:"Just like your car and your health \u2014 your coverage needs regular attention.", sendDay:49, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>You wouldn\u2019t skip your annual physical. You wouldn\u2019t drive 30,000 miles without an oil change. So why do so many people go years \u2014 sometimes decades \u2014 without reviewing their insurance?</p>
<h2>What\u2019s Changed in the Last 12 Months?</h2>
<p>Think about the past year alone. Have you:</p>
<ul>
<li>Received a raise or changed jobs?</li>
<li>Renovated your home or purchased property?</li>
<li>Had a child, gotten married, or experienced a family change?</li>
<li>Started a side business or taken on new professional responsibilities?</li>
<li>Turned 50, 55, 60, or 65? (Age milestones often trigger coverage changes)</li>
</ul>
<p>Even if none of these apply, the insurance market itself has changed. New products, new pricing, and new features may be available that didn\u2019t exist when you last reviewed your policies.</p>
<h2>A 15-Minute Checkup Can Save You Hours of Worry</h2>
<p>Our annual insurance checkup is designed to be quick, thorough, and completely free. We\u2019ll review your current policies, flag any gaps, and let you know if there are opportunities to improve your coverage or reduce your costs.</p>
<p><strong>Reply \u201ccheckup\u201d to this email and we\u2019ll get you on the calendar this week.</strong></p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North \u00b7 1200 N Federal Hwy, Boca Raton, FL 33432</p>` },
  { id:'e-1-10', subject:"What your current agent might not be telling you", previewText:"A second set of eyes never hurts.", sendDay:56, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>Let us be clear upfront: we\u2019re not here to criticize your current insurance agent. Many agents do excellent work. But here\u2019s a reality worth acknowledging \u2014 every professional has blind spots, and the insurance industry has structural incentives that don\u2019t always align with your interests.</p>
<h2>Things Worth Asking About</h2>
<ul>
<li><strong>Captive vs. independent.</strong> If your agent represents a single carrier, they can only offer you that company\u2019s products \u2014 even if a better option exists elsewhere.</li>
<li><strong>Commission structures.</strong> Some products pay agents significantly higher commissions than others. That doesn\u2019t mean the recommendation is wrong, but it\u2019s worth understanding.</li>
<li><strong>Proactive reviews.</strong> When\u2019s the last time your agent reached out to review your coverage \u2014 without you asking? Regular check-ins are a hallmark of good service.</li>
<li><strong>Holistic perspective.</strong> Insurance doesn\u2019t exist in a vacuum. It\u2019s part of your broader financial picture, including estate planning, tax strategy, and retirement goals.</li>
</ul>
<p>A second opinion isn\u2019t about finding fault \u2014 it\u2019s about gaining confidence. Either you\u2019ll confirm you\u2019re in great shape, or you\u2019ll discover opportunities you didn\u2019t know existed. Either way, you win.</p>
<p><strong>Request your complimentary second-opinion review \u2014 reply to this email or call (561) 555-0100.</strong></p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North \u00b7 1200 N Federal Hwy, Boca Raton, FL 33432</p>` },
  { id:'e-1-11', subject:"Free insurance gap analysis \u2014 limited availability this month", previewText:"We\u2019re opening up a handful of complimentary review slots.", sendDay:63, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>We\u2019re setting aside time this month to conduct a limited number of complimentary Insurance Gap Analyses for individuals and families in our community. I wanted to make sure you had the opportunity before our calendar fills up.</p>
<h2>What\u2019s Included in the Gap Analysis</h2>
<ul>
<li><strong>Full policy inventory</strong> \u2014 we\u2019ll catalog every policy you currently hold and identify what\u2019s covered and what isn\u2019t</li>
<li><strong>Life event alignment</strong> \u2014 we\u2019ll check whether your coverage reflects your current life situation, not the one you had five years ago</li>
<li><strong>Cost comparison</strong> \u2014 we\u2019ll look at whether you\u2019re paying a fair price for the coverage you have</li>
<li><strong>Risk assessment</strong> \u2014 we\u2019ll identify your biggest uninsured or underinsured risks</li>
<li><strong>Written summary</strong> \u2014 you\u2019ll receive a clear, one-page report with findings and suggestions, yours to keep regardless of what you decide</li>
</ul>
<p>The analysis takes about 20 minutes and can be done over the phone or on a video call \u2014 whichever you prefer.</p>
<p>There\u2019s truly no obligation. We offer these because they\u2019re the best way to demonstrate the value of working with an advisor who looks at your full financial picture.</p>
<p><strong>Reply to this email to reserve your spot, or call us at (561) 555-0100.</strong></p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North \u00b7 1200 N Federal Hwy, Boca Raton, FL 33432</p>` },
  { id:'e-1-12', subject:"Final thoughts on protecting what matters most", previewText:"Our last email \u2014 and an open invitation.", sendDay:70, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>This is the final email in our insurance education series, and I want to end with something simple.</p>
<p>Insurance isn\u2019t exciting. Nobody wakes up eager to review their policies. But the purpose of insurance is deeply personal \u2014 it\u2019s about protecting the people, the home, the business, and the future you\u2019ve worked so hard to build.</p>
<h2>What We\u2019ve Covered Together</h2>
<ul>
<li>Why coverage gaps form silently over time</li>
<li>The questions every homeowner and business owner should be asking</li>
<li>How periodic reviews can improve coverage while reducing costs</li>
<li>The role of umbrella policies in a comprehensive protection plan</li>
<li>Why a second opinion on your coverage is always a smart move</li>
</ul>
<p>Whether you\u2019re ready for a conversation today or a year from now, our door is open. We don\u2019t believe in high-pressure tactics \u2014 we believe in being here when you need us.</p>
<p><strong>If you\u2019d like to schedule a complimentary review at any time, you can:</strong></p>
<ul>
<li>Reply to this email</li>
<li>Call us at (561) 555-0100</li>
<li>Visit our website to book online</li>
</ul>
<p>Thank you for your time, {{first_name}}. It\u2019s been a pleasure sharing these insights with you.</p>
<p>Warm regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North \u00b7 1200 N Federal Hwy, Boca Raton, FL 33432. You are receiving this email because you opted in to educational content from Florida Financial Advisors. To unsubscribe, reply \u201cunsubscribe\u201d or click the link below.</p>` },
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
  { id:'e-2-5', subject:"Hidden fees in annuities: what you need to know", previewText:"Understanding the true cost of your annuity contract.", sendDay:21, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>When you purchased your annuity, you likely focused on the guarantees, the growth potential, or the income promise. That makes sense \u2014 those are the features that matter most. But there\u2019s another side of the equation that deserves equal attention: the fees.</p>
<h2>The Four Layers of Annuity Costs</h2>
<ul>
<li><strong>Mortality and Expense (M&E) charges</strong> \u2014 This is the insurance company\u2019s charge for providing the guarantees in your contract. It typically ranges from 0.50% to 1.50% annually, deducted from your account value. Older contracts often carry higher M&E charges than what\u2019s available today.</li>
<li><strong>Administrative fees</strong> \u2014 Annual maintenance charges that can be a flat fee ($25\u2013$50) or a percentage of your account. Small, but they add up over decades.</li>
<li><strong>Rider fees</strong> \u2014 If you added optional benefits like a guaranteed lifetime withdrawal benefit or enhanced death benefit, each rider carries its own annual charge \u2014 often 0.50% to 1.25% each.</li>
<li><strong>Underlying fund expenses</strong> \u2014 For variable annuities, the mutual fund sub-accounts have their own expense ratios, just like funds in a 401(k).</li>
</ul>
<p>Added together, total annual costs on some older variable annuities can exceed 3.5% per year. That\u2019s a significant drag on growth over time.</p>
<p>We\u2019re not saying your annuity is a bad deal \u2014 but understanding what you\u2019re paying is the first step toward knowing if you\u2019re getting fair value.</p>
<p><strong>Want us to help you decode your annuity\u2019s fee structure? Reply to this email for a complimentary fee review.</strong></p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North \u00b7 1200 N Federal Hwy, Boca Raton, FL 33432</p>` },
  { id:'e-2-6', subject:"Fixed vs. variable annuities explained", previewText:"Understanding the two main types \u2014 and which might suit you better.", sendDay:28, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>Not all annuities are created equal. If you own one \u2014 or are considering one \u2014 it\u2019s important to understand the fundamental differences between the two most common types.</p>
<h2>Fixed Annuities</h2>
<ul>
<li>Your principal is protected from market losses</li>
<li>You earn a guaranteed interest rate for a set period</li>
<li>Predictable, stable growth \u2014 but typically lower long-term returns</li>
<li>Generally lower fees than variable annuities</li>
<li>Best suited for conservative investors prioritizing safety over growth</li>
</ul>
<h2>Variable Annuities</h2>
<ul>
<li>Your money is invested in sub-accounts (similar to mutual funds)</li>
<li>Returns depend on market performance \u2014 higher upside, but also downside risk</li>
<li>Often include optional riders for income or death benefit guarantees (at additional cost)</li>
<li>Higher fee structures due to investment management and insurance charges</li>
<li>Better suited for investors with longer time horizons who can tolerate volatility</li>
</ul>
<h2>There Are Also Fixed Indexed Annuities</h2>
<p>These are a hybrid \u2014 your principal is protected, but your returns are linked to a market index (like the S&P 500), subject to caps and participation rates. They\u2019ve become increasingly popular, but the crediting methods can be complex.</p>
<p>The right type depends entirely on your goals, timeline, and risk tolerance. There\u2019s no one-size-fits-all answer.</p>
<p><strong>If you\u2019d like help understanding how your current annuity fits your overall financial picture, reply to this email. Our review is complimentary and confidential.</strong></p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North \u00b7 1200 N Federal Hwy, Boca Raton, FL 33432</p>` },
  { id:'e-2-7', subject:"Are you getting the guarantees you were promised?", previewText:"It\u2019s worth checking that your annuity is delivering on its commitments.", sendDay:35, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>When you purchased your annuity, you were likely shown illustrations \u2014 projections of how your account could grow, what income you might receive, or what your beneficiaries would be paid. Those illustrations may have been a key reason you said yes.</p>
<p>But here\u2019s something worth checking: are those projections actually playing out?</p>
<h2>Common Gaps Between Promise and Reality</h2>
<ul>
<li><strong>Guaranteed minimum interest rates</strong> may be lower than what was illustrated in the \u201cnon-guaranteed\u201d column you were shown</li>
<li><strong>Income benefit bases</strong> and <strong>account values</strong> are not the same thing \u2014 and the number that matters for withdrawal purposes may surprise you</li>
<li><strong>Cap rates and participation rates</strong> on indexed annuities can change annually, potentially reducing your credited returns</li>
<li><strong>Death benefit values</strong> may not have grown the way you expected, especially after fees and withdrawals</li>
</ul>
<p>None of this necessarily means something is wrong. Annuity contracts are complex, and it\u2019s natural for there to be a gap between initial expectations and actual performance. But you deserve to understand exactly where you stand.</p>
<p><strong>We offer a complimentary annuity checkup that compares your original illustrations to your current contract values. Reply \u201ccheckup\u201d and we\u2019ll schedule a 20-minute review.</strong></p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North \u00b7 1200 N Federal Hwy, Boca Raton, FL 33432</p>` },
  { id:'e-2-8', subject:"How interest rate changes affect your annuity", previewText:"What rising and falling rates mean for annuity owners.", sendDay:42, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>Interest rates have been a major topic in recent years, and for annuity owners, rate changes can have real implications \u2014 both positive and negative. Here\u2019s what you should know.</p>
<h2>If You Own a Fixed Annuity</h2>
<ul>
<li>When rates rise, newer fixed annuities may offer higher guaranteed rates than your existing contract</li>
<li>If you\u2019re past your surrender period, you may have the flexibility to explore better options</li>
<li>If you\u2019re still in your surrender period, your current guaranteed rate may actually look favorable compared to what was available when rates were lower</li>
</ul>
<h2>If You Own a Variable Annuity</h2>
<ul>
<li>Rising rates can affect the bond sub-accounts within your annuity (bond values typically fall when rates rise)</li>
<li>However, guaranteed income riders are generally unaffected by rate changes \u2014 those guarantees are contractual</li>
<li>Higher rates may also mean that newer variable annuity contracts offer more competitive guarantees</li>
</ul>
<h2>If You Own a Fixed Indexed Annuity</h2>
<ul>
<li>Insurance companies may adjust cap rates and participation rates based on the rate environment</li>
<li>Higher interest rates generally allow insurers to offer more favorable crediting terms</li>
</ul>
<p>The bottom line: interest rate changes don\u2019t automatically mean you should do anything differently. But they do create opportunities worth evaluating.</p>
<p><strong>Want to understand how the current rate environment affects your specific annuity? Reply to this email for a complimentary review.</strong></p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North \u00b7 1200 N Federal Hwy, Boca Raton, FL 33432</p>` },
  { id:'e-2-9', subject:"Real client story: Discovering $8K in unnecessary fees", previewText:"A real-world example of why annuity reviews matter.", sendDay:49, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>Last year, a couple in their early 60s \u2014 let\u2019s call them Jim and Diane \u2014 came to us for a second opinion on their retirement portfolio. They had a variable annuity they\u2019d owned for nine years and assumed it was performing well.</p>
<h2>What We Found</h2>
<ul>
<li><strong>Two riders they weren\u2019t using.</strong> Jim and Diane had added a guaranteed minimum accumulation benefit and an enhanced death benefit when they purchased the contract. Combined rider fees: 1.85% per year. But their financial situation had changed \u2014 they no longer needed either feature, yet they were paying roughly $5,500 annually for them.</li>
<li><strong>High-cost sub-accounts.</strong> The investment options inside their annuity had expense ratios averaging 1.10%. Comparable investments were available at a fraction of that cost.</li>
<li><strong>Surrender period had ended.</strong> Jim and Diane didn\u2019t realize their seven-year surrender period had expired two years earlier. They had full flexibility to make changes \u2014 and no one had told them.</li>
</ul>
<p><strong>The outcome:</strong> After a careful analysis, Jim and Diane were able to restructure their position, eliminating approximately $8,000 in annual fees while maintaining the protections they actually needed.</p>
<p>Every situation is unique, and past results don\u2019t guarantee future outcomes. But Jim and Diane\u2019s story illustrates why periodic reviews are so important.</p>
<p><strong>Curious whether your annuity deserves a closer look? Reply to this email and we\u2019ll schedule a complimentary review.</strong></p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North \u00b7 1200 N Federal Hwy, Boca Raton, FL 33432. Names and details changed to protect client privacy.</p>` },
  { id:'e-2-10', subject:"Your annuity performance review checklist", previewText:"A simple framework for evaluating your annuity.", sendDay:56, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>You don\u2019t need to be a financial expert to evaluate your annuity. Here\u2019s a straightforward checklist you can use to assess whether your contract is still working for you.</p>
<h2>Your Annuity Review Checklist</h2>
<ul>
<li><strong>\u2610 Do I know my total annual fees?</strong> Add up M&E charges, rider fees, administrative fees, and underlying fund expenses. If the total exceeds 3%, it\u2019s worth investigating whether lower-cost alternatives exist.</li>
<li><strong>\u2610 Am I past my surrender period?</strong> Check your contract or annual statement for the surrender schedule. If penalties have expired, you have more options than you may realize.</li>
<li><strong>\u2610 Am I using all the riders I\u2019m paying for?</strong> If you\u2019re paying for a guaranteed income rider but don\u2019t plan to annuitize, or a death benefit rider that\u2019s no longer necessary, you may be paying for features you don\u2019t need.</li>
<li><strong>\u2610 How has my account value performed vs. my benefit base?</strong> These are two different numbers. Understanding both is critical for making informed decisions about withdrawals.</li>
<li><strong>\u2610 Does my annuity still align with my retirement timeline?</strong> Your goals at 50 may be very different from your goals at 65. Make sure your annuity strategy has kept pace.</li>
<li><strong>\u2610 When did I last review this contract?</strong> If it\u2019s been more than two years, it\u2019s time for a fresh look.</li>
</ul>
<p>If you checked fewer than four boxes with confidence, a professional review could be valuable.</p>
<p><strong>Download our free Annuity Evaluation Worksheet by replying \u201cworksheet\u201d \u2014 or schedule a complimentary review by replying \u201creview.\u201d</strong></p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North \u00b7 1200 N Federal Hwy, Boca Raton, FL 33432</p>` },
  { id:'e-2-11', subject:"Should you exchange your annuity? 3 factors to consider", previewText:"Understanding the 1035 exchange \u2014 and when it makes sense.", sendDay:63, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>If your current annuity isn\u2019t meeting your needs, you may have heard about something called a <strong>1035 exchange</strong>. Named after Section 1035 of the Internal Revenue Code, it allows you to transfer from one annuity to another without triggering a taxable event.</p>
<p>But just because you <em>can</em> exchange doesn\u2019t mean you <em>should</em>. Here are three factors to weigh carefully.</p>
<h2>1. Surrender Charges</h2>
<p>If you\u2019re still within your surrender period, exchanging could trigger significant penalties \u2014 sometimes 5% to 8% of your account value. A new contract will also restart the surrender clock. Make sure the benefits of switching clearly outweigh these costs.</p>
<h2>2. Loss of Existing Guarantees</h2>
<p>Some older annuities carry guarantees that are no longer available in today\u2019s market \u2014 higher minimum interest rates, more generous income riders, or better death benefits. Before exchanging, understand exactly what you\u2019d be giving up.</p>
<h2>3. Total Cost Comparison</h2>
<p>Compare the all-in costs of your current contract with the proposed replacement. Lower fees in the new contract are only beneficial if the overall value proposition \u2014 including guarantees, investment options, and flexibility \u2014 is genuinely better.</p>
<h2>The Bottom Line</h2>
<p>A 1035 exchange can be a powerful tool when used appropriately. But it\u2019s not always the right move, and anyone who tells you otherwise without reviewing your specific situation isn\u2019t looking out for your best interests.</p>
<p><strong>If you\u2019re considering an exchange \u2014 or just want to know if it\u2019s worth exploring \u2014 reply to this email. Our analysis is complimentary and comes with zero obligation.</strong></p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North \u00b7 1200 N Federal Hwy, Boca Raton, FL 33432. This is educational content only and should not be considered tax or legal advice. Consult your tax advisor before making any exchange decisions.</p>` },
  { id:'e-2-12', subject:"Next steps for annuity optimization", previewText:"Our final email \u2014 and a standing invitation.", sendDay:70, status:'active', bodyFormat:'html',
    body:`<p>Hi {{first_name}},</p>
<p>Over the past several weeks, we\u2019ve shared what we believe every annuity owner should know \u2014 from understanding hidden fees to evaluating whether your contract is still delivering on its promises.</p>
<h2>Here\u2019s What We\u2019ve Covered</h2>
<ul>
<li>The four layers of annuity costs and how they compound over time</li>
<li>The difference between fixed, variable, and indexed annuities</li>
<li>How to verify that your guarantees are performing as illustrated</li>
<li>The impact of interest rate changes on your contract</li>
<li>A real-world example of how a review uncovered $8K in unnecessary fees</li>
<li>A self-service checklist for evaluating your annuity\u2019s performance</li>
<li>The three critical factors to weigh before considering a 1035 exchange</li>
</ul>
<h2>Where Do You Go From Here?</h2>
<p>If any of these topics resonated with you, the natural next step is a personalized review. Here\u2019s what that looks like:</p>
<ul>
<li><strong>Step 1:</strong> Share your most recent annuity statement with us (we\u2019ll keep it confidential)</li>
<li><strong>Step 2:</strong> We\u2019ll analyze your fees, guarantees, and performance in detail</li>
<li><strong>Step 3:</strong> You\u2019ll receive a clear, written summary of our findings</li>
<li><strong>Step 4:</strong> We\u2019ll discuss your options together \u2014 with absolutely no pressure to make changes</li>
</ul>
<p>The entire process takes about 20 minutes and is completely complimentary.</p>
<p><strong>Ready to get started? Reply to this email, call us at (561) 555-0100, or visit our website to book a time.</strong></p>
<p>Thank you for reading, {{first_name}}. Whatever you decide, we\u2019re here when you need us.</p>
<p>Warm regards,<br/>The FFA North Team</p>
<p style="font-size:12px;color:#888;">Florida Financial Advisors North \u00b7 1200 N Federal Hwy, Boca Raton, FL 33432. You are receiving this email because you opted in to educational content from Florida Financial Advisors. To unsubscribe, reply \u201cunsubscribe\u201d or click the link below.</p>` },
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
  { id:'step-ret-5', subject:"The retirement income gap: are you prepared?", previewText:"What happens when your paycheck stops?", sendDay:21, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>Here is a question that keeps many pre-retirees up at night: <strong>Will my savings actually replace my paycheck?</strong></p>

<p>The reality is that most Americans face a significant gap between the retirement income they will need and the income their current savings are projected to provide. According to research from the Employee Benefit Research Institute, nearly half of households are at risk of not having enough to cover essential expenses in retirement.</p>

<h2>Understanding Your Income Gap</h2>

<p>Your retirement income gap is the difference between:</p>
<ul>
  <li>The monthly income you will need to maintain your lifestyle</li>
  <li>The combined income from Social Security, pensions, and projected portfolio withdrawals</li>
</ul>

<p>Most financial professionals suggest planning for 75-85% of your pre-retirement income, though the right number depends on your unique circumstances — your health, where you plan to live, and how you envision spending your time.</p>

<p>The good news? Once you quantify the gap, you can build a strategy to close it. Small adjustments today — increasing contributions, optimizing asset allocation, or adjusting your timeline — can make a meaningful difference.</p>

<p>We help people calculate and close their income gap every day. <strong>Schedule a complimentary consultation</strong> and we will walk through your numbers together.</p>

<p>Simply reply to this email to get started.</p>

<p>Warm regards,<br/>The FFA North Team</p>` },
  { id:'step-ret-6', subject:"Social Security strategies most people miss", previewText:"Timing and coordination can add tens of thousands.", sendDay:28, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>Social Security may be the single most important retirement decision you make — yet most people spend more time planning a vacation than planning their claiming strategy.</p>

<h2>Three Strategies Worth Knowing</h2>

<ul>
  <li><strong>Delayed claiming for higher guaranteed income.</strong> For every year you delay past your Full Retirement Age (up to 70), your benefit grows by approximately 8%. That is a guaranteed increase that is difficult to replicate with any investment.</li>
  <li><strong>Spousal coordination.</strong> If you are married, the order and timing of when each spouse claims can significantly affect your combined lifetime benefits. One spouse claiming early while the other delays is a strategy that works well for many couples.</li>
  <li><strong>Tax-aware claiming.</strong> Social Security benefits can be taxable depending on your other income sources. Coordinating your claiming strategy with Roth conversions and other income can help reduce your overall tax burden in retirement.</li>
</ul>

<p>The difference between a good strategy and a suboptimal one can amount to tens of thousands of dollars over your lifetime. And once you start receiving benefits, your options become much more limited.</p>

<p>We offer a complimentary Social Security optimization analysis as part of our retirement planning process. <strong>Reply to this email</strong> and we will run the numbers for your specific situation.</p>

<p>Best regards,<br/>The FFA North Team</p>` },
  { id:'step-ret-7', subject:"Healthcare costs in retirement: planning ahead", previewText:"Medicare is just the starting point.", sendDay:35, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>When most people think about retirement expenses, they think about housing, travel, and daily living costs. But the expense that often has the biggest impact on a retirement plan is <strong>healthcare</strong>.</p>

<h2>What Medicare Covers — and What It Does Not</h2>

<p>Medicare is an important foundation, but it was never designed to cover everything:</p>
<ul>
  <li><strong>Part A</strong> covers hospital stays but comes with deductibles and copays</li>
  <li><strong>Part B</strong> covers doctor visits and outpatient care — with a monthly premium that increases based on income</li>
  <li><strong>Part D</strong> helps with prescription drugs but has its own costs and coverage gaps</li>
  <li><strong>Long-term care</strong> — such as assisted living or in-home care — is generally <em>not</em> covered by Medicare at all</li>
</ul>

<h2>Bridging the Gaps</h2>

<p>Many retirees choose a Medicare Supplement (Medigap) or Medicare Advantage plan to reduce out-of-pocket exposure. The right choice depends on your health history, preferred doctors, prescription needs, and risk tolerance.</p>

<p>If you are retiring before 65, you also need a strategy for the gap years before Medicare eligibility — a period when coverage can be especially expensive.</p>

<p>Healthcare planning is a critical piece of any retirement strategy. <strong>Download our complimentary guide, "Healthcare in Retirement: What You Need to Know,"</strong> by replying to this email.</p>

<p>To your health and your future,<br/>The FFA North Team</p>` },
  { id:'step-ret-8', subject:"Tax-efficient withdrawal strategies", previewText:"The order you draw from accounts matters more than you think.", sendDay:42, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>Most people focus on how much they have saved for retirement. Far fewer think about <strong>how they will withdraw it</strong> — and that can be just as important.</p>

<h2>Why Withdrawal Order Matters</h2>

<p>In retirement, you likely have money in accounts with different tax treatments:</p>
<ul>
  <li><strong>Tax-deferred accounts</strong> (Traditional IRA, 401(k)) — withdrawals are taxed as ordinary income</li>
  <li><strong>Tax-free accounts</strong> (Roth IRA, Roth 401(k)) — qualified withdrawals owe no tax</li>
  <li><strong>Taxable accounts</strong> (brokerage) — taxed at capital gains rates, which are often lower</li>
</ul>

<p>The conventional wisdom of "draw from taxable first, then tax-deferred, then Roth last" is a reasonable starting point, but it is not always optimal. A more nuanced approach considers your tax bracket each year and may include:</p>

<ul>
  <li><strong>Roth conversions</strong> in lower-income years to reduce future Required Minimum Distributions</li>
  <li><strong>Strategic Roth withdrawals</strong> to manage your Medicare premium surcharges (IRMAA)</li>
  <li><strong>Tax bracket management</strong> — filling up lower brackets with taxable income to keep more money growing tax-free</li>
</ul>

<p>A well-designed withdrawal strategy can potentially extend the life of your portfolio and reduce the total taxes you pay over your retirement. <strong>Schedule a complimentary consultation</strong> and we can discuss which approach may make sense for your situation.</p>

<p>Best regards,<br/>The FFA North Team</p>` },
  { id:'step-ret-9', subject:"How inflation affects your retirement timeline", previewText:"Your purchasing power is quietly eroding.", sendDay:49, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>Inflation has been front-page news in recent years, and for good reason. But even in more typical years, inflation quietly reshapes every retirement plan.</p>

<h2>The Purchasing Power Problem</h2>

<p>Consider this: at just 3% annual inflation, something that costs $1,000 today will cost roughly $1,800 in twenty years. If your retirement could last 25 or 30 years, the impact compounds significantly.</p>

<p>This means your retirement plan needs to account not just for today's expenses, but for expenses that may double over your lifetime.</p>

<h2>Strategies to Help Protect Your Purchasing Power</h2>

<ul>
  <li><strong>Maintain some growth-oriented investments</strong> even in retirement — a portfolio that is too conservative may not keep pace with rising costs</li>
  <li><strong>Consider Social Security timing</strong> — delayed benefits grow at 8% per year, which can serve as a built-in inflation hedge</li>
  <li><strong>Review your plan annually</strong> — inflation assumptions from five years ago may no longer be accurate</li>
  <li><strong>Build in margin</strong> — a plan that works only if everything goes perfectly is not truly a plan</li>
</ul>

<p>Inflation does not have to derail your retirement. With thoughtful planning, you can build a strategy designed to maintain your lifestyle regardless of economic conditions.</p>

<p><strong>Schedule a complimentary consultation</strong> to discuss how inflation is factored into your current plan. Reply to get started.</p>

<p>Warm regards,<br/>The FFA North Team</p>` },
  { id:'step-ret-10', subject:"Estate planning essentials for retirement", previewText:"Protect what you have built for the people you love.", sendDay:56, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>Estate planning is one of those topics people know is important but often put off. The truth is, retirement is the ideal time to get your estate plan in order — or to review one you created years ago.</p>

<h2>Five Things to Review Now</h2>

<ul>
  <li><strong>Beneficiary designations.</strong> These override your will. If you have had a life change — marriage, divorce, birth, or loss — your designations may be out of date. We see this more often than you might expect.</li>
  <li><strong>Power of attorney.</strong> Both financial and healthcare powers of attorney ensure that someone you trust can act on your behalf if you are unable to.</li>
  <li><strong>Trust considerations.</strong> Depending on the size of your estate and your goals, a trust can help avoid probate, reduce estate taxes, and protect assets for your heirs.</li>
  <li><strong>Required Minimum Distributions and your estate.</strong> If you have significant IRA balances, the SECURE Act changed the rules for inherited IRAs. Your beneficiaries may face a 10-year distribution window that could create a substantial tax burden.</li>
  <li><strong>Charitable giving strategies.</strong> Qualified Charitable Distributions and donor-advised funds can help you support causes you care about while potentially reducing your tax liability.</li>
</ul>

<p>Estate planning works best as part of a comprehensive retirement strategy — not in isolation. <strong>Download our complimentary guide, "Estate Planning Essentials,"</strong> by replying to this email.</p>

<p>Best regards,<br/>The FFA North Team</p>` },
  { id:'step-ret-11', subject:"Real story: How the Martinez family secured their retirement", previewText:"A real-world example of comprehensive planning in action.", sendDay:63, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>We would like to share a story about a couple we will call the Martinez family (names and details changed for privacy).</p>

<h2>Where They Started</h2>

<p>Carlos and Maria came to us five years before their planned retirement. They had done a lot of things right — saved consistently, avoided major debt, and paid off their home. But they had some concerns:</p>
<ul>
  <li>Their savings were concentrated in Carlos's 401(k) with limited diversification</li>
  <li>They had no strategy for when to claim Social Security</li>
  <li>Maria had a small pension, but they were unsure how it fit into their overall plan</li>
  <li>They had not reviewed their estate documents since their children were young</li>
</ul>

<h2>What We Did Together</h2>

<p>Over the course of several meetings, we helped the Martinez family build a comprehensive plan. We modeled different Social Security claiming scenarios and identified a strategy that was projected to provide significantly more lifetime income. We diversified their investment holdings and created a tax-efficient withdrawal sequence. We also connected them with an estate attorney to update their documents.</p>

<h2>Where They Are Today</h2>

<p>Carlos retired on schedule and Maria followed a year later. They feel confident about their income, their healthcare coverage, and the legacy they will leave their family.</p>

<p>Every family's situation is unique, but the process works the same way: understand where you are, define where you want to go, and build a plan to get there. <strong>Schedule a complimentary consultation</strong> and let us start building your plan.</p>

<p>Warm regards,<br/>The FFA North Team</p>` },
  { id:'step-ret-12', subject:"Your personalized retirement readiness assessment", previewText:"Let us build a clear picture of your retirement future.", sendDay:70, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>Over the past several weeks, we have shared insights on some of the most important aspects of retirement planning — from Social Security and healthcare costs to tax-efficient withdrawals and estate planning.</p>

<p>Now we would like to offer you something more personal.</p>

<h2>Your Complimentary Retirement Readiness Assessment</h2>

<p>This is not a generic calculator or a one-size-fits-all report. It is a personalized review conducted by one of our experienced advisors, tailored to your specific situation. Here is what we will cover:</p>

<ul>
  <li><strong>Income gap analysis</strong> — how your projected retirement income compares to your anticipated needs</li>
  <li><strong>Social Security optimization</strong> — the claiming strategy that may work best for you and your spouse</li>
  <li><strong>Healthcare cost projection</strong> — a realistic estimate of your medical expenses in retirement</li>
  <li><strong>Tax efficiency review</strong> — opportunities to reduce your lifetime tax burden through smart withdrawal sequencing</li>
  <li><strong>Estate and beneficiary checkup</strong> — making sure your wishes are properly documented</li>
</ul>

<p>The assessment takes about 30 minutes, is completely complimentary, and comes with zero obligation. You will walk away with a clear picture of where you stand and actionable next steps.</p>

<p><strong>Ready to get started? Reply to this email or call us directly at (561) 555-0100 to schedule your assessment.</strong></p>

<p>We look forward to helping you plan the retirement you deserve.</p>

<p>All the best,<br/>The FFA North Team</p>` },
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
  { id:'step-inv-5', subject:"Market volatility and your portfolio: staying the course", previewText:"Why your reaction to a downturn matters more than the downturn itself.", sendDay:21, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>When markets drop sharply, every instinct tells us to do something — sell, move to cash, wait it out on the sidelines. It feels like the safe choice. But decades of market data tell a different story.</p>

<h2>The Real Risk: Missing the Recovery</h2>

<p>Some of the market's strongest days historically have occurred shortly after its worst days. Investors who moved to cash during downturns and waited for things to "settle down" have often missed the recovery that followed.</p>

<p>Research from J.P. Morgan has shown that missing just the 10 best days in the market over a 20-year period could cut your total returns by more than half. And the challenge is that no one can consistently predict which days those will be.</p>

<h2>What You Can Do Instead</h2>

<ul>
  <li><strong>Review your allocation.</strong> Make sure your portfolio reflects your actual time horizon, not your emotional state during a downturn.</li>
  <li><strong>Rebalance thoughtfully.</strong> Market drops can create opportunities to buy assets at lower prices through disciplined rebalancing.</li>
  <li><strong>Focus on what you can control.</strong> Your savings rate, your tax strategy, and your diversification are all within your control — market returns are not.</li>
  <li><strong>Talk to your advisor.</strong> A calm conversation during turbulent markets is one of the most valuable things an advisor can provide.</li>
</ul>

<p>Volatility is the price of admission for long-term growth. Having a plan — and sticking to it — has historically been one of the most effective investment strategies available.</p>

<p><strong>Schedule a complimentary consultation</strong> if you would like to discuss how your portfolio is positioned. Reply to this email to get started.</p>

<p>Best regards,<br/>The FFA North Team</p>` },
  { id:'step-inv-6', subject:"Diversification beyond stocks and bonds", previewText:"There is a wider world of investment options.", sendDay:28, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>When most people hear "diversification," they think of owning a mix of stocks and bonds. That is an important foundation — but it is only part of the picture.</p>

<h2>Expanding Your Investment Toolkit</h2>

<p>A well-diversified portfolio may include exposure to asset classes that do not move in lockstep with the traditional stock and bond markets:</p>

<ul>
  <li><strong>Real estate investment trusts (REITs).</strong> These provide exposure to commercial and residential real estate without the complexity of owning property directly. They have historically offered attractive income and diversification benefits.</li>
  <li><strong>International and emerging market equities.</strong> While domestic stocks have performed well in recent years, international markets represent roughly half of global market capitalization. Meaningful overseas exposure can reduce concentration risk.</li>
  <li><strong>Treasury Inflation-Protected Securities (TIPS).</strong> These government bonds adjust their principal value with inflation, providing a hedge that traditional bonds do not offer.</li>
  <li><strong>Commodities and natural resources.</strong> These can provide a buffer during inflationary periods when both stocks and bonds may struggle.</li>
</ul>

<h2>The Key Principle</h2>

<p>True diversification means owning assets that respond differently to the same economic conditions. The goal is not to find the single best-performing asset — it is to build a portfolio that is resilient across a range of scenarios.</p>

<p>Wondering how your portfolio's diversification measures up? <strong>Download our complimentary guide, "Building a Resilient Portfolio,"</strong> by replying to this email.</p>

<p>Warm regards,<br/>The FFA North Team</p>` },
  { id:'step-inv-7', subject:"Understanding investment fees and their long-term impact", previewText:"Small percentages, big consequences over time.", sendDay:35, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>In our earlier email, we shared how fees can cost investors hundreds of thousands of dollars over a lifetime. Today, we want to go deeper — because understanding <em>what</em> you are paying is the first step to making informed decisions.</p>

<h2>The Layers of Investment Fees</h2>

<p>Most investors pay fees at multiple levels, and many are not clearly disclosed:</p>

<ul>
  <li><strong>Expense ratios.</strong> Every mutual fund and ETF charges an annual fee, expressed as a percentage of your assets. These can range from 0.03% for a simple index fund to over 1.5% for actively managed funds.</li>
  <li><strong>Advisory fees.</strong> If you work with a financial advisor, you typically pay an additional fee — often 0.5% to 1.5% of assets under management annually.</li>
  <li><strong>Transaction costs.</strong> Trading commissions, bid-ask spreads, and market impact costs all reduce your returns, though they are rarely itemized on statements.</li>
  <li><strong>Account fees.</strong> Custodial fees, account maintenance charges, and transfer fees can also add up over time.</li>
</ul>

<h2>Fees Are Not Inherently Bad</h2>

<p>The question is not whether you are paying fees — it is whether you are getting value for what you pay. Good financial advice, proper tax management, and behavioral coaching during volatile markets can be worth far more than their cost. The key is transparency.</p>

<p>We believe you deserve to know exactly what you are paying and what you are receiving in return. <strong>Schedule a complimentary fee transparency review</strong> — reply to this email and we will analyze your current costs.</p>

<p>Best regards,<br/>The FFA North Team</p>` },
  { id:'step-inv-8', subject:"Risk tolerance vs. risk capacity: know the difference", previewText:"How you feel about risk is only half the equation.", sendDay:42, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>Most investment questionnaires ask how you <em>feel</em> about risk. But your feelings are only one side of the coin. Equally important is your <strong>capacity</strong> to take risk.</p>

<h2>Risk Tolerance vs. Risk Capacity</h2>

<p><strong>Risk tolerance</strong> is emotional — it is how much volatility you can stomach without losing sleep or making impulsive decisions. It is personal and psychological.</p>

<p><strong>Risk capacity</strong> is financial — it is how much risk you can objectively afford to take given your income, savings, time horizon, and obligations. It is mathematical.</p>

<h2>Why Both Matter</h2>

<p>Consider two scenarios:</p>
<ul>
  <li>A 35-year-old with a long time horizon and steady income has high risk <em>capacity</em> but may have low risk <em>tolerance</em> after experiencing a market downturn. An overly conservative portfolio could cost them significant growth over decades.</li>
  <li>A 60-year-old nearing retirement may feel comfortable taking aggressive risks (high tolerance) but may not have the time horizon to recover from a major loss (low capacity). Taking too much risk could jeopardize their retirement.</li>
</ul>

<p>The best investment strategy aligns both dimensions. A portfolio that matches your capacity but ignores your tolerance will lead to poor decisions during downturns. A portfolio that matches your tolerance but ignores your capacity may leave you short of your goals.</p>

<p>We help our clients find the right balance. <strong>Schedule a complimentary consultation</strong> to discuss your personal risk profile — reply to this email to get started.</p>

<p>Warm regards,<br/>The FFA North Team</p>` },
  { id:'step-inv-9', subject:"Tax-loss harvesting and other year-round tax strategies", previewText:"Tax planning is not just a December activity.", sendDay:49, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>Many investors think about taxes only at year-end. But some of the most effective tax strategies work best when they are implemented throughout the year.</p>

<h2>Strategies Worth Knowing</h2>

<ul>
  <li><strong>Tax-loss harvesting.</strong> When an investment declines in value, selling it can generate a tax loss that offsets gains elsewhere in your portfolio. The proceeds can be reinvested in a similar (but not identical) holding to maintain your market exposure. This is most effective when done opportunistically throughout the year — not just in December.</li>
  <li><strong>Asset location.</strong> Placing tax-inefficient investments (like taxable bonds or REITs) in tax-advantaged accounts and tax-efficient investments (like index funds) in taxable accounts can improve your after-tax returns without changing your overall allocation.</li>
  <li><strong>Gain deferral and recognition.</strong> Timing the realization of capital gains to manage your tax bracket — for example, recognizing gains in a year when your income is lower — can reduce your total tax bill.</li>
  <li><strong>Qualified Charitable Distributions.</strong> If you are over 70-1/2 and charitably inclined, donating directly from your IRA can satisfy your Required Minimum Distribution without increasing your taxable income.</li>
</ul>

<p>These strategies require ongoing attention and coordination between your investment management and tax planning. That is exactly the kind of comprehensive approach we provide.</p>

<p><strong>Download our complimentary guide, "Year-Round Tax Strategies for Investors,"</strong> by replying to this email.</p>

<p>Best regards,<br/>The FFA North Team</p>` },
  { id:'step-inv-10', subject:"How life milestones should trigger portfolio reviews", previewText:"Major life changes call for investment checkups.", sendDay:56, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>Your investments should evolve as your life evolves. Yet many people set their portfolio once and rarely revisit it — even as their circumstances change dramatically.</p>

<h2>Life Events That Warrant a Portfolio Review</h2>

<ul>
  <li><strong>Career changes.</strong> A new job, promotion, or transition to self-employment can change your income, benefits, and retirement account options. Your investment strategy should reflect your new reality.</li>
  <li><strong>Marriage or divorce.</strong> Combining finances — or separating them — affects your tax situation, estate plan, and overall investment approach.</li>
  <li><strong>Having or adopting children.</strong> Education funding, increased insurance needs, and a longer financial planning horizon all impact how your portfolio should be structured.</li>
  <li><strong>Receiving an inheritance or windfall.</strong> A sudden increase in assets requires thoughtful integration into your existing plan to avoid concentration risk and tax surprises.</li>
  <li><strong>Approaching retirement.</strong> The transition from accumulation to distribution is one of the most significant shifts in your financial life. Your portfolio should begin reflecting this change years before your retirement date.</li>
  <li><strong>Loss of a spouse or family member.</strong> Beyond the emotional impact, this often requires a complete reassessment of income needs, beneficiary designations, and financial goals.</li>
</ul>

<p>If you have experienced a significant life change recently — or expect one in the near future — it may be time to revisit your investment approach.</p>

<p><strong>Schedule a complimentary consultation</strong> to discuss how your portfolio aligns with where you are today. Reply to this email or call us at (561) 555-0100.</p>

<p>Warm regards,<br/>The FFA North Team</p>` },
  { id:'step-inv-11', subject:"Real results: How a disciplined approach outperforms", previewText:"Patience and process over prediction and impulse.", sendDay:63, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>We would like to share a story that illustrates why we believe in disciplined, evidence-based investing (details changed to protect privacy).</p>

<h2>The Situation</h2>

<p>A business owner — we will call him David — came to us after years of managing his own portfolio. He was a smart, successful professional, but his investment approach was reactive: buying what was hot, selling after downturns, and frequently shifting strategies based on headlines.</p>

<p>When we reviewed his accounts, we found that despite a strong market over the prior decade, his actual returns had significantly lagged a simple balanced portfolio. The culprit was not bad investments — it was bad timing.</p>

<h2>The Approach</h2>

<p>Together, we built a diversified portfolio aligned with his goals, time horizon, and risk profile. We established a systematic rebalancing schedule and a clear investment policy that removed emotion from the equation. Most importantly, we agreed on a plan to follow during market turbulence — before it happened.</p>

<h2>The Outcome</h2>

<p>Over the following years, David's portfolio experienced the same market ups and downs as everyone else. But because he had a plan and a partner to help him stick to it, he avoided the costly mistakes that had held him back before.</p>

<p>Past results do not guarantee future performance, and every investor's situation is unique. But the principle holds: <strong>a disciplined process, consistently followed, has historically been one of the most reliable paths to long-term investment success.</strong></p>

<p>Ready to bring more discipline to your investment approach? <strong>Reply to this email to schedule a complimentary consultation.</strong></p>

<p>Best regards,<br/>The FFA North Team</p>` },
  { id:'step-inv-12', subject:"Your complimentary portfolio analysis awaits", previewText:"A clear, unbiased look at where you stand.", sendDay:70, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>Over the past several weeks, we have shared insights on market volatility, diversification, fees, risk management, tax strategies, and the importance of aligning your investments with your life. We hope you have found these emails valuable.</p>

<p>Now we would like to offer you something more personal.</p>

<h2>Your Complimentary Portfolio Analysis</h2>

<p>This is a thorough, one-on-one review conducted by one of our experienced advisors. Here is what we will cover:</p>

<ul>
  <li><strong>Performance evaluation</strong> — how your portfolio has performed relative to appropriate benchmarks, adjusted for risk</li>
  <li><strong>Fee transparency report</strong> — a complete accounting of what you are paying across all layers of fees</li>
  <li><strong>Diversification analysis</strong> — identifying concentration risks, overlapping holdings, and gaps in your allocation</li>
  <li><strong>Risk alignment assessment</strong> — ensuring your portfolio matches both your risk tolerance and your risk capacity</li>
  <li><strong>Tax efficiency opportunities</strong> — strategies that may reduce your tax burden without changing your investment goals</li>
</ul>

<p>The analysis takes about 30 minutes, is completely complimentary, and comes with no obligation whatsoever. You will leave with a clear understanding of where you stand and specific, actionable ideas for improvement.</p>

<p><strong>Ready to get started? Reply to this email or call us directly at (561) 555-0100 to schedule your portfolio analysis.</strong></p>

<p>We look forward to working with you.</p>

<p>All the best,<br/>The FFA North Team</p>` },
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
  { id:'e-5-5', subject:"Why a financial second opinion is like a medical second opinion", previewText:"You would get one for your health. Why not your wealth?", sendDay:21, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>Imagine your doctor recommends a major surgery. What would you do? Most people would seek a second opinion before making that decision. It is not about distrusting your doctor — it is about making sure you have the full picture.</p>

<p>Your financial plan deserves the same level of care. Here is why the analogy holds:</p>

<ul>
  <li><strong>Diagnosis matters.</strong> Just as two doctors may interpret the same symptoms differently, two advisors may see different opportunities — or risks — in the same portfolio.</li>
  <li><strong>Treatments vary.</strong> There is rarely one "right" approach. A second perspective can reveal strategies your current advisor may not specialize in.</li>
  <li><strong>Peace of mind is priceless.</strong> Whether the second opinion confirms your current path or suggests improvements, you walk away more confident.</li>
</ul>

<p>A financial second opinion is not about finding fault. It is about making sure the plan you are following is truly the best one for your situation today.</p>

<p>If you would like a fresh, objective look at your financial plan, simply reply to this email. There is no cost and no obligation.</p>

<p>Warm regards,<br/>The FFA North Team</p>` },
  { id:'e-5-6', subject:"5 red flags that your financial plan needs a review", previewText:"How many of these apply to you?", sendDay:28, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>Even well-constructed financial plans can drift off course over time. Here are five warning signs that it may be time for a closer look:</p>

<h2>Your Financial Plan Red Flag Checklist</h2>

<ul>
  <li><strong>1. You have not updated your plan in over two years.</strong> Tax laws change, markets shift, and your life evolves. A plan from a few years ago may not reflect where you are today.</li>
  <li><strong>2. You cannot clearly explain your advisor's fee structure.</strong> If you are unsure what you are paying — or how your advisor is compensated — that is a gap worth closing.</li>
  <li><strong>3. Your beneficiary designations are outdated.</strong> Marriage, divorce, new children, or the loss of a loved one can all make existing designations incorrect.</li>
  <li><strong>4. You do not have a written financial plan.</strong> Verbal guidance is not a plan. A written roadmap with specific goals and timelines is essential for measuring progress.</li>
  <li><strong>5. Your advisor has not proactively contacted you this year.</strong> Regular communication is a sign of attentive service. Silence may indicate you are being overlooked.</li>
</ul>

<p>If even one of these resonated, a second opinion could provide valuable clarity. Reply to this email and we will schedule a confidential review at your convenience.</p>

<p>Best regards,<br/>The FFA North Team</p>` },
  { id:'e-5-7', subject:"What fiduciary duty means for your money", previewText:"Not all advisors are held to the same standard.", sendDay:35, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>When it comes to financial advice, there is a critical distinction that many people are unaware of: the difference between the <strong>fiduciary standard</strong> and the <strong>suitability standard</strong>.</p>

<h2>Fiduciary vs. Suitability: What You Should Know</h2>

<p><strong>Fiduciary standard:</strong> The advisor is legally required to act in your best interest. They must put your needs ahead of their own and disclose any potential conflicts of interest.</p>

<p><strong>Suitability standard:</strong> The advisor must recommend products that are "suitable" for you — but not necessarily the <em>best</em> option. A suitable recommendation can still carry higher fees or conflicts of interest.</p>

<p>Here is why this matters in practice:</p>

<ul>
  <li>Two different investment products may both be "suitable" for your situation, but one could charge significantly higher fees than the other.</li>
  <li>Under the suitability standard, either recommendation would be acceptable. Under the fiduciary standard, the advisor would be obligated to recommend the lower-cost option if it better serves your interests.</li>
  <li>Understanding which standard your current advisor follows is one of the most important questions you can ask.</li>
</ul>

<p>If you are not sure which standard your advisor follows, we are happy to help you evaluate your current advisory relationship — no cost, no pressure. Simply reply to this email to get started.</p>

<p>Warm regards,<br/>The FFA North Team</p>` },
  { id:'e-5-8', subject:"The true cost of financial advisor fees", previewText:"Small percentages can add up to surprisingly big numbers.", sendDay:42, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>Most investors focus on returns — but fees may have an even bigger impact on your long-term wealth. Here is a straightforward comparison to illustrate:</p>

<h2>How Fees Compound Over Time</h2>

<p>Consider a $750,000 portfolio growing at an average of 7% annually over 20 years:</p>

<ul>
  <li><strong>At 0.50% total fees:</strong> Your portfolio grows to approximately $2,534,000</li>
  <li><strong>At 1.00% total fees:</strong> Approximately $2,172,000</li>
  <li><strong>At 1.50% total fees:</strong> Approximately $1,860,000</li>
  <li><strong>At 2.00% total fees:</strong> Approximately $1,592,000</li>
</ul>

<p>The difference between the lowest and highest fee scenario is nearly <strong>$942,000</strong> — on the same portfolio, with the same market returns.</p>

<p>Important: lower fees do not always mean better value. The key is understanding what you are paying for and whether the services you receive justify the cost. Some advisors provide comprehensive financial planning, tax optimization, and estate coordination that more than offset their fees.</p>

<p>If you would like to understand exactly what you are paying and what you are getting in return, our complimentary fee transparency review can help. Reply to this email to schedule yours.</p>

<p>Best regards,<br/>The FFA North Team</p>` },
  { id:'e-5-9', subject:"How to evaluate your current advisor's performance", previewText:"A simple framework you can use today.", sendDay:49, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>Evaluating a financial advisor is not just about investment returns. Here is a practical framework you can use to assess whether your current advisory relationship is serving you well:</p>

<h2>The 5-Point Advisor Evaluation Framework</h2>

<ul>
  <li><strong>1. Communication.</strong> Does your advisor reach out proactively — at least quarterly — with updates relevant to your situation? Or do you only hear from them when you initiate contact?</li>
  <li><strong>2. Transparency.</strong> Can you clearly see what you are paying in fees? Does your advisor explain how they are compensated and whether they receive commissions on products they recommend?</li>
  <li><strong>3. Comprehensiveness.</strong> Is your advisor looking at your full financial picture — investments, insurance, tax strategy, estate planning, and retirement income — or only managing one piece?</li>
  <li><strong>4. Alignment.</strong> Has your advisor updated your plan to reflect major life changes? A good advisor adjusts your strategy as your circumstances evolve.</li>
  <li><strong>5. Education.</strong> Does your advisor help you understand <em>why</em> they recommend what they do? You should feel informed, not confused.</li>
</ul>

<p>If your current advisor scores well on all five points, that is a great sign. If there are gaps, a second opinion can help you identify what might be improved.</p>

<p>We are happy to walk through this framework with you. Reply to this email to set up a conversation.</p>

<p>Warm regards,<br/>The FFA North Team</p>` },
  { id:'e-5-10', subject:"Questions to ask before making any financial changes", previewText:"Protect yourself with the right questions.", sendDay:56, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>Whether you are considering switching advisors, restructuring your portfolio, or making any significant financial move, asking the right questions upfront can protect you from costly mistakes.</p>

<h2>10 Questions Worth Asking</h2>

<ul>
  <li>What are the total fees — including fund expenses, platform fees, and advisory fees?</li>
  <li>Are you a fiduciary? Will you put that in writing?</li>
  <li>How are you compensated — fee-only, commission, or a combination?</li>
  <li>What is your investment philosophy, and how does it align with my goals?</li>
  <li>How will you coordinate with my CPA and estate attorney?</li>
  <li>What happens to my account if you leave the firm?</li>
  <li>How often will we meet, and what does ongoing service look like?</li>
  <li>Can you provide references from clients in a similar situation?</li>
  <li>What tax implications should I consider before making changes?</li>
  <li>What is your process for adjusting my plan as my life changes?</li>
</ul>

<p>These questions apply to any advisor — including us. We believe informed clients make better decisions, and we welcome the scrutiny.</p>

<p>If you would like to discuss any of these questions in the context of your own financial situation, reply to this email. We are here to help — with no agenda other than your confidence.</p>

<p>Best regards,<br/>The FFA North Team</p>` },
  { id:'e-5-11', subject:"Real story: Why the Chen family sought a second opinion", previewText:"What one family discovered about their financial plan.", sendDay:63, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>We recently worked with a family — we will call them the Chens — who had been with the same financial advisor for over a decade. They were not unhappy. They simply wanted to make sure they were on the right track as retirement approached.</p>

<h2>What the Second Opinion Revealed</h2>

<p>The Chens had a solid foundation, but our review uncovered several areas where adjustments could make a meaningful difference:</p>

<ul>
  <li><strong>Fee overlap.</strong> They were invested in multiple mutual funds that held many of the same underlying stocks — effectively paying multiple layers of fees for similar exposure.</li>
  <li><strong>Tax-loss harvesting opportunities.</strong> Several positions had unrealized losses that could have been used to offset gains elsewhere in their portfolio.</li>
  <li><strong>Outdated beneficiary designations.</strong> Two accounts still listed a former spouse as the primary beneficiary — an oversight that could have had serious consequences.</li>
  <li><strong>Social Security timing.</strong> By adjusting their claiming strategy, we estimated they could meaningfully increase their combined lifetime benefits.</li>
</ul>

<p>The Chens appreciated the fresh perspective. Some findings confirmed their existing plan was sound; others led to improvements they had not considered.</p>

<p>Every situation is different, but a second opinion can uncover what you did not know to look for. If you are curious about what a review might reveal for you, reply to this email. It is free and completely confidential.</p>

<p>Warm regards,<br/>The FFA North Team</p>` },
  { id:'e-5-12', subject:"Your confidential financial review — no strings attached", previewText:"One conversation could change your financial future.", sendDay:70, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>Over the past several weeks, we have shared insights on what a financial second opinion can reveal — from hidden fees and tax strategies to beneficiary oversights and advisor evaluation frameworks.</p>

<p>Now we would like to offer you something simple: <strong>a confidential, one-on-one financial review with one of our senior advisors.</strong></p>

<h2>Here Is Exactly What You Will Receive</h2>

<ul>
  <li>A comprehensive review of your current investment portfolio, insurance coverage, and retirement plan</li>
  <li>A clear breakdown of your total fees and how they compare to industry benchmarks</li>
  <li>Identification of any gaps, risks, or missed opportunities</li>
  <li>A written summary of findings that is yours to keep — regardless of whether you choose to work with us</li>
</ul>

<h2>Our Commitment to You</h2>

<ul>
  <li>There is no cost for this review</li>
  <li>There is no obligation to make any changes or move any accounts</li>
  <li>Everything you share is held in strict confidence</li>
  <li>You will never be pressured — this is about education, not sales</li>
</ul>

<p>If you have been thinking about whether your financial plan is truly optimized for where you are today, this is a simple first step.</p>

<p>Reply to this email or call us at (561) 555-0100 to schedule your review. We look forward to the conversation.</p>

<p>With warm regards,<br/>The FFA North Team</p>` },
];

const crossSellingEmails: EmailStep[] = [
  { id:'e-6-1', subject:"Beyond insurance: your complete financial picture", previewText:"Insurance is just one piece of the puzzle.", sendDay:0, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>Thank you for exploring your insurance options with us. It tells us something important about you — you take protecting your family and your assets seriously.</p>

<p>But here is something we have learned after working with hundreds of clients: insurance does not exist in a vacuum. It is one piece of a much larger financial picture that includes:</p>

<ul>
  <li><strong>Retirement planning</strong> — ensuring your income lasts as long as you do</li>
  <li><strong>Investment management</strong> — growing your wealth in alignment with your goals and risk tolerance</li>
  <li><strong>Tax strategy</strong> — keeping more of what you earn through proactive planning</li>
  <li><strong>Estate planning</strong> — making sure your assets go where you intend</li>
</ul>

<p>When these areas are managed independently — often by different professionals who do not communicate with each other — gaps and redundancies can develop without anyone noticing.</p>

<p>Over the next few weeks, we will share some insights on how these pieces fit together. No pressure, no sales pitch — just education that we hope you will find valuable.</p>

<p>Warm regards,<br/>The FFA North Team</p>` },
  { id:'e-6-2', subject:"How insurance, investments, and retirement planning work together", previewText:"Three pillars. One strategy.", sendDay:7, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>Most people manage their insurance, investments, and retirement planning as separate concerns. But in practice, these areas are deeply interconnected:</p>

<h2>How They Connect</h2>

<ul>
  <li><strong>Insurance affects your investment risk tolerance.</strong> If you have strong disability and life insurance coverage, you may be able to take on more investment risk — because your downside is protected. Without that coverage, a more conservative approach may be warranted.</li>
  <li><strong>Investment performance affects your retirement timeline.</strong> Your portfolio growth rate directly influences when you can afford to retire and how much income you can generate.</li>
  <li><strong>Retirement planning affects your insurance needs.</strong> As you approach retirement, your insurance requirements change. You may need less life insurance but more long-term care coverage.</li>
</ul>

<p>When these three areas are coordinated, each one reinforces the others. When they are not, you may be paying for protection you do not need — or missing coverage that could be critical.</p>

<p>If you would like to see how your insurance, investments, and retirement plan work together (or where they might not), we would be happy to walk through it with you. Reply to this email to get started.</p>

<p>Best regards,<br/>The FFA North Team</p>` },
  { id:'e-6-3', subject:"The 3 pillars of financial security", previewText:"Protection. Growth. Income. Are all three covered?", sendDay:14, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>After years of working with individuals and families across a range of financial situations, we have found that lasting financial security rests on three pillars:</p>

<h2>Pillar 1: Protection</h2>
<p>This is your safety net — life insurance, disability coverage, liability protection, and an emergency fund. Without it, a single unexpected event can derail years of financial progress.</p>

<h2>Pillar 2: Growth</h2>
<p>This is your investment strategy — the engine that builds wealth over time. It includes your 401(k), IRAs, brokerage accounts, and any other investment vehicles. The goal is disciplined, diversified growth aligned with your timeline and risk tolerance.</p>

<h2>Pillar 3: Income</h2>
<p>This is your retirement income plan — how you will convert your accumulated assets into reliable income that lasts. It includes Social Security optimization, pension decisions, withdrawal sequencing, and tax-efficient distribution strategies.</p>

<p>Most people have addressed at least one pillar. Few have all three working in concert. The gaps between them are where financial risk hides.</p>

<p>Would you like to see how your three pillars stack up? Reply to this email and we will schedule a brief, no-obligation assessment.</p>

<p>Warm regards,<br/>The FFA North Team</p>` },
  { id:'e-6-4', subject:"Are your financial strategies working in harmony?", previewText:"Misalignment can cost more than you think.", sendDay:21, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>Here is a scenario we see more often than you might expect:</p>

<p>A client has a well-funded 401(k), adequate life insurance, and a financial advisor managing their portfolio. On paper, everything looks fine. But a closer look reveals:</p>

<ul>
  <li>Their investment allocation is too aggressive for their timeline, but no one has revisited it since they were 15 years from retirement — now they are 5 years away.</li>
  <li>Their life insurance is a whole life policy purchased 20 years ago that may no longer align with their current needs or estate plan.</li>
  <li>They have no Roth conversion strategy, which means they are potentially missing an opportunity to reduce their future tax burden.</li>
  <li>Their beneficiary designations across accounts contradict what their estate plan says.</li>
</ul>

<p>None of these issues are catastrophic on their own. But together, they represent a financial plan that is working against itself in subtle but meaningful ways.</p>

<p>A comprehensive review looks at all of your financial strategies as a system — not as isolated pieces. If you are curious about whether your strategies are aligned, we would be glad to help you find out.</p>

<p>Reply to this email to schedule a conversation.</p>

<p>Best regards,<br/>The FFA North Team</p>` },
  { id:'e-6-5', subject:"What a comprehensive financial review reveals", previewText:"See your finances from a new angle.", sendDay:28, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>You may be wondering what, specifically, a comprehensive financial review looks like. Here is what we cover:</p>

<h2>Our Comprehensive Review Process</h2>

<ul>
  <li><strong>Insurance audit.</strong> We review all current policies — life, disability, liability, long-term care — to identify gaps, overlaps, or opportunities for better coverage at lower cost.</li>
  <li><strong>Investment analysis.</strong> We evaluate your portfolio for performance, fees, diversification, tax efficiency, and alignment with your stated goals and risk tolerance.</li>
  <li><strong>Retirement projection.</strong> We model your retirement income from all sources — Social Security, pensions, investments, annuities — and stress-test it against different scenarios.</li>
  <li><strong>Tax strategy review.</strong> We look for opportunities to reduce your tax burden today and in retirement through Roth conversions, tax-loss harvesting, and charitable strategies.</li>
  <li><strong>Estate planning check.</strong> We verify that beneficiary designations, account titling, and estate documents are consistent and current.</li>
</ul>

<p>The review typically takes about 45 minutes and results in a written summary of findings. There is no cost and no obligation to act on anything we find.</p>

<p>If you would like to see your complete financial picture in one place, reply to this email and we will get you scheduled.</p>

<p>Warm regards,<br/>The FFA North Team</p>` },
  { id:'e-6-6', subject:"Real story: How integrating services helped the Johnsons", previewText:"What one family gained from a comprehensive approach.", sendDay:35, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>We recently worked with a couple — we will call them the Johnsons — who came to us for an insurance review. What we discovered went well beyond insurance.</p>

<h2>The Situation</h2>
<p>The Johnsons had adequate life insurance, a 401(k) and IRA with a separate advisor, and no formal retirement income plan. Each piece had been set up independently over the years.</p>

<h2>What We Found</h2>
<ul>
  <li><strong>Redundant coverage.</strong> They were paying for both an employer-provided and a private disability policy with overlapping benefits — an unnecessary expense.</li>
  <li><strong>High investment fees.</strong> Their IRA was invested in actively managed funds charging over 1.4% in combined expenses. Comparable index-based alternatives were available at a fraction of the cost.</li>
  <li><strong>Missing tax strategy.</strong> They were in a lower tax bracket than they would likely be in retirement, making the next several years an ideal window for partial Roth conversions.</li>
  <li><strong>Uncoordinated beneficiaries.</strong> Their life insurance and retirement accounts named different beneficiaries than their estate plan specified.</li>
</ul>

<h2>The Outcome</h2>
<p>By addressing these issues together, the Johnsons were able to reduce unnecessary expenses, improve their tax positioning, and bring their entire financial plan into alignment.</p>

<p>Every family's situation is unique. But the value of looking at the full picture is consistent. If you would like a similar review, simply reply to this email.</p>

<p>Best regards,<br/>The FFA North Team</p>` },
  { id:'e-6-7', subject:"Your financial health scorecard", previewText:"Rate yourself across 6 key areas.", sendDay:42, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>Here is a quick self-assessment you can complete in a few minutes. For each area, give yourself a score from 1 (not addressed) to 5 (fully optimized):</p>

<h2>Financial Health Scorecard</h2>

<ul>
  <li><strong>Emergency Fund:</strong> Do you have 3-6 months of living expenses in an accessible account? ___/5</li>
  <li><strong>Insurance Coverage:</strong> Are your life, disability, and liability policies current and adequate for your situation? ___/5</li>
  <li><strong>Investment Strategy:</strong> Is your portfolio diversified, tax-efficient, and aligned with your goals and timeline? ___/5</li>
  <li><strong>Retirement Readiness:</strong> Do you know your target retirement income and have a plan to get there? ___/5</li>
  <li><strong>Tax Planning:</strong> Are you using available strategies — Roth conversions, tax-loss harvesting, charitable giving — to minimize your tax burden? ___/5</li>
  <li><strong>Estate Planning:</strong> Are your beneficiaries, wills, trusts, and powers of attorney current and coordinated? ___/5</li>
</ul>

<p><strong>Your total: ___/30</strong></p>

<p>If you scored below 20, there are likely meaningful opportunities to strengthen your financial position. Even scores above 20 often reveal one or two areas that could use attention.</p>

<p>We would be happy to walk through your scorecard with you and identify where small improvements could make the biggest difference. Reply to this email to schedule a conversation.</p>

<p>Warm regards,<br/>The FFA North Team</p>` },
  { id:'e-6-8', subject:"Let's build your comprehensive financial plan", previewText:"All your financial strategies, working together.", sendDay:56, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>Over the past several weeks, we have explored how insurance, investments, retirement planning, tax strategy, and estate planning work together as a system — and how gaps between them can quietly erode your financial security.</p>

<p>Now we would like to offer you a simple next step: <strong>a complimentary comprehensive financial planning session with one of our senior advisors.</strong></p>

<h2>What to Expect</h2>

<ul>
  <li>A 45-minute conversation covering all major areas of your financial life</li>
  <li>An objective assessment of how your current strategies work together — and where they might not</li>
  <li>Identification of specific opportunities to reduce costs, improve coverage, and strengthen your long-term plan</li>
  <li>A written summary of findings that is yours to keep</li>
</ul>

<h2>What We Promise</h2>

<ul>
  <li>No cost — this is a complimentary service</li>
  <li>No obligation — you are not committing to anything by having the conversation</li>
  <li>No pressure — our job is to educate, not to sell</li>
</ul>

<p>If you have ever wondered whether all the pieces of your financial life are truly working together, this is an easy way to find out.</p>

<p>Reply to this email or call us at (561) 555-0100 to schedule your session. We look forward to hearing from you.</p>

<p>With warm regards,<br/>The FFA North Team</p>` },
];

const reEngagementEmails: EmailStep[] = [
  { id:'e-7-1', subject:"We noticed you have been quiet — here is what is new", previewText:"A lot has changed. We wanted you to know.", sendDay:0, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>It has been a while since we last connected, and we wanted to reach out — not to sell you anything, but to share a few updates that might be relevant to your financial planning.</p>

<h2>What Is New at FFA North</h2>

<ul>
  <li><strong>Expanded retirement planning services.</strong> We have added comprehensive Social Security optimization modeling and retirement income stress-testing to our complimentary review process.</li>
  <li><strong>New educational resources.</strong> We have published several new guides on tax-efficient withdrawal strategies, Medicare planning, and estate coordination — all available at no cost.</li>
  <li><strong>Same commitment to education first.</strong> Our philosophy has not changed: we believe informed clients make the best decisions, and we will never pressure you into anything.</li>
</ul>

<p>If any of this sounds relevant to where you are today, we would love to reconnect. If the timing is not right, that is perfectly fine — we will be here when it is.</p>

<p>Simply reply to this email if you would like to hear more.</p>

<p>Warm regards,<br/>The FFA North Team</p>` },
  { id:'e-7-2', subject:"3 financial trends you should know about in 2026", previewText:"What is shaping the financial landscape right now.", sendDay:7, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>Whether or not you are actively working on your financial plan right now, these three trends are worth keeping on your radar:</p>

<h2>1. Interest Rates and What They Mean for Your Portfolio</h2>
<p>The interest rate environment continues to evolve. If you have not reviewed your bond allocation, cash holdings, or fixed-income strategy recently, this is a good time to make sure your positioning still makes sense.</p>

<h2>2. Tax Law Changes on the Horizon</h2>
<p>Several provisions from recent tax legislation are set to sunset in the coming years, which could meaningfully impact your tax bracket, estate tax exemption, and retirement account strategies. Planning ahead — rather than reacting — can make a significant difference.</p>

<h2>3. Rising Healthcare Costs in Retirement</h2>
<p>Healthcare inflation continues to outpace general inflation. For those approaching retirement, building a realistic healthcare cost projection into your plan is more important than ever. Medicare does not cover everything, and the gaps can be substantial.</p>

<p>If you would like to discuss how any of these trends might affect your personal situation, we are here to help. Reply to this email to start a conversation.</p>

<p>Best regards,<br/>The FFA North Team</p>` },
  { id:'e-7-3', subject:"A quick financial health check you can do in 5 minutes", previewText:"Five questions. Five minutes. Real clarity.", sendDay:14, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>Sometimes the hardest part of financial planning is knowing where to start. Here is a simple five-minute exercise that can help you identify your biggest priority:</p>

<h2>Your 5-Minute Financial Health Check</h2>

<p>Answer each question with Yes, No, or Not Sure:</p>

<ul>
  <li><strong>1.</strong> Do you have enough saved to cover 3-6 months of living expenses without touching your investments? <em>(Emergency fund)</em></li>
  <li><strong>2.</strong> Have you reviewed your insurance coverage — life, disability, liability — in the past two years? <em>(Protection)</em></li>
  <li><strong>3.</strong> Do you know, within a reasonable range, how much income you will need in retirement? <em>(Retirement planning)</em></li>
  <li><strong>4.</strong> Have you reviewed your investment fees and performance in the past year? <em>(Investment management)</em></li>
  <li><strong>5.</strong> Are your beneficiary designations, will, and powers of attorney up to date? <em>(Estate planning)</em></li>
</ul>

<p>If you answered "No" or "Not Sure" to any of these, you are not alone — and each one represents a straightforward area where a brief conversation could provide real clarity.</p>

<p>We are happy to discuss any of these with you, at no cost and with no obligation. Reply to this email and let us know which question resonated most.</p>

<p>Warm regards,<br/>The FFA North Team</p>` },
  { id:'e-7-4', subject:"New resources available: retirement planning toolkit", previewText:"Free guides, calculators, and checklists.", sendDay:21, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>We have put together a collection of retirement planning resources that we think you will find useful — whether you are just starting to think about retirement or are already well into your planning.</p>

<h2>Our Retirement Planning Toolkit Includes:</h2>

<ul>
  <li><strong>The Retirement Income Gap Calculator.</strong> A simple worksheet to estimate your projected retirement income from all sources (Social Security, pensions, investments) and compare it to your anticipated expenses.</li>
  <li><strong>Social Security Claiming Strategy Guide.</strong> A plain-English overview of when and how to claim — including spousal and survivor strategies that many people overlook.</li>
  <li><strong>Healthcare Cost Estimator.</strong> A framework for projecting your healthcare expenses in retirement, including Medicare premiums, supplemental coverage, and out-of-pocket costs.</li>
  <li><strong>Pre-Retirement Checklist.</strong> A comprehensive list of financial, legal, and administrative steps to complete in the 5 years leading up to retirement.</li>
</ul>

<p>All of these resources are available at no cost. We created them because we believe better-informed people make better financial decisions.</p>

<p>Reply to this email with "send toolkit" and we will get these resources to you right away.</p>

<p>Best regards,<br/>The FFA North Team</p>` },
  { id:'e-7-5', subject:"What has changed in financial planning this year", previewText:"Key updates that could affect your plan.", sendDay:28, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>Financial planning is not static — regulations, markets, and best practices evolve. Here are some of the most significant changes from the past year that may be relevant to your planning:</p>

<h2>Key Updates Worth Knowing</h2>

<ul>
  <li><strong>Retirement account contribution limits.</strong> Annual contribution limits for 401(k)s, IRAs, and other retirement accounts have been adjusted. If you have not updated your contribution amounts, you may be leaving tax-advantaged savings on the table.</li>
  <li><strong>Required Minimum Distribution (RMD) changes.</strong> Recent legislation has adjusted the age at which RMDs begin and the rules around inherited IRAs. These changes can significantly impact your tax planning and withdrawal strategy.</li>
  <li><strong>Estate and gift tax exemptions.</strong> Current elevated exemption amounts are scheduled to change. If you have a sizable estate, this is worth discussing with your advisor sooner rather than later.</li>
  <li><strong>Medicare premium adjustments.</strong> Medicare Part B and Part D premiums have changed, and high-income surcharges (IRMAA) may apply if your modified adjusted gross income exceeds certain thresholds.</li>
</ul>

<p>Each of these changes can create both challenges and opportunities — depending on your specific situation. If you would like to understand how they affect you, we are happy to walk through it together.</p>

<p>Reply to this email to schedule a brief, no-cost conversation.</p>

<p>Warm regards,<br/>The FFA North Team</p>` },
  { id:'e-7-6', subject:"Our clients' most common question — answered", previewText:"It is the one thing everyone wants to know.", sendDay:35, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>After thousands of client conversations, one question comes up more than any other:</p>

<p><em>"Am I going to be okay?"</em></p>

<p>It is asked in different ways — "Do I have enough?" "Can I afford to retire?" "Will my money last?" — but the underlying concern is the same. People want to know that they are on solid ground.</p>

<h2>Here Is What We Have Learned</h2>

<ul>
  <li><strong>The question itself is healthy.</strong> Worrying about your financial future is not a sign of failure — it is a sign that you care. The people who should be concerned are the ones who never ask.</li>
  <li><strong>The answer is almost always actionable.</strong> Whether you are ahead of schedule or behind, there are concrete steps you can take to improve your position. The key is knowing where you stand.</li>
  <li><strong>Clarity reduces anxiety.</strong> The clients who feel most at peace are not always the wealthiest — they are the ones who have a clear plan, understand their numbers, and know what to expect.</li>
</ul>

<p>If you have been carrying this question around, we would be glad to help you find your answer. A 30-minute conversation is often all it takes to go from uncertainty to clarity.</p>

<p>Reply to this email and we will set up a time that works for you.</p>

<p>Best regards,<br/>The FFA North Team</p>` },
  { id:'e-7-7', subject:"Is now the right time for a financial review?", previewText:"The short answer might surprise you.", sendDay:42, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>People often ask us when the "right" time is for a financial review. The honest answer: there is no perfect time — but there are several situations that make it especially valuable:</p>

<h2>Consider a Review If:</h2>

<ul>
  <li><strong>Your life has changed.</strong> Marriage, divorce, a new child, a job change, an inheritance, or the loss of a loved one — any of these can shift your financial priorities.</li>
  <li><strong>It has been more than two years.</strong> Even without a major life event, tax laws, markets, and your own goals evolve. A plan that was right two years ago may need updating.</li>
  <li><strong>You feel uncertain.</strong> If you have a nagging sense that something is off — or you simply do not know where you stand — that feeling is worth exploring.</li>
  <li><strong>You are approaching a milestone.</strong> Within 10 years of retirement, reaching a certain net worth, or becoming eligible for Medicare are all natural checkpoints.</li>
</ul>

<p>The truth is, a financial review is never wasted. At worst, it confirms you are on the right track. At best, it uncovers opportunities you did not know existed.</p>

<p>If any of these situations resonate with you, we would be happy to schedule a complimentary review. Reply to this email to get started.</p>

<p>Warm regards,<br/>The FFA North Team</p>` },
  { id:'e-7-8', subject:"We are here when you are ready", previewText:"No rush. No pressure. Just an open door.", sendDay:56, status:'active', bodyFormat:'html' as const,
    body:`<p>Hi {{first_name}},</p>

<p>This is the last email in our series, and we want to leave you with something simple: an open invitation.</p>

<h2>Whenever You Are Ready, We Are Here</h2>

<p>We understand that timing matters. Maybe right now is not the right moment to focus on your financial plan — and that is perfectly okay. Life has a way of demanding our attention in different places at different times.</p>

<p>But when the time is right — whether that is next week, next month, or next year — here is what we offer:</p>

<ul>
  <li>A complimentary, no-obligation financial review</li>
  <li>An experienced advisor who will listen to your concerns and answer your questions</li>
  <li>A clear, written assessment of where you stand and what you might consider</li>
  <li>Zero pressure to make any changes or commitments</li>
</ul>

<p>We will not keep sending emails, but we wanted you to know the door is always open. Save this email, bookmark our number, or simply reply when the time feels right.</p>

<p>We genuinely wish you the best, {{first_name}}, and we hope to hear from you someday.</p>

<p>With warm regards,<br/>The FFA North Team<br/>(561) 555-0100</p>` },
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
