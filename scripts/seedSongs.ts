// Script per popolare il database con le tue canzoni
// Esegui: npx tsx scripts/seedSongs.ts

// IMPORTANTE: dotenv DEVE essere prima di tutto
import 'dotenv/config';

// Ora importiamo il resto
import dbConnect from '../app/lib/mongodb';
import Song from '../app/models/Song';

const songs = [
    {
        title: "versatile",
        artist: "tho",
        producer: "tho",
        album: "swag takes",
        file: "/music/versatile.mp3",
        order: 1
    },
    {
        title: "paracodeine",
        artist: "tho & steezynml",
        producer: "tho",
        album: "swag takes",
        file: "/music/paracodeine.mp3",
        order: 2
    },
    {
        title: "non lo so",
        artist: "tho & musickdie",
        producer: "tho",
        album: "swag takes",
        file: "/music/non-lo-so.mp3",
        order: 3
    },
    {
        title: "problema nella mente",
        artist: "tho",
        producer: "tho",
        album: "swag takes",
        file: "/music/problema-nella-mente.mp3",
        order: 4
    },
    /* WIP
{
    title: "Quinta Vibes",
    artist: "tho",
    producer: "tho",
    album: "swag takes",
    file: "/music/quinta-vibes.mp3",
    order: 5
},
{
    title: "Sesta Energy",
    artist: "tho",
    producer: "tho",
    album: "swag takes",
    file: "/music/canzone6.mp3",
    order: 6
},
{
    title: "Settima Wave",
    artist: "tho",
    producer: "tho",
    album: "swag takes",
    file: "/music/canzone7.mp3",
    order: 7
},
{
    title: "Bonus Track",
    artist: "tho",
    producer: "tho",
    file: "/music/bonus.mp3",
    order: 8
}
 */
];

async function seedDatabase() {
    try {
        console.log('🔌 Connessione a MongoDB...');
        await dbConnect();
        console.log('✅ Connesso!');

        // Pulisce le canzoni esistenti (ATTENZIONE: cancella tutto!)
        const deleted = await Song.deleteMany({});
        console.log(`🗑️  ${deleted.deletedCount} canzoni rimosse`);

        // Inserisce le nuove canzoni
        const inserted = await Song.insertMany(songs);
        console.log(`✅ ${inserted.length} canzoni aggiunte al database!`);

        // Mostra cosa è stato aggiunto
        console.log('\n📝 Canzoni nel database:');
        inserted.forEach((song, i) => {
            console.log(`  ${i + 1}. ${song.title} - ${song.album || 'No album'} (${song.file})`);
        });

        console.log('\n🎉 Database popolato con successo bro!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Errore:', error);
        process.exit(1);
    }
}

seedDatabase();