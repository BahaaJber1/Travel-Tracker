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

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Fetch all visited countries from the database
async function getVisitedCountriesCode() { 
  try {
    const result = await db.query("SELECT * FROM visited_countries");
    let countries = result.rows.map((row) => row.country_code);
    let total = countries.length;

    return { countries, total };
  } catch (error) {
    console.error("Error fetching countries:", error);
    throw new Error("Error fetching countries from the database.");
  }
}

// Fetch country code based on user input and check if it already exists
async function getUserInputCountryCode(country) { 
  try {
    // Check if the country is already in the database
    const result = await db.query(
      "SELECT (country_code) FROM countries WHERE country_name = $1",
      [country]
    );

    if(result.rows.length === 0) {
      return { error: `No such country found: ${country}` };
    }

    const countryCode = result.rows[0].country_code;

    // check if the country has already been added
    const existingResult = await db.query(
      "SELECT * FROM visited_countries WHERE country_code = $1",
      [countryCode]
    );

    if (existingResult.rows.length > 0) {
      return { error: "The country has already been added. Try another one!" };
    }

    // Insert the country code into the visited_countries table
    await db.query(
      "INSERT INTO visited_countries (country_code) VALUES ($1)",
      [countryCode]
    );

  } catch (error) {
    console.error("Error fetching country code:", error);
    return { error: "An error occurred while processing your request." };
  }
}


app.get("/", async (req, res) => {
  try {
    const { countries, total } = await getVisitedCountriesCode();
    res.render("index.ejs", { countries, total, error: null });
  } catch (error) {
    console.error("Error rendering index:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route: POST add a country
app.post("/add", async (req, res) => {
  const country = req.body.country;

  // Validate input
  if (!country || country.trim() === "") {
    return res.render("index.ejs", {
      countries: [],
      total: 0,
      error: "Please enter a valid country name.",
    });
  }

  try {
    const result = await getUserInputCountryCode(country);

    if (result.error) {
      const { countries, total } = await getVisitedCountriesCode();
      return res.render("index.ejs", {
        countries,
        total,
        error: result.error,
      });
    }

    // Redirect to the home page after successful addition
    res.redirect("/");
  } catch (error) {
    console.error("Error adding country:", error);
    const { countries, total } = await getVisitedCountriesCode();
    res.status(500).render("index.ejs", {
      countries,
      total,
      error: "An unexpected error occurred. Please try again later.",
    });
  }
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
