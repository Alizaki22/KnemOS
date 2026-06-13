'use client'
import Link from 'next/link'
import Image from 'next/image'

export const Navbar = () => (
  <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-sm border-b border-[#F0F0F0]">
    <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 text-2xl font-bold tracking-[-1px] text-black relative pr-4">
        <Image src="/KNEMOS.png" alt="KNEMOS Logo" width={24} height={24} className="w-6 h-6 object-contain" />
        <span className="font-display">KNEMOS</span>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-black"></div>
      </Link>

      {/* Nav links */}
      <div className="hidden md:flex items-center gap-8 text-sm text-[#444444]">
        <Link href="/updates" className="hover:text-black transition-colors">Updates</Link>
        <Link href="/pricing" className="hover:text-black transition-colors">Pricing</Link>
        <Link href="/docs" className="hover:text-black transition-colors">Docs</Link>
        <Link href="/download" className="hover:text-black transition-colors">Download</Link>
        <Link href="/signup" className="bg-black text-white px-4 py-1.5 text-xs tracking-widest uppercase hover:bg-[#111] transition-colors">
          Sign Up
        </Link>
      </div>
    </div>
  </nav>
)
