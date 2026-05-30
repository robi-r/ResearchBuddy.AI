import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Exchange confirmation code for session cookies
    await supabase.auth.exchangeCodeForSession(code);

    // Retrieve active validated session user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (user && !userError) {
      // Check if a record already exists in the Postgres profiles schema
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      // If no profile exists, target onboarding profile creation
      if (profileError || !existingProfile) {
        return NextResponse.redirect(`${requestUrl.origin}/profile-creation`);
      } else {
        // Existing peer/judge persona, launch straight to peer discovery feed
        return NextResponse.redirect(`${requestUrl.origin}/discovery`);
      }
    }
  }

  // Safe fallback redirect landing in case of errors
  return NextResponse.redirect(`${requestUrl.origin}/discovery`);
}
