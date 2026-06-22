-- Alter report views to include categoryId

-- CreateOrReplace vw_dailyexpensive
CREATE OR REPLACE VIEW vw_dailyexpensive AS
SELECT
  `c`.`id` AS `categoryId`,
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
      `Movement` `m`
      JOIN `Category` `c` ON((`m`.`categoryId` = `c`.`id`))
    )
    JOIN `Account` `a` ON((`m`.`accountId` = `a`.`id`))
  )
WHERE
  (`m`.`amount` < 0)
GROUP BY
  `c`.`id`,
  `c`.`name`,
  `c`.`icon`,
  `c`.`color`,
  cast(`m`.`datePurchase` AS date),
  `a`.`badgeId`,
  `m`.`userId`
ORDER BY
  `datePurchase` DESC,
  `category`;

-- CreateOrReplace vw_dailyincome
CREATE OR REPLACE VIEW vw_dailyincome AS
SELECT
  `c`.`id` AS `categoryId`,
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
      `Movement` `m`
      JOIN `Category` `c` ON((`m`.`categoryId` = `c`.`id`))
    )
    JOIN `Account` `a` ON((`m`.`accountId` = `a`.`id`))
  )
WHERE
  (`m`.`amount` > 0)
GROUP BY
  `c`.`id`,
  `c`.`name`,
  `c`.`icon`,
  `c`.`color`,
  cast(`m`.`datePurchase` AS date),
  `a`.`badgeId`,
  `m`.`userId`
ORDER BY
  `datePurchase` DESC,
  `category`;

-- CreateOrReplace vw_monthlyexpensive
CREATE OR REPLACE VIEW vw_monthlyexpensive AS
SELECT
  `c`.`id` AS `categoryId`,
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
      `Movement` `m`
      JOIN `Category` `c` ON((`m`.`categoryId` = `c`.`id`))
    )
    JOIN `Account` `a` ON((`m`.`accountId` = `a`.`id`))
  )
WHERE
  (`m`.`amount` < 0)
GROUP BY
  `c`.`id`,
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

-- CreateOrReplace vw_monthlyincome
CREATE OR REPLACE VIEW vw_monthlyincome AS
SELECT
  `c`.`id` AS `categoryId`,
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
      `Movement` `m`
      JOIN `Category` `c` ON((`m`.`categoryId` = `c`.`id`))
    )
    JOIN `Account` `a` ON((`m`.`accountId` = `a`.`id`))
  )
WHERE
  (`m`.`amount` > 0)
GROUP BY
  `c`.`id`,
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

-- CreateOrReplace vw_weeklyexpensive
CREATE OR REPLACE VIEW vw_weeklyexpensive AS
SELECT
  `c`.`id` AS `categoryId`,
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
      `Movement` `m`
      JOIN `Category` `c` ON((`m`.`categoryId` = `c`.`id`))
    )
    JOIN `Account` `a` ON((`m`.`accountId` = `a`.`id`))
  )
WHERE
  (`m`.`amount` < 0)
GROUP BY
  `c`.`id`,
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

-- CreateOrReplace vw_weeklyincome
CREATE OR REPLACE VIEW vw_weeklyincome AS
SELECT
  `c`.`id` AS `categoryId`,
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
      `Movement` `m`
      JOIN `Category` `c` ON((`m`.`categoryId` = `c`.`id`))
    )
    JOIN `Account` `a` ON((`m`.`accountId` = `a`.`id`))
  )
WHERE
  (`m`.`amount` > 0)
GROUP BY
  `c`.`id`,
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

-- CreateOrReplace vw_yearlyexpensive
CREATE OR REPLACE VIEW vw_yearlyexpensive AS
SELECT
  `c`.`id` AS `categoryId`,
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
      `Movement` `m`
      JOIN `Category` `c` ON((`m`.`categoryId` = `c`.`id`))
    )
    JOIN `Account` `a` ON((`m`.`accountId` = `a`.`id`))
  )
WHERE
  (`m`.`amount` < 0)
GROUP BY
  `c`.`id`,
  `c`.`name`,
  `c`.`icon`,
  `c`.`color`,
  year(`m`.`datePurchase`),
  `a`.`badgeId`,
  `m`.`userId`
ORDER BY
  `year` DESC,
  `category`;

-- CreateOrReplace vw_yearlyincome
CREATE OR REPLACE VIEW vw_yearlyincome AS
SELECT
  `c`.`id` AS `categoryId`,
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
      `Movement` `m`
      JOIN `Category` `c` ON((`m`.`categoryId` = `c`.`id`))
    )
    JOIN `Account` `a` ON((`m`.`accountId` = `a`.`id`))
  )
WHERE
  (`m`.`amount` > 0)
GROUP BY
  `c`.`id`,
  `c`.`name`,
  `c`.`icon`,
  `c`.`color`,
  year(`m`.`datePurchase`),
  `a`.`badgeId`,
  `m`.`userId`
ORDER BY
  `year` DESC,
  `category`;