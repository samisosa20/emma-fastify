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
            `fiona`.`movement` `m`
            JOIN `fiona`.`category` `c` ON((`m`.`categoryId` = `c`.`id`))
          )
          JOIN `fiona`.`groupcategory` `gc` ON((`c`.`groupId` = `gc`.`id`))
        )
        JOIN `fiona`.`account` `a` ON((`m`.`accountId` = `a`.`id`))
      )
      JOIN `fiona`.`badge` `b` ON((`a`.`badgeId` = `b`.`id`))
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
            `fiona`.`movement` `m`
            JOIN `fiona`.`category` `c` ON((`m`.`categoryId` = `c`.`id`))
          )
          JOIN `fiona`.`groupcategory` `gc` ON((`c`.`groupId` = `gc`.`id`))
        )
        JOIN `fiona`.`account` `a` ON((`m`.`accountId` = `a`.`id`))
      )
      JOIN `fiona`.`badge` `b` ON((`a`.`badgeId` = `b`.`id`))
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
            `fiona`.`movement` `m`
            JOIN `fiona`.`category` `c` ON((`m`.`categoryId` = `c`.`id`))
          )
          JOIN `fiona`.`groupcategory` `gc` ON((`c`.`groupId` = `gc`.`id`))
        )
        JOIN `fiona`.`account` `a` ON((`m`.`accountId` = `a`.`id`))
      )
      JOIN `fiona`.`badge` `b` ON((`a`.`badgeId` = `b`.`id`))
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
  `unionbalance`