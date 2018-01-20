const express = require("express");
const bp = require("body-parser");

const app = express();
const port = process.env.PORT || 8000;

// CORS
// https://stackoverflow.com/questions/11001817/allow-cors-rest-request-to-a-express-node-js-application-on-heroku
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    next();
});

app.use(bp.urlencoded({extended: false}));
app.use(bp.json());

const env = process.env.NODE_ENV || "development";
const database_uri = process.env.DATABASE_URL || "postgresql://localhost:5432/kuche_nutrition?user=kuche&password=kuche";
app.set("pg_uri", database_uri);

app.use(require("./search")(app));

app.listen(port, () => console.log(`Nutrition server listening on port ${port}`));
