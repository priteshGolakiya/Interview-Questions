// routes/categoryRoutes.js
const express = require("express");
const {
  getCategories,
  getCategory,

  getCategoryQuestionsAndAnswers,
} = require("../../controller/categoryController");

const router = express.Router();

router.route("/").get(getCategories);

router.route("/:id").get(getCategory);

router.get("/:categoryIdOrName/questions", getCategoryQuestionsAndAnswers);

module.exports = router;
