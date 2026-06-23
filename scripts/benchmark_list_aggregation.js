const { Decimal } = require("@prisma/client/runtime/library");

const ZERO_DECIMAL = new Decimal(0);

const generateMovementSums = (count) => {
  const sums = [];
  const eventIds = Array.from({ length: 10 }, (_, i) => `event${i}`);
  const accountIds = Array.from({ length: 20 }, (_, i) => `acc${i}`);

  for (let i = 0; i < count; i++) {
    sums.push({
      eventId: eventIds[i % eventIds.length],
      accountId: accountIds[i % accountIds.length],
      _sum: {
        amount: new Decimal(10.5),
      },
    });
  }
  return sums;
};

const generateAccountBadgeMap = () => {
  const map = new Map();
  for (let i = 0; i < 20; i++) {
    map.set(`acc${i}`, {
      code: `CUR${i % 4}`,
      flag: "f",
      symbol: "s",
    });
  }
  return map;
};

const originalListAggregation = (movementSums, accountBadgeMap) => {
  const eventBalancesMap = new Map();

  for (const sum of movementSums) {
    if (!sum.eventId) continue;

    const badgeInfo = accountBadgeMap.get(sum.accountId);
    if (!badgeInfo) continue;

    if (!eventBalancesMap.has(sum.eventId)) {
      eventBalancesMap.set(sum.eventId, new Map());
    }

    const badgeBalances = eventBalancesMap.get(sum.eventId);
    const currentBalance = badgeBalances.get(badgeInfo.code) || {
      ...badgeInfo,
      balance: ZERO_DECIMAL,
    };

    currentBalance.balance = currentBalance.balance.add(
      sum._sum.amount || ZERO_DECIMAL
    );
    badgeBalances.set(badgeInfo.code, currentBalance);
  }
};

const optimizedListAggregation = (movementSums, accountBadgeMap) => {
  const eventBalancesMap = new Map();

  for (const sum of movementSums) {
    const eventId = sum.eventId;
    if (!eventId) continue;

    const badgeInfo = accountBadgeMap.get(sum.accountId);
    if (!badgeInfo) continue;

    let badgeBalances = eventBalancesMap.get(eventId);
    if (!badgeBalances) {
      badgeBalances = new Map();
      eventBalancesMap.set(eventId, badgeBalances);
    }

    const badgeCode = badgeInfo.code;
    let currentBalance = badgeBalances.get(badgeCode);
    if (!currentBalance) {
      currentBalance = {
        ...badgeInfo,
        balance: ZERO_DECIMAL,
      };
      badgeBalances.set(badgeCode, currentBalance);
    }

    currentBalance.balance = currentBalance.balance.add(
      sum._sum.amount || ZERO_DECIMAL
    );
  }
};

const sumsCount = 500000;
const sums = generateMovementSums(sumsCount);
const badgeMap = generateAccountBadgeMap();

console.log(`Benchmarking list aggregation with ${sumsCount} items...`);

// Warmup
originalListAggregation(sums, badgeMap);
optimizedListAggregation(sums, badgeMap);

console.time("Original");
for (let i = 0; i < 10; i++) originalListAggregation(sums, badgeMap);
console.timeEnd("Original");

console.time("Optimized");
for (let i = 0; i < 10; i++) optimizedListAggregation(sums, badgeMap);
console.timeEnd("Optimized");
