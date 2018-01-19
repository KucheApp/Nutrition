import psycopg2 as pg

def load_data():
	food_groups = {}
	inverse_food_groups = {}
	with open("FD_GROUP.txt") as fp:
		fg = fp.readlines()
		fg = [row.strip().split("^") for row in fg]
		fg = [[col.strip("~") for col in row] for row in fg]
		index = 1
		for g in fg:
			food_groups[g[0]] = index
			index += 1
			# cur.execute("INSERT INTO food_groups (name) VALUES ('%s');" % (g[1]))
		# food group id, food group name

	nutrition_defs = {}
	with open("NUTR_DEF.txt") as fp:
		nd = fp.readlines()
		nd = [row.strip().split("^") for row in nd]
		nd = [[col.strip("~") for col in row] for row in nd]
		index = 1
		for d in nd:
			nutrition_defs[d[0]] = index
			index += 1
			# cur.execute("INSERT INTO nutrient_defs (name, units) VALUES('%s', '%s');" % (d[3], d[1]))
		# nutrient id, units, tag name, name, rounding places, sort order

	foods = {}
	with open("FOOD_DES.txt") as fp:
		fd = fp.readlines()
		fd = [row.strip().split("^") for row in fd]
		fd = [[col.strip("~") for col in row] for row in fd]
		index = 1
		for f in fd:
			foods[f[0]] = index
			index += 1
			# cn = f[4].replace("'", "''")
			# desc = f[2].replace("'", "''")
			# fg = food_groups[f[1]]
			# man = f[5].replace("'", "''")
			# if len(cn) > 0:
			# 	if len(man) > 0:
			# 		stmt = """INSERT INTO foods (common_name, description, food_group, manufacturer) VALUES ('{}', '{}', {}, '{}');""".format(cn, desc, fg, man)
			# 	else:
			# 		stmt = """INSERT INTO foods (common_name, description, food_group) VALUES ('{}', '{}', {});""".format(cn, desc, fg)
			# else:
			# 	if len(man) > 0:
			# 		stmt = """INSERT INTO foods (description, food_group, manufacturer) VALUES ('{}', {}, '{}');""".format(desc, fg, man)
			# 	else:
			# 		stmt = """INSERT INTO foods (description, food_group) VALUES ('{}', {});""".format(desc, fg)
			# cur.execute(stmt)
	# 	food_descriptions = fd
		# nutrient database id (food code), food group id, item description, abbv desc, common name, manufacturer, survey y/n, refuse description, refuse percent, scientific name, nitrogen -> protein conversion, calories from protein factor, calories from fat factor, calories from carbs factor
		# print fd[0]

	with open("NUT_DATA.txt") as fp:
		nd = fp.readlines()
		nd = [row.strip().split("^") for row in nd]
		nd = [[col.strip("~") for col in row] for row in nd]
		nutrition_data = {}
		index = 1
		for row in nd:
			food = foods[row[0]]
			nut = nutrition_defs[row[1]]
			amount = row[2]
			stmt = """INSERT INTO nutrients (food, nutrient, amount) VALUES ({}, {}, {});""".format(food, nut, amount)
			cur.execute(stmt)
			index += 1
			if index % 100 == 0:
				print index
		# nutrient database id (food code), nutrient id, amount in 100 g, data point count, std err, src code, derivation code, database id for extrapolated values, added for enrichment y/n, study count, min value, max value, dof, lower 95% confidence, upper 95% confidence, statistical comments, date added, confidence code
		# for n in nd:
		# 	if n[0] == "01001":
		# 		print n

select_stmt = """
SELECT t1.description, t2.nd_id, t2.amount, t2.units FROM
(SELECT f_id, description FROM foods WHERE f_id = {0}) AS t1
JOIN (
  SELECT * FROM
  (SELECT food, nutrient, amount FROM nutrients WHERE food = {0}) AS t21
  JOIN
  (SELECT * FROM nutrient_defs) AS t22
  ON t21.nutrient = t22.nd_id
) AS t2
ON t1.f_id = t2.food
WHERE t2.nd_id = 1 OR t2.nd_id = 2 OR t2.nd_id = 3 OR t2.nd_id = 5 OR t2.nd_id = 18 OR t2.nd_id = 20 OR t2.nd_id = 26
ORDER BY t2.nutrient;
"""

insert_stmt = """
INSERT INTO food_consolidated
(name, calories, fat_mg, sodium_mg, carbs_mg, fiber_mg, sugars_mg, protein_mg)
VALUES
('{}',{},{},{},{},{},{},{});
"""

def format_amount(amount, units):
	if units == "kcal":
		return int(amount)
	if units == "g":
		return int(amount*1000)
	if units == "mg":
		return int(amount)

if __name__ == '__main__':
	conn = pg.connect(
		host="localhost",
		user="kuche",
		password="kuche",
		database="kuche_nutrition"
	)
	cur = conn.cursor()
	
	index_map = {
		1: 7, # protein
		2: 2, # fat
		3: 4, # carbs
		5: 1, # calories
		18: 6,# sugars
		20: 5,# fiber
		26: 3,# sodium
	}
	col_count = len(index_map.keys()) + 1
	
	for i in range(1, 8790):
		food = [None]*col_count
		cur.execute(select_stmt.format(i))
		for ingredient in cur.fetchall():
			food[0] = ingredient[0].replace("'", "''") # name
			food[index_map[ingredient[1]]] = format_amount(ingredient[2], ingredient[3])
		food = map(lambda x: 0 if x is None else x, food)
		cur.execute(insert_stmt.format(food[0],food[1],food[2],food[3],food[4],food[5],food[6],food[7]))
		if i % 100 == 0:
			print i
	
	conn.commit()
	cur.close()
	conn.close()