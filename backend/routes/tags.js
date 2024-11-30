const express = require("express");
const router = express.Router();

const tagModel = require("../models/tag.js");

router.get("/", async (req, res) => {
  try {
    let labels = await tagModel.find({});
    if (labels) {
      res.status(200).json({
        records: { ...labels },
      });
      console.log("Retrieved tags!");
    } else {
      res.sendStatus(404);
      console.log("\x1b[31m%s\x1b[0m", "Didn't retrieve tags!");
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

router.post("/", async (req, res) => {
  try {
    const { tag, color } = req.body;
    const result = await tagModel.create({
      name: tag.toString().toUpperCase(),
      color,
    });
    if (result._id) {
      res.status(201).json({ result });
      console.log(tag + " is written in the database");
    } else {
      res.sendStatus(400);
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

router.delete("/", async (req, res) => {
  try {
    const id = req.body.id;
    if (id) {
      const result = await tagModel.deleteOne({ _id: id });
      if (result.deletedCount !== 0) {
        res.sendStatus(200);
        console.log("\x1b[32m%s\x1b[0m", "Tag deleted!");
      } else {
        res.sendStatus(400);
        console.log(
          "\x1b[31m%s\x1b[0m",
          "Didn't find the tag for deletion. ID of the tag is " + id,
        );
      }
    } else {
      res.sendStatus(400);
      console.log("\x1b[31m%s\x1b[0m", "Didn't get the reguest for deletion!");
    }
  } catch (e) {
    res.sendStatus(500);
    console.log(e);
  }
});

router.put("/", async (req, res) => {
  try {
    const { _id, name, color } = req.body;

    if (_id) {
      const result = await tagModel.updateOne(
        { _id: _id },
        { name: name.toUpperCase(), color: color },
      );
      if (result.modifiedCount !== 0) {
        console.log("\x1b[32m%s\x1b[0m", "Tag updated!");
        res.sendStatus(200);
      } else {
        res.sendStatus(400);
        console.log(
          "\x1b[31m%s\x1b[0m",
          req.user.name + " didn't update the tag. ID of the tag is " + _id,
        );
      }
    } else {
      res.sendStatus(400);
      console.log("\x1b[31m%s\x1b[0m", "Didn't get the reguest for updating!");
    }
  } catch (e) {
    res.sendStatus(500);
    console.log(e);
  }
});

module.exports = router;
