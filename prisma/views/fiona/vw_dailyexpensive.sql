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
      `fiona`.`movement` `m`
      JOIN `fiona`.`category` `c` ON((`m`.`categoryId` = `c`.`id`))
    )
    JOIN `fiona`.`account` `a` ON((`m`.`accountId` = `a`.`id`))
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
  `category`