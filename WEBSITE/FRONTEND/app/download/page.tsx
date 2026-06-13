'use client'
import { useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'

function DownloadContent() {
  const params = useSearchParams()
  const token = params.get('token')

  useEffect(() => {
    if (token) {
      setTimeout(() => {
        window.location.href = `knemos://auth?token=${token}`
      }, 1500)
    }
  }, [token])

  return null
}

export default function DownloadPage() {
  return (
    <main className="min-h-screen bg-[#fafafa] flex items-center justify-center py-24 px-6 relative">
      <Suspense fallback={null}>
        <DownloadContent />
      </Suspense>
      
      {/* Back Button */}
      <a href="/" className="absolute top-8 left-8 text-xs font-bold tracking-[2px] uppercase text-black hover:text-[#888] transition-colors flex items-center gap-2">
        <span>←</span> Back to Home
      </a>

      <div className="max-w-4xl w-full mt-8">
        
        <div className="text-center mb-16 relative">
          <h1 className="text-6xl font-[100] tracking-[-2px] font-display text-black mb-4">Download KNEMOS</h1>
          <div className="w-[30px] h-[30px] border border-black rotate-45 mx-auto"></div>
        </div>

        {/* Asymmetric Grid from Minimal White Services */}
        
        {/* Desktop App */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-[2px] mb-[2px]">
          <div className="bg-white p-12 border border-black relative group hover:-translate-y-1 transition-transform">
            <h3 className="text-3xl font-[100] tracking-[-1px] font-display text-black mb-4">Desktop App</h3>
            <p className="text-sm text-[#666] leading-relaxed mb-8">
              The core operating layer for Windows 10/11. Requires local installation of Ollama and Tesseract OCR for maximum offline privacy.
            </p>
            <a href="/downloads/KNEMOS-Setup.exe" className="cta-button">
              Download .exe
            </a>
          </div>
          <div className="bg-black text-white p-12 flex flex-col justify-center items-center text-center">
            <div className="text-5xl font-[100] font-display mb-4">01</div>
            <h4 className="text-xs uppercase tracking-[2px] font-bold">Core System</h4>
          </div>
        </div>

        {/* Browser Extension */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-[2px] mb-[2px]">
          <div className="bg-black text-white p-12 flex flex-col justify-center items-center text-center">
            <div className="text-5xl font-[100] font-display mb-4">02</div>
            <h4 className="text-xs uppercase tracking-[2px] font-bold">Extension</h4>
          </div>
          <div className="bg-white p-12 border border-black relative group hover:-translate-y-1 transition-transform">
            <h3 className="text-3xl font-[100] tracking-[-1px] font-display text-black mb-4">Browser Extension</h3>
            <p className="text-sm text-[#666] leading-relaxed mb-8">
              Chrome & Edge extension to feed your active tabs into the KNEMOS semantic memory pipeline. Optional, but highly recommended.
            </p>
            <a href="https://chrome.google.com/webstore/detail/knemos/your-extension-id" className="inline-block px-8 py-3 border-2 border-black text-xs uppercase tracking-[2px] font-bold text-black hover:bg-black hover:text-white transition-colors">
              Install Extension
            </a>
          </div>
        </div>

      </div>
    </main>
  )
}
