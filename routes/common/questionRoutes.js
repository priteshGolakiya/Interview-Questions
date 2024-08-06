const express = require("express");
const router = express.Router();
const {
  getQuestions,
  getQuestion,
} = require("../../controller/questionController");

// Question routes
router.get("/", getQuestions);
router.get("/:id", getQuestion);

module.exports = router;
