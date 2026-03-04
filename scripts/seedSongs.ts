// Script per aggiornare data/songs.json
// Esegui: npx tsx scripts/seedSongs.ts

import fs from 'fs';
import path from 'path';

const songs = [
    {
        _id: "6963a0eda700d0b75bff81b6",
        title: "versatile",
        artist: "tho",
        producer: "tho",
        album: "swag takes",
        coverImage: "/images/swagtakes.png",
        visualVideo: "/canvas/swagtakes.mp4",
        file: "/music/versatile.mp3",
        duration: "2:11",
        order: 1
    },
    {
        _id: "6963a0eda700d0b75bff81b7",
        title: "paracodeine",
        artist: "tho & steezynml",
        producer: "tho",
        album: "swag takes",
        coverImage: "/images/swagtakes.png",
        visualVideo: "/canvas/swagtakes.mp4",
        file: "/music/paracodeine.mp3",
        duration: "2:57",
        order: 2
    },
    {
        _id: "6963a0eda700d0b75bff81b8",
        title: "non lo so",
        artist: "tho & musickdie",
        producer: "tho",
        album: "swag takes",
        coverImage: "/images/swagtakes.png",
        visualVideo: "/canvas/swagtakes.mp4",
        file: "/music/non-lo-so.mp3",
        duration: "1:54",
        order: 3
    },
    {
        _id: "6963a0eda700d0b75bff81b9",
        title: "problema nella mente",
        artist: "tho",
        producer: "tho",
        album: "swag takes",
        coverImage: "/images/swagtakes.png",
        visualVideo: "/canvas/swagtakes.mp4",
        file: "/music/problema-nella-mente.mp3",
        duration: "1:38",
        order: 4
    },
    {
        _id: "6963a0eda700d0b75bff81ba",
        title: "going down",
        artist: "tho & moozy",
        producer: "tho",
        album: "swag takes",
        coverImage: "/images/swagtakes-deluxe.png",
        visualVideo: "/canvas/swagtakes-deluxe.mp4",
        file: "/music/going-down.mp3",
        duration: "2:35",
        order: 5
    },

    /* WIP
    {
        _id: "wip-6",
        title: "Sesta Energy",
        artist: "tho",
        producer: "tho",
        album: "swag takes",
        coverImage: "/images/sesta-energy.jpg",
        visualVideo: "/canvas/swagtakes.mp4",
        file: "/music/canzone6.mp3",
        duration: "",
        order: 6
    },
    {
        _id: "wip-7",
        title: "Settima Wave",
        artist: "tho",
        producer: "tho",
        album: "swag takes",
        coverImage: "/images/settima-wave.jpg",
        visualVideo: "/canvas/swagtakes.mp4",
        file: "/music/canzone7.mp3",
        duration: "",
        order: 7
    },
    {
        _id: "wip-8",
        title: "Bonus Track",
        artist: "tho",
        producer: "tho",
        album: "",
        coverImage: "/images/bonus.jpg",
        visualVideo: "/canvas/swagtakes.mp4",
        file: "/music/bonus.mp3",
        duration: "",
        order: 8
    }
    */
];

const outputPath = path.join(__dirname, '..', 'data', 'songs.json');

fs.writeFileSync(outputPath, JSON.stringify(songs, null, 2));
console.log(`${songs.length} canzoni scritte in data/songs.json`);
songs.forEach((s, i) => console.log(`  ${i + 1}. ${s.title} - ${s.artist}`));
