'use client'

const features = [
  { num: '01', title: 'Semantic Clustering', desc: 'AI groups tabs automatically.' },
  { num: '02', title: 'Memory Lane', desc: 'Search screen history in natural language.' },
  { num: '03', title: 'Deep Work Mode', desc: 'Minimizes off-context apps dynamically.' },
  { num: '04', title: 'RAM Recovery', desc: 'Live counter of memory reclaimed from tabs.' },
  { num: '05', title: 'Wolfram Analytics', desc: 'Algorithmic cognitive focus scores.' },
  { num: '06', title: 'Context Export', desc: 'One-click Markdown snapshot of workspaces.' },
]

export const Features = () => (
  <section id="features" className="bg-white py-20 px-6 text-center">
    <div className="max-w-6xl mx-auto">
      
      <div className="flex items-center justify-center gap-[30px] mb-[60px]">
        <div className="w-[15px] h-[15px] bg-black"></div>
        <h2 className="text-5xl font-[100] tracking-[-1px] font-display text-black">Features</h2>
        <div className="w-[15px] h-[15px] bg-black"></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-0 border-l border-t border-black">
        {features.map((f, i) => (
          <div
            key={f.num}
            className={`p-[60px_20px] border-r border-b border-black transition-all duration-300 hover:-translate-y-[10px] group cursor-default ${i % 2 !== 0 ? 'bg-black text-white hover:bg-white hover:text-black' : 'bg-white text-black hover:bg-black hover:text-white'}`}
          >
            <div className="text-5xl font-[100] mb-5 font-display text-inherit">{f.num}</div>
            <h4 className="text-sm tracking-[2px] uppercase font-medium mb-3 text-inherit">{f.title}</h4>
            <p className="text-xs text-[#888] group-hover:text-inherit transition-colors">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)
