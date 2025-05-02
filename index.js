import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import pg from "pg";
dotenv.config();

const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

db.connect();
let countries = [];
let total = 0;

const result =  db.query("SELECT * FROM visited_countries", (err, res) => {
  if (err) {
    console.error("Error executing query", err.stack);
  } else {
    countries = res.rows.map((row) => row.country_code);
    console.log("Countries fetched from database:", countries);
    total = countries.length;
    console.log("Total countries:", total);
  }
});

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  res.render("index.ejs", { countries, total });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
