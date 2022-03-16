const router = require("express").Router();
const UserModel = require('../models/User.model')
const bcrypt = require('bcryptjs');
const { genSalt } = require("bcrypt");
const async = require("hbs/lib/async");

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
  const {username, password} = req.body;

  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(password, salt)

  const user = {
    username,
    password : hash,
  }
  await UserModel.create(user);
  res.render('profile') // ,'welcome' {username}
});



module.exports = router;
