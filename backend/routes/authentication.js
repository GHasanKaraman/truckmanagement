const express = require("express");
const md5 = require("md5");
const uuid = require("uuid");

const userModel = require("../models/user");
const tokenModel = require("../models/token");

const router = express.Router();

router.post("/login", async (req, res, next) => {
  const encoded = req.header("Authorization");
  const credential = encoded.split(" ")[1];
  const decodedCredential = Buffer.from(credential, "base64").toString();
  const [username, password] = decodedCredential.split("=");
  try {
    console.log("\x1b[36m%s", username, "attempt to sign in!", "\x1b[0m");

    const user = await userModel
      .findOne({
        username: username,
        password: md5(password),
      })
      .lean();
    if (user) {
      const token = await tokenModel.create({
        token: uuid.v4(),
        userID: user._id,
      });

      if (token) {
        delete user.password;
        res.status(200).json({
          user,
          token: token.token,
        });
        console.log(
          "\x1b[32m%s\x1b[0m",
          username + " has succesfully sign in!",
        );
      } else {
        res.sendStatus(400);
        console.log(
          "\x1b[31m%s",
          "Something went wrong while creating a session token!",
          "\x1b[0m",
        );
      }
    } else {
      console.log("\x1b[31m%s", username, "is not in the database!", "\x1b[0m");
      res.sendStatus(404);
    }
  } catch (e) {
    res.sendStatus(500);
    console.log(e);
  }
});

module.exports = router;
