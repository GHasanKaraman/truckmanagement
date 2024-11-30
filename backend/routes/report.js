const express = require("express");
const issueModel = require("../models/issue");
const giveLogModel = require("../models/giveLog");
const consumeLogModel = require("../models/consumeLog.js");
const partModel = require("../models/part");
const purchasesModel = require("../models/purchases");
const posModel = require("../models/po");
const vendorModel = require("../models/vendor.js");
const targetModel = require("../models/target.js");
const userModel = require("../models/user.js");

const { numberFormatToEU } = require("../utils/essentials");

const router = express.Router();

router.post("/", (req, res) => {
  res.json({ status: "success" });
});

router.post("/maintenance", async (req, res) => {
  const { range } = req.body;
  const { start, end } = range;
  try {
    const issues = await issueModel.aggregate([
      {
        $match: {
          $and: [
            { status: 2 },
            { createdAt: { $gte: new Date(start), $lt: new Date(end) } },
            { fixingMethodID: { $ne: null } },
            { problemID: { $ne: null } },
          ],
        },
      },
      {
        $lookup: {
          from: "users",
          foreignField: "_id",
          localField: "techniciansID",
          pipeline: [{ $project: { password: 0 } }],
          as: "technicians",
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
          localField: "problem.superiorID",
          foreignField: "_id",
          as: "superior",
        },
      },
      { $sort: { createdAt: -1 } },
      { $unwind: "$target" },
      { $unwind: { path: "$fixingMethod", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$superior", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$problem", preserveNullAndEmptyArrays: true } },
    ]);

    if (issues) {
      res.status(200).json({
        records: {
          issues: issues,
          user: req.user,
        },
      });
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

router.get("/techniciansForm", async (req, res) => {
  try {
    const users = await userModel.find({}).select("-password");
    if (users) {
      res.status(200).json({ records: { users } });
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    res.sendStatus(500);
    console.log(error);
  }
});

router.get("/maintenanceForm", async (req, res) => {
  try {
    const targets = await targetModel.find({});
    if (targets) {
      res.status(200).json({ records: { targets } });
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    res.sendStatus(500);
    console.log(error);
  }
});

router.get("/costForm", async (req, res) => {
  try {
    const targets = await targetModel.find({});
    const vendors = await vendorModel.find({});
    if (targets && vendors) {
      res.status(200).json({ records: { targets, vendors } });
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    res.sendStatus(500);
    console.log(error);
  }
});

router.post("/cost", async (req, res) => {
  const { range } = req.body;
  const { start, end } = range;
  try {
    let logs = await giveLogModel.aggregate([
      { $match: { createdAt: { $gte: new Date(start), $lt: new Date(end) } } },
      {
        $lookup: {
          from: "parts",
          localField: "itemID",
          pipeline: [
            {
              $lookup: {
                from: "vendors",
                localField: "vendorsID",
                foreignField: "_id",
                as: "vendors",
              },
            },
          ],
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
    const purchases = await purchasesModel.find({
      createdAt: { $gte: new Date(start), $lt: new Date(end) },
    });

    const pos = await posModel.find({
      createdAt: { $gte: new Date(start), $lt: new Date(end) },
    });

    const consumeLogs = await consumeLogModel.find({
      createdAt: { $gte: new Date(start), $lt: new Date(end) },
    });

    if (logs && purchases && pos && consumeLogs) {
      res.json({
        records: {
          logs: logs,
          purchases: purchases,
          pos: pos,
          user: req.user,
        },
      });
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

router.post("/technicians", async (req, res) => {
  const { range } = req.body;
  const { start, end } = range;

  try {
    const issues = await issueModel.aggregate([
      {
        $match: {
          $and: [
            { status: 2 },
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
          localField: "problem.superiorID",
          foreignField: "_id",
          as: "superior",
        },
      },
      { $sort: { createdAt: -1 } },
      { $unwind: "$target" },
      { $unwind: { path: "$fixingMethod", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$superior", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$problem", preserveNullAndEmptyArrays: true } },
    ]);

    let logs = await giveLogModel.aggregate([
      { $match: { createdAt: { $gte: new Date(start), $lt: new Date(end) } } },
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

    if (issues && logs) {
      res.status(200).json({
        records: { issues, logs, user: req.user },
      });
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    res.sendStatus(500);
    res.json({ error: e });
  }
});

router.post("/inventory", async (req, res) => {
  const { facility } = req.body;
  try {
    const parts = await partModel.aggregate([
      {
        $lookup: {
          from: "locations",
          localField: "locationID",
          foreignField: "_id",
          as: "location",
        },
      },
      { $unwind: { path: "$location" } },
      {
        $match: {
          "location.facility": facility,
        },
      },
      {
        $lookup: {
          from: "vendors",
          localField: "vendorsID",
          foreignField: "_id",
          as: "vendors",
        },
      },
      {
        $lookup: {
          from: "tags",
          localField: "tagsID",
          foreignField: "_id",
          as: "tags",
        },
      },
    ]);
    if (parts) {
      res.status(200).json({
        records: { parts, user: req.user },
      });
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

module.exports = router;
