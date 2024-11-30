const fs = require("fs");

const partModel = require("../models/part");
const purchasesModel = require("../models/purchases");
const posModel = require("../models/po");
const userModel = require("../models/user.js");
const issueModel = require("../models/issue.js");

const moment = require("moment-timezone");

const numberFormatToEU = (number) => {
  number = number.replace(",", ".");
  return Number(number);
};

const deleteImage = async (id) => {
  try {
    const result = await partModel.find({ _id: id }, {});
    const image = result[0].image;
    const thumbnail =
      image.substring(0, image.indexOf("/")) +
      "/thumbnail-" +
      image.substring(image.indexOf("/") + 1);
    await fs.unlinkSync(image);
    await fs.unlinkSync(thumbnail);
    return 1;
  } catch (error) {
    console.log(error);
    return 0;
  }
};

const deleteUserImage = async (id) => {
  try {
    const result = await userModel.find({ _id: id }, {});
    const image = result[0].image;
    const thumbnail =
      image.substring(0, image.indexOf("/")) +
      "/thumbnail-" +
      image.substring(image.indexOf("/") + 1);
    await fs.unlinkSync(image);
    await fs.unlinkSync(thumbnail);
    return 1;
  } catch (error) {
    console.log(error);
    return 0;
  }
};

const deleteIssueImage = async (id) => {
  try {
    const result = await issueModel.find({ _id: id }, {});
    const image = result[0].image;
    if (image === "") {
      return 1;
    }
    const thumbnail =
      image.substring(0, image.indexOf("/")) +
      "/thumbnail-" +
      image.substring(image.indexOf("/") + 1);
    await fs.unlinkSync(image);
    await fs.unlinkSync(thumbnail);
    return 1;
  } catch (error) {
    console.log(error);
    return 0;
  }
};

const deleteReceiptImage = async (id, type) => {
  try {
    var result;
    var image;
    var thumbnail = undefined;
    if (type === "purchase") {
      result = await purchasesModel.find({ _id: id }, {});
      image = result[0].image;
      thumbnail =
        image.substring(0, image.indexOf("/")) +
        "/thumbnail-" +
        image.substring(image.indexOf("/") + 1);
    } else {
      result = await posModel.find({ _id: id });
      image = result[0].doc;
    }
    await fs.unlinkSync(image);
    if (thumbnail) {
      await fs.unlinkSync(thumbnail);
    }
    return 1;
  } catch (error) {
    console.log(error);
    return 0;
  }
};

const getEST = () => {
  const date = Date.now();
  return moment(date).tz("America/New_York").format();
};

const fromNow = (date) => {
  return moment(Date.now())
    .tz("America/New_York")
    .diff(moment(date).tz("America/New_York"), "minutes");
};

/*
 * Verify raw permissions according to check each permission given by user and condition
 * */

const verifyPermissions = (raw, perms = "w", condition = false) => {
  const _all = [...perms];
  var result = false;

  if (condition) {
    _all.forEach((p) => {
      result &= raw.includes(p);
    });
  } else {
    _all.forEach((p) => {
      result |= raw.includes(p);
    });
  }

  return result;
};

const extractRange = (selectedCase) => {
  switch (selectedCase) {
    case "today":
      return {
        start: moment()
          .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
          .tz("America/New_York")
          .toDate(),
        end: moment()
          .add(1, "days")
          .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
          .tz("America/New_York")
          .toDate(),
      };
    case "week":
      return {
        start: moment().startOf("isoweek").tz("America/New_York").toDate(),
        end: moment().endOf("isoweek").tz("America/New_York").toDate(),
      };

    case "month":
      return {
        start: moment().startOf("month").tz("America/New_York").toDate(),
        end: moment().endOf("month").tz("America/New_York").toDate(),
      };

    case "quarter":
      return {
        start: moment().startOf("quarter").tz("America/New_York").toDate(),
        end: moment().endOf("quarter").tz("America/New_York").toDate(),
      };
    case "year":
      return {
        start: moment().startOf("year").tz("America/New_York").toDate(),
        end: moment().endOf("year").tz("America/New_York").toDate(),
      };
    default:
      return { start: undefined, end: undefined };
  }
};

module.exports = {
  numberFormatToEU,
  deleteImage,
  deleteReceiptImage,
  deleteUserImage,
  deleteIssueImage,
  getEST,
  fromNow,
  verifyPermissions,
  extractRange,
};
