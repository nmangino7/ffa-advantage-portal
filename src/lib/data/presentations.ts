export interface PresentationSlide {
  title: string;
  subtitle?: string;
  bullets?: string[];
  body?: string;
  type: 'title' | 'content' | 'case-study' | 'cta' | 'disclaimer';
}

export interface PresentationDeck {
  id: string;
  serviceLine: string;
  serviceLineKey: string;
  title: string;
  subtitle: string;
  slideCount: number;
  slides: PresentationSlide[];
}

export const PRESENTATIONS: PresentationDeck[] = [
  // Deck 1: Insurance Portfolio Review
  {
    id: 'deck-insurance-review',
    serviceLine: 'Insurance Review',
    serviceLineKey: 'insurance-review',
    title: 'Protecting What Matters: A Comprehensive Coverage Review',
    subtitle: 'Ensuring your insurance portfolio keeps pace with your life',
    slideCount: 10,
    slides: [
      {
        type: 'title',
        title: 'Protecting What Matters',
        subtitle: 'A Comprehensive Coverage Review',
      },
      {
        type: 'content',
        title: 'The Coverage Challenge',
        bullets: [
          'Life changes often outpace insurance updates, creating hidden gaps',
          'Rising replacement costs can leave properties significantly underinsured',
          'Policy riders and endorsements may no longer align with current needs',
          'Multiple carriers can lead to overlapping or conflicting coverage',
        ],
      },
      {
        type: 'content',
        title: 'Why Regular Reviews Matter',
        bullets: [
          'Major life events such as marriage, children, or retirement shift coverage needs',
          'Tax law changes can affect the efficiency of existing policy structures',
          'Beneficiary designations should be verified after any family change',
          'Premium optimization opportunities emerge as markets evolve over time',
          'Outdated policies may lack modern benefits and protections available today',
        ],
      },
      {
        type: 'content',
        title: '5 Key Coverage Areas We Evaluate',
        bullets: [
          'Life insurance adequacy relative to income replacement and debt obligations',
          'Long-term care planning for potential extended healthcare expenses',
          'Disability coverage to protect your most valuable asset: earning power',
          'Property and casualty alignment with current asset valuations',
          'Umbrella liability protection scaled to your overall net worth',
        ],
      },
      {
        type: 'content',
        title: 'Common Gaps We Find',
        bullets: [
          'Insufficient life coverage after income growth or new dependents arrive',
          'No long-term care strategy despite rising healthcare cost projections',
          'Outdated beneficiary designations that conflict with estate plans',
          'Gaps in umbrella coverage leaving significant assets exposed to liability',
        ],
      },
      {
        type: 'case-study',
        title: 'Real Impact: A Client Story',
        body: 'A couple in their mid-50s came to us believing their coverage was adequate. Our review revealed their life insurance had not been updated in 15 years, leaving a $400,000 gap relative to current obligations. We also identified $1,200 in annual premium savings by consolidating overlapping policies. Within 60 days, they had comprehensive, streamlined coverage at a lower total cost.',
      },
      {
        type: 'content',
        title: 'Our Review Process',
        bullets: [
          'Step 1: Gather all existing policies, declarations, and beneficiary forms',
          'Step 2: Analyze current coverage against your financial picture and goals',
          'Step 3: Identify gaps, redundancies, and cost optimization opportunities',
          'Step 4: Present a clear, prioritized action plan with specific recommendations',
          'Step 5: Implement changes and establish a schedule for ongoing reviews',
        ],
      },
      {
        type: 'content',
        title: 'What to Expect',
        bullets: [
          'A confidential, no-obligation review of your complete insurance portfolio',
          'A written summary with findings, recommendations, and priority levels',
          'Side-by-side comparisons when alternative products may better serve you',
          'Ongoing monitoring to keep coverage aligned as your life evolves',
        ],
      },
      {
        type: 'content',
        title: 'Questions to Consider',
        bullets: [
          'When was the last time you reviewed all of your insurance policies?',
          'Have you experienced major life changes since your coverage was placed?',
          'Do you know exactly what each of your policies covers and excludes?',
          'Are your beneficiary designations current and consistent with your wishes?',
          'Could you be paying less for the same or better coverage elsewhere?',
        ],
      },
      {
        type: 'cta',
        title: 'Next Steps',
        bullets: [
          'Schedule a complimentary 30-minute coverage review consultation',
          'Gather your current policy declarations pages for our analysis',
          'Prepare a list of any recent life changes or upcoming milestones',
        ],
        body: 'Contact your FFA North advisor to schedule your personalized insurance portfolio review. There is no cost and no obligation.',
      },
    ],
  },

  // Deck 2: Annuity Optimization
  {
    id: 'deck-annuities',
    serviceLine: 'Under-Serviced Annuities',
    serviceLineKey: 'annuities',
    title: 'Maximizing Your Annuity: Understanding Your Options',
    subtitle: 'A clear-eyed look at annuity performance, fees, and opportunities',
    slideCount: 10,
    slides: [
      {
        type: 'title',
        title: 'Maximizing Your Annuity',
        subtitle: 'Understanding Your Options',
      },
      {
        type: 'content',
        title: 'The Annuity Landscape Today',
        bullets: [
          'Over $3 trillion in annuity assets are held by American households',
          'Many contracts were sold years ago under different market conditions',
          'Interest rate changes have materially altered the value proposition of older products',
          'Regulatory updates have increased transparency and consumer protections',
        ],
      },
      {
        type: 'content',
        title: 'Types of Annuities Explained',
        bullets: [
          'Fixed annuities offer guaranteed interest rates and predictable growth',
          'Variable annuities provide market participation with insurance features',
          'Fixed indexed annuities link returns to an index with downside protection',
          'Immediate annuities convert a lump sum into a guaranteed income stream',
          'Each type serves different goals depending on your timeline and risk tolerance',
        ],
      },
      {
        type: 'content',
        title: 'Fee Transparency Matters',
        bullets: [
          'Mortality and expense charges typically range from 1.0% to 1.5% annually',
          'Administrative fees and fund management expenses add to the total cost',
          'Surrender charges can restrict access to your money for 5 to 10 years',
          'Rider fees for guaranteed benefits may cost 0.5% to 1.25% per year',
          'Understanding total cost is essential before making any changes',
        ],
      },
      {
        type: 'content',
        title: 'Income Rider Benefits',
        bullets: [
          'Guaranteed lifetime withdrawal benefits provide income you cannot outlive',
          'Benefit bases may grow at guaranteed rates regardless of market performance',
          'Spousal continuation options can protect a surviving partner\'s income',
          'Understanding the difference between account value and benefit base is critical',
        ],
      },
      {
        type: 'content',
        title: 'Tax-Deferred Growth Advantage',
        bullets: [
          'Earnings grow tax-deferred until withdrawn, allowing greater compounding',
          'No annual contribution limits beyond what the contract allows',
          'Strategic withdrawal planning can minimize the overall tax impact',
          'Required minimum distributions apply to qualified annuity contracts',
        ],
      },
      {
        type: 'content',
        title: 'Performance Benchmarking',
        bullets: [
          'Compare your annuity returns against appropriate market benchmarks',
          'Evaluate sub-account performance net of all fees and expenses',
          'Assess whether guaranteed benefits justify the cost in your situation',
          'Determine if your current allocation still matches your risk profile',
        ],
      },
      {
        type: 'content',
        title: 'Optimization Opportunities',
        bullets: [
          'A 1035 exchange can move assets to a better contract tax-free',
          'Rebalancing sub-accounts may improve risk-adjusted returns over time',
          'Activating or adjusting income riders may enhance retirement cash flow',
          'Partial surrenders can free up capital once surrender charges have lapsed',
          'Every situation is unique and requires careful individual analysis',
        ],
      },
      {
        type: 'content',
        title: 'Common Questions We Address',
        bullets: [
          'Is my annuity still the right fit given my current financial situation?',
          'What are the true total costs I am paying each year on this contract?',
          'Would a 1035 exchange into a modern product benefit me financially?',
          'How do I maximize the income guarantees I have already purchased?',
          'What happens to my annuity if I pass away before annuitizing?',
        ],
      },
      {
        type: 'cta',
        title: 'Next Steps',
        bullets: [
          'Request a complimentary annuity analysis and fee comparison',
          'Bring your most recent annuity statement to our review meeting',
          'Ask about our no-obligation contract comparison report',
        ],
        body: 'Contact your FFA North advisor for a thorough review of your annuity contracts. We will provide an objective analysis at no cost to you.',
      },
    ],
  },

  // Deck 3: Retirement Planning
  {
    id: 'deck-retirement',
    serviceLine: 'Retirement Planning',
    serviceLineKey: 'retirement-planning',
    title: 'Your Retirement Roadmap: Planning for the Life You Want',
    subtitle: 'A comprehensive framework for retirement income and lifestyle planning',
    slideCount: 10,
    slides: [
      {
        type: 'title',
        title: 'Your Retirement Roadmap',
        subtitle: 'Planning for the Life You Want',
      },
      {
        type: 'content',
        title: 'Retirement Readiness Check',
        bullets: [
          'Only 4 in 10 Americans have calculated how much they need to retire',
          'Healthcare costs in retirement can exceed $300,000 per couple on average',
          'Longevity risk means planning for 25 to 30 years of retirement income',
          'Inflation erodes purchasing power by roughly 50% over 20 years at 3%',
          'A written plan significantly increases the probability of a successful retirement',
        ],
      },
      {
        type: 'content',
        title: 'Building Your Income Sources',
        bullets: [
          'Social Security provides a foundation but rarely covers all expenses',
          'Employer pensions and defined benefit plans offer guaranteed income streams',
          'Personal savings including 401(k), IRA, and taxable accounts fill the gap',
          'Annuity income can provide additional guaranteed lifetime cash flow',
          'Part-time work or consulting can supplement income in early retirement years',
        ],
      },
      {
        type: 'content',
        title: 'Social Security Strategy',
        bullets: [
          'Benefits increase approximately 8% per year by delaying from age 62 to 70',
          'Spousal coordination strategies can maximize total household benefits received',
          'Taxation of benefits depends on combined income from all sources',
          'Early claiming may be appropriate depending on health and other income needs',
          'A personalized analysis can reveal the optimal filing strategy for you',
        ],
      },
      {
        type: 'content',
        title: 'Healthcare Planning in Retirement',
        bullets: [
          'Medicare eligibility begins at 65 but does not cover all medical costs',
          'Medigap or Medicare Advantage plans help fill coverage gaps in Original Medicare',
          'Long-term care represents the largest uncovered healthcare expense for retirees',
          'Health Savings Accounts can serve as powerful retirement healthcare funding tools',
          'Prescription drug coverage requires careful plan comparison each enrollment period',
        ],
      },
      {
        type: 'content',
        title: 'Tax Management in Retirement',
        bullets: [
          'Diversifying across pre-tax, Roth, and taxable accounts creates tax flexibility',
          'Strategic withdrawal sequencing can reduce your lifetime tax burden significantly',
          'Roth conversions during lower-income years may produce lasting tax savings',
          'Required minimum distributions begin at age 73 and increase each year after',
          'Qualified charitable distributions can satisfy RMDs while reducing taxable income',
        ],
      },
      {
        type: 'content',
        title: 'Risk Management for Retirees',
        bullets: [
          'Sequence-of-returns risk can devastate a portfolio in early retirement years',
          'A cash reserve or bond ladder provides stability during market downturns',
          'Appropriate insurance coverage protects assets from catastrophic events',
          'Diversification across asset classes reduces overall portfolio volatility',
        ],
      },
      {
        type: 'content',
        title: 'Estate Planning Basics',
        bullets: [
          'An up-to-date will and beneficiary designations ensure your wishes are honored',
          'Powers of attorney protect you if you become unable to make decisions',
          'Trust structures can provide tax efficiency and asset protection for heirs',
          'Regular reviews ensure your estate plan reflects current laws and family changes',
        ],
      },
      {
        type: 'content',
        title: 'Lifestyle Planning',
        bullets: [
          'Define what a fulfilling retirement looks like beyond financial numbers alone',
          'Travel, hobbies, and family time should be budgeted as meaningful priorities',
          'Phased retirement can ease the transition and maintain a sense of purpose',
          'Volunteering and community involvement support well-being and social connection',
          'Your financial plan should serve your life goals, not the other way around',
        ],
      },
      {
        type: 'cta',
        title: "Let's Build Your Plan",
        bullets: [
          'Schedule a complimentary retirement readiness assessment with our team',
          'Bring your most recent account statements and Social Security estimates',
          'Identify your top three priorities and concerns for your retirement years',
        ],
        body: 'Contact your FFA North advisor to begin building a retirement plan tailored to your goals. Our initial consultation is complimentary and confidential.',
      },
    ],
  },

  // Deck 4: Investment Planning
  {
    id: 'deck-investment',
    serviceLine: 'Investment Planning',
    serviceLineKey: 'investment-planning',
    title: 'Building Wealth with Purpose: A Disciplined Approach',
    subtitle: 'Principles-based investing aligned with your financial goals',
    slideCount: 10,
    slides: [
      {
        type: 'title',
        title: 'Building Wealth with Purpose',
        subtitle: 'A Disciplined Approach',
      },
      {
        type: 'content',
        title: 'Our Investment Philosophy',
        bullets: [
          'Goals-based investing starts with understanding what your money must accomplish',
          'Evidence-based strategies grounded in decades of academic financial research',
          'Disciplined rebalancing removes emotion from portfolio management decisions',
          'Cost efficiency is a key driver of long-term investment success',
          'Transparency in process, performance, and fees is fundamental to our approach',
        ],
      },
      {
        type: 'content',
        title: 'Understanding Your Risk Profile',
        bullets: [
          'Risk tolerance measures your emotional comfort with portfolio fluctuations',
          'Risk capacity reflects the financial ability to absorb losses without hardship',
          'Time horizon is one of the most important factors in determining allocation',
          'A proper risk assessment aligns your portfolio with both comfort and reality',
        ],
      },
      {
        type: 'content',
        title: 'The Power of Diversification',
        bullets: [
          'Spreading investments across asset classes reduces overall portfolio risk',
          'International exposure provides access to global growth opportunities',
          'Fixed income allocations provide stability and income during volatile markets',
          'Alternative investments may offer low correlation to traditional stock markets',
          'True diversification means owning assets that behave differently over time',
        ],
      },
      {
        type: 'content',
        title: 'Tax-Efficient Investing Strategies',
        bullets: [
          'Asset location places tax-inefficient investments in tax-advantaged accounts',
          'Tax-loss harvesting offsets gains and can reduce your annual tax liability',
          'Municipal bonds offer tax-exempt income for investors in higher tax brackets',
          'Holding period management distinguishes short-term from long-term capital gains',
          'Coordination with your tax advisor ensures strategies align with your full picture',
        ],
      },
      {
        type: 'content',
        title: 'Market Perspective',
        bullets: [
          'Markets have historically rewarded patient, long-term investors consistently',
          'Short-term volatility is normal and expected as part of the investing experience',
          'Timing the market has proven nearly impossible even for professional managers',
          'Staying invested through cycles has outperformed moving to cash in most periods',
        ],
      },
      {
        type: 'content',
        title: 'Strategic Asset Allocation',
        bullets: [
          'Your allocation is built around your specific goals, timeline, and risk profile',
          'Equities provide growth potential while bonds offer income and stability',
          'Regular rebalancing maintains your target allocation as markets shift',
          'Adjustments over time reflect changes in your life stage and objectives',
          'We use institutional-quality investment vehicles to build diversified portfolios',
        ],
      },
      {
        type: 'content',
        title: 'Cost Management',
        bullets: [
          'Investment fees compound over time and directly reduce your net returns',
          'Low-cost index funds and ETFs provide broad market exposure efficiently',
          'Advisory fee transparency ensures you always know what you are paying',
          'We benchmark total costs against industry averages for full accountability',
        ],
      },
      {
        type: 'content',
        title: 'Ongoing Portfolio Reviews',
        bullets: [
          'Quarterly performance reporting keeps you informed of progress toward goals',
          'Annual strategy reviews ensure your plan adapts to life changes and markets',
          'Proactive rebalancing maintains alignment between your portfolio and your plan',
          'Open communication means you always have access to your advisor when needed',
          'We measure success by progress toward your goals, not just index performance',
        ],
      },
      {
        type: 'cta',
        title: 'Start the Conversation',
        bullets: [
          'Schedule a complimentary portfolio review and investment consultation',
          'Bring your current account statements and any existing investment plan',
          'Share your most important financial goals and timeline considerations',
        ],
        body: 'Contact your FFA North advisor for a personalized investment consultation. We look forward to understanding your goals and building a strategy together.',
      },
    ],
  },

  // Deck 5: Second Opinion
  {
    id: 'deck-second-opinion',
    serviceLine: 'Second-Opinion Positioning',
    serviceLineKey: 'second-opinion',
    title: 'The Value of a Fresh Perspective on Your Finances',
    subtitle: 'An objective, no-obligation review of your current financial strategy',
    slideCount: 10,
    slides: [
      {
        type: 'title',
        title: 'The Value of a Fresh Perspective',
        subtitle: 'On Your Finances',
      },
      {
        type: 'content',
        title: 'Why Second Opinions Matter',
        bullets: [
          'Even strong financial plans benefit from an independent, objective review',
          'Markets, tax laws, and personal circumstances change over time significantly',
          'A different perspective can uncover opportunities your current plan may miss',
          'Second opinions are standard practice in medicine and should be in finance too',
        ],
      },
      {
        type: 'content',
        title: 'What We Review',
        bullets: [
          'Investment portfolio allocation, diversification, and overall risk exposure',
          'Total fees and expenses across all accounts, funds, and advisory relationships',
          'Insurance coverage adequacy for life, disability, and long-term care needs',
          'Retirement income projections and withdrawal strategy sustainability',
          'Estate plan coordination with beneficiary designations and tax planning',
        ],
      },
      {
        type: 'case-study',
        title: 'Common Findings',
        body: 'In our experience reviewing hundreds of financial plans, we frequently find overlapping fund holdings that reduce true diversification, total fees exceeding 2% annually when all costs are accounted for, insurance gaps that leave families exposed, and retirement projections based on assumptions that may be overly optimistic. These findings are not a criticism of any advisor but reflect how plans can drift from their original intent over time.',
      },
      {
        type: 'content',
        title: 'Fee Analysis Deep Dive',
        bullets: [
          'We calculate total all-in costs including advisory, fund, and platform fees',
          'Hidden costs such as 12b-1 fees and transaction charges are identified clearly',
          'We compare your costs to industry benchmarks for similar portfolio strategies',
          'Even a 0.5% reduction in fees can mean tens of thousands over your lifetime',
        ],
      },
      {
        type: 'content',
        title: 'Benefits of Account Consolidation',
        bullets: [
          'Simplifies your financial life with fewer statements and login credentials',
          'Enables holistic asset allocation across your entire investment portfolio',
          'Reduces the risk of orphaned accounts with outdated beneficiary designations',
          'Can lower total costs by qualifying for fee breakpoints at higher asset levels',
          'Makes tax planning and required distributions more manageable and efficient',
        ],
      },
      {
        type: 'content',
        title: 'Our Fiduciary Standard',
        bullets: [
          'We are legally obligated to act in your best interest at all times',
          'Our recommendations are based on your needs, not product commissions or quotas',
          'Full transparency in compensation ensures alignment of interests with clients',
          'We welcome questions about how and why we make every recommendation we do',
        ],
      },
      {
        type: 'content',
        title: 'Our Review Process',
        bullets: [
          'Step 1: Confidential gathering of your current financial documents and statements',
          'Step 2: Comprehensive analysis of investments, insurance, fees, and projections',
          'Step 3: Written report with clear findings, observations, and recommendations',
          'Step 4: In-person or virtual presentation to walk through our analysis together',
        ],
      },
      {
        type: 'content',
        title: 'Our No-Obligation Promise',
        bullets: [
          'This review is complimentary with absolutely no strings attached',
          'You are free to stay with your current advisor if that is the best choice',
          'Our goal is to provide clarity and confidence in your financial direction',
          'You will leave with actionable information regardless of any decision you make',
        ],
      },
      {
        type: 'cta',
        title: "Let's Connect",
        bullets: [
          'Schedule a confidential, no-obligation financial review at your convenience',
          'Gather your recent investment, insurance, and retirement account statements',
          'Write down your top three financial questions or concerns before we meet',
        ],
        body: 'Contact your FFA North advisor to schedule your complimentary second opinion review. We look forward to providing a fresh perspective on your financial future.',
      },
    ],
  },
];
