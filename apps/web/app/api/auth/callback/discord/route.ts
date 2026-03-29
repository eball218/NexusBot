import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  if (!code) {
    return NextResponse.redirect('http://localhost:3000/login?error=no_code');
  }

  try {
    const res = await fetch('http://localhost:3001/api/v1/auth/oauth/discord', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    const json = await res.json();
    if (!res.ok) {
      return NextResponse.redirect('http://localhost:3000/login?error=oauth_failed');
    }

    const { accessToken, refreshToken } = json.data;
    return NextResponse.redirect(
      `http://localhost:3002?token=${accessToken}&refresh=${refreshToken}`
    );
  } catch {
    return NextResponse.redirect('http://localhost:3000/login?error=oauth_error');
  }
}
