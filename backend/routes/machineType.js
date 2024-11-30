const express = require("express");
const router = express.Router();

const machineTypeModel = require("../models/machineType");

router.get("/", async (req, res) => {
  try {
    const machineTypes = await machineTypeModel.find({});
    if (machineTypes) {
      res.status(200).json({
        records: { ...machineTypes },
      });
      console.log("Retrieved machine types!");
    } else {
      res.sendStatus(404);
      console.log("\x1b[31m%s\x1b[0m", "Didn't retrieve machine types!");
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

router.post("/", async (req, res) => {
  try {
    const { machineType } = req.body;
    const result = await machineTypeModel.create({
      machineType: machineType.toUpperCase(),
    });

    if (result._id) {
      res.status(201).json({ result });
      console.log(
        "Machine type " + machineType + " is written in the database",
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
      const result = await machineTypeModel.deleteOne({ _id: id });
      if (result.deletedCount !== 0) {
        res.sendStatus(200);
        console.log("\x1b[32m%s\x1b[0m", "The machine type is deleted!");
      } else {
        res.sendStatus(400);
        console.log(
          "\x1b[31m%s\x1b[0m",
          "Didn't find the machine type for deletion. ID of the machine type is " +
            id,
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
    const { _id, machineType } = req.body;

    if (_id) {
      const result = await machineTypeModel.updateOne(
        { _id: _id },
        { machineType: machineType.toUpperCase() },
      );
      if (result.modifiedCount !== 0) {
        console.log("\x1b[32m%s\x1b[0m", "The machine type is updated!");
        res.sendStatus(200);
      } else {
        res.sendStatus(400);
        console.log(
          "\x1b[31m%s\x1b[0m",
          req.user.name +
            " didn't update the machine type. ID of the machine type is " +
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
