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

## 2026-05-26 - [Eliminating 3*N Database Roundtrips in Budget Imports]
**Learning:** Sequential database lookups for related resources (Period, Badge, Category) within an import loop cause significant latency and can saturate connection pools.
**Action:** Use `Promise.all` to pre-fetch global metadata and user-scoped categories in parallel before the loop, utilizing `Map` objects for efficient O(1) retrieval.
## 2026-05-12 - [O(1) Planned Payment Import Lookup]
**Learning:** Performing sequential `findFirst` lookups for Accounts and Categories inside a loop during Planned Payment imports created a significant N+1 database bottleneck.
**Action:** Bulk fetch all metadata into Hash Maps (`Map`) before the loop to replace database roundtrips with O(1) in-memory lookups.

## 2026-05-27 - [O(1) Category Import Lookup]
**Learning:** Performing sequential `findFirst` lookups for GroupCategories and parent Categories inside a loop during Category imports created a significant N+1 database bottleneck.
**Action:** Bulk fetch all metadata into Hash Maps (`Map`) before the loop to replace database roundtrips with O(1) in-memory lookups.

## 2026-05-28 - [Eliminating N+1 queries in Account Import]
**Learning:** Performing sequential `findFirst` lookups for AccountTypes and Badges inside a loop during Account imports created a significant N+1 database bottleneck.
**Action:** Bulk fetch all metadata (AccountTypes, Badges) in parallel using `Promise.all` and use Hash Maps for O(1) in-memory lookups during the import loop.

## 2026-05-29 - [Eliminating N+1 queries in Investment, Appreciation, and Heritage Imports]
**Learning:** Performing sequential database lookups (findFirst) for related resources (Badges, Investments) within an import loop creates significant N+1 bottlenecks.
**Action:** Pre-fetch all relevant metadata into Hash Maps before the loop to replace database roundtrips with O(1) in-memory lookups.

## 2026-05-30 - [O(1) Transfer Pairing in Movement Import]
**Learning:** Performing a database lookup (`findFirst`) inside a loop for pairing transfer movements during an import creates an N+1 bottleneck. Since paired movements are imported in the same batch, they can be linked in-memory.
**Action:** Use a `Map` with a composite key (`${accountId}-${date}-${amount}-${categoryId}`) to cache newly created movements during the import loop for O(1) pairing lookups.

## 2026-05-31 - [Database Query Consolidation in Balance History]
**Learning:** Making three independent database queries for different periods (current, last year, previous) in `reportBalanceHistory` adds significant network latency and database roundtrip overhead.
**Action:** Consolidate these into a single `prisma.vw_historybalance.findMany` call with an `OR` filter for all three date ranges, and use a shared `Map` for O(1) in-memory data assembly.

## 2026-05-21 - [Parallelize Login Metadata Fetching]
**Learning:** Fetching multiple independent metadata collections (Badges, AccountTypes, Periods, GroupCategories) sequentially during login increases response latency.
**Action:** Use `Promise.all` to fetch all required metadata in parallel to minimize the total wait time for the client.

## 2026-06-05 - [Eliminating Sequential N+1 Queries in Heritage Reporting]
**Learning:** Performing multiple independent database queries (aggregations, findMany, and latest-record lookups) inside a loop for year-over-year heritage reporting causes severe latency as the number of years grows.
**Action:** Hoist all data retrieval outside the loop using `Promise.all`, and use sorted lists with `Set` tracking for O(N) in-memory "latest-record" lookups to replicate database logic without roundtrips.

## 2026-06-10 - [Parallelizing Account List and Balance Aggregation]
**Learning:** Sequentially fetching an account list (paginated or full) and then its movement aggregations adds unnecessary latency. Using a user-wide aggregation allows these queries to run concurrently.
**Action:** Use `Promise.all` to fetch accounts and user-level movement `groupBy` sums in parallel. Use a Hash Map for O(1) balance lookups to avoid O(N*M) processing.

## 2026-06-15 - [Consolidated Reporting with Metadata Hoisting]
**Learning:** Having multiple reporting methods with identical logic for participation calculation and metadata attachment creates a maintenance burden and redundant object allocations. Re-calculating absolute values multiple times per item increases memory pressure.
**Action:** Consolidate reporting logic into a private helper method. Use `Promise.all` with `findUnique` for concurrent, efficient metadata fetching. Hoist metadata properties outside loops and reuse calculated absolute amounts to minimize `Decimal` allocations.

## 2026-06-15 - [Consolidate Reporting Logic and Hoist Metadata]
**Learning:** Identical reporting patterns (fetching data + looking up badge metadata) across multiple methods cause code bloat and redundant processing. High-frequency mapping loops often perform unnecessary property access or object re-allocations (e.g., repeating .abs() or object spreads).
**Action:** Consolidate repetitive reporting logic into optimized private helpers that use Promise.all for parallel fetching and findUnique for primary key lookups. Pre-calculate values (like absolute amounts) once and hoist metadata outside loops to minimize runtime overhead.

## 2026-06-20 - [Single-Pass Aggregation for Decimal Reports]
**Learning:** Calculating absolute values and sums separately for `Decimal` objects in report aggregation loops leads to redundant allocations and method calls. Multi-pass mapping over the same dataset can be optimized by caching intermediate `Decimal` results (like absolute amounts) in a typed array.
**Action:** Use a single loop to pre-calculate absolute values and totals, then reuse these cached values in the final mapping pass to reduce `Decimal` overhead by ~50%.

## 2026-06-25 - [Repository Data Access and Bulk Import Optimization]
**Learning:**  performed heavy `include` with 6 joins, mostly unused. `addMovement` for transfers also had redundant `include` on paired records. `importMovements` repeatedly parsed date strings in nested loops (O(N) redundant work).
**Action:** Use targeted `select` in `deleteMovement` to avoid joins. Remove redundant `include` in creation paths. Pre-parse dates and cache them in bulk processing loops to eliminate redundant object allocations.

## 2026-06-25 - [Repository Data Access and Bulk Import Optimization]
**Learning:** `deleteMovement` performed heavy `include` with 6 joins, mostly unused. `addMovement` for transfers also had redundant `include` on paired records. `importMovements` repeatedly parsed date strings in nested loops (O(N) redundant work).
**Action:** Use targeted `select` in `deleteMovement` to avoid joins. Remove redundant `include` in creation paths. Pre-parse dates and cache them in bulk processing loops to eliminate redundant object allocations.

## 2026-06-30 - [Targeted Select for Ownership Checks]
**Learning:** Fetching full metadata objects during prerequisite ownership checks (Account, Category, etc.) increases data transfer and memory overhead. Since these checks only verify existence and ownership, only the ID is needed.
**Action:** Use `select: { id: true }` in prerequisite `findFirst` calls within `addMovement` and `updateMovement` to minimize database payload and application memory pressure.

## 2026-06-23 - [Single-Pass Map Lookups for Aggregations]
**Learning:** Replacing redundant Map operations (e.g., `.has()` followed by `.get()`) with a single `.get()` and a conditional check provides a measurable performance boost in high-frequency aggregation loops (e.g., ~24% reduction in processing time for 500k records).
**Action:** Always use `let val = map.get(key); if (!val) { ... }` instead of `if (!map.has(key)) { ... }` in performance-critical sections.

## 2026-06-23 - [Risk of Unsafe Type Casts in Optimized Paths]
**Learning:** Aggressive optimization sometimes leads to using `as unknown as Decimal` to bypass TypeScript when working with Prisma types. This is a significant runtime risk if the underlying value is not a `Decimal` instance.
**Action:** Ensure that any unsafe cast is preceded by a robust fallback (e.g., `(val as unknown as Decimal) || ZERO_DECIMAL`) or type guard to prevent runtime crashes.
