import Link from "next/link";
import type { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  subtitle: string;
  footerText: string;
  footerLinkLabel: string;
  footerHref: string;
  children: ReactNode;
}

export function AuthCard({ title, subtitle, footerText, footerLinkLabel, footerHref, children }: AuthCardProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-950">
      <div className="w-full max-w-sm">
        <p className="mb-8 text-center text-lg font-semibold tracking-tight text-indigo-600 dark:text-indigo-400">AgentFlow</p>
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">{title}</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
        <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
          {footerText}
          <Link href={footerHref} className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            {footerLinkLabel}
          </Link>
        </p>
      </div>
    </main>
  );
}
