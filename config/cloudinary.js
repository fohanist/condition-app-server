const cloudinary = require("cloudinary");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CDI_NAME,
  api_key: process.env.CDI_KEY,
  api_secret: process.env.CDI_SECRET,
  secure: true,
});

module.exports = cloudinary;
