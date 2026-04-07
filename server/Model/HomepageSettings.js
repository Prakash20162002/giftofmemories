import mongoose from "mongoose";

const HomeVideoSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["upload", "youtube"],
    default: "youtube",
  },
  url: {
    type: String,
    default: "",
  },
  youtubeId: {
    type: String,
    default: "",
  },
  title: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  thumbnailUrl: {
    type: String,
    default: "",
  },
  order: {
    type: Number,
    default: 0,
  },
});

const FAQSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
});

const HomepageSettingsSchema = new mongoose.Schema(
  {
    showProducts: {
      type: Boolean,
      default: true,
    },
    showServices: {
      type: Boolean,
      default: true,
    },
    showGallery: {
      type: Boolean,
      default: true,
    },
    showTestimonials: {
      type: Boolean,
      default: true,
    },
    showScrollGallery: {
      type: Boolean,
      default: true,
    },
    showStackedGallery: {
      type: Boolean,
      default: true,
    },
    showHomeVideo: {
      type: Boolean,
      default: true,
    },
    // Dynamic Section Titles
    productsSectionTitle: {
      type: String,
      default: "Premium Products",
    },
    productsSectionDescription: {
      type: String,
      default:
        "Transform your cherished moments into timeless keepsakes. Discover our handcrafted albums, gallery-quality prints, and bespoke merchandise designed to last generations.",
    },
    productsSectionBadge: {
      type: String,
      default: "Featured Collection",
    },
    servicesSectionTitle: {
      type: String,
      default: "Our Services",
    },
    servicesSectionDescription: {
      type: String,
      default:
        "From intimate weddings to stunning fashion editorials, our team brings creativity and technical excellence to every project, capturing life's most precious moments.",
    },
    servicesSectionBadge: {
      type: String,
      default: "What We Do",
    },
    homeVideos: [HomeVideoSchema],
    faqs: {
      type: [FAQSchema],
      default: [
        {
          question: "What are your starting packages?",
          answer:
            "Our wedding packages start from ₹75,000 for single-day coverage. Portrait sessions begin at ₹15,000. Contact us for a detailed price guide tailored to your needs.",
        },
        {
          question: "Do you travel for destination weddings?",
          answer:
            "Absolutely! We love capturing love stories across the globe. Travel and accommodation costs are additional for weddings outside Hyderabad.",
        },
        {
          question: "How long does it take to receive the photos?",
          answer:
            "We deliver a sneak peek of 20-30 highlight images within 3 days. The full edited gallery is delivered within 4-6 weeks after the event.",
        },
        {
          question: "Do you provide cinematic video services?",
          answer:
            "Yes, we have a dedicated team of cinematographers who specialize in creating wedding films, teasers, and event highlights.",
        },
      ],
    },
  },
  {
    timestamps: true,
  },
);

export const HomepageSettings = mongoose.model(
  "HomepageSettings",
  HomepageSettingsSchema,
);
