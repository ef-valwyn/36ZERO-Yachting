import { authMiddleware } from '@clerk/nextjs/server';

/**
 * Clerk middleware.
 *
 * NOTE: this file was previously named `proxy.ts` and was silently a no-op
 * (Next.js only recognises `middleware.ts` at the app root). We renamed it
 * to make it take effect, and in doing so have to be careful not to break
 * any route that was previously unauthenticated — everything on the site
 * was effectively public before.
 *
 * Strategy: treat every route as public by default and only enforce auth on
 * `/admin/*`. The page-level layout at `apps/yachting/app/admin/layout.tsx`
 * does the stricter role check via `requireStaff()`.
 */
export default authMiddleware({
  publicRoutes: (req) => !req.nextUrl.pathname.startsWith('/admin'),
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
