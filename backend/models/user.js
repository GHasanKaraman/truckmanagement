const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    image: { type: String, default: "" },
    name: { type: String, required: true },
    surname: { type: String, required: true },
    username: { type: String, required: true },
    showQR: { type: Boolean, default: false }, //true = show the name, false = do not show the name
    password: {
      type: String,
      required: true,
      default: "202cb962ac59075b964b07152d234b70", //md5(123)
    },
    facility: { type: String, required: true, default: "vreeland" },
    phone: { type: String, required: true, default: "0000000000" },
    position: { type: String, required: true, default: "Technician" },
    zone: { type: String, required: true, default: "zone 1" },
    nkey: { type: String, default: "" },
    notifications: { type: String, default: "disabled" },
    permissions: { type: String },
    accountStatus: { type: Boolean, default: true }, //true = Active, false = Deactive
  },
  { timestamps: true },
);

const user = mongoose.model("user", userSchema);

module.exports = user;
