import { PlayerClient } from "../components";

type PlayerPageProps = {
    searchParams?: Promise<{
        album?: string | string[];
        mode?: string | string[];
    }>;
};

export default async function PlayerPage({ searchParams }: PlayerPageProps) {
    const resolvedSearchParams = searchParams ? await searchParams : undefined;
    const albumParam = resolvedSearchParams?.album;
    const modeParam = resolvedSearchParams?.mode;
    const initialAlbum = Array.isArray(albumParam) ? albumParam[0] : albumParam;
    const initialMode = Array.isArray(modeParam) ? modeParam[0] : modeParam;

    return <PlayerClient initialAlbum={initialAlbum} initialMode={initialMode} />;
}