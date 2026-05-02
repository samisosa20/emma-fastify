## 2026-05-01 - [Parallelize Reporting Queries]
**Learning:** Sequential await calls for independent database queries significantly increase latency in reporting endpoints.
**Action:** Use `Promise.all` to fetch data and metadata concurrently in repository methods.

## 2026-05-02 - [O(N) Budget Comparison Lookup]
**Learning:** Performing `Array.find()` inside a `.map()` loop for budget-movement comparison created an O(N*M) bottleneck.
**Action:** Use a Hash Map/Record with composite keys (`${categoryId}-${badgeId}`) for O(1) lookups instead of converting to arrays.
