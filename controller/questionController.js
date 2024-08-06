const Question = require("../models/question");
const Category = require("../models/category");

// Utility function to validate ObjectId
const isValidObjectId = (id) => {
  return id && id.match(/^[0-9a-fA-F]{24}$/);
};

const createQuestion = async (req, res) => {
  try {
    const { categoryId, ...questionData } = req.body;

    if (!isValidObjectId(categoryId)) {
      return res.status(400).json({ message: "Invalid category ID format" });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const question = new Question({
      ...questionData,
      category: categoryId,
    });
    await question.save();

    category.questions.push(question._id);
    await category.save();

    res.status(201).json(question);
  } catch (error) {
    console.error("Error creating question:", error);
    res.status(400).json({ message: error.message });
  }
};

const getQuestions = async (req, res) => {
  try {
    const { category, page = 1, limit = 10, search } = req.query;
    let query = {};

    // Category filter
    if (category) {
      const foundCategory = await Category.findOne({
        name: new RegExp(category, "i"),
      });
      if (foundCategory) {
        query.category = foundCategory._id;
      } else {
        return res.status(404).json({ message: "Category not found" });
      }
    }

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Execute query with pagination
    const questions = await Question.find(query)
      .populate("category", "name")
      .populate("answers")
      .skip(skip)
      .limit(limitNumber);

    // Get total count for pagination info
    const totalQuestions = await Question.countDocuments(query);

    res.json({
      questions,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalQuestions / limitNumber),
      totalQuestions,
    });
  } catch (error) {
    console.error("Error retrieving questions:", error);
    res.status(500).json({ message: error.message });
  }
};

const getQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate("category", "name")
      .populate("answers");
    if (!question)
      return res.status(404).json({ message: "Question not found" });
    res.json(question);
  } catch (error) {
    console.error("Error retrieving question:", error);
    res.status(500).json({ message: error.message });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const { categoryId, ...updateData } = req.body;

    if (categoryId) {
      if (!isValidObjectId(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID format" });
      }

      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      updateData.category = categoryId;
    }

    const question = await Question.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate("category", "name");

    if (!question)
      return res.status(404).json({ message: "Question not found" });

    res.json(question);
  } catch (error) {
    console.error("Error updating question:", error);
    res.status(400).json({ message: error.message });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question)
      return res.status(404).json({ message: "Question not found" });

    await Category.findByIdAndUpdate(question.category, {
      $pull: { questions: question._id },
    });

    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    console.error("Error deleting question:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createQuestion,
  getQuestions,
  getQuestion,
  updateQuestion,
  deleteQuestion,
};
