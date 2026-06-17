import { NextRequest, NextResponse } from "next/server"

const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ?? ""
const publicRoutes = ["/login", "/login/verify", "/forgot-password", "/reset-password"]

const isRoute = (pathname: string, routes: string[]) =>
  routes.some((route) => pathname === route || (route !== "/" && pathname.startsWith(`${route}/`)))

const hasAdminAccessCookie = (request: NextRequest) =>
  Boolean(request.cookies.get("access_token") || request.cookies.get("admin_access_token"))

const hasAdminRefreshCookie = (request: NextRequest) =>
  Boolean(request.cookies.get("refresh_token") || request.cookies.get("admin_refresh_token"))

const appendSetCookieHeaders = (response: NextResponse, source: Response) => {
  const cookieHeaders = source.headers.getSetCookie?.()
  const fallbackHeader = source.headers.get("set-cookie")
  const setCookieHeaders = cookieHeaders?.length ? cookieHeaders : fallbackHeader ? [fallbackHeader] : []

  for (const header of setCookieHeaders) {
    response.headers.append("Set-Cookie", header)
  }
}

const clearAdminAuthCookies = (response: NextResponse) => {
  for (const name of ["access_token", "admin_access_token", "refresh_token", "admin_refresh_token"]) {
    response.cookies.set(name, "", {
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    })
  }
}

const redirectToLogin = (request: NextRequest, pathname: string, search: string) => {
  const loginUrl = new URL("/login", request.url)
  if (pathname !== "/") {
    loginUrl.searchParams.set("redirect", `${pathname}${search}`)
  }

  const response = NextResponse.redirect(loginUrl)
  clearAdminAuthCookies(response)
  return response
}

const refreshAdminSession = async (request: NextRequest) => {
  if (!apiUrl) return null

  return fetch(`${apiUrl}/api/v1/admin/auth/refresh`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Cookie: request.headers.get("cookie") ?? "",
    },
    cache: "no-store",
  })
}

export default async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  if (pathname.startsWith("/api/") || pathname.startsWith("/.well-known/")) {
    return NextResponse.next()
  }

  const isPublicRoute = isRoute(pathname, publicRoutes)
  const hasAccess = hasAdminAccessCookie(request)
  const hasRefresh = hasAdminRefreshCookie(request)

  if (isPublicRoute) {
    if (hasRefresh) {
      const refreshResponse = await refreshAdminSession(request)

      if (refreshResponse?.ok) {
        const response = NextResponse.redirect(new URL("/", request.url))
        appendSetCookieHeaders(response, refreshResponse)
        return response
      }

      const response = NextResponse.next()
      clearAdminAuthCookies(response)
      return response
    }

    if (hasAccess) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    return NextResponse.next()
  }

  if (hasAccess) {
    return NextResponse.next()
  }

  if (hasRefresh) {
    const refreshResponse = await refreshAdminSession(request)

    if (refreshResponse?.ok) {
      const response = NextResponse.next()
      appendSetCookieHeaders(response, refreshResponse)
      return response
    }

    return redirectToLogin(request, pathname, search)
  }

  return redirectToLogin(request, pathname, search)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
