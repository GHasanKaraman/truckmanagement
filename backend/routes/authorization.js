const express = require("express");
const router = express.Router();

const userModel = require("../models/user");
const tokenModel = require("../models/token");
const essentials = require("../utils/essentials");

function isEmpty(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) return false;
  }
  return true;
}

router.use(async (req, res, next) => {
  require("dns").resolve("www.google.com", function (err) {
    if (err) {
      const txt = String.raw`

                       ______
                    .-"      "-.
                   /            \
       _          |              |          _
      ( \         |,  .-.  .-.  ,|         / )
       > "=._     | )(__/  \__)( |     _.=" <
      (_/"=._"=._ |/     /\     \| _.="_.="\_)
             "=._ (_     ^^     _)"_.="
                 "=\__|IIIIII|__/="
                _.="| \IIIIII/ |"=._
      _     _.="_.="\          /"=._"=._     _
     ( \_.="_.="     '--------'     "=._"=._/ )
      > _.="                            "=._ <
     (_/                                    \_)
        
     `;
      console.log("\x1b[31m%s\x1b[0m", txt);
      console.log("\x1b[31m%s\x1b[0m", "NO INTERNET CONNECTION");
    }
  });
  try {
    const token = req.header("Authorization");
    if (token) {
      const tokenData = await tokenModel
        .find({ token: token })
        .sort({ createdAt: -1 })
        .limit(1);
      if (!isEmpty(tokenData)) {
        console.log("\x1b[35m%s\x1b[0m", token + " will be authenticated!");

        if (Math.abs(essentials.fromNow(tokenData[0].createdAt)) >= 60 * 6) {
          console.log(
            "\x1b[31m%s\x1b[0m",
            token + " has expired! User should sign in again!",
          );
          res.sendStatus(401);
        } else {
          const user = await userModel
            .find({ _id: tokenData[0].userID })
            .select("-password");
          if (user) {
            req.user = user[0];
            console.log(
              "\x1b[32m%s\x1b[0m",
              user[0].name + " has been succesfully authenticated!",
            );
            if (essentials.verifyPermissions(user[0].permissions, "ra")) {
              next();
            } else {
              res.sendStatus(403);
            }
          } else {
            console.log("\x1b[31m%s\x1b[0m", "User not found!");
            res.sendStatus(401);
          }
        }
      } else {
        console.log(
          "\x1b[31m%s\x1b[0m",
          "Token is not valid. User should sign in again!",
        );
        res.sendStatus(401);
      }
    } else {
      console.log(
        "\x1b[31m%s",
        token,
        "is not authenticated! User should sign in!",
        "\x1b[0m",
      );
      res.sendStatus(401);
    }
  } catch (e) {
    req.user = null;
    res.status(500).json({ error: e });
    console.log(e);
  }
});

module.exports = router;
