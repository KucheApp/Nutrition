const express = require("express");
const bp = require("body-parser");

const app = express();
const port = process.env.PORT || 8000;

app.use(bp.urlencoded({extended: false}));
app.use(bp.json());

const env = process.env.NODE_ENV || "development";
const database_uri = process.env.DATABASE_URL || "postgresql://localhost:5432/kuche_nutrition?user=kuche&password=kuche";
app.set("pg_uri", database_uri);

app.use(require("./search")(app));

app.listen(port, () => console.log(`Nutrition server listening on port ${port}`));
