const express = require("express");
const router = express.Router();

const problemModel = require("../models/problem");
const superiorModel = require("../models/superior");
const mongoose = require("mongoose");

router.get("/", async (_req, res) => {
  try {
    const problems = await problemModel.aggregate([
      {
        $lookup: {
          from: "superiors",
          localField: "superiorID",
          foreignField: "_id",
          as: "superiorData",
        },
      },
      { $unwind: "$superiorData" },
    ]);

    const superiors = await superiorModel.find({});

    if (problems && superiors) {
      res.status(200).json({
        records: { problems, superiors },
      });
      console.log("Retrieved problems!");
    } else {
      res.sendStatus(404);
      console.log("\x1b[31m%s\x1b[0m", "Didn't retrieve problems!");
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

router.get("/find", async (req, res) => {
  try {
    const { superiorID } = req.query;
    const problems = await superiorModel.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(superiorID) } },
      {
        $lookup: {
          from: "problems",
          localField: "_id",
          foreignField: "superiorID",
          as: "problem",
        },
      },
      { $unwind: "$problem" },
    ]);
    if (problems) {
      res.status(200).json({
        records: { ...problems },
      });
      console.log("Found problems by superior!");
    } else {
      res.sendStatus(404);
      console.log("\x1b[31m%s\x1b[0m", "Didn't find problems by superior!");
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

router.post("/", async (req, res) => {
  try {
    const { problem, superior } = req.body;

    const sameProblemResult = await problemModel.find({
      superiorID: superior._id,
      problem: problem.toUpperCase(),
    });

    if (sameProblemResult.length > 0) {
      res.sendStatus(400);
    } else {
      const result = await problemModel.create({
        problem: problem.toUpperCase(),
        superiorID: superior._id,
      });
      if (result._id) {
        res.status(201).json({ result });
        console.log("Problem " + problem + " is written in the database");
      } else {
        res.sendStatus(400);
      }
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
      const result = await problemModel.deleteOne({ _id: id });

      if (result.deletedCount !== 0) {
        res.sendStatus(200);
        console.log("\x1b[32m%s\x1b[0m", "Problem deleted!");
      } else {
        res.sendStatus(400);
        console.log(
          "\x1b[31m%s\x1b[0m",
          "Didn't find the problem for deletion. ID of the problem is " + id,
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
    const { _id, problem, superiorData } = req.body;
    const superId = superiorData._id;
    if (superId) {
      const result = await problemModel.updateOne(
        { _id: _id },
        { problem: problem.toUpperCase(), superiorID: superId },
      );
      if (result.modifiedCount !== 0) {
        console.log("\x1b[32m%s\x1b[0m", "Problem updated!");
        res.sendStatus(200);
      } else {
        res.sendStatus(400);
        console.log(
          "\x1b[31m%s\x1b[0m",
          req.user.name +
            " didn't update the problem. ID of the problem is " +
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
