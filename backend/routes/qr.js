const express = require("express");
const sharp = require("sharp");
const upload = require("../file");

const mongoose = require("mongoose");
const router = express.Router();
//database models
const giveLogModel = require("../models/giveLog");
const partModel = require("../models/part");
const tagModel = require("../models/tag");
const locationModel = require("../models/location");
const vendorModel = require("../models/vendor");
const targetModel = require("../models/target");
const issueModel = require("../models/issue");
const fixingMethodModel = require("../models/fixingMethod");
const problemModel = require("../models/problem");
const superiorModel = require("../models/superior");
const userModel = require("../models/user.js");

const essentials = require("../utils/essentials");

router.get("/", async (req, res) => {
  try {
    const { id } = req.query;
    const parts = await partModel.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "locations",
          localField: "locationID",
          foreignField: "_id",
          as: "location",
        },
      },
      { $unwind: "$location" },
    ]);
    const host = req.protocol + "://" + req.get("host");
    const part = parts[0];
    if (part) {
      part.image = host + "/" + part.image;
      const issues = await issueModel
        .aggregate([
          {
            $match: {
              $expr: {
                $gt: [
                  "$createdAt",
                  {
                    $dateSubtract: {
                      startDate: "$$NOW",
                      unit: "day",
                      amount: 14,
                    },
                  },
                ],
              },
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
              from: "users",
              localField: "techniciansID",
              foreignField: "_id",
              as: "technicians",
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
          { $unwind: "$target" },
          {
            $unwind: {
              path: "$fixingMethod",
              preserveNullAndEmptyArrays: true,
            },
          },
          { $unwind: { path: "$superior", preserveNullAndEmptyArrays: true } },
          { $unwind: { path: "$problem", preserveNullAndEmptyArrays: true } },
        ])
        .sort({ createdAt: "desc" });
      if (issues) {
        res.status(200).json({ records: { part, issues } });
        console.log("Retrieved technicians!");
      } else {
        res.sendStatus(400);
        console.log("\x1b[31m%s\x1b[0m", "Didn't retrieve technicians!");
      }
    } else {
      res.sendStatus("404");
      console.log("\x1b[31m%s\x1b[0m", "Didn't retrieve part details!");
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

router.get("/target", async (req, res) => {
  try {
    const { id } = req.query;
    const target = await targetModel.findOne({ _id: id });
    if (target) {
      const issue = await issueModel.aggregate([
        {
          $match: {
            targetID: mongoose.Types.ObjectId(id),
            $or: [{ status: 1 }, { status: 0 }],
          },
        },
      ]);

      const openIssueState = async () => {
        const technicians = await userModel.find({}).select("-password");
        res.status(200).json({ records: { target, technicians } });
        console.log("QR Retrieved the target!");
      };

      if (issue.length > 0) {
        if (issue[0].status === 0) {
          await openIssueState();
        } else {
          console.log("QR Retrieved the issue!");
          const superiors = await superiorModel.find({
            targets: { $in: [target._id] },
          });
          const fixingMethods = await fixingMethodModel.find({});
          const technicians = await userModel.find({}).select("-password");
          if (superiors && fixingMethods && technicians) {
            res.status(200).json({
              records: {
                target,
                superiors,
                fixingMethods,
                technicians,
                issue: issue[0],
              },
            });
          } else {
            res.sendStatus(404);
          }
        }
      } else {
        await openIssueState();
      }
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

router.put("/issue/upload", upload.single("file"), async (req, res) => {
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

          "Issue picture has not been uploaded. ID of the issue is " + id,
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

router.put("/issue/pause/start", async (req, res) => {
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
      console.log("\x1b[32m%s\x1b[0m", id + " issue has been paused");
    } else {
      res.sendStatus(400);
      console.log(
        "\x1b[31m%s\x1b[0m",
        "Issue could not been paused. ID of the issue is " + id,
      );
    }
  } catch (e) {
    res.sendStatus(500);
    console.log(e);
  }
});

router.put("/issue/pause/stop", async (req, res) => {
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
      console.log("\x1b[32m%s\x1b[0m", id + " issue has been continued");
    } else {
      res.sendStatus(400);
      console.log(
        "\x1b[31m%s\x1b[0m",
        "Issue could not been continued. ID of the issue is " + id,
      );
    }
  } catch (e) {
    res.sendStatus(500);
    console.log(e);
  }
});

router.put("/issue/technicians", async (req, res) => {
  try {
    const { technicians, id } = req.body;

    const issueResult = await issueModel.updateOne(
      { _id: id },
      {
        techniciansID: technicians,
      },
    );
    if (issueResult.modifiedCount !== 0) {
      res.sendStatus(200);
      console.log(
        "\x1b[32m%s\x1b[0m",
        "Technicians are updated on issue " + id,
      );
    } else {
      res.sendStatus(400);
      console.log(
        "\x1b[31m%s\x1b[0m",
        "Technicians could not been updated. ID of the issue is " + id,
      );
    }
  } catch (e) {
    res.sendStatus(500);
    console.log(e);
  }
});

router.get("/operator", async (req, res) => {
  try {
    const { id } = req.query;
    const target = await targetModel.find({ _id: id });
    if (target.length > 0) {
      const issue = await issueModel.aggregate([
        {
          $match: {
            targetID: mongoose.Types.ObjectId(id),
            $or: [{ status: 1 }, { status: 0 }],
          },
        },
      ]);
      if (issue.length > 0) {
        res.sendStatus(400);
      } else {
        res.status(200).json({ records: { target: target[0] } });
        console.log("QR Operator retrieved the target!");
      }
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

router.post("/give", async (req, res) => {
  try {
    let {
      id,
      price,
      count,
      technicianID,
      outputQuantity,
      locationID,
      issueID,
    } = req.body;

    const result = await giveLogModel.create({
      itemID: id,
      userID: undefined,
      count,
      technicianID,
      outputQuantity,
      locationID,
      issueID,
    });
    if (result._id) {
      const productResult = await partModel.updateOne(
        { _id: id },
        {
          count: count - outputQuantity,
          totalPrice: (count - outputQuantity) * price,
        },
      );

      if (result._id && productResult.modifiedCount !== 0) {
        res.status(201).json({ result });
        console.log(
          "Taken " +
            outputQuantity +
            " out of " +
            count +
            " " +
            id +
            " by " +
            technicianID +
            " for " +
            issueID +
            " issue.",
        );
      } else {
        res.sendStatus(400);
      }
    } else {
      res.sendStatus(400);
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

router.get("/location", async (req, res) => {
  try {
    const { id } = req.query;
    const labels = await tagModel.find({});
    const vendors = await vendorModel.find({});
    const loc = await locationModel.findOne({ _id: id });
    if (labels && vendors && loc) {
      res.status(200).json({
        records: {
          labels: labels,
          location: loc,
          vendors: vendors,
        },
      });
      console.log("Retrieved datas!");
    } else {
      res.sendStatus(404);
      console.log("\x1b[31m%s\x1b[0m", "Didn't retrieve datas!");
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

router.post("/location", upload.single("file"), async (req, res) => {
  try {
    let { count, vendorsID, minQuantity, locationID, partName, price, tagsID } =
      req.body;

    const image = req.file;
    const path = image.path;

    const filename = image.filename.replace(/\..+$/, "");
    const newFilename = `thumbnail-${filename}.${image.path.substring(
      image.path.lastIndexOf(".") + 1,
    )}`;
    await sharp(image.path)
      .rotate()
      .resize(200)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`${image.destination}/${newFilename}`);

    const result = await partModel.create({
      image: path,
      count,

      vendorsID: vendorsID.split(","),
      minQuantity,
      locationID,
      partName,
      price,
      tagsID: tagsID.length === 0 ? [] : tagsID.split(","),
      totalPrice: price * count,
    });

    if (result._id) {
      console.log(
        req.socket.remoteAddress + " added " + partName + " product!",
      );
      res.status(201).json({ records: { part: result } });
    } else {
      res.sendStatus(400);
    }
  } catch (e) {
    res.json({ error: e });
    console.log(e);
  }
});

router.get("/problem/find", async (req, res) => {
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

router.post("/issue/open", async (req, res) => {
  try {
    const { targetID, technicians } = req.body;

    const issue = await issueModel.find({
      targetID: targetID,
      status: 0,
    });
    if (issue.length > 0) {
      const result = await issueModel.updateOne(
        { _id: issue[0]._id },
        {
          techniciansID: technicians,
          start: essentials.getEST(),
          status: 1,
        },
      );
      if (result.modifiedCount > 0) {
        res.sendStatus(200);
      } else {
        res.sendStatus(400);
      }
    } else {
      const result = await issueModel.create({
        targetID: targetID,
        techniciansID: technicians,
        start: essentials.getEST(),
      });
      if (result._id) {
        res.status(201).json({ records: { issue: result } });
        console.log(
          technicians.join(", ") + " started maintaining in " + targetID + ".",
        );
      } else {
        res.sendStatus(400);
      }
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

router.post("/operator/request", async (req, res) => {
  try {
    const { id } = req.body;

    const result = await issueModel.create({
      targetID: id,
      status: 0,
    });
    if (result._id) {
      res.sendStatus(201);
      console.log("An operator created an issue request over target " + id);
    } else {
      res.sendStatus(400);
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

router.put("/issue/close", async (req, res) => {
  try {
    const { id, comment, fixingMethodID, problemID } = req.body;
    console.log(problemID);
    const issue = await issueModel.updateOne(
      { _id: id },
      {
        stop: essentials.getEST(),
        comment: comment,
        status: 2,
        fixingMethodID: fixingMethodID,
        problemID: problemID,
      },
    );

    if (issue.modifiedCount !== 0) {
      res.status(200).json({ records: { issue } });
    } else {
      res.sendStatus(400);
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

module.exports = router;
