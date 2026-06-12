'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'

export const Hero = () => (
  <section className="relative min-h-screen bg-white flex flex-col items-center justify-center overflow-hidden">

    {/* Floating geometric shapes from template */}
    <div className="floating-objects">
        <div className="floating-circle"></div>
        <div className="floating-circle"></div>
        <div className="floating-square"></div>
        <div className="floating-line"></div>
    </div>

    <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="inline-flex items-center gap-2 text-xs text-[#888] tracking-[0.25em] uppercase mb-8 border border-[#E8E8E8] px-4 py-2"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
        OSC AI Build 1.0 — Future of Productivity
      </motion.div>

      {/* Main Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="text-[clamp(48px,8vw,88px)] font-[100] tracking-[-3px] text-black leading-[0.9] mb-8 font-display relative"
      >
        Less Context
        <br />
        Switching.
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[60px] h-[2px] bg-black"></div>
      </motion.h1>

      {/* Subheadline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-sm tracking-[0.3em] uppercase text-[#888888] mb-6"
      >
        AI-Powered Semantic Workspace Operating System
      </motion.p>

      {/* Body */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-base text-[#555555] max-w-xl mx-auto leading-relaxed mb-10"
      >
        KnemOS automatically organizes your browser tabs, IDE sessions, and local files
        into intelligent semantic workspaces. Your screen history becomes searchable.
        Your focus becomes measurable.
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-4 items-center justify-center"
      >
        {/* Primary */}
        <Link
          href="/download"
          className="cta-button"
        >
          Download for Windows
        </Link>

        {/* Secondary */}
        <a
          href="https://github.com/Ahad-Dngwala/KnemOS"
          className="text-xs uppercase tracking-[2px] font-bold text-[#888] hover:text-black transition-colors flex items-center gap-1"
        >
          View on GitHub <span>→</span>
        </a>
      </motion.div>
    </div>

    {/* Template's scroll indicator / decoration */}
    <div className="hero-decoration"></div>
  </section>
)
