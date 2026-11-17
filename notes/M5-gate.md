# M5 Gate

- Passed (cycle detection first try; 404-vs-403, race-safe update and lost-update risk passed on retry): cycle = reaching a node still "visiting"; 404 hides that someone else's id exists; no version check = last write silently wins; version in the UPDATE's WHERE makes check+write one locked statement
- Deferred: tag filtering + GIN index (no need yet), dashboard execution metrics (M8), Kahn's algorithm for run order (M8)
