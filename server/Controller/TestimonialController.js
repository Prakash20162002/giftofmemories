import { Testimonial } from "../Model/Testimonial.js";
export const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find();
    res.status(200).json(testimonials);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
export const addTestimonial = async (req, res) => {
  try {
    const { name, feedback, title } = req.body;

    if (!name || !feedback) {
      return res
        .status(400)
        .json({ message: "Name and feedback are required" });
    }

    const newTestimonial = new Testimonial({
      name,
      feedback,
      title,
    });
    await newTestimonial.save();
    res.status(201).json({
      message: "Testimonial added successfully",
      testimonial: newTestimonial,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
export const updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, feedback, title } = req.body;

    const updatedTestimonial = await Testimonial.findByIdAndUpdate(
      id,
      { name, feedback, title },
      { new: true, runValidators: true }
    );

    if (!updatedTestimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }
    res.status(200).json({
      message: "Testimonial updated successfully",
      testimonial: updatedTestimonial,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
export const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTestimonial = await Testimonial.findByIdAndDelete(id);
    if (!deletedTestimonial) {
      return res.status(404).json({ message: "Testimonial not found" });
    }
    res.status(200).json({ message: "Testimonial deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
