const express = require("express");
const moment = require("moment-timezone");

const issueModel = require("../models/issue");
const giveLogModel = require("../models/giveLog");
const partModel = require("../models/part");
const { numberFormatToEU, verifyPermissions } = require("../utils/essentials");

const router = express.Router();

async function getDashBoardData(range) {
  const { start, end } = range;

  const issues = await issueModel.aggregate([
    {
      $match: {
        $and: [
          { status: "closed" },
          { createdAt: { $gte: new Date(start), $lt: new Date(end) } },
          { fixingMethodID: { $ne: null } },
          { problemID: { $ne: null } },
        ],
      },
    },
    {
      $lookup: {
        from: "targets",
        localField: "targetID",
        foreignField: "_id",
        as: "target",
      },
    },
    {
      $lookup: {
        from: "problems",
        localField: "problemID",
        foreignField: "_id",
        as: "problem",
      },
    },
    {
      $lookup: {
        from: "fixingmethods",
        localField: "fixingMethodID",
        foreignField: "_id",
        as: "fixingMethod",
      },
    },
    {
      $lookup: {
        from: "superiors",
        localField: "problem.superior",
        foreignField: "_id",
        as: "superior",
      },
    },
    { $sort: { createdAt: -1 } },
    { $unwind: "$target" },
    {
      $unwind: { path: "$fixingMethod", preserveNullAndEmptyArrays: true },
    },
    { $unwind: { path: "$superior", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$problem", preserveNullAndEmptyArrays: true } },
  ]);

  const logs = await giveLogModel.aggregate([
    {
      $match: { createdAt: { $gte: new Date(start), $lt: new Date(end) } },
    },
    {
      $lookup: {
        from: "products",
        localField: "itemID",
        foreignField: "_id",
        as: "item",
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
        foreignField: "_id",
        as: "user",
      },
    },
    { $sort: { createdAt: -1 } },
    { $unwind: { path: "$problem", preserveNullAndEmptyArrays: true } },
    { $unwind: "$item" },
    { $unwind: "$issue" },
    { $unwind: "$target" },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
  ]);
  logs.forEach((item) => {
    item.item.price = numberFormatToEU(item.item.price);
  });

  return { issues, logs };
}

router.post("/", async (req, res) => {
  const rangeLast = {
    start: moment()
      .startOf("week")
      .subtract(7, "days")
      .add(1, "days")
      .add("4", "hours")
      .tz("America/New_York")
      .toDate(),
    end: moment()
      .endOf("week")
      .subtract(7, "days")
      .add(1, "day")
      .add("4", "hours")
      .tz("America/New_York")
      .toDate(),
  };

  const rangeCurrent = {
    start: moment()
      .startOf("week")
      .add(1, "days")
      .add("4", "hours")
      .tz("America/New_York")
      .toDate(),
    end: moment()
      .endOf("week")
      .add(1, "day")
      .add("4", "hours")
      .tz("America/New_York")
      .toDate(),
  };

  try {
    const lastWeekData = await getDashBoardData(rangeLast);
    const currentWeekData = await getDashBoardData(rangeCurrent);
    const products = await partModel.find({});
    if (verifyPermissions(req.user.permissions, "ra")) {
      res.status(200).json({
        status: "success",
        lastWeek: lastWeekData,
        currentWeek: currentWeekData,
        products: products,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
});

module.exports = router;
