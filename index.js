const express = require("express");
var sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const db = new sqlite3.Database("./db/artikel.db");

const port = process.env.PORT || 3000;
const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", async (req, res) => {
  db.all("SELECT * FROM Artikel WHERE ID = 1", (err, artikel) => {
    res.render("pages/index", {
      data: artikel,
    });
  });
});

app.post("/postBewertung", (req, res) => {
  db.all(
    `UPDATE Artikel SET Bewertung = Bewertung + ${req.body.i} WHERE ID = ${req.body.id}`,
    (err, artikel) => {}
  );
  db.all(
    `UPDATE Artikel SET Anzahlbewertung = Anzahlbewertung + 1 WHERE ID = ${req.body.id}`,
    (err, artikel) => {}
  );
  res.send("Finished");
});

const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}…`);
});

module.exports = server;
