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

## 2026-05-15 - [Database Aggregation for Investment Listings]
**Learning:** Using Prisma `include` to fetch all movements and appreciations for an investment list causes severe N+1 data bloat and O(N*M) processing in Node.js.
**Action:** Use `groupBy` for database-level sums and a two-step `groupBy` + `findMany` pattern to efficiently retrieve the "latest" associated records. Use `Map` for O(1) assembly of indicators and ensure `Decimal` safety for nullable fields.

## 2026-05-09 - [Database-Level Event Balance Aggregation]
**Learning:** Fetching all movements to calculate event balances in-memory (O(N*M)) causes severe performance degradation and high memory pressure.
**Action:** Use Prisma `groupBy` to aggregate sums at the database level and combine them with metadata using `Map` for O(1) lookups. Ensure `userId` is enforced to maintain security and optimize queries.
## 2026-05-20 - [Accurate Heritage Reporting with Multi-Source Aggregation]
**Learning:** Relying on complex database views for year-over-year reporting can lead to data inconsistencies and hidden logic bugs.
**Action:** Re-implement year-over-year aggregation in the application/infrastructure layer using explicit parallelized queries to sum Balances (Init + Movements), latest Investment Valuations, and Commercial Values, ensuring consistent currency grouping and multi-tenancy.

## 2026-05-25 - [Parallelizing Write Path Validations]
**Learning:** Sequential ownership and existence checks for related resources (Accounts, Categories, Events, Investments) before creating or updating a record add unnecessary latency.
**Action:** Consolidate all prerequisite database lookups into a single `Promise.all` call to reduce sequential roundtrips.

## 2026-05-25 - [Bulk Metadata Fetching for Imports]
**Learning:** Performing multiple `findFirst` lookups inside a loop for data imports creates an N*M database bottleneck.
**Action:** Pre-fetch all relevant metadata (Accounts, Categories, etc.) into Hash Maps before the loop to replace database roundtrips with O(1) in-memory lookups.
