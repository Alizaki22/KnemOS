'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const supabase = createClient()

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        setErrorMsg(error.message)
      } else {
        setSent(true)
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Failed to fetch') {
        setErrorMsg('Network error: Please verify your NEXT_PUBLIC_SUPABASE_URL in .env.local')
      } else if (err instanceof Error) {
        setErrorMsg(err.message || 'An unexpected error occurred')
      } else {
        setErrorMsg('An unexpected error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6 relative">
      <Link href="/" className="absolute top-8 left-8 text-xs font-bold tracking-[2px] uppercase hover:text-[#888] transition-colors flex items-center gap-2 text-black">
        <span>←</span> Back to Home
      </Link>
      <div className="w-full max-w-sm">

        <div className="flex items-center gap-2 justify-center mb-10">
          <Image src="/KNEMOS.png" alt="KNEMOS" width={32} height={32} className="w-8 h-8" />
          <span className="font-bold text-lg tracking-widest text-black">KNEMOS</span>
        </div>

        {sent ? (
          <div className="text-center">
            <p className="text-lg font-bold mb-2 text-black">Check your email</p>
            <p className="text-sm text-[#888]">We sent a magic link to <strong>{email}</strong></p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-center mb-8 text-black font-display">Sign In</h1>

            {errorMsg && (
              <div className="bg-red-50 text-red-600 border border-red-200 p-3 text-xs mb-6 text-center">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleMagicLink} className="space-y-4">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full border border-[#E0E0E0] px-4 py-3 text-sm outline-none focus:border-black transition-colors text-black bg-white"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-3 text-sm tracking-widest uppercase disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Continue with Email'}
              </button>
            </form>

            <p className="text-center text-xs text-[#888] mt-6">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-black underline">Sign up</Link>
            </p>
          </>
        )}
      </div>
    </main>
  )
}
