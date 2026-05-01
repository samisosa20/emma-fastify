## 2025-05-15 - [Sensitive Data Leakage and Weak Defaults]
**Vulnerability:** API response messages included sensitive recovery/confirmation tokens, and JWT configuration had a hardcoded fallback secret.
**Learning:** Success messages were used to communicate debug-like information (the full URL with token), and the configuration favored "it just works" over security by providing a default secret.
**Prevention:** Strictly separate token delivery channels (email only) and enforce the presence of security-critical environment variables at startup.
