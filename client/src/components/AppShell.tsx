import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNode } from "react";
import { ROUTES } from "@/lib/routes";
import { useAuth } from "@/store/authStore";
import { useApi } from "@/hooks/useApi";


interface AppShellProps {
  title: string;
  children: ReactNode;
}

const NAV_ITEMS = [
  { label: "Dashboard", href: ROUTES.dashboard },
  { label: "Workflows", href: ROUTES.workflows },
  { label: "Executions", href: ROUTES.executions },
  { label: "Integrations", href: ROUTES.integrations },
  { label: "Settings", href: ROUTES.settings },
] as const;

export function AppShell({ title, children }: AppShellProps) {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const clear = useAuth((s) => s.clear);
  const { isLoading: loggingOut, request: logoutRequest } = useApi("/auth/logout", "post");

  async function handleLogout(): Promise<void> {
    // logout returns 204, so data is "" — only null means failure
    const result = await logoutRequest();
    if (result === null) return;
    clear();
    await router.replace(ROUTES.login);
  }

  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-neutral-200 bg-white md:flex dark:border-neutral-800 dark:bg-neutral-900">
        <div className="px-6 py-5 text-lg font-semibold tracking-tight text-indigo-600 dark:text-indigo-400">AgentFlow</div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV_ITEMS.map(({ label, href }) => {
            const active = router.pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${active
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                  : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                  }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900">
          <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{title}</h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{user?.name}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{user?.role.toLowerCase()}</p>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-60 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Log out
            </button>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
