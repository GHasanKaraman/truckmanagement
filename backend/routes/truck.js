const express = require("express");
const router = express.Router();

const truckModel = require("../models/truck");

router.get("/", async (req, res) => {
  try {
    const trucks = await truckModel.find({});
    if (trucks) {
      res.status(200).json({
        records: { trucks },
      });
      console.log("Retrieved trucks!");
    } else {
      res.sendStatus(404);
      console.log("\x1b[31m%s\x1b[0m", "Didn't retrieve trucks!");
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

router.post("/", async (req, res) => {
  try {
    const { truck, facility } = req.body;
    const result = await truckModel.create({
      truck: truck.toUpperCase(),
      facility: facility.toUpperCase(),
    });
    if (result._id) {
      res.status(201).json({ result });
      console.log("Truck " + truck + " is written in the database");
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
      const result = await truckModel.deleteOne({ _id: id });
      if (result.deletedCount !== 0) {
        res.sendStatus(200);
        console.log("\x1b[32m%s\x1b[0m", "Truck deleted!");
      } else {
        res.sendStatus(400);
        console.log(
          "\x1b[31m%s\x1b[0m",
          "Didn't find the truck for deletion. ID of the truck is " + id,
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
    const { _id, truck, facility } = req.body;
    if (_id) {
      const result = await truckModel.updateOne(
        { _id: _id },
        {
          truck: truck.toUpperCase(),
          facility: facility.toUpperCase(),
        },
      );
      if (result.modifiedCount !== 0) {
        console.log("\x1b[32m%s\x1b[0m", "Truck updated!");
        res.sendStatus(200);
      } else {
        res.sendStatus(400);
        console.log(
          "\x1b[31m%s\x1b[0m",
          req.user.name + " didn't update the truck. ID of the truck is " + _id,
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
