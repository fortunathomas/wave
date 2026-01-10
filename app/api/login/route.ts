import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import Password from '@/app/models/Password';

export async function POST(request: NextRequest) {
    try {
        console.log('🔥 API chiamata!');

        await dbConnect();
        console.log('✅ Connesso a MongoDB!');

        // DEBUG: vedi quale collection sta usando
        console.log('📂 Collection name:', Password.collection.name);
        console.log('📂 Database name:', Password.db.name);

        // DEBUG: conta i documenti
        const count = await Password.countDocuments();
        console.log('Documenti nella collection:', count);

        // DEBUG: prendi TUTTI i documenti
        const allDocs = await Password.find({});
        console.log('Tutti i documenti:', JSON.stringify(allDocs, null, 2));

        const { password } = await request.json();
        console.log('Password inserita:', password);

        const savedPassword = await Password.findOne().sort({ updatedAt: -1 });
        console.log('Password DB:', savedPassword);

        if (!savedPassword) {
            return NextResponse.json({ error: 'Password non disponibile' }, { status: 500 });
        }

        const isValid = password === savedPassword.password;

        if (isValid) {
            const response = NextResponse.json({
                success: true,
                message: 'Password corretta'
            });

            response.cookies.set('auth', 'true', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24
            });

            return response;
        } else {
            return NextResponse.json({
                error: 'Password errata'
            }, { status: 401 });
        }

    } catch (error) {
        console.error('Errore:', error);
        return NextResponse.json({
            error: 'Errore server: ' + (error as Error).message
        }, { status: 500 });
    }
}