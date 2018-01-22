const { Pool } = require("pg");

function buildSearchStmt(search_str) {
  search_str = search_str.replace(/\'/g, "''");
  let metaphone_similarity = 20;
  let response_limit = 20;
  return `
  SELECT * FROM foods WHERE
  name ~ '${search_str}' OR
  metaphone ~ metaphone('${search_str}', ${metaphone_similarity})
  ORDER BY levenshtein(metaphone, metaphone('${search_str}', ${metaphone_similarity}))
  LIMIT ${response_limit}
  ;
  `;
}

function buildIdStmt(id) {
  return `SELECT * FROM foods WHERE f_id = ${id};`;
}

function parseFoodRow(pg_row) {
  let {f_id, name, calories, fat_mg, sodium_mg, carbs_mg, fiber_mg, sugars_mg, protein_mg} = pg_row;
  let fat_g = fat_mg * 0.001;
  let carbs_g = carbs_mg * 0.001;
  let fiber_g = fiber_mg * 0.001;
  let sugars_g = sugars_mg * 0.001;
  let protein_g = protein_mg * 0.001;
  let serving_size_g = 100;
  return {f_id, name, serving_size_g, calories, fat_g, sodium_mg, carbs_g, fiber_g, sugars_g, protein_g};
}

function filterNaughtyKeywords(query) {
  var naughtyKeywords = ["UPDATE", "DELETE", "DROP", "INSERT", "CREATE", "ALTER", ";"];
  naughtyKeywords.forEach(kw => {
    if (query.includes(kw)) {
      return Promise.reject('probably sql injection')
    }
  });
  return Promise.resolve(query);
}

module.exports = (connection_uri) => {
  const pool = new Pool({ connectionString: connection_uri });
  return {
    search: function(query) {
      return filterNaughtyKeywords(query)
      .then(query => buildSearchStmt(query))
      .then(stmt => pool.query(stmt))
      .then(result => result.rows)
      .then(rows => rows.map(parseFoodRow))
    },
    withId: function(id) {
      return filterNaughtyKeywords(id)
      .then(query => buildIdStmt(query))
      .then(stmt => pool.query(stmt))
      .then(result => result.rows)
      .then(rows => rows.map(parseFoodRow))
    }
  }
};
