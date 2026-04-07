import { FAQ } from "../Model/FAQ.js";

export const getFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find({ isActive: true }).sort({
      order: 1,
      createdAt: 1,
    });
    res.json(faqs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch FAQs" });
  }
};

export const getAllFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ order: 1, createdAt: 1 });
    res.json(faqs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch FAQs" });
  }
};

export const addFAQ = async (req, res) => {
  try {
    const { question, answer, order } = req.body;
    const faq = new FAQ({ question, answer, order });
    await faq.save();
    res.status(201).json(faq);
  } catch (err) {
    res.status(400).json({ message: "Failed to add FAQ" });
  }
};

export const updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, order, isActive } = req.body;
    const faq = await FAQ.findByIdAndUpdate(
      id,
      { question, answer, order, isActive },
      { new: true },
    );
    res.json(faq);
  } catch (err) {
    res.status(400).json({ message: "Failed to update FAQ" });
  }
};

export const deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    await FAQ.findByIdAndDelete(id);
    res.json({ message: "FAQ deleted" });
  } catch (err) {
    res.status(400).json({ message: "Failed to delete FAQ" });
  }
};
