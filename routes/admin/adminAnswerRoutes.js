const express = require("express");
const router = express.Router();
const {
  createAnswer,
  getAnswers,
  getAnswer,
  updateAnswer,
  deleteAnswer,
} = require("../../controller/answerController");

// Answer routes
router.post("/", createAnswer);
router.get("/", getAnswers);
router.get("/:id", getAnswer);
router.put("/:id", updateAnswer);
router.delete("/:id", deleteAnswer);

module.exports = router;
