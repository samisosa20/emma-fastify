CREATE OR REPLACE VIEW vw_accountbalances AS
WITH `totalbalance` AS (
  SELECT
    `m`.`accountId` AS `accountId`,
    `a`.`name` AS `name`,
    `b`.`code` AS `code`,
    `b`.`flag` AS `flag`,
    `b`.`symbol` AS `symbol`,
    sum(`m`.`amount`) AS `amount`,
    `a`.`initAmount` AS `initAmount`,
    `a`.`userId` AS `userId`
  FROM
    (
      (
        (
          (
            `movement` `m`
            JOIN `category` `c` ON((`m`.`categoryId` = `c`.`id`))
          )
          JOIN `groupcategory` `gc` ON((`c`.`groupId` = `gc`.`id`))
        )
        JOIN `account` `a` ON((`m`.`accountId` = `a`.`id`))
      )
      JOIN `badge` `b` ON((`a`.`badgeId` = `b`.`id`))
    )
  WHERE
    (
      (
        (`m`.`trm` = 1)
        AND (`gc`.`name` <> 'Transferencia')
      )
      OR (
        (`m`.`trm` <> 1)
        AND (`gc`.`name` = 'Transferencia')
      )
    )
  GROUP BY
    `m`.`accountId`,
    `a`.`userId`
),
`yearlybalance` AS (
  SELECT
    `m`.`accountId` AS `accountId`,
    `a`.`name` AS `name`,
    `b`.`code` AS `code`,
    `b`.`flag` AS `flag`,
    `b`.`symbol` AS `symbol`,
    sum(`m`.`amount`) AS `amount`,
    IF(
      (year(`a`.`createdAt`) = year(curdate())),
      `a`.`initAmount`,
      0
    ) AS `initAmount`,
    `a`.`userId` AS `userId`
  FROM
    (
      (
        (
          (
            `movement` `m`
            JOIN `category` `c` ON((`m`.`categoryId` = `c`.`id`))
          )
          JOIN `groupcategory` `gc` ON((`c`.`groupId` = `gc`.`id`))
        )
        JOIN `account` `a` ON((`m`.`accountId` = `a`.`id`))
      )
      JOIN `badge` `b` ON((`a`.`badgeId` = `b`.`id`))
    )
  WHERE
    (
      (year(`m`.`datePurchase`) = year(curdate()))
      AND (
        (
          (`m`.`trm` = 1)
          AND (`gc`.`name` <> 'Transferencia')
        )
        OR (
          (`m`.`trm` <> 1)
          AND (`gc`.`name` = 'Transferencia')
        )
      )
    )
  GROUP BY
    `m`.`accountId`,
    `a`.`userId`
),
`monthlybalance` AS (
  SELECT
    `m`.`accountId` AS `accountId`,
    `a`.`name` AS `name`,
    `b`.`code` AS `code`,
    `b`.`flag` AS `flag`,
    `b`.`symbol` AS `symbol`,
    sum(`m`.`amount`) AS `amount`,
    IF(
      (
        (year(`a`.`createdAt`) = year(curdate()))
        AND (MONTH(`a`.`createdAt`) = MONTH(curdate()))
      ),
      `a`.`initAmount`,
      0
    ) AS `initAmount`,
    `a`.`userId` AS `userId`
  FROM
    (
      (
        (
          (
            `movement` `m`
            JOIN `category` `c` ON((`m`.`categoryId` = `c`.`id`))
          )
          JOIN `groupcategory` `gc` ON((`c`.`groupId` = `gc`.`id`))
        )
        JOIN `account` `a` ON((`m`.`accountId` = `a`.`id`))
      )
      JOIN `badge` `b` ON((`a`.`badgeId` = `b`.`id`))
    )
  WHERE
    (
      (MONTH(`m`.`datePurchase`) = MONTH(curdate()))
      AND (year(`m`.`datePurchase`) = year(curdate()))
      AND (
        (
          (`m`.`trm` = 1)
          AND (`gc`.`name` <> 'Transferencia')
        )
        OR (
          (`m`.`trm` <> 1)
          AND (`gc`.`name` = 'Transferencia')
        )
      )
    )
  GROUP BY
    `m`.`accountId`,
    `a`.`userId`
),
`unionbalance` AS (
  SELECT
    `tb`.`userId` AS `userId`,
    `tb`.`accountId` AS `accountId`,
    `tb`.`name` AS `name`,
    `tb`.`code` AS `code`,
    `tb`.`flag` AS `flag`,
    `tb`.`symbol` AS `symbol`,
(`tb`.`amount` + `tb`.`initAmount`) AS `totalAmount`,
    IFNULL((`yb`.`amount` + `yb`.`initAmount`), 0) AS `yearlyAmount`,
    IFNULL((`mb`.`amount` + `mb`.`initAmount`), 0) AS `monthlyAmount`
  FROM
    (
      (
        `totalbalance` `tb`
        LEFT JOIN `yearlybalance` `yb` ON((`tb`.`accountId` = `yb`.`accountId`))
      )
      LEFT JOIN `monthlybalance` `mb` ON((`tb`.`accountId` = `mb`.`accountId`))
    )
)
SELECT
  `unionbalance`.`userId` AS `userId`,
  `unionbalance`.`accountId` AS `accountId`,
  `unionbalance`.`name` AS `name`,
  `unionbalance`.`code` AS `code`,
  `unionbalance`.`flag` AS `flag`,
  `unionbalance`.`symbol` AS `symbol`,
  `unionbalance`.`totalAmount` AS `totalAmount`,
  `unionbalance`.`yearlyAmount` AS `yearlyAmount`,
  `unionbalance`.`monthlyAmount` AS `monthlyAmount`
FROM
  `unionbalance`;


CREATE OR REPLACE VIEW vw_dailyexpensive AS
SELECT
  `c`.`name` AS `category`,
  `c`.`icon` AS `icon`,
  `c`.`color` AS `color`,
  sum(`m`.`amount`) AS `amount`,
  cast(`m`.`datePurchase` AS date) AS `datePurchase`,
  `a`.`badgeId` AS `badgeId`,
  `m`.`userId` AS `userId`
FROM
  (
    (
      `movement` `m`
      JOIN `category` `c` ON((`m`.`categoryId` = `c`.`id`))
    )
    JOIN `account` `a` ON((`m`.`accountId` = `a`.`id`))
  )
WHERE
  (`m`.`amount` < 0)
GROUP BY
  `c`.`name`,
  `c`.`icon`,
  `c`.`color`,
  cast(`m`.`datePurchase` AS date),
  `a`.`badgeId`,
  `m`.`userId`
ORDER BY
  `datePurchase` DESC,
  `category`;

CREATE OR REPLACE VIEW vw_dailyincome AS
SELECT
  `c`.`name` AS `category`,
  `c`.`icon` AS `icon`,
  `c`.`color` AS `color`,
  sum(`m`.`amount`) AS `amount`,
  cast(`m`.`datePurchase` AS date) AS `datePurchase`,
  `a`.`badgeId` AS `badgeId`,
  `m`.`userId` AS `userId`
FROM
  (
    (
      `movement` `m`
      JOIN `category` `c` ON((`m`.`categoryId` = `c`.`id`))
    )
    JOIN `account` `a` ON((`m`.`accountId` = `a`.`id`))
  )
WHERE
  (`m`.`amount` > 0)
GROUP BY
  `c`.`name`,
  `c`.`icon`,
  `c`.`color`,
  cast(`m`.`datePurchase` AS date),
  `a`.`badgeId`,
  `m`.`userId`
ORDER BY
  `datePurchase` DESC,
  `category`;

CREATE OR REPLACE VIEW vw_genneralbalances AS
WITH `totalbalance` AS (
  SELECT
    `a`.`badgeId` AS `badgeId`,
    `b`.`code` AS `code`,
    `b`.`flag` AS `flag`,
    `b`.`symbol` AS `symbol`,
    sum(`m`.`amount`) AS `amount`,
    `m`.`userId` AS `userId`
  FROM
    (
      (
        (
          (
            `movement` `m`
            JOIN `category` `c` ON((`m`.`categoryId` = `c`.`id`))
          )
          JOIN `groupcategory` `gc` ON((`c`.`groupId` = `gc`.`id`))
        )
        JOIN `account` `a` ON((`m`.`accountId` = `a`.`id`))
      )
      JOIN `badge` `b` ON((`a`.`badgeId` = `b`.`id`))
    )
  GROUP BY
    `a`.`badgeId`,
    `m`.`userId`
),
`initamount` AS (
  SELECT
    `a`.`badgeId` AS `badgeId`,
    `b`.`code` AS `code`,
    `b`.`flag` AS `flag`,
    `b`.`symbol` AS `symbol`,
    sum(`a`.`initAmount`) AS `amount`,
    `a`.`userId` AS `userId`
  FROM
    (
      `account` `a`
      JOIN `badge` `b` ON((`a`.`badgeId` = `b`.`id`))
    )
  GROUP BY
    `a`.`badgeId`,
    `a`.`userId`
),
`unionbalance` AS (
  SELECT
    `ia`.`badgeId` AS `badgeId`,
    `ia`.`code` AS `code`,
    `ia`.`flag` AS `flag`,
    `ia`.`symbol` AS `symbol`,
(`ia`.`amount` + `tb`.`amount`) AS `amount`,
    `ia`.`userId` AS `userId`
  FROM
    (
      `initamount` `ia`
      LEFT JOIN `totalbalance` `tb` ON(
        (
          (`tb`.`badgeId` = `ia`.`badgeId`)
          AND (`tb`.`userId` = `ia`.`userId`)
        )
      )
    )
)
SELECT
  `unionbalance`.`badgeId` AS `badgeId`,
  `unionbalance`.`code` AS `code`,
  `unionbalance`.`flag` AS `flag`,
  `unionbalance`.`symbol` AS `symbol`,
  `unionbalance`.`amount` AS `amount`,
  `unionbalance`.`userId` AS `userId`
FROM
  `unionbalance`;

CREATE OR REPLACE VIEW vw_heritagebyyear AS
WITH `summovements` AS (
  SELECT
    year(`m`.`datePurchase`) AS `year`,
    `a`.`badgeId` AS `badgeId`,
    sum(`m`.`amount`) AS `amount`,
    `m`.`userId` AS `userId`
  FROM
    (
      `movement` `m`
      JOIN `account` `a` ON((`m`.`accountId` = `a`.`id`))
    )
  GROUP BY
    year(`m`.`datePurchase`),
    `a`.`badgeId`,
    `m`.`userId`
  ORDER BY
    `year` DESC
),
`initamount` AS (
  SELECT
    year(`a`.`createdAt`) AS `year`,
    `a`.`badgeId` AS `badgeId`,
    sum(`a`.`initAmount`) AS `amount`,
    `a`.`userId` AS `userId`
  FROM
    `account` `a`
  GROUP BY
    year(`a`.`createdAt`),
    `a`.`badgeId`,
    `a`.`userId`
),
`unionbalance` AS (
  SELECT
    `ia`.`year` AS `year`,
    `ia`.`badgeId` AS `badgeId`,
(`ia`.`amount` + `tb`.`amount`) AS `amount`,
    `ia`.`userId` AS `userId`
  FROM
    (
      `initamount` `ia`
      LEFT JOIN `summovements` `tb` ON(
        (
          (`tb`.`badgeId` = `ia`.`badgeId`)
          AND (`tb`.`userId` = `ia`.`userId`)
          AND (`ia`.`year` = `tb`.`year`)
        )
      )
    )
),
`sumheritage` AS (
  SELECT
    `heritage`.`year` AS `year`,
    `heritage`.`badgeId` AS `badgeId`,
    sum(`heritage`.`comercialAmount`) AS `amount`,
    `heritage`.`userId` AS `userId`
  FROM
    `heritage`
  GROUP BY
    `heritage`.`year`,
    `heritage`.`badgeId`,
    `heritage`.`userId`
),
`suminvestment` AS (
  SELECT
    year(`ia`.`dateAppreciation`) AS `year`,
    `i`.`badgeId` AS `badgeId`,
    sum(`ia`.`amount`) AS `amount`,
    `i`.`userId` AS `userId`
  FROM
    (
      `investmentappreciation` `ia`
      JOIN `investment` `i` ON((`i`.`id` = `ia`.`investmentId`))
    )
  GROUP BY
    year(`ia`.`dateAppreciation`),
    `i`.`badgeId`,
    `i`.`userId`
),
`unionheritage` AS (
  SELECT
    `unionbalance`.`year` AS `year`,
    `unionbalance`.`badgeId` AS `badgeId`,
    `unionbalance`.`amount` AS `amount`,
    `unionbalance`.`userId` AS `userId`
  FROM
    `unionbalance`
  UNION
  ALL
  SELECT
    `sumheritage`.`year` AS `year`,
    `sumheritage`.`badgeId` AS `badgeId`,
    `sumheritage`.`amount` AS `amount`,
    `sumheritage`.`userId` AS `userId`
  FROM
    `sumheritage`
),
`sumunion` AS (
  SELECT
    `unionheritage`.`year` AS `year`,
    `unionheritage`.`badgeId` AS `badgeId`,
    sum(`unionheritage`.`amount`) AS `amount`,
    `unionheritage`.`userId` AS `userId`
  FROM
    `unionheritage`
  GROUP BY
    `unionheritage`.`year`,
    `unionheritage`.`badgeId`,
    `unionheritage`.`userId`
),
`addinvestment` AS (
  SELECT
    `su`.`year` AS `year`,
    `b`.`code` AS `code`,
    `b`.`flag` AS `flag`,
    `b`.`symbol` AS `symbol`,
(
      IFNULL(`su`.`amount`, 0) + IFNULL(`si`.`amount`, 0)
    ) AS `amount`,
    `su`.`userId` AS `userId`
  FROM
    (
      (
        `sumunion` `su`
        LEFT JOIN `suminvestment` `si` ON(
          (
            (`su`.`year` = `si`.`year`)
            AND (`su`.`badgeId` = `si`.`badgeId`)
            AND (`si`.`userId` = `su`.`userId`)
          )
        )
      )
      JOIN `badge` `b` ON((`su`.`badgeId` = `b`.`id`))
    )
  ORDER BY
    `su`.`year` DESC,
    `su`.`userId`,
    `b`.`code`
)
SELECT
  `addinvestment`.`year` AS `year`,
  `addinvestment`.`code` AS `code`,
  `addinvestment`.`flag` AS `flag`,
  `addinvestment`.`symbol` AS `symbol`,
  `addinvestment`.`amount` AS `amount`,
  `addinvestment`.`userId` AS `userId`
FROM
  `addinvestment`;


CREATE OR REPLACE VIEW vw_historybalance AS
WITH `initialbalance` AS (
  SELECT
    `a`.`badgeId` AS `badgeId`,
    `b`.`code` AS `code`,
    `b`.`flag` AS `flag`,
    `b`.`symbol` AS `symbol`,
    cast(`a`.`createdAt` AS date) AS `date`,
    `a`.`initAmount` AS `dailyAmount`,
    `a`.`userId` AS `userId`
  FROM
    (
      `account` `a`
      JOIN `badge` `b` ON((`a`.`badgeId` = `b`.`id`))
    )
),
`dailytransactions` AS (
  SELECT
    `a`.`badgeId` AS `badgeId`,
    `b`.`code` AS `code`,
    `b`.`flag` AS `flag`,
    `b`.`symbol` AS `symbol`,
    cast(`m`.`datePurchase` AS date) AS `date`,
    sum(`m`.`amount`) AS `dailyAmount`,
    `a`.`userId` AS `userId`
  FROM
    (
      (
        `movement` `m`
        JOIN `account` `a` ON((`m`.`accountId` = `a`.`id`))
      )
      JOIN `badge` `b` ON((`a`.`badgeId` = `b`.`id`))
    )
  GROUP BY
    `a`.`badgeId`,
    `b`.`code`,
    `b`.`flag`,
    `b`.`symbol`,
    cast(`m`.`datePurchase` AS date),
    `a`.`userId`
),
`alltransactions` AS (
  SELECT
    `initialbalance`.`badgeId` AS `badgeId`,
    `initialbalance`.`code` AS `code`,
    `initialbalance`.`flag` AS `flag`,
    `initialbalance`.`symbol` AS `symbol`,
    `initialbalance`.`date` AS `date`,
    `initialbalance`.`dailyAmount` AS `dailyAmount`,
    `initialbalance`.`userId` AS `userId`
  FROM
    `initialbalance`
  UNION
  ALL
  SELECT
    `dailytransactions`.`badgeId` AS `badgeId`,
    `dailytransactions`.`code` AS `code`,
    `dailytransactions`.`flag` AS `flag`,
    `dailytransactions`.`symbol` AS `symbol`,
    `dailytransactions`.`date` AS `date`,
    `dailytransactions`.`dailyAmount` AS `dailyAmount`,
    `dailytransactions`.`userId` AS `userId`
  FROM
    `dailytransactions`
)
SELECT
  `alltransactions`.`badgeId` AS `badgeId`,
  `alltransactions`.`code` AS `code`,
  `alltransactions`.`flag` AS `flag`,
  `alltransactions`.`symbol` AS `symbol`,
  `alltransactions`.`date` AS `date`,
  `alltransactions`.`dailyAmount` AS `dailyAmount`,
  `alltransactions`.`userId` AS `userId`,
  sum(`alltransactions`.`dailyAmount`) OVER (
    PARTITION BY `alltransactions`.`code`,
    `alltransactions`.`userId`
    ORDER BY
      `alltransactions`.`date`
  ) AS `cumulativeBalance`
FROM
  `alltransactions`
ORDER BY
  `alltransactions`.`code`,
  `alltransactions`.`date` DESC;

CREATE OR REPLACE VIEW vw_monthlycategorystats AS
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
          `movement` `m`
          JOIN `category` `c` ON((`m`.`categoryId` = `c`.`id`))
        )
        JOIN `account` `a` ON((`m`.`accountId` = `a`.`id`))
      )
      JOIN `badge` `b` ON((`a`.`badgeId` = `b`.`id`))
    )
  GROUP BY
    `m`.`userId`,
    `c`.`id`,
    `c`.`name`,
    `b`.`code`,
    `b`.`flag`,
    `b`.`symbol`,
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
  `ms`.`code`,
  `ms`.`flag`,
  `ms`.`symbol`;

CREATE OR REPLACE VIEW vw_monthlyexpensive AS
SELECT
  `c`.`name` AS `category`,
  `c`.`icon` AS `icon`,
  `c`.`color` AS `color`,
  sum(`m`.`amount`) AS `amount`,
  year(`m`.`datePurchase`) AS `year`,
  MONTH(`m`.`datePurchase`) AS `month`,
  `a`.`badgeId` AS `badgeId`,
  `m`.`userId` AS `userId`
FROM
  (
    (
      `movement` `m`
      JOIN `category` `c` ON((`m`.`categoryId` = `c`.`id`))
    )
    JOIN `account` `a` ON((`m`.`accountId` = `a`.`id`))
  )
WHERE
  (`m`.`amount` < 0)
GROUP BY
  `c`.`name`,
  `c`.`icon`,
  `c`.`color`,
  year(`m`.`datePurchase`),
  MONTH(`m`.`datePurchase`),
  `a`.`badgeId`,
  `m`.`userId`
ORDER BY
  `year` DESC,
  `month` DESC,
  `category`;

CREATE OR REPLACE VIEW vw_monthlyincome AS
SELECT
  `c`.`name` AS `category`,
  `c`.`icon` AS `icon`,
  `c`.`color` AS `color`,
  sum(`m`.`amount`) AS `amount`,
  year(`m`.`datePurchase`) AS `year`,
  MONTH(`m`.`datePurchase`) AS `month`,
  `a`.`badgeId` AS `badgeId`,
  `m`.`userId` AS `userId`
FROM
  (
    (
      `movement` `m`
      JOIN `category` `c` ON((`m`.`categoryId` = `c`.`id`))
    )
    JOIN `account` `a` ON((`m`.`accountId` = `a`.`id`))
  )
WHERE
  (`m`.`amount` > 0)
GROUP BY
  `c`.`name`,
  `c`.`icon`,
  `c`.`color`,
  year(`m`.`datePurchase`),
  MONTH(`m`.`datePurchase`),
  `a`.`badgeId`,
  `m`.`userId`
ORDER BY
  `year` DESC,
  `month` DESC,
  `category`;

CREATE OR REPLACE VIEW vw_weeklyexpensive AS
SELECT
  `c`.`name` AS `category`,
  `c`.`icon` AS `icon`,
  `c`.`color` AS `color`,
  sum(`m`.`amount`) AS `amount`,
  year(`m`.`datePurchase`) AS `year`,
  week(`m`.`datePurchase`, 1) AS `weekNumber`,
  `a`.`badgeId` AS `badgeId`,
  `m`.`userId` AS `userId`
FROM
  (
    (
      `movement` `m`
      JOIN `category` `c` ON((`m`.`categoryId` = `c`.`id`))
    )
    JOIN `account` `a` ON((`m`.`accountId` = `a`.`id`))
  )
WHERE
  (`m`.`amount` < 0)
GROUP BY
  `c`.`name`,
  `c`.`icon`,
  `c`.`color`,
  year(`m`.`datePurchase`),
  week(`m`.`datePurchase`, 1),
  `a`.`badgeId`,
  `m`.`userId`
ORDER BY
  `year` DESC,
  `weekNumber` DESC,
  `category`;

CREATE OR REPLACE VIEW vw_weeklyincome AS
SELECT
  `c`.`name` AS `category`,
  `c`.`icon` AS `icon`,
  `c`.`color` AS `color`,
  sum(`m`.`amount`) AS `amount`,
  year(`m`.`datePurchase`) AS `year`,
  week(`m`.`datePurchase`, 1) AS `weekNumber`,
  `a`.`badgeId` AS `badgeId`,
  `m`.`userId` AS `userId`
FROM
  (
    (
      `movement` `m`
      JOIN `category` `c` ON((`m`.`categoryId` = `c`.`id`))
    )
    JOIN `account` `a` ON((`m`.`accountId` = `a`.`id`))
  )
WHERE
  (`m`.`amount` > 0)
GROUP BY
  `c`.`name`,
  `c`.`icon`,
  `c`.`color`,
  year(`m`.`datePurchase`),
  week(`m`.`datePurchase`, 1),
  `a`.`badgeId`,
  `m`.`userId`
ORDER BY
  `year` DESC,
  `weekNumber` DESC,
  `category`;

CREATE OR REPLACE VIEW vw_yearlyexpensive AS
SELECT
  `c`.`name` AS `category`,
  `c`.`icon` AS `icon`,
  `c`.`color` AS `color`,
  sum(`m`.`amount`) AS `amount`,
  year(`m`.`datePurchase`) AS `year`,
  `a`.`badgeId` AS `badgeId`,
  `m`.`userId` AS `userId`
FROM
  (
    (
      `movement` `m`
      JOIN `category` `c` ON((`m`.`categoryId` = `c`.`id`))
    )
    JOIN `account` `a` ON((`m`.`accountId` = `a`.`id`))
  )
WHERE
  (`m`.`amount` < 0)
GROUP BY
  `c`.`name`,
  `c`.`icon`,
  `c`.`color`,
  year(`m`.`datePurchase`),
  `a`.`badgeId`,
  `m`.`userId`
ORDER BY
  `year` DESC,
  `category`;

CREATE OR REPLACE VIEW vw_yearlyincome AS
SELECT
  `c`.`name` AS `category`,
  `c`.`icon` AS `icon`,
  `c`.`color` AS `color`,
  sum(`m`.`amount`) AS `amount`,
  year(`m`.`datePurchase`) AS `year`,
  `a`.`badgeId` AS `badgeId`,
  `m`.`userId` AS `userId`
FROM
  (
    (
      `movement` `m`
      JOIN `category` `c` ON((`m`.`categoryId` = `c`.`id`))
    )
    JOIN `account` `a` ON((`m`.`accountId` = `a`.`id`))
  )
WHERE
  (`m`.`amount` > 0)
GROUP BY
  `c`.`name`,
  `c`.`icon`,
  `c`.`color`,
  year(`m`.`datePurchase`),
  `a`.`badgeId`,
  `m`.`userId`
ORDER BY
  `year` DESC,
  `category`;