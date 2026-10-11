# M2 Gate

- Passed (4/5 MCQ, miss fixed on follow-up): JSONB when read/written whole, @unique beats race conditions, ON DELETE SetNull vs Cascade, migrations = one-time SQL tracked in `_prisma_migrations`
- Corrected: migrations never run on app boot; no `migrate dev` = no migration file = no column in prod
- SQL basics (4/5, miss fixed on follow-up): LEFT vs INNER JOIN, HAVING vs WHERE, composite B-tree index needs leftmost column, transactions = all-or-nothing. Corrected: default index is a sorted B-tree, not a hash map
