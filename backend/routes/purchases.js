const express = require("express");
const sharp = require("sharp");
const router = express.Router();
const upload = require("../file");
const purchasesModel = require("../models/purchases");
const essentials = require("../utils/essentials");

router.post("/", upload.single("file"), async (req, res) => {
  try {
    let { parts, date, price, vendor } = req.body;

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

    const result = await purchasesModel.create({
      image: path,
      parts,
      date,
      vendor,
      price,
    });

    if (result._id) {
      console.log(req.user.name + " created " + parts + " purchase record!");
      res.status(201).json({ records: { purchase: result } });
    } else {
      res.sendStatus(400);
    }
  } catch (e) {
    res.sendStatus(500);
    console.log(e);
  }
});

router.get("/", async (_req, res) => {
  try {
    const purchases = await purchasesModel.find({}).sort({ createdAt: -1 });
    if (purchases) {
      res.status(200).json({ records: { purchases } });
      console.log("Retrieved purchases!");
    } else {
      res.sendStatus(404);
      console.log("\x1b[31m%s\x1b[0m", "Didn't retrieve purchases!");
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

router.delete("/", async (req, res) => {
  try {
    const id = req.body.id;
    if (id && (await essentials.deleteReceiptImage(id, "purchase")) === 1) {
      const result = await purchasesModel.deleteOne({ _id: id });
      if (result.deletedCount !== 0) {
        res.sendStatus(200);
        console.log("\x1b[32m%s\x1b[0m", "Purchase deleted!");
      } else {
        res.sendStatus(400);
        console.log(
          "\x1b[31m%s\x1b[0m",
          "Didn't find the purchase for deletion. ID of the purchase is " + id,
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
    let { id, date, vendor, parts, price } = req.body;

    price = essentials.numberFormatToEU(price);
    vendor = vendor.toUpperCase();
    parts = parts.toUpperCase();

    const pipeline = {
      date,
      vendor,
      parts,
      price: price,
    };
    if (req.file) {
      const image = req.file;

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
      pipeline.image = req.file.path;
    }

    const isImageInPipeline = async () => {
      if (pipeline.image) {
        if ((await essentials.deleteReceiptImage(id, "purchase")) === 1) {
          return true;
        } else {
          return false;
        }
      }
      return true;
    };

    if (isImageInPipeline() && id) {
      const result = await purchasesModel.updateOne({ _id: id }, pipeline);
      if (result.modifiedCount !== 0) {
        console.log("\x1b[32m%s\x1b[0m", "Purchase updated!");
        res.sendStatus(200);
      } else {
        res.sendStatus(400);
        console.log(
          "\x1b[31m%s\x1b[0m",
          req.user.name +
            " didn't update the purchase. ID of the purchase is " +
            id,
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
