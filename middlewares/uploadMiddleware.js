const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "avatars/");
  },
  filename: function (req, file, cb) {
    const extension = file.originalname.split(".").pop();
    cb(null, file.fieldname + "-" + Date.now() + "." + extension);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error("Only image files are allowed!"));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = upload;
