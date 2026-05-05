## 2025-05-15 - [Sensitive Data Leakage and Weak Defaults]
**Vulnerability:** API response messages included sensitive recovery/confirmation tokens, and JWT configuration had a hardcoded fallback secret.
**Learning:** Success messages were used to communicate debug-like information (the full URL with token), and the configuration favored "it just works" over security by providing a default secret.
**Prevention:** Strictly separate token delivery channels (email only) and enforce the presence of security-critical environment variables at startup.

## 2025-05-20 - [Unenforced Security Schemas and Missing Middleware Validation]
**Vulnerability:** Strong password policies were defined in Zod schemas but not applied to the user creation input, and authentication routes lacked centralized input validation middleware.
**Learning:** Security controls existing in the codebase (like `strongPasswordSchema`) do not provide protection unless explicitly integrated into the data ingestion paths. Relying on manual validation in controllers leads to inconsistencies.
**Prevention:** Always apply validation schemas at the entry point using `preHandler` middlewares and ensure that shared validation models strictly enforce security requirements like password complexity.

## 2025-05-25 - [Broken Object Level Authorization in Account Operations]
**Vulnerability:** Account operations (list, detail, update, delete) lacked ownership verification, allowing any authenticated user to access or modify accounts belonging to others by guessing the UUID.
**Learning:** Prisma's `update` and `delete` methods require unique identifiers in the `where` clause. Adding a non-unique `userId` to these methods' filters is a type-level error. Security enforcement for these operations requires a two-step "lookup then act" pattern if the schema doesn't support composite unique keys on `(id, userId)`.
**Prevention:** Always include `userId` in the `where` clause for `find` operations and verify ownership before performing `update` or `delete` on a resource.
