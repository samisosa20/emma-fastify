WITH `monthlystats` AS (
  SELECT
    `m`.`userId` AS `userId`,
    `c`.`id` AS `categoryId`,
    `c`.`name` AS `categoryName`,
    `b`.`code` AS `code`,
    `b`.`flag` AS `flag`,
    `b`.`symbol` AS `symbol`,
    date_format(`m`.`datePurchase`, '%Y-%m') AS `month`,
    sum(
      (
        CASE
          WHEN (`m`.`amount` > 0) THEN `m`.`amount`
          ELSE 0
        END
      )
    ) AS `totalIncome`,
    sum(
      (
        CASE
          WHEN (`m`.`amount` < 0) THEN abs(`m`.`amount`)
          ELSE 0
        END
      )
    ) AS `totalExpense`
  FROM
    (
      (
        (
          `fiona`.`movement` `m`
          JOIN `fiona`.`category` `c` ON((`m`.`categoryId` = `c`.`id`))
        )
        JOIN `fiona`.`account` `a` ON((`m`.`accountId` = `a`.`id`))
      )
      JOIN `fiona`.`badge` `b` ON((`a`.`badgeId` = `b`.`id`))
    )
  GROUP BY
    `m`.`userId`,
    `c`.`id`,
    `c`.`name`,
    `b`.`code`,
    `month`
)
SELECT
  `ms`.`userId` AS `userId`,
  `ms`.`categoryId` AS `categoryId`,
  `ms`.`categoryName` AS `categoryName`,
  `ms`.`code` AS `code`,
  `ms`.`flag` AS `flag`,
  `ms`.`symbol` AS `symbol`,
  avg(`ms`.`totalIncome`) AS `avgMonthlyIncome`,
(
    avg(`ms`.`totalIncome`) - std(`ms`.`totalIncome`)
  ) AS `incomeLowerLimit`,
(
    avg(`ms`.`totalIncome`) + std(`ms`.`totalIncome`)
  ) AS `incomeUpperLimit`,
  avg(`ms`.`totalExpense`) AS `avgMonthlyExpense`,
(
    avg(`ms`.`totalExpense`) - std(`ms`.`totalExpense`)
  ) AS `expenseLowerLimit`,
(
    avg(`ms`.`totalExpense`) + std(`ms`.`totalExpense`)
  ) AS `expenseUpperLimit`
FROM
  `monthlystats` `ms`
GROUP BY
  `ms`.`userId`,
  `ms`.`categoryId`,
  `ms`.`categoryName`,
  `ms`.`code`