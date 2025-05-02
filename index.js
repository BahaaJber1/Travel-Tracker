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

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
