import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    if (pathname === "/" && token) {
      switch (token.userType) {
        case "bank-sampah":
          return NextResponse.redirect(new URL("/bank-sampah", req.url));
        case "nasabah":
          return NextResponse.redirect(new URL("/nasabah", req.url));
        case "controller":
          return NextResponse.redirect(new URL("/controller", req.url));
        default:
          return NextResponse.redirect(new URL("/", req.url));
      }
    }

    if (pathname.startsWith("/bank-sampah")) {
      if (!token || token.userType !== "bank-sampah") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    if (pathname.startsWith("/nasabah")) {
      if (!token || token.userType !== "nasabah") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    if (pathname.startsWith("/controller")) {
      if (!token || token.userType !== "controller") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        if (pathname === "/") {
          return true;
        }

        if (pathname.startsWith("/api")) {
          return true;
        }

        if (
          pathname.startsWith("/bank-sampah") ||
          pathname.startsWith("/nasabah") ||
          pathname.startsWith("/controller")
        ) {
          return !!token;
        }

        return true;
      },
    },
  },
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
