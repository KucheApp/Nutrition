const express = require("express");

module.exports = (app) => {
  const router = express.Router();

  let connection_uri = app.get("pg_uri");
  const db = require("./db")(connection_uri);

  router.get("/search", (req, res) => {
    if (req.query.id !== undefined) {
      db.withId(req.query.id)
      .then(results => res.json(results))
      .catch(err => {
        console.log(err);
        res.sendStatus(500);
      })
    } else if (req.query.food !== undefined) {
      db.search(req.query.food)
      .then(results => res.json(results))
      .catch(err => {
        console.log(err);
        res.sendStatus(500);
      })
    }
  })

  return router;
};
