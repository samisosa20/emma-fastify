-- Create report to get expensive
CREATE VIEW
    VW_WeeklyExpensive AS
SELECT
    c.name category,
    SUM(m.amount) amount,
    YEAR (m.datePurchase) AS year,
    WEEK (m.datePurchase, 1) AS weekNumber,
    a.badgeId,
    m.userId
FROM
    Movement m
    JOIN Category c ON m.categoryId = c.id
    JOIN Account a ON m.accountId = a.id
WHERE
    m.amount < 0
GROUP BY
    c.name,
    YEAR (m.datePurchase),
    WEEK (m.datePurchase, 1),
    a.badgeId,
    m.userId
ORDER BY
    year DESC,
    weekNumber DESC,
    category;

CREATE VIEW
    VW_MonthlyExpensive AS
SELECT
    c.name category,
    SUM(m.amount) amount,
    YEAR (m.datePurchase) AS year,
    MONTH (m.datePurchase) AS month,
    a.badgeId,
    m.userId
FROM
    Movement m
    JOIN Category c ON m.categoryId = c.id
    JOIN Account a ON m.accountId = a.id
WHERE
    m.amount < 0
GROUP BY
    c.name,
    YEAR (m.datePurchase),
    MONTH (m.datePurchase),
    a.badgeId,
    m.userId
ORDER BY
    year DESC,
    month DESC,
    category;

CREATE VIEW
    VW_YearlyExpensive AS
SELECT
    c.name category,
    SUM(m.amount) amount,
    YEAR (m.datePurchase) AS year,
    a.badgeId,
    m.userId
FROM
    Movement m
    JOIN Category c ON m.categoryId = c.id
    JOIN Account a ON m.accountId = a.id
WHERE
    m.amount < 0
GROUP BY
    c.name,
    YEAR (m.datePurchase),
    a.badgeId,
    m.userId
ORDER BY
    year DESC,
    category;

CREATE VIEW
    VW_DailyExpensive AS
SELECT
    c.name category,
    SUM(m.amount) amount,
    DATE (m.datePurchase) as datePurchase,
    a.badgeId,
    m.userId
FROM
    Movement m
    JOIN Category c ON m.categoryId = c.id
    JOIN Account a ON m.accountId = a.id
WHERE
    m.amount < 0
GROUP BY
    c.name,
    DATE (m.datePurchase),
    a.badgeId,
    m.userId
ORDER BY
    datePurchase DESC,
    category;

-- Create report to get income
CREATE VIEW
    VW_WeeklyIncome AS
SELECT
    c.name category,
    SUM(m.amount) amount,
    YEAR (m.datePurchase) AS year,
    WEEK (m.datePurchase, 1) AS weekNumber,
    a.badgeId,
    m.userId
FROM
    Movement m
    JOIN Category c ON m.categoryId = c.id
    JOIN Account a ON m.accountId = a.id
WHERE
    m.amount > 0
GROUP BY
    c.name,
    YEAR (m.datePurchase),
    WEEK (m.datePurchase, 1),
    a.badgeId,
    m.userId
ORDER BY
    year DESC,
    weekNumber DESC,
    category;

CREATE VIEW
    VW_MonthlyIncome AS
SELECT
    c.name category,
    SUM(m.amount) amount,
    YEAR (m.datePurchase) AS year,
    MONTH (m.datePurchase) AS month,
    a.badgeId,
    m.userId
FROM
    Movement m
    JOIN Category c ON m.categoryId = c.id
    JOIN Account a ON m.accountId = a.id
WHERE
    m.amount > 0
GROUP BY
    c.name,
    YEAR (m.datePurchase),
    MONTH (m.datePurchase),
    a.badgeId,
    m.userId
ORDER BY
    year DESC,
    month DESC,
    category;

CREATE VIEW
    VW_DailyIncome AS
SELECT
    c.name category,
    SUM(m.amount) amount,
    DATE (m.datePurchase) as datePurchase,
    a.badgeId,
    m.userId
FROM
    Movement m
    JOIN Category c ON m.categoryId = c.id
    JOIN Account a ON m.accountId = a.id
WHERE
    m.amount > 0
GROUP BY
    c.name,
    DATE (m.datePurchase),
    a.badgeId,
    m.userId
ORDER BY
    datePurchase DESC,
    category;

CREATE VIEW
    VW_YearlyIncome AS
SELECT
    c.name category,
    SUM(m.amount) amount,
    YEAR (m.datePurchase) AS year,
    a.badgeId,
    m.userId
FROM
    Movement m
    JOIN Category c ON m.categoryId = c.id
    JOIN Account a ON m.accountId = a.id
WHERE
    m.amount > 0
GROUP BY
    c.name,
    YEAR (m.datePurchase),
    a.badgeId,
    m.userId
ORDER BY
    year DESC,
    category;