const cloudinary = require("../../config/cloudinary");
const express = require("express");
const router = express.Router();
const pool = require("../../config/database.js");
const verifyToken = require("../middleware/verifyToken");
const multer = require("multer");
const upload = multer();

function avatarUpload(request, response, next) {
  const base64 = Buffer.from(request.file.buffer, "bytes").toString("base64");
  cloudinary.v2.uploader.upload(
    `data:image/png;base64,${base64}`,
    { folder: "/condition-app" },
    (error, result) => {
      if (result) {
        request.imageUrl = result.url;
        next();
      } else {
        response.json({
          success: true,
          message: error,
        });
      }
    }
  );
}

function avatarUpdate(request, response) {
  const userData = request.userTokenInfo;
  const text = "UPDATE users SET avatar_url = $1 WHERE user_id = $2 ";
  const values = [request.imageUrl, userData.userId];

  pool.query(text, values).then(() => {
    response.json({
      success: true,
    });
  });
}

router.use("/", verifyToken);
router.put("/", upload.single("imageFile"), avatarUpload);
router.put("/", avatarUpdate);

module.exports = router;
