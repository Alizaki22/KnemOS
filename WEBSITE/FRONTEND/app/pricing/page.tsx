import Link from 'next/link'

const CHECK = '○'
const CROSS = '×'
const DASH = '—'

const features = [
  { category: 'Core Intelligence', label: 'Local AI (Qwen2.5)', free: CHECK, business: CHECK, enterprise: CHECK },
  { category: 'Core Intelligence', label: 'Wolfram Engine Integration', free: CHECK, business: CHECK, enterprise: CHECK },
  { category: 'Core Intelligence', label: 'Semantic Memory System', free: CHECK, business: CHECK, enterprise: CHECK },
  { category: 'Core Intelligence', label: 'Browser Extension', free: CHECK, business: CHECK, enterprise: CHECK },
  { category: 'Core Intelligence', label: 'Workspace Automation', free: CHECK, business: CHECK, enterprise: CHECK },
  { category: 'Analytics', label: 'Focus Analytics & Heatmaps', free: CHECK, business: CHECK, enterprise: CHECK },
  { category: 'Analytics', label: 'Deep Focus Timer', free: CHECK, business: CHECK, enterprise: CHECK },
  { category: 'Analytics', label: 'Focus Grade System (S–D)', free: CHECK, business: CHECK, enterprise: CHECK },
  { category: 'Analytics', label: 'Session Stability Scores', free: CHECK, business: CHECK, enterprise: CHECK },
  { category: 'Teams', label: 'Multi-user Workspaces', free: CROSS, business: CHECK, enterprise: CHECK },
  { category: 'Teams', label: 'Shared Analytics Dashboard', free: CROSS, business: CHECK, enterprise: CHECK },
  { category: 'Teams', label: 'Cloud Sync', free: CROSS, business: CHECK, enterprise: CHECK },
  { category: 'Teams', label: 'Admin Controls', free: CROSS, business: CHECK, enterprise: CHECK },
  { category: 'Enterprise', label: 'Org-wide Deployment', free: CROSS, business: CROSS, enterprise: CHECK },
  { category: 'Enterprise', label: 'Centralized Policies', free: CROSS, business: CROSS, enterprise: CHECK },
  { category: 'Enterprise', label: 'Advanced Admin Tooling', free: CROSS, business: CROSS, enterprise: CHECK },
  { category: 'Enterprise', label: 'Priority Support SLAs', free: CROSS, business: CROSS, enterprise: CHECK },
  { category: 'Enterprise', label: 'Enterprise Onboarding', free: CROSS, business: DASH, enterprise: CHECK },
]

export default function PricingPage() {
  const categories = [...new Set(features.map(f => f.category))]

  return (
    <main className="min-h-screen bg-[#fafafa] py-24 px-6 relative text-black">
      <Link href="/" className="absolute top-8 left-8 text-xs font-bold tracking-[2px] uppercase hover:text-[#888] transition-colors flex items-center gap-2">
        <span>←</span> Back to Home
      </Link>
      
      <div className="max-w-5xl mx-auto w-full">
        <div className="text-center mb-20">
          <h1 className="text-6xl font-[100] tracking-[-2px] font-display mb-4">Pricing</h1>
          <p className="text-[#666] max-w-xl mx-auto text-sm leading-relaxed">
            All core intelligence features are free, forever. KNEMOS is local-first by design —
            your data never leaves your machine.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="bg-white border border-black overflow-hidden">

          {/* Table Header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] border-b-2 border-black">
            <div className="p-6 border-r border-black">
              <span className="text-xs font-bold tracking-[2px] uppercase text-[#888]">Features</span>
            </div>
            
            {/* Free */}
            <div className="p-6 border-r border-black text-center bg-[#fafafa]">
              <div className="text-xs font-bold tracking-[2px] uppercase text-[#888] mb-2">Free</div>
              <div className="text-3xl font-[100] font-display">$0</div>
              <div className="text-xs text-[#888] mt-1">forever</div>
              <Link href="/signup" className="mt-4 block text-center text-xs font-bold uppercase tracking-[2px] border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors">
                Get Started
              </Link>
            </div>

            {/* Business */}
            <div className="p-6 border-r border-black text-center bg-black text-white">
              <div className="text-xs font-bold tracking-[2px] uppercase text-[#888] mb-2">Business</div>
              <div className="text-3xl font-[100] font-display">TBA</div>
              <div className="text-xs text-[#888] mt-1">per team / mo</div>
              <button disabled className="mt-4 block w-full text-center text-xs font-bold uppercase tracking-[2px] border border-[#555] px-4 py-2 text-[#555] cursor-not-allowed">
                Coming Soon
              </button>
            </div>

            {/* Enterprise */}
            <div className="p-6 text-center bg-[#fafafa]">
              <div className="text-xs font-bold tracking-[2px] uppercase text-[#888] mb-2">Enterprise</div>
              <div className="text-3xl font-[100] font-display">Custom</div>
              <div className="text-xs text-[#888] mt-1">contact us</div>
              <button disabled className="mt-4 block w-full text-center text-xs font-bold uppercase tracking-[2px] border border-black px-4 py-2 text-[#888] cursor-not-allowed">
                Contact Us
              </button>
            </div>
          </div>

          {/* Feature Rows */}
          {categories.map((cat, catIdx) => (
            <div key={cat}>
              {/* Category Header */}
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr] bg-[#f5f5f5] border-b border-black">
                <div className="px-6 py-3 border-r border-black col-span-4">
                  <span className="text-[10px] font-bold tracking-[2px] uppercase text-[#888]">{cat}</span>
                </div>
              </div>

              {/* Feature Rows in category */}
              {features.filter(f => f.category === cat).map((feature, i) => (
                <div key={feature.label} className={`grid grid-cols-[2fr_1fr_1fr_1fr] border-b ${catIdx === categories.length - 1 && i === features.filter(f => f.category === cat).length - 1 ? '' : 'border-[#e8e8e8]'}`}>
                  <div className="px-6 py-4 border-r border-[#e8e8e8] text-sm text-[#333]">{feature.label}</div>
                  <div className="px-6 py-4 border-r border-[#e8e8e8] text-center text-sm bg-[#fafafa]">
                    <span className={feature.free === CHECK ? 'text-black font-bold' : 'text-[#ccc]'}>{feature.free}</span>
                  </div>
                  <div className="px-6 py-4 border-r border-[#e8e8e8] text-center text-sm bg-black text-white">
                    <span className={feature.business === CHECK ? 'text-white font-bold' : feature.business === DASH ? 'text-[#555]' : 'text-[#555]'}>{feature.business}</span>
                  </div>
                  <div className="px-6 py-4 text-center text-sm bg-[#fafafa]">
                    <span className={feature.enterprise === CHECK ? 'text-black font-bold' : 'text-[#ccc]'}>{feature.enterprise}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}

        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-xs text-[#888] max-w-lg mx-auto leading-relaxed">
            KNEMOS is fully local-first. All intelligence features work offline with no subscription required. 
            Business and Enterprise tiers add team collaboration and cloud capabilities.
          </p>
        </div>
      </div>
    </main>
  )
}
