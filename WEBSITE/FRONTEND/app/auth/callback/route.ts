import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session) {
      // After successful auth, redirect to download page
      // The download page will show the deep link to open the desktop app
      return NextResponse.redirect(`${origin}/download?token=${data.session.access_token}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=callback_failed`)
}
