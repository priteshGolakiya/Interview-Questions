// routes/categoryRoutes.js
const express = require("express");
const {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  getCategoryQuestionsAndAnswers,
} = require("../../controller/categoryController");

const router = express.Router();

router.route("/").get(getCategories).post(createCategory);

router
  .route("/:id")
  .get(getCategory)
  .put(updateCategory)
  .delete(deleteCategory);

router.get("/:categoryIdOrName/questions", getCategoryQuestionsAndAnswers);

module.exports = router;
