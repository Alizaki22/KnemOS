'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const supabase = createClient()
  const router = useRouter()

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
    } catch (err: any) {
      if (err.message === 'Failed to fetch') {
        setErrorMsg('Network error: Please verify your NEXT_PUBLIC_SUPABASE_URL in .env.local')
      } else {
        setErrorMsg(err.message || 'An unexpected error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm">

        <div className="flex items-center gap-2 justify-center mb-10">
          <img src="/logo.svg" alt="KnemOS" className="w-8 h-8" />
          <span className="font-bold text-lg tracking-widest text-black">KnemOS</span>
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

            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-[#E8E8E8]" />
              <span className="text-xs text-[#888]">or</span>
              <div className="flex-1 h-px bg-[#E8E8E8]" />
            </div>

            <button
              onClick={handleGoogle}
              className="w-full border border-[#E0E0E0] py-3 text-sm text-[#444] hover:border-black transition-colors bg-white"
            >
              Continue with Google
            </button>
          </>
        )}
      </div>
    </main>
  )
}
