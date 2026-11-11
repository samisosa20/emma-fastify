import prisma from "./prisma.client";

export interface LookupMetadata {
  periods: Awaited<ReturnType<typeof prisma.period.findMany>>;
  badges: Awaited<ReturnType<typeof prisma.badge.findMany>>;
  accountTypes: Awaited<ReturnType<typeof prisma.accountType.findMany>>;
  groupCategories: Awaited<ReturnType<typeof prisma.groupCategory.findMany>>;
}

interface CachedEntry<T> {
  value: T;
  expiresAt: number;
}

const METADATA_TTL_MS = 5 * 60 * 1000;
const USER_SESSION_TTL_MS = 30 * 1000;
const MAX_USER_CACHE_ENTRIES = 1000;

let metadataCache: CachedEntry<LookupMetadata> | null = null;
let metadataInFlight: Promise<LookupMetadata> | null = null;

const userSessionCache = new Map<
  string,
  CachedEntry<{ confirmedEmailAt: Date | null; badgeId: string | null } | null>
>();
const userSessionInFlight = new Map<
  string,
  Promise<{ confirmedEmailAt: Date | null; badgeId: string | null } | null>
>();

/**
 * Returns global lookup tables (periods, badges, accountTypes, groupCategories)
 * from an in-memory TTL cache, coalescing concurrent cold fetches.
 */
export async function getCachedLookupMetadata(): Promise<LookupMetadata> {
  const now = Date.now();
  if (metadataCache && metadataCache.expiresAt > now) {
    return metadataCache.value;
  }
  if (metadataInFlight) {
    return metadataInFlight;
  }

  metadataInFlight = Promise.all([
    prisma.period.findMany(),
    prisma.badge.findMany(),
    prisma.accountType.findMany(),
    prisma.groupCategory.findMany(),
  ])
    .then(([periods, badges, accountTypes, groupCategories]) => {
      const value: LookupMetadata = {
        periods,
        badges,
        accountTypes,
        groupCategories,
      };
      metadataCache = { value, expiresAt: Date.now() + METADATA_TTL_MS };
      return value;
    })
    .finally(() => {
      metadataInFlight = null;
    });

  return metadataInFlight;
}

export function invalidateLookupMetadataCache(): void {
  metadataCache = null;
  metadataInFlight = null;
}

/**
 * Returns minimal session user metadata with a short TTL cache and in-flight coalescing
 * to avoid repeated primary-key lookups across concurrent API requests.
 */
export async function getCachedUserSessionFields(
  userId: string
): Promise<{ confirmedEmailAt: Date | null; badgeId: string | null } | null> {
  const now = Date.now();
  const cached = userSessionCache.get(userId);
  if (cached && cached.expiresAt > now) {
    return cached.value;
  }
  const existingFlight = userSessionInFlight.get(userId);
  if (existingFlight) {
    return existingFlight;
  }

  const fetchPromise = prisma.user
    .findUnique({
      where: { id: userId },
      select: { confirmedEmailAt: true, badgeId: true },
    })
    .then((row) => {
      if (userSessionCache.size >= MAX_USER_CACHE_ENTRIES) {
        const oldestKey = userSessionCache.keys().next().value;
        if (oldestKey !== undefined) {
          userSessionCache.delete(oldestKey);
        }
      }
      userSessionCache.set(userId, {
        value: row,
        expiresAt: Date.now() + USER_SESSION_TTL_MS,
      });
      return row;
    })
    .finally(() => {
      userSessionInFlight.delete(userId);
    });

  userSessionInFlight.set(userId, fetchPromise);
  return fetchPromise;
}

export function invalidateUserSessionCache(userId?: string): void {
  if (userId) {
    userSessionCache.delete(userId);
    userSessionInFlight.delete(userId);
    return;
  }
  userSessionCache.clear();
  userSessionInFlight.clear();
}
