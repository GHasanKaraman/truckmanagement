const express = require("express");
const router = express.Router();

const giveLogModel = require("../models/giveLog");
const consumeLogModel = require("../models/consumeLog.js");
const returnLogModel = require("../models/returnLog");
const partModel = require("../models/part");
const mongoose = require("mongoose");

router.get("/output", async (req, res) => {
  try {
    const { range } = req.body;
    if (range) {
      var { start, end } = range;
    }
    let logs = await giveLogModel.aggregate([
      range
        ? {
            $match: {
              createdAt: { $gte: new Date(start), $lt: new Date(end) },
            },
          }
        : { $match: {} },
      {
        $lookup: {
          from: "parts",
          localField: "itemID",
          foreignField: "_id",
          as: "item",
        },
      },
      {
        $lookup: {
          from: "locations",
          localField: "locationID",
          foreignField: "_id",
          as: "location",
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "technicianID",
          pipeline: [{ $project: { password: 0 } }],
          foreignField: "_id",
          as: "technician",
        },
      },
      {
        $lookup: {
          from: "vendors",
          localField: "item.vendorsID",
          foreignField: "_id",
          as: "vendors",
        },
      },

      {
        $lookup: {
          from: "issues",
          localField: "issueID",
          foreignField: "_id",
          as: "issue",
        },
      },
      {
        $lookup: {
          from: "problems",
          localField: "issue.problemID",
          foreignField: "_id",
          as: "problem",
        },
      },
      {
        $lookup: {
          from: "targets",
          localField: "issue.targetID",
          foreignField: "_id",
          as: "target",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userID",
          pipeline: [{ $project: { password: 0 } }],
          foreignField: "_id",
          as: "user",
        },
      },
      { $sort: { createdAt: -1 } },
      { $unwind: { path: "$problem", preserveNullAndEmptyArrays: true } },
      { $unwind: "$item" },
      { $unwind: "$location" },
      { $unwind: "$technician" },
      { $unwind: "$issue" },
      { $unwind: "$target" },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    ]);
    if (logs) {
      res.status(200).json({ records: { ...logs } });
      console.log("Retrieved give logs!");
    } else {
      res.sendStatus(404);
      console.log("\x1b[31m%s\x1b[0m", "Didn't retrieve give logs!");
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

router.get("/consume", async (req, res) => {
  try {
    const logs = await consumeLogModel.aggregate([
      {
        $lookup: {
          from: "parts",
          localField: "itemID",
          foreignField: "_id",
          as: "item",
        },
      },
      {
        $lookup: {
          from: "locations",
          localField: "locationID",
          foreignField: "_id",
          as: "location",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "technicianID",
          pipeline: [{ $project: { password: 0 } }],
          foreignField: "_id",
          as: "technician",
        },
      },
      {
        $lookup: {
          from: "vendors",
          localField: "item.vendorsID",
          foreignField: "_id",
          as: "vendor",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userID",
          pipeline: [{ $project: { password: 0 } }],
          foreignField: "_id",
          as: "user",
        },
      },
      { $sort: { createdAt: -1 } },
      { $unwind: "$item" },
      { $unwind: "$location" },
      { $unwind: "$technician" },
      { $unwind: "$user" },
    ]);
    if (logs) {
      res.status(200).json({ records: { ...logs } });
      console.log("Retrieved consume logs!");
    } else {
      res.sendStatus(404);
      console.log("\x1b[31m%s\x1b[0m", "Didn't retrieve consume logs!");
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

router.post("/return", async (req, res) => {
  const { id, returnQuantity } = req.body;
  try {
    const result = await returnLogModel.create({
      userID: req.user._id,
      giveLogID: id,
      returnQuantity: returnQuantity,
    });
    if (result._id) {
      const returnLogDetailedResult = await returnLogModel.aggregate([
        { $match: { giveLogID: mongoose.Types.ObjectId(id) } },
        {
          $lookup: {
            from: "givelogs",
            localField: "giveLogID",
            foreignField: "_id",
            as: "giveLog",
          },
        },
        {
          $lookup: {
            from: "parts",
            localField: "giveLog.itemID",
            foreignField: "_id",
            as: "item",
          },
        },
        { $unwind: "$giveLog" },
        { $unwind: "$item" },
      ]);
      console.log(returnLogDetailedResult);
      const returnLogDetailed = returnLogDetailedResult[0];
      const newCount = returnQuantity + returnLogDetailed.item.count;
      await partModel.updateOne(
        {
          _id: returnLogDetailed.item._id,
        },
        {
          count: newCount,
          totalPrice: returnLogDetailed.item.price * newCount,
        },
      );
      await giveLogModel.updateOne(
        {
          _id: mongoose.Types.ObjectId(id),
        },
        {
          isReturned: true,
          returnQuantity:
            returnQuantity + returnLogDetailed.giveLog.returnQuantity,
        },
      );
      res.sendStatus(200);
    } else {
      res.sendStatus(400);
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

router.get("/returnlogs", async (req, res) => {
  try {
    const logs = await returnLogModel.aggregate([
      {
        $lookup: {
          from: "givelogs",
          localField: "giveLogID",
          foreignField: "_id",
          as: "giveLog",
        },
      },
      {
        $lookup: {
          from: "issues",
          localField: "giveLog.issueID",
          foreignField: "_id",
          as: "issue",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "giveLog.technicianID",
          foreignField: "_id",
          pipeline: [{ $project: { password: 0 } }],
          as: "technician",
        },
      },
      {
        $lookup: {
          from: "problems",
          localField: "issue.problemID",
          foreignField: "_id",
          as: "problem",
        },
      },
      {
        $lookup: {
          from: "targets",
          localField: "issue.targetID",
          foreignField: "_id",
          as: "target",
        },
      },
      {
        $lookup: {
          from: "parts",
          localField: "giveLog.itemID",
          foreignField: "_id",
          as: "item",
        },
      },
      {
        $lookup: {
          from: "locations",
          localField: "item.locationID",
          foreignField: "_id",
          as: "location",
        },
      },
      {
        $lookup: {
          from: "vendors",
          localField: "item.vendorsID",
          foreignField: "_id",
          as: "vendor",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userID",
          pipeline: [{ $project: { password: 0 } }],
          foreignField: "_id",
          as: "user",
        },
      },

      { $sort: { createdAt: -1 } },
      { $unwind: "$giveLog" },
      { $unwind: "$issue" },
      { $unwind: "$technician" },
      { $unwind: "$item" },
      { $unwind: "$location" },
      { $unwind: "$vendor" },
      { $unwind: "$target" },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$problem", preserveNullAndEmptyArrays: true } },
    ]);

    if (logs) {
      res.status(200).json({ records: { ...logs } });
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

module.exports = router;
