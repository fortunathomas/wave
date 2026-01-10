import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const isAuth = req.cookies.get("auth");

    if (!isAuth && req.nextUrl.pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/", req.url));
    }
}

export const config = {
    matcher: ["/dashboard/:path*"]
};
