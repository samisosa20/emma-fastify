CREATE OR REPLACE  VIEW `vw_accountbalances` AS
with `totalbalance` as (
select
    `m`.`accountId` AS `accountId`,
    `a`.`name` AS `name`,
    `b`.`code` AS `code`,
    `b`.`flag` AS `flag`,
    `b`.`symbol` AS `symbol`,
    sum(`m`.`amount`) AS `amount`,
    `a`.`initAmount` AS `initAmount`,
    `a`.`userId` AS `userId`
from
    ((((`movement` `m`
join `category` `c` on
    ((`m`.`categoryId` = `c`.`id`)))
join `groupcategory` `gc` on
    ((`c`.`groupId` = `gc`.`id`)))
join `account` `a` on
    ((`m`.`accountId` = `a`.`id`)))
join `badge` `b` on
    ((`a`.`badgeId` = `b`.`id`)))
group by
    `m`.`accountId`,
    `a`.`userId`),
`yearlybalance` as (
select
    `m`.`accountId` AS `accountId`,
    `a`.`name` AS `name`,
    `b`.`code` AS `code`,
    `b`.`flag` AS `flag`,
    `b`.`symbol` AS `symbol`,
    sum(`m`.`amount`) AS `amount`,
    if((year(`a`.`createdAt`) = year(curdate())), `a`.`initAmount`, 0) AS `initAmount`,
    `a`.`userId` AS `userId`
from
    ((((`movement` `m`
join `category` `c` on
    ((`m`.`categoryId` = `c`.`id`)))
join `groupcategory` `gc` on
    ((`c`.`groupId` = `gc`.`id`)))
join `account` `a` on
    ((`m`.`accountId` = `a`.`id`)))
join `badge` `b` on
    ((`a`.`badgeId` = `b`.`id`)))
where
    ((year(`m`.`datePurchase`) = year(curdate())))
group by
    `m`.`accountId`,
    `a`.`userId`),
`monthlybalance` as (
select
    `m`.`accountId` AS `accountId`,
    `a`.`name` AS `name`,
    `b`.`code` AS `code`,
    `b`.`flag` AS `flag`,
    `b`.`symbol` AS `symbol`,
    sum(`m`.`amount`) AS `amount`,
    if(((year(`a`.`createdAt`) = year(curdate())) and (month(`a`.`createdAt`) = month(curdate()))), `a`.`initAmount`, 0) AS `initAmount`,
    `a`.`userId` AS `userId`
from
    ((((`movement` `m`
join `category` `c` on
    ((`m`.`categoryId` = `c`.`id`)))
join `groupcategory` `gc` on
    ((`c`.`groupId` = `gc`.`id`)))
join `account` `a` on
    ((`m`.`accountId` = `a`.`id`)))
join `badge` `b` on
    ((`a`.`badgeId` = `b`.`id`)))
where
    ((month(`m`.`datePurchase`) = month(curdate()))
        and (year(`m`.`datePurchase`) = year(curdate())))
group by
    `m`.`accountId`,
    `a`.`userId`),
`unionbalance` as (
select
    `tb`.`userId` AS `userId`,
    `tb`.`accountId` AS `accountId`,
    `tb`.`name` AS `name`,
    `tb`.`code` AS `code`,
    `tb`.`flag` AS `flag`,
    `tb`.`symbol` AS `symbol`,
    (`tb`.`amount` + `tb`.`initAmount`) AS `totalAmount`,
    ifnull((`yb`.`amount` + `yb`.`initAmount`), 0) AS `yearlyAmount`,
    ifnull((`mb`.`amount` + `mb`.`initAmount`), 0) AS `monthlyAmount`
from
    ((`totalbalance` `tb`
left join `yearlybalance` `yb` on
    ((`tb`.`accountId` = `yb`.`accountId`)))
left join `monthlybalance` `mb` on
    ((`tb`.`accountId` = `mb`.`accountId`))))
select
    `unionbalance`.`userId` AS `userId`,
    `unionbalance`.`accountId` AS `accountId`,
    `unionbalance`.`name` AS `name`,
    `unionbalance`.`code` AS `code`,
    `unionbalance`.`flag` AS `flag`,
    `unionbalance`.`symbol` AS `symbol`,
    `unionbalance`.`totalAmount` AS `totalAmount`,
    `unionbalance`.`yearlyAmount` AS `yearlyAmount`,
    `unionbalance`.`monthlyAmount` AS `monthlyAmount`
from
    `unionbalance`