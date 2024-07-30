const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/images/"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ".jpeg");
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb({ message: "Unsupported file format" }, false);
  }
};

const uploadPhoto = multer({
  storage: storage,
  fileFilter: multerFilter,
  limits: { fileSize: 1000000 },
});

const resizeAndSaveImage = async (file, outputPath) => {
  const buffer = await sharp(file.path)
    .resize(300, 300)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toBuffer();
  
  fs.writeFileSync(outputPath, buffer);
  return path.resolve(outputPath);
};

const updateFilePaths = (req, updatedFiles) => {
  req.files.forEach((file, index) => {
    file.path = updatedFiles[index];
  });
};

const productImgResize = async (req, res, next) => {
  if (!req.files) return next();
  
  const updatedFiles = await Promise.all(
    req.files.map(async (file) => {
      const outputPath = path.join(__dirname, "../public/images/products/", file.filename);
      return await resizeAndSaveImage(file, outputPath);
    })
  );

  updateFilePaths(req, updatedFiles);
  next();
};

const blogImgResize = async (req, res, next) => {
  if (!req.files) return next();
  
  const updatedFiles = await Promise.all(
    req.files.map(async (file) => {
      const outputPath = path.join(__dirname, "../public/images/blogs/", file.filename);
      return await resizeAndSaveImage(file, outputPath);
    })
  );

  updateFilePaths(req, updatedFiles);
  next();
};


module.exports = { uploadPhoto, productImgResize, blogImgResize};
