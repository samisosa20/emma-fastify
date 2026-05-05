## 2026-05-01 - [Parallelize Reporting Queries]
**Learning:** Sequential await calls for independent database queries significantly increase latency in reporting endpoints.
**Action:** Use `Promise.all` to fetch data and metadata concurrently in repository methods.

## 2026-05-05 - [Optimize Large Dataset Aggregations]
**Learning:** Fetching all individual records (e.g., movements) to calculate sums in-memory causes high memory pressure and latency. In-memory nested searches using `.find()` inside loops scale poorly (O(N*M)).
**Action:** Use Prisma `groupBy` for database-level aggregation and `Map` for O(N) in-memory lookups.
## 2026-05-02 - [O(N) Budget Comparison Lookup]
**Learning:** Performing `Array.find()` inside a `.map()` loop for budget-movement comparison created an O(N*M) bottleneck.
**Action:** Use a Hash Map/Record with composite keys (`${categoryId}-${badgeId}`) for O(1) lookups instead of converting to arrays.

## 2026-05-04 - [Database-Level Account Balance Aggregation]
**Learning:** Fetching all movements to calculate account balances in-memory (especially in paginated lists) causes significant O(N*M) performance degradation as data grows.
**Action:** Use `prisma.movement.groupBy` for batch aggregation in list views and `prisma.movement.aggregate` for detail views to offload calculations to the database. Use `new Decimal((val ?? 0).toString())` for robust `Decimal` initialization.
