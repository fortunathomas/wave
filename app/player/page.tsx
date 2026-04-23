import { PlayerClient } from "../components";

type PlayerPageProps = {
    searchParams?: Promise<{
        album?: string | string[];
    }>;
};

export default async function PlayerPage({ searchParams }: PlayerPageProps) {
    const resolvedSearchParams = searchParams ? await searchParams : undefined;
    const albumParam = resolvedSearchParams?.album;
    const initialAlbum = Array.isArray(albumParam) ? albumParam[0] : albumParam;

    return <PlayerClient initialAlbum={initialAlbum} />;
}