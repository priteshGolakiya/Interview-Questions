const express = require("express");
const router = express.Router();
const { getAnswers, getAnswer } = require("../../controller/answerController");

// Answer routes
router.get("/", getAnswers);
router.get("/:id", getAnswer);

module.exports = router;
