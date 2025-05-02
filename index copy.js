import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  res.render("index.ejs", { countries: ["FR", "US", "GB"], total: 3});
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
