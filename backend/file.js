const multer = require("multer");
const uuid = require("uuid");
const path = require("path");
const fs = require("fs");

const getCount = (path) => {
  const count = fs.readdirSync(path).length - 1;
  if (count < 0) {
    return 0;
  }
  return count;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    var fileIndex = 0;
    const totalNumber = getCount("./imgs");
    fileIndex = totalNumber;
    if (!fs.existsSync("./imgs/" + totalNumber)) {
      fs.mkdirSync("./imgs/" + totalNumber);
    } else {
      const totalImage = fs.readdirSync("./imgs/" + totalNumber).length;
      if (totalImage > 500) {
        fileIndex += 1;
      }
    }
    const dest = `./imgs/${fileIndex}`;
    fs.access(dest, function (error) {
      if (error) {
        return fs.mkdir(dest, (error) => cb(error, dest));
      } else {
        return cb(null, dest);
      }
    });
  },
  filename: (req, file, cb) => {
    cb(null, uuid.v4() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

module.exports = upload;
