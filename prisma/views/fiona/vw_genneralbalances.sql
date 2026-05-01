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
            `fiona`.`movement` `m`
            JOIN `fiona`.`category` `c` ON((`m`.`categoryId` = `c`.`id`))
          )
          JOIN `fiona`.`groupcategory` `gc` ON((`c`.`groupId` = `gc`.`id`))
        )
        JOIN `fiona`.`account` `a` ON((`m`.`accountId` = `a`.`id`))
      )
      JOIN `fiona`.`badge` `b` ON((`a`.`badgeId` = `b`.`id`))
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
      `fiona`.`account` `a`
      JOIN `fiona`.`badge` `b` ON((`a`.`badgeId` = `b`.`id`))
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
  `unionbalance`