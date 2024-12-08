const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const moment = require("moment-timezone");
//
//express routes
const dashboard = require("./routes/dashboard.js");
const qr = require("./routes/qr.js");
const user = require("./routes/user.js");
const truck = require("./routes/truck.js");
const form = require("./routes/form.js");
const authorization = require("./routes/authorization.js");
const authentication = require("./routes/authentication.js");

var morgan = require("morgan");
var fs = require("fs");
const chalk = require("chalk");

require("console-stamp")(console, {
  format: "(->).yellow :date().bold.black.bgRed",
});

require("dotenv").config();

const app = express();
mongoose.set("strictQuery", false);
mongoose.connect(
  "mongodb+srv://inventory:rNWsMsyxsVEXHFsw@cluster0.zjjva5g.mongodb.net/truck",
  {
    useNewUrlParser: true,
  },
);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

db.once("open", function () {
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(cors());

  if (process.env.NODE_ENV === "production") {
    var accessLogStream = fs.createWriteStream("./access.log", { flags: "a" });
    app.use(
      morgan({
        format:
          "[:date[clf]] :remote-addr :method :url :status :response-time ms",
        stream: {
          write: function (str) {
            accessLogStream.write(str);
            console.log(str);
          },
        },
      }),
    );
  } else {
    app.use(
      morgan(function (tokens, req, res) {
        return [
          "\n",
          chalk.hex("#ff4757").bold("🍄  Morgan --> "),
          chalk.hex("#34ace0").bold(tokens.method(req, res)),
          chalk.hex("#ffb142").bold(tokens.status(req, res)),
          chalk.hex("#ff5252").bold(tokens.url(req, res)),
          chalk.hex("#2ed573").bold(tokens["response-time"](req, res) + " ms"),
          chalk
            .hex("#f78fb3")
            .bold(
              "@ " +
                moment(tokens.date(req, res)).tz("America/New_York").format(),
            ),
          chalk.yellow(tokens["remote-addr"](req, res)),
          chalk.hex("#fffa65").bold("from " + tokens.referrer(req, res)),
          chalk.hex("#1e90ff")(tokens["user-agent"](req, res)),
          "\n",
        ].join(" ");
      }),
    );
  }

  app.use((req, res, next) => {
    if ("OPTIONS" === req.method) {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  app.use("/imgs", express.static(__dirname + "/imgs"));
  app.use("/uploads", express.static(__dirname + "/uploads"));

  app.get("/", async (req, res) => {
    res.send("CiboENG Server!");
  });

  app.use("/qr", qr);
  app.use("/", authentication);

  app.use("/", authorization);

  app.use("/dashboard", dashboard);
  app.use("/user", user);
  app.use("/truck", truck);
  app.use("/issue", form);

  app.listen(process.env.PORT, () => {
    var txt = encodeURIComponent(
      `
   ▄████▄   ██▓ ▄▄▄▄    ▒█████  ▓█████  ███▄    █   ▄████ 
▒██▀ ▀█  ▓██▒▓█████▄ ▒██▒  ██▒▓█   ▀  ██ ▀█   █  ██▒ ▀█▒
▒▓█    ▄ ▒██▒▒██▒ ▄██▒██░  ██▒▒███   ▓██  ▀█ ██▒▒██░▄▄▄░
▒▓▓▄ ▄██▒░██░▒██░█▀  ▒██   ██░▒▓█  ▄ ▓██▒  ▐▌██▒░▓█  ██▓
▒ ▓███▀ ░░██░░▓█  ▀█▓░ ████▓▒░░▒████▒▒██░   ▓██░░▒▓███▀▒
░ ░▒ ▒  ░░▓  ░▒▓███▀▒░ ▒░▒░▒░ ░░ ▒░ ░░ ▒░   ▒ ▒  ░▒   ▒ 
  ░  ▒    ▒ ░▒░▒   ░   ░ ▒ ▒░  ░ ░  ░░ ░░   ░ ▒░  ░   ░ 
░         ▒ ░ ░    ░ ░ ░ ░ ▒     ░      ░   ░ ░ ░ ░   ░ 
░ ░       ░   ░          ░ ░     ░  ░         ░       ░ 
░                  ░                                        `,
    );
    txt = decodeURIComponent(txt);
    console.log("\x1b[35m%s\x1b[0m", txt);
    console.log(
      "\x1b[33m%s\x1b[0m",
      "mongo connection established successfully!",
    );
    console.log("\x1b[34m%s\x1b[0m", "Listening on port " + process.env.PORT);
  });
});
