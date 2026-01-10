import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/mongodb';
import Song from '@/app/models/Song';

export async function GET() {
    try {
        console.log('API Songs called');

        await dbConnect();
        console.log('Connessione a MongoDB effettuata');

        // DEBUG: info sulla collection
        console.log('Songs Collection:', Song.collection.name);
        console.log('Database:', Song.db.name);

        // Conta documenti
        const count = await Song.countDocuments();
        console.log('Numero canzoni nel DB:', count);

        // Prende tutte le canzoni ordinate per campo "order"
        const songs = await Song.find({}).sort({ order: 1 }).lean();
        console.log('Canzoni trovate:', songs.length);

        return NextResponse.json({
            success: true,
            songs: songs
        });
    } catch (error) {
        console.error('Errore fetch canzoni:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Errore nel caricamento delle canzoni: ' + (error as Error).message
            },
            { status: 500 }
        );
    }
}