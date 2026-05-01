## 2026-05-01 - [Parallelize Reporting Queries]
**Learning:** Sequential await calls for independent database queries significantly increase latency in reporting endpoints.
**Action:** Use `Promise.all` to fetch data and metadata concurrently in repository methods.
