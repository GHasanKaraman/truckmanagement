const express = require("express");
const router = express.Router();

const issueModel = require("../models/issue");
const giveLogModel = require("../models/giveLog");

router.get("/issue", async (req, res) => {
  try {
    const issues = await issueModel.aggregate([
      { $match: { $or: [{ status: 0 }, { status: 1 }] } },
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
          from: "superiors",
          localField: "problem.superiorID",
          foreignField: "_id",
          as: "superior",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "techniciansID",
          foreignField: "_id",
          as: "users",
          pipeline: [{ $project: { password: 0 } }],
        },
      },

      { $sort: { createdAt: -1 } },
      { $unwind: { path: "$superior", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$problem", preserveNullAndEmptyArrays: true } },
      { $unwind: "$target" },
    ]);

    const giveLogs = await giveLogModel.aggregate([
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
          from: "parts",
          localField: "itemID",
          foreignField: "_id",
          as: "item",
        },
      },
      {
        $match: {
          $or: [{ "issue.status": 0 }, { "issue.status": 1 }],
        },
      },
      { $unwind: { path: "$target", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$item", preserveNullAndEmptyArrays: true } },
    ]);
    if (issues && giveLogs) {
      let data = Object.values(issues).sort((a, b) => {
        if (a.status === 2 && b.status === 2) {
          return 1;
        }
        if (a.status === 0 && b.status !== 0) {
          return -1;
        } else if (b.status === 0 && a.status !== 0) {
          return 1;
        }

        if (a.status === 1 && b.status !== 1) {
          return -1;
        } else if (b.status === 1 && a.status !== 1) {
          return 1;
        }
      });
      res.status(200).json({
        records: { issues: data, giveLogs },
      });
      console.log("Retrieved issues!");
    } else {
      res.sendStatus(401);
      console.log("\x1b[31m%s\x1b[0m", "Didn't retrieve issues!");
    }
  } catch (error) {
    res.sendStatus(500);
    console.log(error);
  }
});

module.exports = router;
