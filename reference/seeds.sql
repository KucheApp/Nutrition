-- SELECT setval('nutrient_defs_n_id_seq', 1, false);

CREATE TABLE IF NOT EXISTS food_groups (
  fg_id SERIAL PRIMARY KEY,
  name VARCHAR(40) NOT NULL
);

CREATE TABLE IF NOT EXISTS nutrient_defs (
  nd_id SERIAL PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  units VARCHAR(7) NOT NULL
);

CREATE TABLE IF NOT EXISTS foods (
  f_id SERIAL PRIMARY KEY,
  common_name VARCHAR(100),
  description VARCHAR(200) NOT NULL,
  food_group INTEGER REFERENCES food_groups (fg_id) NOT NULL,
  manufacturer VARCHAR(65)
);

CREATE TABLE IF NOT EXISTS nutrients (
  n_id SERIAL PRIMARY KEY,
  food INTEGER REFERENCES foods (f_id) NOT NULL,
  nutrient INTEGER REFERENCES nutrient_defs (nd_id) NOT NULL,
  amount REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS food_consolidated (
  fc_id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  calories INTEGER NOT NULL,
  fat_mg INTEGER NOT NULL,
  sodium_mg INTEGER NOT NULL,
  carbs_mg INTEGER NOT NULL,
  fiber_mg INTEGER NOT NULL,
  sugars_mg INTEGER NOT NULL,
  protein_mg INTEGER NOT NULL
);

5: 1, # calories
2: 2, # fat
26: 3,# sodium
3: 4, # carbs
20: 5,# fiber
18: 6,# sugars
1: 7, # protein
