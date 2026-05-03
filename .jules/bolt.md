## 2026-05-01 - [Parallelize Reporting Queries]
**Learning:** Sequential await calls for independent database queries significantly increase latency in reporting endpoints.
**Action:** Use `Promise.all` to fetch data and metadata concurrently in repository methods.

## 2026-05-05 - [Optimize Large Dataset Aggregations]
**Learning:** Fetching all individual records (e.g., movements) to calculate sums in-memory causes high memory pressure and latency. In-memory nested searches using `.find()` inside loops scale poorly (O(N*M)).
**Action:** Use Prisma `groupBy` for database-level aggregation and `Map` for O(N) in-memory lookups.
