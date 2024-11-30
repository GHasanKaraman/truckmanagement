const express = require("express");
const router = express.Router();

const superiorModel = require("../models/superior");
const targetModel = require("../models/target");

router.get("/", async (_req, res) => {
  try {
    const targets = await targetModel.find({});
    const superiors = await superiorModel.aggregate([
      {
        $lookup: {
          from: "targets",
          localField: "targets",
          foreignField: "_id",
          as: "targetDetails",
        },
      },
    ]);
    if (superiors && targets) {
      res.status(200).json({
        records: { superiors, targets },
      });
      console.log("Retrieved superiors!");
    } else {
      res.sendStatus(404);
      console.log("\x1b[31m%s\x1b[0m", "Didn't retrieve superiors!");
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

router.get("/find", async (req, res) => {
  try {
    const { targetID } = req.query;
    const superiors = await superiorModel.find({
      targets: { $in: [targetID] },
    });
    if (superiors) {
      res.status(200).json({
        records: { ...superiors },
      });
      console.log("Retrieved superiors by target!");
    } else {
      res.sendStatus(404);
      console.log("\x1b[31m%s\x1b[0m", "Didn't retrieve superiors by target!");
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

router.post("/", async (req, res) => {
  try {
    const { superior, targets } = req.body;
    const _targets = targets.map(({ _id }) => _id);
    const result = await superiorModel.create({
      superior: superior.toUpperCase(),
      targets: _targets,
    });
    if (result._id) {
      res.status(201).json({ result });
      console.log("Superior " + superior + " is written in the database");
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
      const result = await superiorModel.deleteOne({ _id: id });
      if (result.deletedCount !== 0) {
        res.sendStatus(200);
        console.log("\x1b[32m%s\x1b[0m", "Superior deleted!");
      } else {
        res.sendStatus(400);
        console.log(
          "\x1b[31m%s\x1b[0m",
          "Didn't find the superior for deletion. ID of the superior is " + id,
        );
      }
    } else {
      console.log("\x1b[31m%s\x1b[0m", "Didn't get the reguest for deletion!");
      res.sendStatus(400);
    }
  } catch (e) {
    res.sendStatus(500);
    console.log(e);
  }
});

router.put("/", async (req, res) => {
  try {
    const { _id, superior, targetDetails } = req.body;
    const _targets = targetDetails.map(({ _id }) => _id);
    if (_id) {
      const result = await superiorModel.updateOne(
        { _id: _id },
        { superior: superior.toUpperCase(), targets: _targets },
      );
      if (result.modifiedCount !== 0) {
        console.log("\x1b[32m%s\x1b[0m", "Superior updated!");
        res.sendStatus(200);
      } else {
        res.sendStatus(400);

        console.log(
          "\x1b[31m%s\x1b[0m",
          req.user.name +
            " didn't update the superior. ID of the superior is " +
            _id,
        );
      }
    } else {
      console.log("\x1b[31m%s\x1b[0m", "Didn't get the reguest for updating!");
      res.sendStatus(400);
    }
  } catch (e) {
    res.sendStatus(500);
    console.log(e);
  }
});

module.exports = router;
