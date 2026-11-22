import { CATEGORY_LABELS, CATEGORY_ORDER, NODE_CATALOG, type NodeKind } from "@/lib/nodeCatalog/catalog";

const catalogKinds = Object.keys(NODE_CATALOG) as NodeKind[];

export default function Palette() {
    return (
        <aside className="h-screen w-64 shrink-0 overflow-y-auto border-r border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Nodes</h2>

            {CATEGORY_ORDER.map((category) => (
                <section key={category} className="mb-4">
                    <h3 className="mb-2 text-xs uppercase tracking-wide text-zinc-500">{CATEGORY_LABELS[category]}</h3>
                    <ul className="flex flex-col gap-2">
                        {catalogKixnds
                            .filter((kind) => NODE_CATALOG[kind].category === category)
                            .map((kind) => (
                                <li
                                    key={kind}
                                    draggable
                                    className="cursor-grab rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm hover:border-indigo-400 active:cursor-grabbing dark:border-zinc-700 dark:bg-zinc-900"
                                >
                                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{NODE_CATALOG[kind].label}</p>
                                    <p className="truncate text-xs text-zinc-500">{NODE_CATALOG[kind].description}</p>
                                </li>
                            ))}
                    </ul>
                </section>
            ))}
        </aside>
    );
}
