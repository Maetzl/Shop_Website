const express = require("express");
var sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./db/shopdb.db");
const bodyParser = require("body-parser");
const flash = require("express-flash");
const session = require("express-session");
const passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy;

const port = process.env.PORT || 3000;
const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/public", express.static(process.cwd() + "/public"));
app.use(flash());
app.use(
  session({
    secret: "somesecret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

//--------- passport configuration -----------//

passport.use(
  new LocalStrategy(function (username, password, done) {
    db.get(
      "SELECT * FROM users WHERE username = ?",
      [username],
      (err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }
        if (user.password != password) {
          return done(null, false, { message: "Incorrect password." });
        }
        return done(null, user);
      }
    );
  })
);
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

//--------------------------------------------//

app.get("/", async (req, res) => {
  db.all("SELECT rowid AS ID,* FROM Artikel", [], (err, articles) => {
    if (err) {
      console.log(err.message);
      //res.render('pages/login');
    } else {
      if (!req.isAuthenticated()) {
        console.log("Load index...");
        res.render("pages/index", { articles, Login: true });
      } else {
        console.log("Load index... logged in");
        res.render("pages/index", { articles, Login: false });
      }
    }
  });
});

//--------Route:   /login

app.get("/login", (req, res) => {
  console.log("Load Login Page");
  res.render("pages/login");
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.get("/logout", function (req, res) {
  console.log("logging out...");
  req.logOut();
  res.redirect("/");
});
//--------Route:   /change-articles

app.get("/change-articles", checkAuthenticated, (req, res) => {
  db.all("SELECT rowid AS ID,* FROM Artikel", (err, articles) => {
    res.render("pages/change-articles", { articles });
  });
});

app.post("/change-articles", (req, res) => {
  if (
    req.body.Artikel_Name &&
    req.body.Artikel_Preis &&
    req.body.Artikel_Beschreibung
  ) {
    db.run(
      "INSERT INTO Artikel(Name, Preis, Beschreibung, Bewertung, Anzahlbewertung, Bild) VALUES(?,?,?,0,0,?);",
      [
        req.body.Artikel_Name,
        req.body.Artikel_Preis,
        req.body.Artikel_Beschreibung,
        req.body.Artikel_Bild_Url,
      ],
      (err) => {
        if (err) {
          console.log(err);
        }
        console.log("Article added!");
        res.redirect("/change-articles");
      }
    );
  } else {
    console.log("No article added.");
    res.redirect("/change-articles");
  }
});

app.post("/delete-article", checkAuthenticated, (req, res) => {
  db.run("DELETE FROM Artikel WHERE rowid=?", req.body.ArtikelID, (err) => {
    if (err) {
      console.log(err);
    }
    console.log("Artikel " + req.body.ArtikelID + " gelöscht...");
    res.redirect("/change-articles");
  });
});

app.post("/logout", (req, res) => {
  req.logOut();
});

app.post("/postBewertung", (req, res) => {
  console.log(req.body);
  db.all(
    `UPDATE Artikel SET Bewertung = Bewertung + ${req.body.i} WHERE rowid = ${req.body.id}`,
    (err, artikel) => {}
  );
  db.all(
    `UPDATE Artikel SET Anzahlbewertung = Anzahlbewertung + 1 WHERE rowid = ${req.body.id}`,
    (err, artikel) => {}
  );
  res.redirect("/");
});

const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}…`);
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    console.log("Couldn't authenticate...");
    res.redirect("/");
  }
}
app.get("/search", function (req, res) {
  console.log("logging out...");

  db.all(
    `SELECT * FROM Artikel WHERE Artikel_Name like ${req.body.suche}`,
    (err, artikel) => {
      res.send(artikel);
      console.log(err);
    }
  );
});

module.exports = server;
