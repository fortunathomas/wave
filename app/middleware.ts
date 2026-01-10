import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const isAuth = req.cookies.get("auth");

    // Proteggi la pagina /musica
    if (!isAuth && req.nextUrl.pathname.startsWith("/musica")) {
        return NextResponse.redirect(new URL("/", req.url));
    }
}

export const config = {
    matcher: ["/musica/:path*"]  // cambiato da dashboard a musica
};