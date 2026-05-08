import { BudgetPrismaRepository } from "../packages/budget/infrastructure/budget.repository";
import prisma from "../packages/shared/settings/prisma.client";

async function verifyIdorProtection() {
  console.log("--- Verifying IDOR Protection for Budgets ---");

  const repository = new BudgetPrismaRepository();

  // 1. Create a dummy user
  const user1 = await prisma.user.create({
    data: {
      name: "User One",
      email: "user1@example.com",
      password: "Password123!",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: "User Two",
      email: "user2@example.com",
      password: "Password123!",
    },
  });

  // Create necessary relations
  const period = await prisma.period.create({ data: { name: "Monthly" } });
  const badge = await prisma.badge.create({ data: { name: "USD", code: "USD" } });
  const group = await prisma.groupCategory.create({ data: { name: "Group" } });
  const category = await prisma.category.create({
    data: {
      name: "Category",
      description: "Desc",
      groupId: group.id,
      userId: user1.id,
    },
  });

  // 2. User 1 creates a budget
  const budget = await prisma.budget.create({
    data: {
      amount: 100,
      year: 2024,
      periodId: period.id,
      badgeId: badge.id,
      categoryId: category.id,
      userId: user1.id,
    },
  });

  console.log(`Created budget ${budget.id} for User 1`);

  // 3. User 2 tries to access User 1's budget
  const detailResult = await repository.detailBudget(budget.id, user2.id);
  console.log("User 2 detail access test:", detailResult === null ? "PASSED (Access Denied)" : "FAILED (Access Granted)");

  // 4. User 2 tries to update User 1's budget
  try {
    await repository.updateBudget(budget.id, { amount: 200 }, user2.id);
    console.log("User 2 update test: FAILED (Access Granted)");
  } catch (error: any) {
    console.log("User 2 update test:", error.statusCode === 404 ? "PASSED (Access Denied)" : `FAILED (Unexpected error: ${error.message})`);
  }

  // 5. User 2 tries to delete User 1's budget
  const deleteResult = await repository.deleteBudget(budget.id, user2.id);
  console.log("User 2 delete test:", deleteResult === null ? "PASSED (Access Denied)" : "FAILED (Access Granted)");

  // 6. User 1 tries to access their own budget
  const ownDetailResult = await repository.detailBudget(budget.id, user1.id);
  console.log("User 1 detail access test:", ownDetailResult !== null ? "PASSED (Access Granted)" : "FAILED (Access Denied)");

  // Clean up
  await prisma.budget.deleteMany({ where: { userId: { in: [user1.id, user2.id] } } });
  await prisma.category.deleteMany({ where: { userId: user1.id } });
  await prisma.user.deleteMany({ where: { id: { in: [user1.id, user2.id] } } });
  await prisma.groupCategory.delete({ where: { id: group.id } });
  await prisma.period.delete({ where: { id: period.id } });
  await prisma.badge.delete({ where: { id: badge.id } });

  process.exit(0);
}

verifyIdorProtection().catch((error) => {
  console.error("Verification failed:", error);
  process.exit(1);
});
