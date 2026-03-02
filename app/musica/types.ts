export interface Song {
    _id: string;
    title: string;
    artist: string;
    producer?: string;
    album?: string;
    coverImage?: string;
    visualVideo?: string;
    file: string;
    duration?: string;
    order: number;
}
