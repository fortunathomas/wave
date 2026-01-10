import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import Password from '@/app/models/Password';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const { password } = await request.json();

        // Prendi la password dal DB
        const savedPassword = await Password.findOne().sort({ updatedAt: -1 });

        if (!savedPassword) {
            return NextResponse.json({ error: 'Password non disponibile' }, { status: 500 });
        }

        const isValid = password === savedPassword.password;

        if (isValid) {
            // Crea response con cookie
            const response = NextResponse.json({
                success: true,
                message: 'Password corretta gasi! 🔥'
            });

            // Setta cookie auth (scade dopo 24 ore)
            response.cookies.set('auth', 'true', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 // 24 ore
            });

            return response;
        } else {
            return NextResponse.json({
                error: 'Password errata peso'
            }, { status: 401 });
        }

    } catch (error) {
        console.error('Errore login:', error);
        return NextResponse.json({
            error: 'Errore server akhi'
        }, { status: 500 });
    }
}