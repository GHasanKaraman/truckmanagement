const express = require("express");
const router = express.Router();

const targetModel = require("../models/target");
const machineTypeModel = require("../models/machineType");

router.get("/", async (req, res) => {
  try {
    const targets = await targetModel.aggregate([
      {
        $lookup: {
          from: "machinetypes",
          localField: "machineTypeID",
          foreignField: "_id",
          as: "machineType",
        },
      },
      { $unwind: { path: "$machineType" } },
    ]);
    const machineTypes = await machineTypeModel.find({});
    if (targets && machineTypes) {
      res.status(200).json({
        records: { targets, machineTypes },
      });
      console.log("Retrieved targets!");
    } else {
      res.sendStatus(404);
      console.log("\x1b[31m%s\x1b[0m", "Didn't retrieve targets!");
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

router.post("/", async (req, res) => {
  try {
    const { target, machineType, facility } = req.body;
    const result = await targetModel.create({
      target: target.toUpperCase(),
      machineTypeID: machineType._id,
      facility: facility.toUpperCase(),
    });
    if (result._id) {
      res.status(201).json({ result });
      console.log("Target " + target + " is written in the database");
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
      const result = await targetModel.deleteOne({ _id: id });
      if (result.deletedCount !== 0) {
        res.sendStatus(200);
        console.log("\x1b[32m%s\x1b[0m", "Target deleted!");
      } else {
        res.sendStatus(400);
        console.log(
          "\x1b[31m%s\x1b[0m",
          "Didn't find the target for deletion. ID of the target is " + id,
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
    const { _id, target, machineType, facility } = req.body;
    if (_id) {
      const result = await targetModel.updateOne(
        { _id: _id },
        {
          target: target.toUpperCase(),
          machineTypeID: machineType._id,
          facility: facility.toUpperCase(),
        },
      );
      if (result.modifiedCount !== 0) {
        console.log("\x1b[32m%s\x1b[0m", "Target updated!");
        res.sendStatus(200);
      } else {
        res.sendStatus(400);
        console.log(
          "\x1b[31m%s\x1b[0m",
          req.user.name +
            " didn't update the target. ID of the target is " +
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

router.put("/assign", async (req, res) => {
  try {
    const { id, IP } = req.body;
    if (id) {
      const result = await targetModel.updateOne(
        { _id: id },
        {
          IP: IP,
        },
      );
      if (result.modifiedCount !== 0) {
        console.log("\x1b[32m%s\x1b[0m", "IP has been assigned!");
        res.sendStatus(200);
      } else {
        res.sendStatus(400);
        console.log(
          "\x1b[31m%s\x1b[0m",
          req.user.name + " couldn't assign the IP. ID of the target is " + id,
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
