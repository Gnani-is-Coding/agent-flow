/*
 * Page flow + auth rehydrate
 *
 * _document (server only: html/body) → _app (wraps every page, stays mounted) → Component (index | login | dashboard)
 *
 * Opening `/`:
 * 1. Server: no localStorage → user: null, hydrated: false → index renders <Spinner />.
 * 2. Browser first render: same state → same spinner → no hydration mismatch.
 * 3. This effect: rehydrate() reads localStorage["auth"] → onRehydrateStorage sets hydrated: true.
 * 4. index effect reruns → Router.replace to /dashboard (user) or /login (none).
 * 5. Later navigations only swap Component; rehydrate runs once per full page load.
 * Child effects run before parent: index sees hydrated: false first, then reruns after this rehydrates.
 *
 * persist options (store/authStore.ts):
 * - name: localStorage key.
 * - partialize: save only user; a saved hydrated: true would skip the wait.
 * - skipHydration: don't read storage on store create; wait for rehydrate() here so server and first client render match.
 * - onRehydrateStorage: outer fn runs at start, inner at finish → hydrated: true means user is real.
 */
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { useAuth } from "@/store/authStore";
import Router, { useRouter } from "next/router";
import { ROUTES } from "@/lib/routes";

export default function App({ Component, pageProps }: AppProps) {
  const user = useAuth((s) => s.user);
  const hydrated = useAuth((s) => s.hydrated);
  const router = useRouter()
  const redirectURL = router.asPath


  useEffect(() => {
    void useAuth.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (hydrated && !redirectURL.includes("/login")) {
      void Router.replace(user ? redirectURL ?? router.asPath : `${ROUTES.login}?redirect=${redirectURL ?? "/"}`);
    }
  }, [hydrated, user, redirectURL]);

  return <Component {...pageProps} />;
}
