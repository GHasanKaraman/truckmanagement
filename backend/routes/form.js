const express = require("express");
const router = express.Router();

const essentials = require("../utils/essentials");
const formModel = require("../models/form");
const truckModel = require("../models/truck");
const { default: mongoose } = require("mongoose");

router.get("/details", async (req, res) => {
  try {
    const { id } = req.query;
    const form = await formModel.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "images",
          localField: "imageIDs",
          foreignField: "_id",
          as: "images",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userID",
          foreignField: "_id",
          as: "user",
          pipeline: [{ $project: { password: 0 } }],
        },
      },
      { $unwind: "$user" },
    ]);
    if (form.length === 1) {
      res.status(200).json({ records: { form: form[0] } });
      console.log(req.user + " pulled the details about the " + id);
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
    var { from, to, show, search, page, truck } = req.query;

    if (!from && !to && show !== "special") {
      const { start, end } = essentials.extractRange(show);
      if (start && end) {
        from = start;
        to = end;
      }
    }

    const forms = await formModel.aggregate([
      show === "special"
        ? {
            $match: { $or: [{ formType: 2 }, { formType: 1 }] },
          }
        : { $match: {} },
      from && to
        ? {
            $match: {
              $or: [
                {
                  createdAt: { $gte: new Date(from), $lt: new Date(to) },
                },
              ],
            },
          }
        : { $match: {} },
      {
        $lookup: {
          from: "images",
          localField: "imageIDs",
          foreignField: "_id",
          as: "images",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userID",
          foreignField: "_id",
          as: "user",
          pipeline: [{ $project: { password: 0 } }],
        },
      },
      { $unwind: "$user" },
      { $sort: { createdAt: -1 } },
      search && search !== ""
        ? {
            $match: {
              $or: [
                { "user.name": { $regex: search, $options: "i" } },
                { "user.surname": { $regex: search, $options: "i" } },
              ],
            },
          }
        : { $match: {} },
    ]);

    var data = Object.values(forms);

    const trucks = await truckModel.find({});
    if (forms && trucks) {
      if (truck) {
        //filter
        data = data.filter((item) => item.truck === truck);
      }

      const length = data.length;

      res.status(200).json({
        records: {
          forms: data.slice((page - 1) * 18, (page - 1) * 18 + 18),
          trucks: trucks,
          length,
        },
      });
      console.log("Retrieved forms by truck!");
    } else {
      res.sendStatus(404);
      console.log("\x1b[31m%s\x1b[0m", "Couldn't retrieve the forms!");
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

router.delete("/", async (req, res) => {
  try {
    const id = req.body.id;
    if (id) {
      const result = await formModel.deleteOne({ _id: id });
      if (result.deletedCount !== 0) {
        res.sendStatus(200);
        console.log("\x1b[32m%s\x1b[0m", "Form deleted!");
      } else {
        res.sendStatus(400);
        console.log(
          "\x1b[31m%s\x1b[0m",
          "Couldn't find the form for deletion. ID of the form is " + id,
        );
      }
    } else {
      console.log(
        "\x1b[31m%s\x1b[0m",
        "Couldn't get the request for deletion!",
      );
      res.sendStatus(400);
    }
  } catch (e) {
    res.sendStatus(500);
    console.log(e);
  }
});

router.put("/changeType", async (req, res) => {
  try {
    var { id, formType } = req.body;

    const form = (await formModel.find({ _id: id }))[0];

    if (form.formType === formType) {
      formType = 0;
    }

    const formResult = await formModel.updateOne(
      { _id: id },
      {
        formType,
      },
    );
    if (formResult.modifiedCount !== 0) {
      res.sendStatus(200);
      console.log(
        "Form type has been changed to " + formType + " on form " + id,
      );
    } else {
      res.sendStatus(400);
      console.log(
        "\x1b[31m%s\x1b[0m",
        req.user.name +
          " couldn't change the form type. ID of the form is " +
          id,
      );
    }
  } catch (e) {
    res.sendStatus(500);
    console.log(e);
  }
});

module.exports = router;
