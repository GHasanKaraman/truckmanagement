const express = require("express");
const sharp = require("sharp");
const upload = require("../singleFile");

const userModel = require("../models/user");
const essentials = require("../utils/essentials");

const router = express.Router();

function capitalizeFirst(_str) {
  const str = _str.toLowerCase();
  return str
    .split(" ")
    .map((item) => {
      const first = item.charAt(0).toUpperCase();
      return first + item.slice(1);
    })
    .join(" ");
}

router.get("/", async (req, res) => {
  try {
    const users = await userModel.find({}).select("-password");
    if (users) {
      res.status(200).json({
        records: users,
      });
      console.log("Retrieved users!");
    } else {
      res.sendStatus(404);
      console.log("\x1b[31m%s\x1b[0m", "Didn't retrieve users!");
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

router.get("/profile", async (req, res) => {
  try {
    if (req.user) {
      res.status(200).json({ records: req.user });
      console.log("Retrieved user for displaying profile!");
    } else {
      res.sendStatus(404);
      console.log("\x1b[31m%s\x1b[0m", "Didn't fetch user from header!");
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

router.put("/profile/upload", upload.single("file"), async (req, res) => {
  try {
    const id = req.user._id;
    const pipeline = {};
    if (req.file) {
      const image = req.file;
      const path = image.path;

      const filename = image.filename.replace(/\..+$/, "");
      const newFilename = `thumbnail-${filename}.${path.substring(
        path.lastIndexOf(".") + 1,
      )}`;
      await sharp(path)
        .rotate()
        .resize(200)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`${image.destination}/${newFilename}`);
      pipeline.image = req.file.path;
    }

    const isImageInPipeline = async () => {
      if (pipeline.image) {
        if ((await essentials.deleteUserImage(id)) === 1) {
          return true;
        } else {
          return false;
        }
      }
      return true;
    };

    const isDeleted = await isImageInPipeline();

    if ((isDeleted || req.user.image === "") && id) {
      const result = await userModel.updateOne({ _id: id }, pipeline);
      if (result.modifiedCount !== 0) {
        console.log(
          "\x1b[32m%s\x1b[0m",
          "User profile picture has been updated!",
        );
        res.sendStatus(200);
      } else {
        res.sendStatus(400);
        console.log(
          "\x1b[31m%s\x1b[0m",
          req.user.name +
            " didn't update the profile picture. ID of the user is " +
            id,
        );
      }
    } else {
      console.log("\x1b[31m%s\x1b[0m", "Didn't get the reguest for updating!");
      res.sendStatus(400);
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, surname, username, phone, position, permissions } = req.body;

    const result = await userModel.create({
      name: capitalizeFirst(name),
      surname: capitalizeFirst(surname),
      username,
      phone,
      position,
      permissions,
    });

    if (result._id) {
      delete result.password;
      res.status(201).json({ result });
      console.log("User " + name + " is written in the database");
    } else {
      res.sendStatus(400);
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

router.put("/", async (req, res) => {
  try {
    const { _id, name, surname, phone, position, username, showQR } = req.body;
    if (_id) {
      const result = await userModel.updateOne(
        { _id: _id },
        { name, surname, phone, position, username, showQR },
      );
      if (result.modifiedCount !== 0) {
        console.log("\x1b[32m%s\x1b[0m", "User updated!");
        res.sendStatus(200);
      } else {
        res.sendStatus(400);
        console.log(
          "\x1b[31m%s\x1b[0m",
          req.user.name + " didn't update the user. ID of the user is " + _id,
        );
      }
    } else {
      console.log(
        "\x1b[31m%s\x1b[0m",
        "Didn't get the reguest for updating user!",
      );
      res.sendStatus(400);
    }
  } catch (e) {
    res.sendStatus(500);
    console.log(e);
  }
});

module.exports = router;
