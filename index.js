import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { Pool } from "pg";
dotenv.config();

const db = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});


let countries = [];
let total = 0;

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  try { 
    const result = await db.query("SELECT * FROM visited_countries");
    countries = result.rows.map((row) => row.country_code);
    console.log("Countries fetched from database:", countries);
    total = countries.length;
    console.log("Total countries:", total);
    res.render("index.ejs", { countries, total });
  } catch (error) {
    console.error("Error fetching countries:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/add", async (req, res) => {
  try {
    const country = req.body.country;

    console.log("Country to add:", country);
    const result = await db.query(
      "SELECT (country_code) FROM countries WHERE country_name = $1",
      [country]
    );
    console.log("Query result:", result.rows);
    const countryCode = result.rows[0].country_code;
    console.log("Country code fetched:", countryCode);

    await db.query(
      "INSERT INTO visited_countries (country_code) VALUES ($1)",
      [countryCode]
    );
    console.log("Country added to database:", countryCode);

    res.redirect("/");
  } catch (error) {
    console.error("Error adding country:", error);
    res.status(500).send("Internal Server Error");
  }
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
