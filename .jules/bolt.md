## 2026-05-01 - [Parallelize Reporting Queries]
**Learning:** Sequential await calls for independent database queries significantly increase latency in reporting endpoints.
**Action:** Use `Promise.all` to fetch data and metadata concurrently in repository methods.

## 2026-05-05 - [Optimize Large Dataset Aggregations]
**Learning:** Fetching all individual records (e.g., movements) to calculate sums in-memory causes high memory pressure and latency. In-memory nested searches using `.find()` inside loops scale poorly (O(N*M)).
**Action:** Use Prisma `groupBy` for database-level aggregation and `Map` for O(N) in-memory lookups.
## 2026-05-02 - [O(N) Budget Comparison Lookup]
**Learning:** Performing `Array.find()` inside a `.map()` loop for budget-movement comparison created an O(N*M) bottleneck.
**Action:** Use a Hash Map/Record with composite keys (`${categoryId}-${badgeId}`) for O(1) lookups instead of converting to arrays.

## 2026-05-05 - [Database-Level Account Balance Aggregation]
**Learning:** Fetching all movement records to calculate account balances in-memory causes significant N+1-like performance degradation as transaction history grows.
**Action:** Use Prisma `groupBy` or `aggregate` to compute sums at the database level, and combine them with `initAmount` using `Decimal` for precision. Always filter by `userId` to maintain isolation during aggregation.
## 2026-05-04 - [Database-Level Account Balance Aggregation]
**Learning:** Fetching all movements to calculate account balances in-memory (especially in paginated lists) causes significant O(N*M) performance degradation as data grows.
**Action:** Use `prisma.movement.groupBy` for batch aggregation in list views and `prisma.movement.aggregate` for detail views to offload calculations to the database. Use `new Decimal((val ?? 0).toString())` for robust `Decimal` initialization.

## 2026-05-10 - [Aggressive Parallelization for Reporting]
**Learning:** Fetching lookup tables (like Badges) concurrently with primary data and aggregations, even if some fetched data isn't used, reduces overall latency by removing sequential dependencies.
**Action:** Use `Promise.all` to fetch lookups and primary data together to flatten the execution timeline.

## 2026-05-15 - [Batch Aggregation for Investment Lists]
**Learning:** Including large relational datasets (movements, appreciations) in paginated lists causes severe N+1 performance degradation and high memory usage.
**Action:** Replace relational `include` with database-level `groupBy` aggregations for the entire batch of IDs. Use `Promise.all` to parallelize these aggregations and merge results in-memory using `Map` for O(1) lookups.
