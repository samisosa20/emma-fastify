WITH `summovements` AS (
  SELECT
    year(`m`.`datePurchase`) AS `year`,
    `a`.`badgeId` AS `badgeId`,
    sum(`m`.`amount`) AS `amount`,
    `m`.`userId` AS `userId`
  FROM
    (
      `fiona`.`movement` `m`
      JOIN `fiona`.`account` `a` ON((`m`.`accountId` = `a`.`id`))
    )
  GROUP BY
    year(`m`.`datePurchase`),
    `a`.`badgeId`,
    `m`.`userId`
  ORDER BY
    `year` DESC
),
`sumheritage` AS (
  SELECT
    `fiona`.`heritage`.`year` AS `year`,
    `fiona`.`heritage`.`badgeId` AS `badgeId`,
    sum(`fiona`.`heritage`.`comercialAmount`) AS `amount`,
    `fiona`.`heritage`.`userId` AS `userId`
  FROM
    `fiona`.`heritage`
  GROUP BY
    `fiona`.`heritage`.`year`,
    `fiona`.`heritage`.`badgeId`,
    `fiona`.`heritage`.`userId`
),
`suminvestment` AS (
  SELECT
    year(`ia`.`dateAppreciation`) AS `year`,
    `i`.`badgeId` AS `badgeId`,
    sum(`ia`.`amount`) AS `amount`,
    `i`.`userId` AS `userId`
  FROM
    (
      `fiona`.`investmentappreciation` `ia`
      JOIN `fiona`.`investment` `i` ON((`i`.`id` = `ia`.`investmentId`))
    )
  GROUP BY
    year(`ia`.`dateAppreciation`),
    `i`.`badgeId`,
    `i`.`userId`
),
`unionheritage` AS (
  SELECT
    `summovements`.`year` AS `year`,
    `summovements`.`badgeId` AS `badgeId`,
    `summovements`.`amount` AS `amount`,
    `summovements`.`userId` AS `userId`
  FROM
    `summovements`
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
      JOIN `fiona`.`badge` `b` ON((`su`.`badgeId` = `b`.`id`))
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
  `addinvestment`