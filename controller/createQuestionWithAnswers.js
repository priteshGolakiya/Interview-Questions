const mongoose = require("mongoose");
const Question = require("../models/question");
const Answer = require("../models/answer");
const Category = require("../models/category");

const createQuestionWithAnswers = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { categoryId, title, description, difficulty, tags, answers } =
      req.body;

    // Validate category
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: "Invalid category ID format" });
    }

    const category = await Category.findById(categoryId).session(session);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Create question
    const question = new Question({
      title,
      description,
      difficulty,
      category: categoryId,
      tags,
    });

    // Process answers
    const answerIds = [];
    for (let answerData of answers) {
      let content;

      switch (answerData.type) {
        case "paragraph":
          content = answerData.content.text;
          break;
        case "table":
        case "code":
          content = JSON.stringify(answerData.content);
          break;
        default:
          content = JSON.stringify(answerData.content);
      }

      const answer = new Answer({
        questionId: question._id,
        type: answerData.type,
        content: content,
      });

      await answer.save({ session });
      answerIds.push(answer._id);
    }

    question.answers = answerIds;
    await question.save({ session });

    // Update category
    category.questions.push(question._id);
    await category.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Fetch the complete question with populated answers
    const populatedQuestion = await Question.findById(question._id).populate(
      "answers"
    );

    res.status(201).json(populatedQuestion);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error creating question with answers:", error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createQuestionWithAnswers,
};
