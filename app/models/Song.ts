import mongoose from 'mongoose';

const SongSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    artist: {
        type: String,
        default: 'tho',
    },
    producer: {
        type: String,
        required: false,
    },
    album: {
        type: String,
        required: false,
    },
    coverImage: {
        type: String, // path tipo "/images/cover.jpg"
        required: false,
        default: '/images/swagtakes.png'
    },
    visualVideo: {
        type: String, // path tipo "/canvas/visual1.mp4"
        required: false,
        default: '/canvas/swagtakes.mp4'
    },
    file: {
        type: String, // path tipo "/music/canzone1.mp3"
        required: true,
    },
    duration: {
        type: String, // tipo "3:45"
        required: false,
    },
    order: {
        type: Number, // per ordinare le canzoni
        default: 0,
    }
}, {
    timestamps: true
});

export default mongoose.models.Song || mongoose.model('Song', SongSchema);