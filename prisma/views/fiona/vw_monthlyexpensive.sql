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
  year(`m`.`datePurchase`),
  MONTH(`m`.`datePurchase`),
  `a`.`badgeId`,
  `m`.`userId`
ORDER BY
  `year` DESC,
  `month` DESC,
  `category`