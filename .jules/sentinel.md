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
