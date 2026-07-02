const { Prisma } = require("@prisma/client");

const ZERO_DECIMAL = new Prisma.Decimal(0);

// Mock data generation
const generateMovements = (count) => {
  const movements = [];
  const badgeCodes = ["USD", "EUR", "COP", "BRL"];
  const categories = [
    { id: "cat1", name: "Food", color: "#ff0000", icon: "fastfood" },
    { id: "cat2", name: "Transport", color: "#00ff00", icon: "train" },
    { id: "cat3", name: "Leisure", color: "#0000ff", icon: "movie" },
  ];

  for (let i = 0; i < count; i++) {
    const badgeCode = badgeCodes[i % badgeCodes.length];
    const category = categories[i % categories.length];
    movements.push({
      amount: new Prisma.Decimal(10.5),
      account: {
        badge: {
          code: badgeCode,
          symbol: "$",
          flag: "🇺🇸",
        },
      },
      category: {
        id: category.id,
        name: category.name,
        color: category.color,
        icon: category.icon,
      },
    });
  }
  return movements;
};

const originalAggregation = (movements) => {
  const groupedByBadge = new Map();

  for (const movement of movements) {
    const badgeCode = movement.account?.badge?.code;
    const categoryName = movement.category?.name;
    const amount = movement.amount;

    if (badgeCode && categoryName) {
      if (!groupedByBadge.has(badgeCode)) {
        groupedByBadge.set(badgeCode, {
          symbol: String(movement.account?.badge?.symbol),
          flag: String(movement.account?.badge?.flag),
          total_amount: ZERO_DECIMAL,
          categories: new Map(),
        });
      }

      const badgeGroup = groupedByBadge.get(badgeCode);

      // Sumar al total de la moneda
      badgeGroup.total_amount = badgeGroup.total_amount.add(amount);

      // Sumar a la categoría específica dentro de la moneda
      const categoryId = movement.category?.id;
      if (categoryId) {
        const existing = badgeGroup.categories.get(categoryId) || {
          id: categoryId,
          name: movement.category.name,
          color: movement.category.color,
          icon: movement.category.icon,
          amount: ZERO_DECIMAL,
        };
        existing.amount = existing.amount.add(amount);
        badgeGroup.categories.set(categoryId, existing);
      }
    }
  }

  const categories = Array.from(groupedByBadge.entries()).map(
    ([badgeCode, data]) => {
      const categoriesList = Array.from(data.categories.values()).map(
        (cat) => ({
          id: cat.id,
          name: cat.name,
          color: cat.color,
          icon: cat.icon,
          amount: cat.amount.toNumber(),
          percentage: data.total_amount.isZero()
            ? 0
            : cat.amount
                .div(data.total_amount)
                .mul(100)
                .toDecimalPlaces(2)
                .toNumber(),
        })
      );

      return {
        code: badgeCode,
        flag: data.flag,
        symbol: data.symbol,
        categories: categoriesList,
      };
    }
  );

  return categories;
};

const optimizedAggregation = (movements) => {
  const groupedByBadge = new Map();

  for (let i = 0; i < movements.length; i++) {
    const movement = movements[i];
    const acc = movement.account;
    const badge = acc?.badge;
    const badgeCode = badge?.code;
    const cat = movement.category;
    const categoryId = cat?.id;

    if (badgeCode && categoryId) {
      let badgeGroup = groupedByBadge.get(badgeCode);
      if (!badgeGroup) {
        badgeGroup = {
          symbol: badge.symbol ?? "",
          flag: badge.flag ?? "",
          total_amount: ZERO_DECIMAL,
          categories: new Map(),
        };
        groupedByBadge.set(badgeCode, badgeGroup);
      }

      const amount = movement.amount;
      badgeGroup.total_amount = badgeGroup.total_amount.add(amount);

      let catData = badgeGroup.categories.get(categoryId);
      if (!catData) {
        catData = {
          id: categoryId,
          name: cat.name,
          color: cat.color,
          icon: cat.icon,
          amount: ZERO_DECIMAL,
        };
        badgeGroup.categories.set(categoryId, catData);
      }
      catData.amount = catData.amount.add(amount);
    }
  }

  const finalCategories = [];
  for (const [badgeCode, data] of groupedByBadge) {
    const categoriesList = [];
    const totalAmount = data.total_amount;
    const isTotalZero = totalAmount.isZero();

    for (const cat of data.categories.values()) {
      categoriesList.push({
        id: cat.id,
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
        amount: cat.amount.toNumber(),
        percentage: isTotalZero
          ? 0
          : cat.amount
              .div(totalAmount)
              .mul(100)
              .toDecimalPlaces(2)
              .toNumber(),
      });
    }

    finalCategories.push({
      code: badgeCode,
      flag: data.flag,
      symbol: data.symbol,
      categories: categoriesList,
    });
  }

  return finalCategories;
};

// Benchmark
const movementsCount = 200000;
const movements = generateMovements(movementsCount);

console.log(`Benchmarking with ${movementsCount} movements...`);

// Warmup
originalAggregation(movements);
optimizedAggregation(movements);

console.time("Original");
for (let i = 0; i < 20; i++) originalAggregation(movements);
console.timeEnd("Original");

console.time("Optimized");
for (let i = 0; i < 20; i++) optimizedAggregation(movements);
console.timeEnd("Optimized");
