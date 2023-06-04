import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // fs.access("./uploads", function (error) {
    //   if (error) {
    //     console.log("Directory does not exist.");
    //     fs.mkdirSync("./uploads");
    //   }
    // });
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpg") {
    cb(null, true);
  }
};

const upload = multer({ storage: storage, FileFilter: fileFilter });
export const imgUpload = upload.single("image");
