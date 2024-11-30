const express = require("express");
const sharp = require("sharp");
const upload = require("../file");

const partModel = require("../models/part.js");
const giveLogModel = require("../models/giveLog");
const consumeLogModel = require("../models/consumeLog.js");
const vendorModel = require("../models/vendor.js");
const locationModel = require("../models/location");
const tagModel = require("../models/tag");
const issueModel = require("../models/issue.js");

const essentials = require("../utils/essentials");

const router = express.Router();

router.get("/add", async (req, res) => {
  try {
    const vendors = await vendorModel.find({});
    const locations = await locationModel.find({});
    const tags = await tagModel.find({});

    if (vendors && locations && tags) {
      res.status(200).json({ records: { vendors, locations, tags } });
      console.log("Retrieved new part form datas!");
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

router.get("/", async (req, res) => {
  try {
    const { facility } = req.query;

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

    const locations = await locationModel.find({});
    const vendors = await vendorModel.find({});
    const tags = await tagModel.find({});

    if (parts && locations && vendors && tags) {
      console.log("Retrieved stock table!");
      res.status(200).json({
        records: { parts, locations, vendors, tags },
      });
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

router.get("/issues", async (req, res) => {
  try {
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
          $unwind: { path: "$fixingMethod", preserveNullAndEmptyArrays: true },
        },
        { $unwind: { path: "$superior", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$problem", preserveNullAndEmptyArrays: true } },
      ])
      .sort({ createdAt: "desc" });
    if (issues) {
      res.status(200).json({
        records: { ...issues },
      });
      console.log("Retrieved last 2 weeks issues!");
    } else {
      res.sendStatus(404);
      console.log("\x1b[31m%s\x1b[0m", "Didn't retrieve issues!");
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

router.post("/", upload.single("file"), async (req, res) => {
  try {
    let { count, vendorsID, minQuantity, locationID, partName, price, tagsID } =
      req.body;

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
      console.log(req.user.name + " added " + partName + " product!");
      res.status(201).json({ result });
    } else {
      res.sendStatus(400);
    }
  } catch (e) {
    res.sendStatus(500);
    console.log(e);
  }
});

router.delete("/", async (req, res) => {
  try {
    const id = req.body.id;
    if (id && (await essentials.deleteImage(id)) === 1) {
      const result = await partModel.deleteOne({ _id: id });
      if (result.deletedCount !== 0) {
        res.sendStatus(200);
        console.log("\x1b[32m%s\x1b[0m", "Part deleted!");
      } else {
        res.sendStatus(400);
        console.log(
          "\x1b[31m%s\x1b[0m",
          "Didn't find the part for deletion. ID of the item is " + id,
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

router.put("/", upload.single("file"), async (req, res) => {
  try {
    let {
      id,
      count,
      vendorsID,
      minQuantity,
      locationID,
      partName,
      price,
      tagsID,
    } = req.body;

    const pipeline = {
      count,
      vendorsID: vendorsID.split(","),
      minQuantity,
      locationID,
      partName,
      price,
      tagsID: tagsID.length === 0 ? [] : tagsID.split(","),
      totalPrice: price * count,
    };

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
        if ((await essentials.deleteImage(id)) === 1) {
          return true;
        } else {
          return false;
        }
      }
      return true;
    };

    if (isImageInPipeline() && id) {
      const result = await partModel.updateOne({ _id: id }, pipeline);
      if (result.modifiedCount !== 0) {
        console.log("\x1b[32m%s\x1b[0m", "Part has been updated!");
        res.sendStatus(200);
      } else {
        res.sendStatus(400);
        console.log(
          "\x1b[31m%s\x1b[0m",
          req.user.name + " didn't update the part. ID of the part is " + id,
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

router.post("/consume", async (req, res) => {
  try {
    let { values } = req.body;
    let { id, count, parts, technicianID, wanted_count, price, new_location } =
      values;
    const result = await consumeLogModel.create({
      itemID: id,
      userID: req.user._id,
      count,
      parts,
      technicianID,
      wanted_count,
      source: new_location,
    });
    if (result._id) {
      const productResult = await partModel.updateOne(
        { _id: id },
        {
          count: count - wanted_count,
          totalPrice: (count - wanted_count) * price,
        },
      );

      if (result._id && productResult.modifiedCount !== 0) {
        res.status(201).json({ result });
        console.log(
          req.user.name +
            " gave " +
            wanted_count +
            " out of " +
            count +
            " " +
            parts +
            " to " +
            new_location +
            " as consumables.",
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

router.put("/give", async (req, res) => {
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
      userID: req.user._id,
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
          req.user.name +
            " gave " +
            outputQuantity +
            " out of " +
            count +
            " " +
            id +
            " to " +
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

router.put("/consume", async (req, res) => {
  try {
    let { id, price, count, technicianID, outputQuantity, locationID } =
      req.body;

    const result = await consumeLogModel.create({
      itemID: id,
      userID: req.user._id,
      technicianID,
      outputQuantity,
      locationID,
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
          req.user.name +
            " gave " +
            outputQuantity +
            " out of " +
            count +
            " " +
            id +
            " to " +
            technicianID +
            " as consumables",
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

module.exports = router;
