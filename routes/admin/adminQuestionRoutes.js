const express = require("express");
const router = express.Router();
const {
  createQuestion,
  getQuestions,
  getQuestion,
  updateQuestion,
  deleteQuestion,
} = require("../../controller/questionController");
const {createQuestionWithAnswers} = require("../../controller/createQuestionWithAnswers.js")
// Question routes
router.post("/", createQuestion);
router.get("/", getQuestions);
router.get("/:id", getQuestion);
router.put("/:id", updateQuestion);
router.delete("/:id", deleteQuestion);
router.post("/questions", createQuestionWithAnswers);
module.exports = router;
