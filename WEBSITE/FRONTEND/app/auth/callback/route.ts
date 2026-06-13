import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session) {
      // After successful auth, redirect to signin page with token
      // The signin page will show the token for the user to copy
      return NextResponse.redirect(`${origin}/signin?token=${data.session.access_token}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=callback_failed`)
}
