import Link from 'next/link'

export default function UpdatesPage() {
  return (
    <main className="min-h-screen bg-[#fafafa] py-24 px-6 relative text-black">
      <Link href="/" className="absolute top-8 left-8 text-xs font-bold tracking-[2px] uppercase hover:text-[#888] transition-colors flex items-center gap-2">
        <span>←</span> Back to Home
      </Link>
      
      <div className="max-w-4xl mx-auto mt-8">
        <div className="text-center mb-16 relative">
          <h1 className="text-6xl font-[100] tracking-[-2px] font-display text-black mb-4">Release Updates</h1>
          <div className="w-[30px] h-[30px] border border-black rotate-45 mx-auto"></div>
        </div>

        <div className="space-y-12">
          {/* Version 2.5 Section */}
          <div className="bg-white border border-black p-10 relative">
            <div className="absolute top-0 right-0 bg-black text-white px-4 py-1 text-xs font-bold tracking-[2px] uppercase">
              Latest
            </div>
            <h2 className="text-3xl font-[100] tracking-[-1px] font-display mb-2">v2.5 Production Hardening</h2>
            <p className="text-xs text-[#888] tracking-widest uppercase mb-8">Major Core Update</p>
            
            <div className="space-y-6 text-sm text-[#444] leading-relaxed">
              <div className="flex gap-4">
                <span className="text-black font-bold flex-shrink-0 w-8">01</span>
                <div>
                  <strong className="text-black">Architecture Rewrite (@dnd-kit)</strong>
                  <p>Replaced HTML5 drag-and-drop with a global overlay-driven architecture for fluid cross-workspace dragging.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="text-black font-bold flex-shrink-0 w-8">02</span>
                <div>
                  <strong className="text-black">Scheduler & Telemetry Optimization</strong>
                  <p>Eliminated event loop blocking and SQLite spam by implementing ahead-of-time process caching and MD5 payload deduplication. System latency dropped to ~15ms.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="text-black font-bold flex-shrink-0 w-8">03</span>
                <div>
                  <strong className="text-black">Dynamic Contrast & Typography</strong>
                  <p>Integrated semantic CSS tokens (--ink, --bg-panel) ensuring perfect contrast on hover states while maintaining the strict monochrome Minimal White identity. Text is now universally selectable.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="text-black font-bold flex-shrink-0 w-8">04</span>
                <div>
                  <strong className="text-black">True Memory Metrics</strong>
                  <p>Multi-process applications (like Chrome) are now fully aggregated via psutil executable mapping, displaying accurate total RAM usage.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="text-black font-bold flex-shrink-0 w-8">05</span>
                <div>
                  <strong className="text-black">Inference Stability</strong>
                  <p>Replaced aggressive "Ollama Offline" polling banners with graceful, demand-driven inference feedback to prevent UI blocking.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Commits Section */}
          <div>
            <h3 className="text-xl font-bold tracking-[1px] uppercase mb-6 border-b border-[#E0E0E0] pb-4">Recent Commits</h3>
            <div className="space-y-4">
              {[
                { hash: '8e6af60', msg: 'Update project name from "KnemOS" to "KNEMOS" also added Brand logo' },
                { hash: 'c0ce026', msg: 'Remove obsolete features and issues docs' },
                { hash: '0e756e2', msg: 'Add Next.js frontend (KNEMOS) site' },
                { hash: 'a913105', msg: 'Integrate Wolfram Engine analytics' },
                { hash: '699778e', msg: 'Desktop: migrate drag & polish UI styles' },
                { hash: 'b5f8b51', msg: 'Add Tauri dialog/fs plugins, auth, and UI updates' },
                { hash: '6285296', msg: 'Add WebSocket, onboarding, analytics & DnD fixes' },
                { hash: 'e7ab475', msg: 'Desktop: titlebar drag, export fix, docs added' },
              ].map((commit, idx) => (
                <div key={idx} className="flex items-center gap-4 py-3 border-b border-[#F0F0F0] hover:bg-white transition-colors px-4">
                  <span className="font-mono text-xs bg-[#f5f5f5] border border-[#E0E0E0] px-2 py-1 text-[#666]">
                    {commit.hash}
                  </span>
                  <span className="text-sm text-black">{commit.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
