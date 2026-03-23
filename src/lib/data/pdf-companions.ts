import type { ServiceLine } from '../types';

export interface PdfSection {
  title: string;
  body?: string;
  bullets?: string[];
  type: 'heading' | 'body' | 'checklist' | 'callout' | 'table';
  tableRows?: string[][];
}

export interface PdfCompanion {
  id: string;
  campaignId: string;
  title: string;
  subtitle: string;
  serviceLine: ServiceLine;
  pageCount: number;
  description: string;
  sections: PdfSection[];
}

export const PDF_COMPANIONS: PdfCompanion[] = [
  // ── Insurance Review Campaign ──────────────────────────────
  {
    id: 'pdf-insurance-checklist',
    campaignId: 'camp-1',
    title: 'Your Insurance Coverage Review Checklist',
    subtitle: 'A step-by-step guide to evaluating your current protection',
    serviceLine: 'Insurance Review',
    pageCount: 3,
    description: 'Printable checklist that walks clients through a self-assessment of their insurance portfolio.',
    sections: [
      {
        type: 'heading',
        title: 'Why a Coverage Review Matters',
        body: 'Life changes fast — your insurance should keep pace. Marriage, a new home, children, career moves, and retirement all shift what you need from your coverage. This checklist helps you identify gaps before they become problems.',
      },
      {
        type: 'checklist',
        title: 'Life Insurance Assessment',
        bullets: [
          'Current death benefit covers at least 10-12x annual household income',
          'Beneficiary designations are up to date after any life changes',
          'Policy type (term vs. permanent) still aligns with your goals',
          'Cash value accumulation is on track (if applicable)',
          'Premium is competitive compared to current market rates',
          'Riders (waiver of premium, accelerated death benefit) are in place',
        ],
      },
      {
        type: 'checklist',
        title: 'Property & Casualty Review',
        bullets: [
          'Home replacement cost reflects current construction costs',
          'Auto liability limits meet or exceed state minimums by 2-3x',
          'Umbrella policy is in place for additional liability protection',
          'Deductibles are set at a level you can comfortably afford',
          'Jewelry, art, or collectibles are scheduled if above standard limits',
        ],
      },
      {
        type: 'checklist',
        title: 'Long-Term Care Planning',
        bullets: [
          'Evaluated the cost of care in your geographic area',
          'Considered hybrid life/LTC policies as an alternative',
          'Reviewed employer-sponsored LTC options if available',
          'Discussed family care expectations with loved ones',
        ],
      },
      {
        type: 'callout',
        title: 'Next Step',
        body: 'Once you have completed this checklist, your FFA North advisor can review your answers and provide a personalized gap analysis at no cost. Schedule your complimentary review today.',
      },
    ],
  },

  // ── Under-Serviced Annuities Campaign ──────────────────────
  {
    id: 'pdf-annuity-guide',
    campaignId: 'camp-2',
    title: 'Understanding Your Annuity: A Plain-Language Guide',
    subtitle: 'What you own, what it costs, and whether it still fits your plan',
    serviceLine: 'Under-Serviced Annuities',
    pageCount: 4,
    description: 'Educational guide that demystifies annuity contracts and helps clients understand fees, riders, and surrender schedules.',
    sections: [
      {
        type: 'heading',
        title: 'What Is an Annuity, Really?',
        body: 'An annuity is a contract between you and an insurance company. You pay premiums — either as a lump sum or over time — and in return the insurer promises future income payments or growth. But not all annuities are created equal, and the details matter.',
      },
      {
        type: 'body',
        title: 'Common Annuity Types',
        bullets: [
          'Fixed Annuity — Guarantees a set interest rate for a defined period. Low risk, predictable growth.',
          'Variable Annuity — Returns depend on underlying investment sub-accounts. Higher potential but more risk.',
          'Fixed Indexed Annuity — Credited interest tied to a market index (e.g., S&P 500) with a floor protecting against loss.',
          'Immediate Annuity — Converts a lump sum into income payments that start right away.',
        ],
      },
      {
        type: 'table',
        title: 'Fee Comparison at a Glance',
        tableRows: [
          ['Fee Type', 'Fixed', 'Variable', 'Indexed'],
          ['Mortality & Expense', 'None', '1.0-1.5%', 'Built into cap'],
          ['Admin Fee', '$0-30/yr', '$30-50/yr', '$0-50/yr'],
          ['Sub-Account Fees', 'N/A', '0.5-2.0%', 'N/A'],
          ['Surrender Charge', '0-10%', '0-8%', '0-10%'],
          ['Rider Fees', '0-1.0%', '0.5-1.5%', '0-1.0%'],
        ],
      },
      {
        type: 'checklist',
        title: 'Questions to Ask About Your Annuity',
        bullets: [
          'What is my current surrender schedule and when does it expire?',
          'What total annual fees am I paying across all layers?',
          'Is my guaranteed minimum interest rate still competitive?',
          'Do I have a living benefit rider, and what is it costing me?',
          'Has my annuity been exchanged (1035) in the past, and why?',
          'Am I on track to meet the income goals this annuity was designed for?',
        ],
      },
      {
        type: 'callout',
        title: 'Free Annuity Health Check',
        body: 'Your FFA North advisor can pull your current contract details, calculate your all-in cost, and compare it to alternatives — at no charge and with no obligation. Contact us to schedule your annuity review.',
      },
    ],
  },

  // ── Retirement Planning Campaign ───────────────────────────
  {
    id: 'pdf-retirement-roadmap',
    campaignId: 'camp-3',
    title: 'Your Retirement Readiness Roadmap',
    subtitle: 'Key milestones and action items for a confident retirement',
    serviceLine: 'Retirement Planning',
    pageCount: 4,
    description: 'Timeline-based roadmap covering savings benchmarks, Social Security timing, and income strategies.',
    sections: [
      {
        type: 'heading',
        title: 'Planning with Confidence',
        body: 'Retirement planning is not a one-time event — it is an ongoing process. This roadmap breaks the journey into clear milestones so you can measure progress and adjust as life evolves.',
      },
      {
        type: 'table',
        title: 'Savings Milestones by Age',
        tableRows: [
          ['Age', 'Target Savings', 'Key Actions'],
          ['30', '1x salary saved', 'Maximize employer match, start Roth if eligible'],
          ['40', '3x salary saved', 'Increase contributions, diversify investments'],
          ['50', '6x salary saved', 'Use catch-up contributions, review asset allocation'],
          ['55', '8x salary saved', 'Model retirement income scenarios, reduce debt'],
          ['60', '10x salary saved', 'Finalize Social Security strategy, plan Medicare'],
          ['65', '12x salary saved', 'Begin income distribution planning, optimize taxes'],
        ],
      },
      {
        type: 'body',
        title: 'Social Security Timing Matters',
        bullets: [
          'Claiming at 62 reduces your benefit by up to 30% permanently',
          'Full retirement age (66-67) provides 100% of your calculated benefit',
          'Delaying to 70 increases your benefit by 8% per year past full retirement age',
          'Spousal coordination strategies can maximize household lifetime income',
          'Consider health, longevity, and other income sources in your decision',
        ],
      },
      {
        type: 'checklist',
        title: 'Your Pre-Retirement Checklist',
        bullets: [
          'Calculated your estimated monthly expenses in retirement',
          'Reviewed all retirement account balances and projections',
          'Modeled Social Security benefits at ages 62, 67, and 70',
          'Evaluated health insurance options between retirement and Medicare',
          'Created a tax-efficient withdrawal strategy across account types',
          'Reviewed estate plan and beneficiary designations',
          'Stress-tested your plan against market downturns and inflation',
        ],
      },
      {
        type: 'callout',
        title: 'Your Personalized Retirement Analysis',
        body: 'Every situation is unique. Your FFA North advisor can build a customized retirement income projection using your actual numbers — at no cost. See exactly where you stand and what adjustments could make the biggest impact.',
      },
    ],
  },

  // ── Investment Planning Campaign ───────────────────────────
  {
    id: 'pdf-investment-principles',
    campaignId: 'camp-4',
    title: 'Investment Principles That Stand the Test of Time',
    subtitle: 'A guide to building and maintaining a disciplined portfolio',
    serviceLine: 'Investment Planning',
    pageCount: 3,
    description: 'Educational guide covering core investment principles, asset allocation, and common behavioral pitfalls.',
    sections: [
      {
        type: 'heading',
        title: 'Investing with Discipline',
        body: 'Markets fluctuate, headlines change, and emotions can cloud judgment. The investors who build lasting wealth are the ones who follow time-tested principles — not predictions. This guide outlines the framework that has helped generations of investors stay on track.',
      },
      {
        type: 'body',
        title: 'Five Core Investment Principles',
        bullets: [
          'Start with a plan: Your investment strategy should flow from your goals, timeline, and risk tolerance — not from market conditions.',
          'Diversify broadly: Spreading investments across asset classes, sectors, and geographies reduces the impact of any single downturn.',
          'Keep costs low: Every dollar paid in fees is a dollar that cannot compound. Favor low-cost funds when possible.',
          'Stay disciplined: Rebalance regularly and avoid making emotional changes during market volatility.',
          'Think long-term: Time in the market consistently outperforms timing the market over meaningful horizons.',
        ],
      },
      {
        type: 'table',
        title: 'Sample Allocation by Risk Profile',
        tableRows: [
          ['Risk Profile', 'Stocks', 'Bonds', 'Alternatives', 'Cash'],
          ['Conservative', '30%', '50%', '10%', '10%'],
          ['Moderate', '50%', '35%', '10%', '5%'],
          ['Growth', '70%', '20%', '8%', '2%'],
          ['Aggressive', '85%', '10%', '5%', '0%'],
        ],
      },
      {
        type: 'checklist',
        title: 'Portfolio Health Check',
        bullets: [
          'Investment allocation matches your stated risk tolerance',
          'Portfolio has been rebalanced within the past 12 months',
          'Total expense ratio across all funds is below 0.75%',
          'No single stock position exceeds 10% of total portfolio',
          'Tax-loss harvesting opportunities have been evaluated this year',
          'Retirement account contributions are maximized for the current year',
        ],
      },
      {
        type: 'callout',
        title: 'Complimentary Portfolio Review',
        body: 'Your FFA North advisor can provide a comprehensive portfolio analysis — including fees, diversification, risk alignment, and tax efficiency — at no charge. Bring your current statements and we will show you exactly where you stand.',
      },
    ],
  },

  // ── Second-Opinion Positioning Campaign ────────────────────
  {
    id: 'pdf-second-opinion',
    campaignId: 'camp-5',
    title: 'The Value of a Second Opinion on Your Finances',
    subtitle: 'Why an independent review can protect and grow your wealth',
    serviceLine: 'Second-Opinion Positioning',
    pageCount: 3,
    description: 'Persuasive guide explaining why a second opinion matters and what an independent review covers.',
    sections: [
      {
        type: 'heading',
        title: 'A Fresh Perspective Can Make All the Difference',
        body: 'You get second opinions on medical diagnoses and home repairs. Why not on the financial plan that determines your retirement? An independent review is not about finding fault — it is about finding opportunities your current approach may be missing.',
      },
      {
        type: 'body',
        title: 'What a Second Opinion Covers',
        bullets: [
          'Fee audit: Are you paying more than necessary for the services and products you use?',
          'Risk alignment: Does your portfolio match your actual risk tolerance, or has drift occurred?',
          'Tax efficiency: Are your accounts structured to minimize taxes both now and in retirement?',
          'Insurance gaps: Do your coverage levels still match your current life situation?',
          'Estate coordination: Are beneficiary designations, trusts, and titling aligned with your wishes?',
          'Income projection: Will your current savings and investments actually support your retirement lifestyle?',
        ],
      },
      {
        type: 'table',
        title: 'Common Findings in Second-Opinion Reviews',
        tableRows: [
          ['Finding', 'How Often', 'Typical Impact'],
          ['Excess fees', '68% of reviews', '$2,000-8,000/yr saved'],
          ['Risk misalignment', '54% of reviews', 'Better downside protection'],
          ['Tax inefficiency', '47% of reviews', '$1,500-5,000/yr saved'],
          ['Insurance gaps', '41% of reviews', 'Critical coverage restored'],
          ['Outdated beneficiaries', '38% of reviews', 'Estate errors prevented'],
        ],
      },
      {
        type: 'callout',
        title: 'Schedule Your Free Second Opinion',
        body: 'An FFA North advisor will review your complete financial picture — investments, insurance, taxes, and estate plan — and provide a written summary of findings. No cost, no obligation, and no pressure. Your current advisor does not need to know.',
      },
    ],
  },

  // ── Additional: Retirement Planning deep-dive ──────────────
  {
    id: 'pdf-social-security-guide',
    campaignId: 'camp-3',
    title: 'Social Security Claiming Strategies Explained',
    subtitle: 'Maximize your lifetime benefits with the right timing',
    serviceLine: 'Retirement Planning',
    pageCount: 3,
    description: 'Focused guide on Social Security optimization strategies for singles and couples.',
    sections: [
      {
        type: 'heading',
        title: 'Social Security Is More Complex Than You Think',
        body: 'The Social Security Administration offers over 500 pages of rules governing benefits. Your claiming decision is one of the biggest financial choices you will make — the difference between optimal and suboptimal timing can exceed $100,000 in lifetime benefits.',
      },
      {
        type: 'table',
        title: 'Benefit Comparison by Claiming Age',
        tableRows: [
          ['Claiming Age', 'Monthly Benefit', '% of Full Benefit', 'Break-Even Age'],
          ['62', '$1,750', '70%', 'N/A (baseline)'],
          ['64', '$2,000', '80%', '76'],
          ['67 (FRA)', '$2,500', '100%', '79'],
          ['70', '$3,100', '124%', '82'],
        ],
      },
      {
        type: 'body',
        title: 'Strategies for Married Couples',
        bullets: [
          'Higher earner delays to 70 while lower earner claims earlier to bridge the gap',
          'Spousal benefit equals up to 50% of the higher earner\'s full retirement age benefit',
          'Survivor benefit equals 100% of the deceased spouse\'s benefit — delay maximizes this',
          'Coordinate claiming with pension income, required minimum distributions, and tax brackets',
        ],
      },
      {
        type: 'checklist',
        title: 'Before You Claim, Make Sure You Have...',
        bullets: [
          'Reviewed your Social Security statement at ssa.gov for accuracy',
          'Calculated benefits at ages 62, 67, and 70 using the SSA estimator',
          'Discussed spousal coordination strategies if married',
          'Modeled the tax impact of Social Security income on your overall bracket',
          'Considered your health, family longevity, and other income sources',
        ],
      },
      {
        type: 'callout',
        title: 'Free Social Security Optimization Analysis',
        body: 'Your FFA North advisor can model multiple claiming scenarios for you and your spouse — showing projected lifetime benefits, tax implications, and the optimal strategy for your situation. Schedule your analysis today.',
      },
    ],
  },

  // ── Additional: Investment deep-dive ───────────────────────
  {
    id: 'pdf-tax-smart-investing',
    campaignId: 'camp-4',
    title: 'Tax-Smart Investing: Keep More of What You Earn',
    subtitle: 'Strategies for minimizing taxes across your investment accounts',
    serviceLine: 'Investment Planning',
    pageCount: 3,
    description: 'Guide to asset location, tax-loss harvesting, and Roth conversion strategies.',
    sections: [
      {
        type: 'heading',
        title: 'It Is Not What You Earn — It Is What You Keep',
        body: 'Investment returns get all the attention, but taxes can quietly erode a significant portion of your wealth. A tax-smart approach does not mean avoiding taxes entirely — it means being strategic about when and how you pay them.',
      },
      {
        type: 'body',
        title: 'Asset Location: The Right Account for Each Investment',
        bullets: [
          'Tax-deferred accounts (401k, IRA): Hold bonds, REITs, and high-turnover funds that generate ordinary income',
          'Tax-free accounts (Roth IRA, Roth 401k): Hold your highest-growth investments — gains are never taxed',
          'Taxable brokerage accounts: Hold low-turnover index funds, municipal bonds, and tax-managed strategies',
          'This "asset location" strategy can add 0.25-0.75% in annual after-tax returns without changing your risk',
        ],
      },
      {
        type: 'body',
        title: 'Roth Conversions: A Powerful Planning Tool',
        bullets: [
          'Convert traditional IRA funds to Roth during low-income years (early retirement, sabbatical)',
          'Pay taxes now at a lower rate to enjoy tax-free growth and withdrawals later',
          'Reduces future Required Minimum Distributions, lowering lifetime tax burden',
          'Particularly valuable if you expect tax rates to rise or your income to increase',
        ],
      },
      {
        type: 'checklist',
        title: 'Tax Efficiency Checklist',
        bullets: [
          'Reviewed asset location across taxable, tax-deferred, and tax-free accounts',
          'Harvested tax losses to offset capital gains this year',
          'Evaluated Roth conversion opportunity based on current tax bracket',
          'Confirmed mutual funds are tax-efficient (low turnover, index-based)',
          'Reviewed charitable giving strategies (donor-advised fund, qualified charitable distribution)',
          'Coordinated investment tax planning with your overall tax return preparation',
        ],
      },
      {
        type: 'callout',
        title: 'Complimentary Tax-Efficiency Review',
        body: 'Your FFA North advisor can analyze your current account structure, identify tax-saving opportunities, and build a multi-year Roth conversion strategy — at no cost. Bring your most recent tax return and investment statements to get started.',
      },
    ],
  },
];
