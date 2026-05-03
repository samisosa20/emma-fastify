## 2026-05-01 - [Parallelize Reporting Queries]
**Learning:** Sequential await calls for independent database queries significantly increase latency in reporting endpoints.
**Action:** Use `Promise.all` to fetch data and metadata concurrently in repository methods.

## 2026-05-05 - [Optimize Large Dataset Aggregations]
**Learning:** Fetching all individual records (e.g., movements) to calculate sums in-memory causes high memory pressure and latency. In-memory nested searches using `.find()` inside loops scale poorly (O(N*M)).
**Action:** Use Prisma `groupBy` for database-level aggregation and `Map` for O(N) in-memory lookups.
## 2026-05-02 - [O(N) Budget Comparison Lookup]
**Learning:** Performing `Array.find()` inside a `.map()` loop for budget-movement comparison created an O(N*M) bottleneck.
**Action:** Use a Hash Map/Record with composite keys (`${categoryId}-${badgeId}`) for O(1) lookups instead of converting to arrays.
