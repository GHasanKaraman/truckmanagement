const express = require("express");
const router = express.Router();

const fixingMethodModel = require("../models/fixingMethod");

router.get("/", async (req, res) => {
  try {
    const fixingMethods = await fixingMethodModel.find({});
    if (fixingMethods) {
      res.status(200).json({
        records: { ...fixingMethods },
      });
      console.log("Retrieved fixing methods!");
    } else {
      res.sendStatus(404);
      console.log("\x1b[31m%s\x1b[0m", "Didn't retrieve fixing methods!");
    }
  } catch (error) {
    res.sendStatus(500);
    console.log(error);
  }
});

router.post("/", async (req, res) => {
  try {
    const { fixingMethod, issueType } = req.body;
    const result = await fixingMethodModel.create({
      fixingMethod: fixingMethod.toUpperCase(),
      issueType: issueType.toUpperCase(),
    });
    if (result._id) {
      res.status(201).json({ result });
      console.log(
        "Fixing method " + fixingMethod + " is written in the database",
      );
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
      const result = await fixingMethodModel.deleteOne({ _id: id });
      if (result.deletedCount !== 0) {
        res.sendStatus(200);
        console.log("\x1b[32m%s\x1b[0m", "The fixing method is deleted!");
      } else {
        res.sendStatus(400);
        console.log(
          "\x1b[31m%s\x1b[0m",
          "Didn't find the fixing method for deletion. ID of the fixing method is " +
            id,
        );
      }
    } else {
      console.log("\x1b[31m%s\x1b[0m", "Didn't get the reguest for deletion!");
      res.sendStatus(400);
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

router.put("/", async (req, res) => {
  try {
    const { _id, fixingMethod, issueType } = req.body;

    if (_id) {
      const result = await fixingMethodModel.updateOne(
        { _id: _id },
        {
          fixingMethod: fixingMethod.toUpperCase(),
          issueType: issueType.toUpperCase(),
        },
      );
      if (result.modifiedCount !== 0) {
        console.log("\x1b[32m%s\x1b[0m", "The fixing method is updated!");
        res.sendStatus(200);
      } else {
        res.sendStatus(400);
        console.log(
          "\x1b[31m%s\x1b[0m",
          req.user.name +
            " didn't update the fixing method. ID of the fixing method is " +
            _id,
        );
      }
    } else {
      console.log("\x1b[31m%s\x1b[0m", "Didn't get the reguest for updating!");
      res.sendStatus(400);
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

module.exports = router;
