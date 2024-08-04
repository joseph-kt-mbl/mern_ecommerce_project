const express = require("express");
const { deleteImages } = require("../Controllers/uploadCtrl");
const { isAdmin, authMiddleware } = require("../Middlewares/authMiddleware");
const router = express.Router();



router.delete("/delete-img/:id", authMiddleware, isAdmin, deleteImages);

module.exports = router;