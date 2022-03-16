const router = require("express").Router();
const UserModel = require("../models/User.model");
const bcrypt = require("bcryptjs");
const { genSalt } = require("bcrypt");
const async = require("hbs/lib/async");
const User = require("../models/User.model");
const session = require("express-session");
const MongoStore = require("connect-mongo"); //stay login while refreshing
const mongoose = require("mongoose");
const { route } = require("express/lib/application");

//MIDDLEWARE CONFIG
router.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
    },
    //stay login while refreshing
    store: MongoStore.create({
      mongoUrl: "mongodb://localhost/lab-express-basic-auth",
      tlt: 60 * 60,
    }),
  })
);

/* GET profile page */
router.get('/profile', (req, res) => {
  res.render("profile")
})

const requireLogin = (req, res, next) => {
  if (!req.session.currentSession) {
    res.redirect("/login");
  }
  next();
};
/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

/* GET signup page */
router.get("/signup", (req, res, next) => {
  res.render("signup");
});

/* GET home page */
router.post("/signup", async (req, res, next) => {
  const { username, password } = req.body;

  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(password, salt);

  //HASH PASSWORD
  const user = {
    username,
    password: hash,
  };
  await UserModel.create(user);
  res.render("profile"); // ,'welcome' {username}
});

//LOGIN PAGE
router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    console.log(user);

    const hashDB = user.password; // Store password into hashDB
    const passwordCheck = await bcrypt.compare(req.body.password, hashDB); // Comparing hashDB to the actual input (trying to login)
    console.log(passwordCheck ? "Yes" : "No");
    if (!passwordCheck) {
      throw Error("Wrong Password Mother Fucker");
    }
    req.session.currentSession = user;
    res.redirect("/profile");
  } catch (err) {
    res.render("/login", { error: "Wrong Username or Password" });
  }
  //res.render("profile");
});

module.exports = router;
