const { Pool } = require("pg");

function buildStmt(search_str) {
  search_str = search_str.replace(/\'/g, "''");
  let metaphone_similarity = 20;
  let response_limit = 20;
  return `
  SELECT * FROM foods
  WHERE metaphone ~ metaphone('${search_str}', ${metaphone_similarity})
  LIMIT ${response_limit}
  ;
  `
}

function parseFoodRow(pg_row) {
  let {name, calories, fat_mg, sodium_mg, carbs_mg, fiber_mg, sugars_mg, protein_mg} = pg_row;
  let fat_g = fat_mg * 0.001;
  let carbs_g = carbs_mg * 0.001;
  let fiber_g = fiber_mg * 0.001;
  let sugars_g = sugars_mg * 0.001;
  let protein_g = protein_mg * 0.001;
  let serving_size_g = 100;
  return {name, serving_size_g, calories, fat_g, sodium_mg, carbs_g, fiber_g, sugars_g, protein_g};
}

module.exports = (connection_uri) => {
  const pool = new Pool({ connectionString: connection_uri });
  return {
    search: function(query) {
      var naughtyKeywords = ["UPDATE", "DELETE", "DROP", "INSERT", "CREATE", "ALTER", ";"];
      naughtyKeywords.forEach(kw => {
        if (query.includes(kw)) {
          return Promise.reject('probably sql injection')
        }
      });

      let stmt = buildStmt(query);
      return pool.query(stmt)
      .then(result => result.rows)
      .then(rows => rows.map(parseFoodRow))
    }
  }
};
