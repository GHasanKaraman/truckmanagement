const express = require("express");
const router = express.Router();

const locationModel = require("../models/location");

router.get("/", async (req, res) => {
  try {
    const locs = await locationModel.find({});
    if (locs) {
      res.status(200).json({
        records: { ...locs },
      });
      console.log("Retrieved locations!");
    } else {
      res.sendStatus(404);
      console.log("\x1b[31m%s\x1b[0m", "Didn't retrieve locations!");
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

router.get("/nonused", async (req, res) => {
  try {
    const locs = await locationModel.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "location",
          foreignField: "new_location",
          as: "matched_docs",
        },
      },
      {
        $match: {
          matched_docs: { $eq: [] },
        },
      },
    ]);

    if (locs) {
      res.status(200).json({
        records: { ...locs },
      });
      console.log("Retrieved locations!");
    } else {
      res.sendStatus(404);
      console.log("\x1b[31m%s\x1b[0m", "Didn't retrieve locations!");
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

router.post("/", async (req, res) => {
  try {
    const { location, facility } = req.body;
    const result = await locationModel.create({
      location: location.toUpperCase(),
      facility,
    });
    if (result._id) {
      res.status(201).json({ result });
      console.log("Location " + location + " is written in the database");
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
      const result = await locationModel.deleteOne({ _id: id });
      if (result.deletedCount !== 0) {
        res.sendStatus(200);
        console.log("\x1b[32m%s\x1b[0m", "Location deleted!");
      } else {
        res.sendStatus(400);
        console.log(
          "\x1b[31m%s\x1b[0m",
          "Didn't find the location for deletion. ID of the location is " + id,
        );
      }
    } else {
      console.log(
        "\x1b[31m%s\x1b[0m",
        "Didn't get the reguest for deletion of location!",
      );
      res.sendStatus(400);
    }
  } catch (e) {
    res.sendStatus(500);
    console.log(e);
  }
});

router.put("/", async (req, res) => {
  try {
    const { _id, location, facility } = req.body;

    if (_id) {
      const result = await locationModel.updateOne(
        { _id: _id },
        { location: location.toUpperCase(), facility },
      );
      if (result.modifiedCount !== 0) {
        console.log("\x1b[32m%s\x1b[0m", "Location updated!");
        res.sendStatus(200);
      } else {
        res.sendStatus(400);
        console.log(
          "\x1b[31m%s\x1b[0m",
          req.user.name +
            " didn't update the location. ID of the location is " +
            _id,
        );
      }
    } else {
      console.log(
        "\x1b[31m%s\x1b[0m",
        "Didn't get the reguest for updating location!",
      );
      res.sendStatus(400);
    }
  } catch (e) {
    res.sendStatus(500);
    console.log(e);
  }
});

module.exports = router;
