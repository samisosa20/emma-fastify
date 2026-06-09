import { z } from "zod";

export const ReportMovementsQuery = z.object({
  year: z.preprocess(
    (val) => (val ? Number(val) : undefined),
    z.number().int().optional()
  ),
  month: z.preprocess(
    (val) => (val ? Number(val) : undefined),
    z.number().int().min(1).max(12).optional()
  ),
  weekNumber: z.preprocess(
    (val) => (val ? Number(val) : undefined),
    z.number().int().min(1).max(53).optional()
  ),
  date: z.string().date().optional(),
  badgeId: z.string().uuid().optional(),
});

export const ReportAccountBalanceParams = z.object({
  id: z.string().uuid({ message: "Invalid account ID format" }),
});

export const ReportCategoryStatsParams = z.object({
  id: z.string().uuid({ message: "Invalid category ID format" }),
});

export const ReportBalanceHistoryQuery = z.object({
  badgeId: z.string().uuid().optional(),
  startDate: z.string().date({ message: "Invalid startDate format" }),
  endDate: z.string().date({ message: "Invalid endDate format" }),
});
