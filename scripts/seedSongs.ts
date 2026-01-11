// Script per popolare il database
// Esegui: npx tsx scripts/seedSongs.ts

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

import mongoose from 'mongoose';
import Song from '../app/models/Song';

const songs = [
    {
        title: "versatile",
        artist: "tho",
        producer: "tho",
        album: "swag takes",
        coverImage: "/images/swagtakes.png",
        visualVideo: "/canvas/swagtakes.mp4",
        file: "/music/versatile.mp3",
        order: 1
    },
    {
        title: "paracodeine",
        artist: "tho & steezynml",
        producer: "tho",
        album: "swag takes",
        coverImage: "/images/swagtakes.png",
        visualVideo: "/canvas/swagtakes.mp4",
        file: "/music/paracodeine.mp3",
        order: 2
    },
    {
        title: "non lo so",
        artist: "tho & musickdie",
        producer: "tho",
        album: "swag takes",
        coverImage: "/images/swagtakes.png",
        visualVideo: "/canvas/swagtakes.mp4",
        file: "/music/non-lo-so.mp3",
        order: 3
    },
    {
        title: "problema nella mente",
        artist: "tho",
        producer: "tho",
        album: "swag takes",
        coverImage: "/images/swagtakes.png",
        visualVideo: "/canvas/swagtakes.mp4",
        file: "/music/problema-nella-mente.mp3",
        order: 4
    },
    {
        title: "going down",
        artist: "tho & moozy",
        producer: "tho",
        album: "swag takes",
        coverImage: "/images/swagtakes-deluxe.png",
        visualVideo: "/canvas/swagtakes-deluxe.mp4",
        file: "/music/going-down.mp3",
        order: 5
    },

    /* WIP
    {
        title: "Sesta Energy",
        artist: "tho",
        producer: "tho",
        album: "swag takes",
        coverImage: "/images/sesta-energy.jpg",
        visualVideo: "/canvas/swagtakes.mp4",
        file: "/music/canzone6.mp3",
        order: 6
    },
    {
        title: "Settima Wave",
        artist: "tho",
        producer: "tho",
        album: "swag takes",
        coverImage: "/images/settima-wave.jpg",
        visualVideo: "/canvas/swagtakes.mp4",
        file: "/music/canzone7.mp3",
        order: 7
    },
    {
        title: "Bonus Track",
        artist: "tho",
        producer: "tho",
        coverImage: "/images/bonus.jpg",
        visualVideo: "/canvas/swagtakes.mp4",
        file: "/music/bonus.mp3",
        order: 8
    }
     */
];

async function seedDatabase() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;

        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI non trovato nel file .env');
        }

        console.log('Connessione a MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connesso');

        // Pulisce le canzoni esistenti (ATTENZIONE: cancella tutto!)
        const deleted = await Song.deleteMany({});
        console.log(`  ${deleted.deletedCount} canzoni rimosse`);

        // Inserisce le nuove canzoni
        const inserted = await Song.insertMany(songs);
        console.log(` ${inserted.length} canzoni aggiunte al database`);

        // Mostra cosa è stato aggiunto
        console.log('\n Canzoni nel database:');
        inserted.forEach((song, i) => {
            console.log(`  ${i + 1}. ${song.title} - ${song.album || 'No album'} (${song.file})`);
        });

        console.log('\n Database popolato con successo');
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error(' Errore:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

seedDatabase();