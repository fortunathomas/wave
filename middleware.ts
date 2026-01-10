import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const isAuth = req.cookies.get("auth");

    // Proteggi /musica
    if (!isAuth && req.nextUrl.pathname.startsWith("/musica")) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/musica/:path*", "/musica"]  // proteggi sia /musica che /musica/qualcosa
};