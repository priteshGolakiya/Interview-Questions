// controllers/categoryController.js
const Category = require("../models/category");
const Question = require("../models/question");
const Answer = require("../models/answer");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

const createCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.create(req.body);
  res.status(201).json({
    success: true,
    data: category,
  });
});

const getCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find().populate("questions", "title");
  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories,
  });
});

const getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id).populate("questions");

  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});

const updateCategory = asyncHandler(async (req, res, next) => {
  let category = await Category.findById(req.params.id);

  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id of ${req.params.id}`, 404)
    );
  }

  category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: category,
  });
});

const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id of ${req.params.id}`, 404)
    );
  }

  await category.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

const getCategoryQuestionsAndAnswers = asyncHandler(async (req, res, next) => {
  const categoryIdOrName = req.params.categoryIdOrName;

  let category;

  // Check if the parameter is a valid ObjectId
  if (categoryIdOrName.match(/^[0-9a-fA-F]{24}$/)) {
    category = await Category.findById(categoryIdOrName);
  } else {
    category = await Category.findOne({ name: categoryIdOrName });
  }

  if (!category) {
    return next(
      new ErrorResponse(
        `Category not found with id or name of ${categoryIdOrName}`,
        404
      )
    );
  }

  const questions = await Question.find({ category: category._id }).populate(
    "answers"
  );

  res.status(200).json({
    success: true,
    data: {
      category: category.name,
      questions: questions.map((q) => ({
        id: q._id,
        title: q.title,
        description: q.description,
        difficulty: q.difficulty,
        answers: q.answers.map((a) => ({
          id: a._id,
          content: a.content,
          answerType: a.answerType,
          votes: a.votes,
        })),
      })),
    },
  });
});

module.exports = {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  getCategoryQuestionsAndAnswers,
};
