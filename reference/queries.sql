SELECT t1.description, t2.nd_id, t2.name, t2.amount, t2.units FROM
(SELECT f_id, description FROM foods WHERE f_id = 100) AS t1
JOIN (
  SELECT * FROM
  (SELECT food, nutrient, amount FROM nutrients WHERE food = 100) AS t21
  JOIN
  (SELECT * FROM nutrient_defs) AS t22
  ON t21.nutrient = t22.nd_id
) AS t2
ON t1.f_id = t2.food
WHERE t2.nd_id = 1 OR t2.nd_id = 2 OR t2.nd_id = 3 OR t2.nd_id = 5 OR t2.nd_id = 18 OR t2.nd_id = 20
ORDER BY t2.nutrient;

SELECT t2.name, t1.name AS food_group FROM
(
  SELECT t12.name, t11.description FROM
  (SELECT food_group, description FROM foods) AS t11
  JOIN
  (SELECT fg_id, name FROM food_groups) AS t12
  ON t11.food_group = t12.fg_id
) AS t1
JOIN
(
  SELECT fc_id, name FROM food_consolidated
) AS t2
ON t1.description = t2.name
ORDER BY fc_id;

SELECT * FROM food_consolidated WHERE metaphone ~ metaphone('query', 20);
