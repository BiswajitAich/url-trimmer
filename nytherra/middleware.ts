import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
const protectedPaths = ["/qrcode", "/trimurl", "/analytics"];

export function middleware(req: NextRequest) {
    const token = req.cookies.get('token')?.value;
    console.log("token:", token);

    const pathname = req.nextUrl.pathname;
    const isProtected = protectedPaths.some(path =>
        pathname === path || pathname.startsWith(`${path}/`)
    );
    if (!token && isProtected) {
        return NextResponse.redirect(new URL("/auth", req.url));
    }
    return NextResponse.next();
}
export const config = {
    matcher: protectedPaths.map(path => `${path}/:path*`),
}