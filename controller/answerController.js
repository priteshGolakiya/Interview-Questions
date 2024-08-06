const Answer = require("../models/answer");
const Question = require("../models/question");

const createAnswer = async (req, res) => {
  try {
    const { questionId, answers } = req.body;

    // Check if 'answers' is an array
    if (!Array.isArray(answers)) {
      return res.status(400).json({ message: "'answers' should be an array" });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const savedAnswers = [];

    for (let answerData of answers) {
      let content;

      // Handle different content types
      if (answerData.type === "paragraph") {
        content = answerData.content.text;
      } else if (answerData.type === "table") {
        content = JSON.stringify(answerData.content);
      } else if (answerData.type === "code") {
        content = JSON.stringify(answerData.content);
      } else {
        // Default case: stringify the content
        content = JSON.stringify(answerData.content);
      }

      const answer = new Answer({
        questionId,
        type: answerData.type,
        content: content,
      });

      await answer.save();
      savedAnswers.push(answer);

      question.answers.push(answer._id);
    }

    await question.save();

    res.status(201).json(savedAnswers);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


const getAnswers = async (req, res) => {
  try {
    const answers = await Answer.find().populate("questionId");
    res.json(answers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id).populate("questionId");
    if (!answer) return res.status(404).json({ message: "Answer not found" });
    res.json(answer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAnswer = async (req, res) => {
  try {
    const answer = await Answer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!answer) return res.status(404).json({ message: "Answer not found" });
    res.json(answer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteAnswer = async (req, res) => {
  try {
    const answer = await Answer.findByIdAndDelete(req.params.id);
    if (!answer) return res.status(404).json({ message: "Answer not found" });

    // Remove the answer from the question's answers array
    await Question.findByIdAndUpdate(answer.questionId, {
      $pull: { answers: answer._id },
    });

    res.json({ message: "Answer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAnswer,
  getAnswers,
  getAnswer,
  updateAnswer,
  deleteAnswer,
};
