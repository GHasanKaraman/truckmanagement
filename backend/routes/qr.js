const express = require("express");
const sharp = require("sharp");
const upload = require("../file");

const router = express.Router();

const truckModel = require("../models/truck.js");
const imageModel = require("../models/image.js");
const formModel = require("../models/form.js");
const userModel = require("../models/user.js");

router.get("/truck", async (req, res) => {
  try {
    const { id } = req.body;
    const trucks = await truckModel.find({ id });
    const users = await userModel.find({ showQR: true }).select("-password");
    if (trucks) {
      res.status(200).json({
        records: { truck: trucks[0], users },
      });
      console.log("Retrieved truck information from QR!");
    } else {
      res.sendStatus(404);
      console.log(
        "\x1b[31m%s\x1b[0m",
        "Didn't retrieve QR truck informations!",
      );
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

router.post("/preoperational", upload.any(), async (req, res) => {
  try {
    await Promise.all(
      req.files.map(async (file) => {
        const filename = file.filename.replace(/\..+$/, "");
        const newFilename = `thumbnail-${filename}.jpeg`;

        await sharp(file.path)
          .rotate()
          .resize(200)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(`${file.destination}/${newFilename}`);
      }),
    );

    const imageDetails = req.files.map((file) => {
      let i = file.destination.lastIndexOf("/") + 1;
      return {
        folderIndex: file.destination.slice(i),
        fileName: file.filename,
      };
    });

    const result = await imageModel.insertMany(imageDetails);
    if (result) {
      const data = req.body;
      var status = undefined;
      if (
        data.truck &&
        data.isCabinClean === "Yes" &&
        data.isBackClean === "Yes" &&
        data.isThereProblem === "Yes" &&
        data.areLightsWorking === "Yes" &&
        data.areThereDEF === "Yes"
      ) {
        status = 1;
      }

      const imageIDs = result.map((info) => info._id);
      const form = await formModel.create({
        ...data,
        imageIDs,
        status,
      });

      if (form) {
        console.log("A truck form has been successfully created!");
        res.status(201).json({ form });
      } else {
        console.log("Something went wrong while creating truck form!");
        res.sendStatus(404);
      }
    } else {
      console.log("Image info has not been written in the database!");
      res.sendStatus(404);
    }
    console.log(result);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

module.exports = router;
