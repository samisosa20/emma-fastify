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
      `fiona`.`account` `a`
      JOIN `fiona`.`badge` `b` ON((`a`.`badgeId` = `b`.`id`))
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
        `fiona`.`movement` `m`
        JOIN `fiona`.`account` `a` ON((`m`.`accountId` = `a`.`id`))
      )
      JOIN `fiona`.`badge` `b` ON((`a`.`badgeId` = `b`.`id`))
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
  `alltransactions`.`date` DESC