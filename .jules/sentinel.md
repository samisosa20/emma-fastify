## 2025-05-15 - [Sensitive Data Leakage and Weak Defaults]
**Vulnerability:** API response messages included sensitive recovery/confirmation tokens, and JWT configuration had a hardcoded fallback secret.
**Learning:** Success messages were used to communicate debug-like information (the full URL with token), and the configuration favored "it just works" over security by providing a default secret.
**Prevention:** Strictly separate token delivery channels (email only) and enforce the presence of security-critical environment variables at startup.

## 2025-05-20 - [Unenforced Security Schemas and Missing Middleware Validation]
**Vulnerability:** Strong password policies were defined in Zod schemas but not applied to the user creation input, and authentication routes lacked centralized input middleware.
**Learning:** Security controls existing in the codebase (like `strongPasswordSchema`) do not provide protection unless explicitly integrated into the data ingestion paths. Relying on manual validation in controllers leads to inconsistencies.
**Prevention:** Always apply validation schemas at the entry point using `preHandler` middlewares and ensure that shared validation models strictly enforce security requirements like password complexity.

## 2025-05-25 - [Pervasive IDOR in Resource Management]
**Vulnerability:** Insecure Direct Object Reference (IDOR) vulnerabilities allowed users to access, update, or delete movements belonging to other users by guessing their IDs.
**Learning:** Authentication is not sufficient for resource protection; ownership must be explicitly verified at the repository level. Furthermore, creation/update operations involving related entities (accounts, categories) must verify that the user owns those related resources to prevent cross-user data association.
**Prevention:** Enforce `userId` scoping in all Prisma queries for read/write operations and implement cross-resource ownership checks before creating or updating records with foreign keys.
