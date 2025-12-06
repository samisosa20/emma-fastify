import cron from "node-cron";
import prisma from "packages/shared/settings/prisma.client";

// Ejecutar todos los días a las 05:00 AM
cron.schedule("0 5 * * *", async () => {
  console.log("🕒 Ejecutando tarea diaria: generar movimientos automáticos...");

  try {
    // Obtener el día actual
    const today = new Date();
    const currentDay = today.getDate();

    // 1️⃣ Buscar los PlannedPayments que coinciden con la regla
    const plannedPayments = await prisma.plannedPayment.findMany({
      where: {
        specificDay: currentDay,
        OR: [{ endDate: null }, { endDate: { gte: today } }],
      },
    });

    if (!plannedPayments.length) {
      console.log("ℹ️ No hay pagos planificados para hoy.");
      return;
    }

    console.log(
      `📋 Se encontraron ${plannedPayments.length} pagos planificados.`
    );

    // 2️⃣ Mapearlos a nuevos movimientos
    const newMovements = plannedPayments.map((pp: any) => ({
      accountId: pp.accountId,
      categoryId: pp.categoryId,
      description: pp.description,
      amount: pp.amount,
      trm: 1,
      datePurchase: new Date(),
      userId: pp.userId,
      addWithdrawal: false,
    }));

    // 3️⃣ Insertar todos los movimientos
    await prisma.movement.createMany({
      data: newMovements,
    });

    console.log(
      `✅ ${newMovements.length} movimientos insertados correctamente.`
    );
  } catch (error) {
    console.error("❌ Error al insertar movimientos:", error);
  }
});
