const express = require("express");
const router = express.Router();

const essentials = require("../utils/essentials");
const issueModel = require("../models/issue");
const fixingMethodModel = require("../models/fixingMethod");
const targetModel = require("../models/target");
const userModel = require("../models/user");
const { default: mongoose } = require("mongoose");

const sharp = require("sharp");
const upload = require("../file");

router.get("/", async (req, res) => {
  try {
    var { from, to, show, search, page, target } = req.query;

    if (!from && !to && show !== "special") {
      const { start, end } = essentials.extractRange(show);
      if (start && end) {
        from = start;
        to = end;
      }
    }

    const issues = await issueModel.aggregate([
      show === "special"
        ? {
            $match: { $or: [{ issueType: 2 }, { issueType: 1 }] },
          }
        : { $match: {} },
      from && to
        ? {
            $match: {
              $or: [
                {
                  createdAt: { $gte: new Date(from), $lt: new Date(to) },
                },
                {
                  $or: [{ status: 0 }, { status: 1 }],
                },
              ],
            },
          }
        : { $match: {} },
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
      {
        $lookup: {
          from: "users",
          localField: "techniciansID",
          foreignField: "_id",
          as: "users",
          pipeline: [{ $project: { password: 0 } }],
        },
      },
      {
        $lookup: {
          from: "givelogs",
          localField: "_id",
          foreignField: "issueID",
          pipeline: [
            {
              $lookup: {
                from: "parts",
                localField: "itemID",
                pipeline: [
                  {
                    $lookup: {
                      from: "locations",
                      localField: "locationID",
                      foreignField: "_id",
                      as: "location",
                    },
                  },
                  { $unwind: "$location" },
                ],
                foreignField: "_id",
                as: "logItem",
              },
            },
            { $unwind: "$logItem" },
          ],
          as: "log",
        },
      },
      { $sort: { createdAt: -1 } },
      { $unwind: "$target" },
      {
        $unwind: { path: "$fixingMethod", preserveNullAndEmptyArrays: true },
      },
      { $unwind: { path: "$superior", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$problem", preserveNullAndEmptyArrays: true } },
      search && search !== ""
        ? { $match: { "problem.problem": { $regex: search, $options: "i" } } }
        : { $match: {} },
    ]);

    const users = await userModel.find({}).select("-password");
    const fixingMethods = await fixingMethodModel.find({});
    const targets = await targetModel.find({});
    if (issues && users && fixingMethods && targets) {
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
      if (target) {
        //filter
        data = data.filter((item) => item.target.target === target);
      }

      const length = data.length;

      res.status(200).json({
        records: {
          issues: data.slice((page - 1) * 18, (page - 1) * 18 + 18),
          users,
          fixingMethods,
          targets,
          length,
        },
      });
      console.log("Retrieved issues by target!");
    } else {
      res.sendStatus(404);
      console.log("\x1b[31m%s\x1b[0m", "Couldn't retrieve the issues!");
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

router.post("/", async (req, res) => {
  try {
    const { target } = req.body;
    const targetID = target._id;
    const issues = await issueModel.find({
      targetID: targetID,
      $or: [{ status: 0 }, { status: 1 }],
    });

    if (issues.length > 0) {
      res.sendStatus(409);
    } else {
      const result = await issueModel.create({
        targetID: targetID,
        status: 0,
      });
      if (result._id) {
        res.status(201).json({ result });
        console.log("A problem has been occured in " + target.target + ".");
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
      const result = await issueModel.deleteOne({ _id: id });
      if (result.deletedCount !== 0) {
        res.sendStatus(200);
        console.log("\x1b[32m%s\x1b[0m", "Issue deleted!");
      } else {
        res.sendStatus(400);
        console.log(
          "\x1b[31m%s\x1b[0m",
          "Couldn't find the issue for deletion. ID of the issue is " + id,
        );
      }
    } else {
      console.log(
        "\x1b[31m%s\x1b[0m",
        "Couldn't get the reguest for deletion!",
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
    var { values, id } = req.body;
    if (id) {
      if (values.fixingMethod) {
        const fixingMethodID = values.fixingMethod?._id;
        values.fixingMethod = undefined;
        values.fixingMethodID = fixingMethodID;
      }

      if (values.superior && values.problem) {
        var problemID = values.problem?.problem?._id;
        values.superior = undefined;
        values.problem = undefined;
        values.problemID = problemID;
      }
      values.techniciansID = values.technicians.map((tech) =>
        mongoose.Types.ObjectId(tech._id),
      );
      values.extraTechnicians = values.extraTechnicians?.map(
        (extraTech) => extraTech.title,
      );

      const result = await issueModel.updateOne({ _id: id }, { ...values });
      if (result.modifiedCount !== 0) {
        res.sendStatus(200);
        console.log("\x1b[32m%s\x1b[0m", "Issue edited!");
      } else {
        res.sendStatus(400);
        console.log(
          "\x1b[31m%s\x1b[0m",
          "Couldn't find the issue for update. ID of the issue is " + id,
        );
      }
    } else {
      console.log("\x1b[31m%s\x1b[0m", "Couldn't get the reguest for update!");
      res.sendStatus(400);
    }
  } catch (e) {
    res.sendStatus(500);
    console.log(e);
  }
});

router.put("/start", async (req, res) => {
  try {
    const { id } = req.body;

    const issueResult = await issueModel.updateOne(
      { _id: id },
      {
        start: essentials.getEST(),
        status: 1,
      },
    );
    if (issueResult.modifiedCount !== 0) {
      res.sendStatus(200);
      console.log(
        "\x1b[32m%s\x1b[0m",
        "Technicians started working on Issue " + id,
      );
    } else {
      res.sendStatus(400);
      console.log(
        "\x1b[31m%s\x1b[0m",
        req.user.name + " couldn't started the issue. ID of the issue is " + id,
      );
    }
  } catch (e) {
    res.sendStatus(500);
    console.log(e);
  }
});

router.put("/stop", async (req, res) => {
  try {
    const { id } = req.body;

    const issueResult = await issueModel.updateOne(
      { _id: id },
      {
        stop: essentials.getEST(),
        status: 2,
      },
    );
    if (issueResult.modifiedCount !== 0) {
      res.sendStatus(200);
      console.log(
        "\x1b[32m%s\x1b[0m",
        "Technicians stopped working on Issue " + id,
      );
    } else {
      res.sendStatus(400);
      console.log(
        "\x1b[31m%s\x1b[0m",
        req.user.name + " couldn't stopped the issue. ID of the issue is " + id,
      );
    }
  } catch (e) {
    res.sendStatus(500);
    console.log(e);
  }
});

router.put("/pause/start", async (req, res) => {
  try {
    const { id } = req.body;

    const issueResult = await issueModel.updateOne(
      { _id: id },
      {
        pauseStart: essentials.getEST(),
        paused: 1,
      },
    );
    if (issueResult.modifiedCount !== 0) {
      res.sendStatus(200);
      console.log("\x1b[32m%s\x1b[0m", req.user.name + " paused issue " + id);
    } else {
      res.sendStatus(400);
      console.log(
        "\x1b[31m%s\x1b[0m",
        req.user.name + " couldn't paused the issue. ID of the issue is " + id,
      );
    }
  } catch (e) {
    res.sendStatus(500);
    console.log(e);
  }
});

router.put("/pause/stop", async (req, res) => {
  try {
    const { id } = req.body;

    const issueResult = await issueModel.updateOne(
      { _id: id },
      {
        pauseStop: essentials.getEST(),
        paused: 2,
      },
    );
    if (issueResult.modifiedCount !== 0) {
      res.sendStatus(200);
      console.log("\x1b[32m%s\x1b[0m", req.user.name + " paused issue " + id);
    } else {
      res.sendStatus(400);
      console.log(
        "\x1b[31m%s\x1b[0m",
        req.user.name + " couldn't paused the issue. ID of the issue is " + id,
      );
    }
  } catch (e) {
    res.sendStatus(500);
    console.log(e);
  }
});

router.put("/changeType", async (req, res) => {
  try {
    var { id, issueType } = req.body;

    const issue = (await issueModel.find({ _id: id }))[0];

    if (issue.issueType === issueType) {
      issueType = 0;
    }

    const issueResult = await issueModel.updateOne(
      { _id: id },
      {
        issueType,
      },
    );
    if (issueResult.modifiedCount !== 0) {
      res.sendStatus(200);
      console.log(
        "Issue type has been changed to " + issueType + " on Issue " + id,
      );
    } else {
      res.sendStatus(400);
      console.log(
        "\x1b[31m%s\x1b[0m",
        req.user.name +
          " couldn't change the issue type. ID of the issue is " +
          id,
      );
    }
  } catch (e) {
    res.sendStatus(500);
    console.log(e);
  }
});

router.put("/upload", upload.single("file"), async (req, res) => {
  try {
    const { id } = req.body;
    const pipeline = {};
    if (req.file) {
      const image = req.file;
      const path = image.path;

      const filename = image.filename.replace(/\..+$/, "");
      const newFilename = `thumbnail-${filename}.${path.substring(
        path.lastIndexOf(".") + 1,
      )}`;
      await sharp(path)
        .rotate()
        .resize(200)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`${image.destination}/${newFilename}`);
      pipeline.image = req.file.path;
    }

    const isImageInPipeline = async () => {
      if (pipeline.image) {
        if ((await essentials.deleteIssueImage(id)) === 1) {
          return true;
        } else {
          return false;
        }
      }
      return true;
    };

    const isDeleted = await isImageInPipeline();
    if (isDeleted && id) {
      const result = await issueModel.updateOne({ _id: id }, pipeline);
      if (result.modifiedCount !== 0) {
        console.log("\x1b[32m%s\x1b[0m", "Issue picture has been updated!");
        res.sendStatus(200);
      } else {
        res.sendStatus(400);
        console.log(
          "\x1b[31m%s\x1b[0m",
          req.user.name +
            " didn't update the issue picture. ID of the issue is " +
            id,
        );
      }
    } else {
      console.log("\x1b[31m%s\x1b[0m", "Didn't get the reguest for updating!");
      res.sendStatus(400);
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

module.exports = router;
