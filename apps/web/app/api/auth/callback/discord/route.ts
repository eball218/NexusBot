import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const WEB_URL = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000';
const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3002';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  if (!code) {
    return NextResponse.redirect(`${WEB_URL}/login?error=no_code`);
  }

  try {
    const res = await fetch(`${API_URL}/auth/oauth/discord`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    const json = await res.json();
    if (!res.ok) {
      return NextResponse.redirect(`${WEB_URL}/login?error=oauth_failed`);
    }

    const { accessToken, refreshToken } = json.data;
    return NextResponse.redirect(
      `${DASHBOARD_URL}?token=${accessToken}&refresh=${refreshToken}`
    );
  } catch {
    return NextResponse.redirect(`${WEB_URL}/login?error=oauth_error`);
  }
}
