import { AppShell } from "@/components/AppShell";
import { AuthGuard } from "@/components/AuthGuard";
import { useAuth } from "@/store/authStore";

export default function DashboardPage() {
  const user = useAuth((s) => s.user);

  return (
    <AuthGuard>
      <AppShell title="Dashboard">
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center dark:border-neutral-700 dark:bg-neutral-900">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Welcome, {user?.name}</h2>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Workflow metrics and recent executions will show up here once you create your first workflow.
          </p>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
