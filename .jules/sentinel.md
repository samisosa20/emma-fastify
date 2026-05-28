## 2025-05-15 - [Sensitive Data Leakage and Weak Defaults]
**Vulnerability:** API response messages included sensitive recovery/confirmation tokens, and JWT configuration had a hardcoded fallback secret.
**Learning:** Success messages were used to communicate debug-like information (the full URL with token), and the configuration favored "it just works" over security by providing a default secret.
**Prevention:** Strictly separate token delivery channels (email only) and enforce the presence of security-critical environment variables at startup.

## 2025-05-20 - [Unenforced Security Schemas and Missing Middleware Validation]
**Vulnerability:** Strong password policies were defined in Zod schemas but not applied to the user creation input, and authentication routes lacked centralized input middleware.
**Learning:** Security controls existing in the codebase (like `strongPasswordSchema`) do not provide protection unless explicitly integrated into the data ingestion paths. Relying on manual validation in controllers leads to inconsistencies.
**Prevention:** Always apply validation schemas at the entry point using `preHandler` middlewares and ensure that shared validation models strictly enforce security requirements like password complexity.

## 2025-05-25 - [Broken Object Level Authorization in Account Operations]
**Vulnerability:** Account operations (list, detail, update, delete) lacked ownership verification, allowing any authenticated user to access or modify accounts belonging to others by guessing the UUID.
**Learning:** Prisma's `update` and `delete` methods require unique identifiers in the `where` clause. Adding a non-unique `userId` to these methods' filters is a type-level error. Security enforcement for these operations requires a two-step "lookup then act" pattern if the schema doesn't support composite unique keys on `(id, userId)`.
**Prevention:** Always include `userId` in the `where` clause for `find` operations and verify ownership before performing `update` or `delete` on a resource.
## 2025-05-25 - [Pervasive IDOR in Resource Management]
**Vulnerability:** Insecure Direct Object Reference (IDOR) vulnerabilities allowed users to access, update, or delete movements belonging to other users by guessing their IDs.
**Learning:** Authentication is not sufficient for resource protection; ownership must be explicitly verified at the repository level. Furthermore, creation/update operations involving related entities (accounts, categories) must verify that the user owns those related resources to prevent cross-user data association.
**Prevention:** Enforce `userId` scoping in all Prisma queries for read/write operations and implement cross-resource ownership checks before creating or updating records with foreign keys.

## 2025-05-30 - [Resource Ownership Verification for Budgets]
**Vulnerability:** Budget operations (detail, update, delete) relied solely on budget IDs, enabling IDOR attacks where any authenticated user could access or modify others' budgets.
**Learning:** For models without composite unique keys on `(id, userId)`, multi-tenancy must be enforced by using `findFirst({ where: { id, userId } })` instead of `findUnique({ where: { id } })`. Additionally, critical processes like `importBudgets` must use the authenticated user's ID rather than falling back to global environment variables.
**Prevention:** Standardize repository methods to always include `userId` in filters for all single-resource operations and ensure that creation/import logic strictly derives ownership from the request context.

## 2025-06-05 - [IDOR and Environment-Dependent Ownership in Investments]
**Vulnerability:** The Investment module allowed unauthorized access/modification via IDOR and relied on a static `USER_ID` environment variable for data imports.
**Learning:** Even when authentication is present, resource-level authorization must be explicitly enforced in all CRUD and import operations. Relying on environment variables for user context in multi-tenant applications creates a significant security gap where all imported data is attributed to a single global user.
**Prevention:** Strictly propagate the authenticated `userId` from the request context to all repository operations and use it as a mandatory filter in Prisma queries (`findFirst` with `userId`).

## 2026-05-10 - [IDOR in Planned Payments and Cross-Resource Authorization]
**Vulnerability:** Planned Payment operations lacked ownership verification, and imports relied on a global environment variable. Additionally, users could link payments to accounts or categories belonging to other users.
**Learning:** Even if a resource is owned by a user, the system must verify that any related resources (foreign keys) specified in a create/update request are also owned by that same user to prevent cross-user data association.
**Prevention:** Enforce `userId` scoping in all CRUD operations and explicitly verify ownership of related entities (e.g., `accountId`, `categoryId`) before proceeding with data modification. Derived `userId` from the authenticated session for all operations, including batch imports.

## 2026-05-12 - [IDOR in Category Management and Mass Assignment Protection]
**Vulnerability:** Category operations lacked ownership verification, and the create/update methods were susceptible to mass assignment of the `userId` field.
**Learning:** Even with authentication, resource ownership must be enforced at the database query level. Furthermore, explicitly stripping `userId` from input payloads in the repository ensures that ownership cannot be spoofed or transferred by malicious users.
**Prevention:** Propagate the authenticated `userId` to all repository methods and use it as a mandatory filter in Prisma queries (`findFirst`). Sanitize input payloads to exclude sensitive fields like `userId`.
## 2026-05-15 - [Pervasive IDOR in Heritage Management]
**Vulnerability:** Heritage operations (detail, update, delete) lacked ownership verification, and the import process relied on a global environment variable for the user ID.
**Learning:** Security enforcement must be consistently applied across all resource types. Relying on environment variables for user context in a multi-tenant API is a critical flaw that allows data to be misattributed.
**Prevention:** Strictly propagate the authenticated `userId` from the request context through the application layers to the repository, and use it as a mandatory filter in all database operations (`findFirst` with `userId` check).

## 2026-05-18 - [IDOR in Investment Appreciations and Parent Resource Verification]
**Vulnerability:** Appreciation operations lacked ownership verification, and the import process relied on a global environment variable. Additionally, users could add appreciations to investments belonging to others.
**Learning:** Security enforcement must extend to sub-resources. Verifying ownership of the parent resource (Investment) during the creation of a child resource (Appreciation) is critical to prevent unauthorized data association.
**Prevention:** Always scope queries by `userId` and explicitly verify ownership of parent resources before creating or modifying dependent records.

## 2026-05-19 - [Broken Access Control on Global Resources]
**Vulnerability:** System-wide resources (`Badge`, `AccountType`, etc.) lacked role-based access control, allowing any authenticated user to perform administrative mutations.
**Learning:** Authentication (knowing who a user is) does not equate to authorization (what they can do). Global resources without a `userId` owner are particularly vulnerable in multi-tenant systems if they lack specific administrative checks.
**Prevention:** Implement a fail-secure `isAdmin` helper that validates the user's identity against a trusted source (e.g., an `ADMIN_EMAIL` env var) and explicitly check for administrative privileges on all system-wide mutation endpoints.

## 2026-05-17 - [Silent Data Leakage and Unscoped Global Lookups]
**Vulnerability:** Hashed passwords were leaked in API responses because repositories returned full Prisma objects despite TypeScript `Omit` signatures. Also, internal lookups for common resources (like the "Transferencia" category) lacked `userId` scoping, leading to IDOR.
**Learning:** TypeScript's `Omit` and `Pick` types only provide compile-time safety; they do not remove fields from the runtime object, which Prisma returns in full. Furthermore, even "standard" resources must be explicitly scoped to the user to maintain multi-tenant isolation.
**Prevention:** Explicitly destructure and remove sensitive fields from database results before they leave the repository. Always include `userId` in Prisma `where` clauses, even when searching for resources by unique names or types.

## 2026-05-20 - [Administrative Privilege Escalation via Unconfirmed Email]
**Vulnerability:** The `isAdmin` helper only checked the user's email against an environment variable, allowing any unconfirmed account with the administrator's email to gain full administrative access.
**Learning:** Authentication (identity) and verification (proof of ownership) are distinct. Role-based access control (RBAC) must depend on verified identities to prevent spoofing or account pre-claiming attacks.
**Prevention:** Always verify that an account is confirmed (`confirmedEmailAt` is not null) before granting administrative or elevated privileges.

## 2026-05-21 - [Host Header Injection in Auth Proxy]
**Vulnerability:** The authentication proxy route was using the untrusted `Host` header to construct URLs for Better-Auth, making the application vulnerable to Host Header Injection attacks.
**Learning:** Even when using well-known libraries like Better-Auth, manually proxying requests to their handlers can introduce common web vulnerabilities if untrusted headers are used for URL construction.
**Prevention:** Always use a trusted `APP_URL` from the environment for constructing internal or external absolute URLs instead of relying on client-provided headers like `Host`.

## 2026-05-21 - [Invalid Zod Method in Validation Schema]
**Vulnerability:** The movement validation schema was using `z.iso.datetime`, which is not a standard Zod method, leading to potential silent validation failures or runtime errors.
**Learning:** Relying on non-existent or non-standard validation methods can leave critical data ingestion paths unprotected. TypeScript might not always catch these errors depending on how the types are defined or if they are cast to `any`.
**Prevention:** Strictly use standard, well-documented validation methods (e.g., `z.string().datetime()`) and always verify schema correctness through automated builds and functional tests.

## 2026-05-22 - [IDOR in Account Detail and Balance Aggregation]
**Vulnerability:** `AccountPrismaRepository.detailAccount` failed to include the `userId` filter in its Prisma queries, allowing any authenticated user to view metadata and calculated balances for any account by guessing its UUID.
**Learning:** Method signatures that accept security context (like `userId`) are "security theater" if those parameters aren't explicitly passed into every database operation within the method, including secondary operations like aggregations.
**Prevention:** Always scope all Prisma operations (find, aggregate, update, delete) by the authenticated `userId` in multi-tenant environments.

## 2025-06-10 - [IDOR in Budget Category Association]
**Vulnerability:** Budget entries could be associated with categories belonging to other users.
**Learning:** Even if the primary resource (Budget) is ownership-verified, related resources (CategoryId) must also be checked against the authenticated user's ID to prevent cross-user data leakage or unauthorized associations.
**Prevention:** Always verify ownership of related entities (foreign keys) before creating or updating records in a multi-tenant environment.

## 2025-06-25 - [Mass Assignment in Resource Ownership]
**Vulnerability:** Update operations for Planned Payments, Heritages, Investments, and Appreciations were vulnerable to mass assignment, potentially allowing users to change the `userId` (ownership) of a record.
**Learning:** Even with ownership checks in place, spreading unvalidated or semi-validated request bodies directly into database update calls can lead to parameter pollution where internal fields like `userId` are overwritten.
**Prevention:** Always explicitly destructure and exclude sensitive or immutable fields (especially `userId`) from input payloads before passing them to Prisma `update` or `create` calls.
