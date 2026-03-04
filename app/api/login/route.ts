import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const sitePassword = process.env.SITE_PASSWORD;

    if (!sitePassword) {
        return NextResponse.json({ error: 'SITE_PASSWORD non configurata' }, { status: 500 });
    }

    const { password } = await request.json();

    if (password !== sitePassword) {
        return NextResponse.json({ error: 'Password errata' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });

    response.cookies.set('auth', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24
    });

    return response;
}
