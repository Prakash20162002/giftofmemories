import React, { useState, useRef } from "react";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css"; // The native MS Word styling
import { X, Save, ImagePlus } from "lucide-react";
import { motion } from "framer-motion";

const BlogEditor = ({ blog, onSave, onCancel }) => {
  const [title, setTitle] = useState(blog?.title || "");
  const [category, setCategory] = useState(blog?.category || "Weddings");
  const [excerpt, setExcerpt] = useState(blog?.excerpt || "");
  const [coverImage, setCoverImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(blog?.image || null);
  
  // This single state replaces the entire Tiptap editor setup!
  const [content, setContent] = useState(blog?.content || "");

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content) return;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("excerpt", excerpt);
    formData.append("content", content);
    formData.append(
      "date",
      blog?.date ||
        new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
    );

    if (coverImage) formData.append("image", coverImage);

    onSave(formData);
  };

  // SunEditor Configuration (The "MS Word" layout)
  const editorOptions = {
    mode: "classic",
    rtl: false,
    imageResizing: true,
    videoResizing: true,
    // By default, SunEditor saves uploaded images as Base64 strings, matching your current backend setup perfectly.
    buttonList: [
      ["undo", "redo"],
      ["font", "fontSize", "formatBlock"],
      ["paragraphStyle", "blockquote"],
      ["bold", "underline", "italic", "strike", "subscript", "superscript"],
      ["fontColor", "hiliteColor", "textStyle"],
      ["removeFormat"],
      "/", // Line break - drops the next tools to a new row just like Word
      ["outdent", "indent"],
      ["align", "horizontalRule", "list", "lineHeight"],
      ["table", "link", "image", "video"],
      ["fullScreen", "showBlocks", "codeView"]
    ],
    defaultStyle: "font-family: 'Inter', sans-serif; font-size: 18px; line-height: 1.8;",
    font: ["Inter", "Playfair Display", "Arial", "Courier New", "Georgia"],
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto pb-20 font-inter text-left"
    >
      {/* HEADER CONFIGURATION */}
      <div className="bg-white border border-charcoal-black/10 rounded-[2.5rem] p-10 mb-8 shadow-sm text-left">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="font-playfair text-4xl font-bold text-charcoal-black">
              Studio Editor
            </h2>
            <p className="text-slate-gray text-sm mt-1 uppercase tracking-widest font-medium">
              SunEditor Workflow
            </p>
          </div>

          <button
            onClick={onCancel}
            className="p-3 hover:bg-red-50 text-slate-gray hover:text-red-500 rounded-full transition-all"
          >
            <X size={28} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gold-accent mb-2 block">
                Article Headline
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-6 py-4 bg-warm-ivory border border-charcoal-black/10 rounded-2xl focus:border-gold-accent outline-none font-playfair text-xl font-bold"
                placeholder="Headline goes here..."
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gold-accent mb-2 block">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-6 py-4 bg-warm-ivory border border-charcoal-black/10 rounded-2xl focus:border-gold-accent outline-none text-sm font-bold appearance-none"
              >
                <option>Weddings</option>
                <option>Portraits</option>
                <option>Cinematic</option>
                <option>Behind the Lens</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gold-accent mb-2 block">
                Excerpt
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                className="w-full px-6 py-4 bg-warm-ivory border border-charcoal-black/10 rounded-2xl focus:border-gold-accent outline-none text-sm"
                placeholder="Short summary of the blog..."
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gold-accent mb-2 block">
              Main Banner Image
            </label>
            <div className="relative group h-[260px] bg-warm-ivory border-2 border-dashed border-charcoal-black/10 rounded-3xl overflow-hidden flex items-center justify-center transition-all hover:border-gold-accent">
              {previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    alt="Preview"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <label className="cursor-pointer bg-white text-charcoal-black px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl">
                      Swap Banner
                    </label>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <ImagePlus className="mx-auto text-slate-gray/30 mb-3" size={40} />
                  <p className="text-[10px] font-bold text-slate-gray uppercase">
                    Upload Journal Cover
                  </p>
                </div>
              )}

              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileChange}
                accept="image/*"
              />
            </div>
          </div>
        </div>
      </div>

      {/* THE SUNEDITOR CANVAS */}
      <div className="bg-[#ebebeb] p-4 md:p-14 rounded-[3rem] border border-charcoal-black/5 shadow-inner flex flex-col items-center">
        <div className="w-full max-w-[1000px] shadow-2xl rounded-2xl overflow-hidden bg-white">
          <SunEditor
            setOptions={editorOptions}
            setContents={content}
            onChange={setContent}
            height="800px" // Mimics a standard Word Document height
          />
        </div>
      </div>

      {/* PUBLISH ACTIONS */}
      <div className="fixed bottom-10 right-10 z-[100] flex gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-10 py-4 bg-white border border-charcoal-black/10 text-slate-gray rounded-full font-bold text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:bg-red-50 transition-all"
        >
          Discard
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          className="px-12 py-5 bg-charcoal-black text-gold-accent rounded-full font-bold text-[10px] uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
        >
          <Save size={18} /> {blog ? "Save Changes" : "Publish to Journal"}
        </button>
      </div>
      
      <style>{`
        /* Overrides to make SunEditor blend seamlessly into your Luxury Theme */
        .sun-editor {
            border: none !important;
        }
        .sun-editor .se-toolbar {
            background-color: #f9f9f9 !important;
            outline: none !important;
            border-bottom: 1px solid #eee !important;
            padding: 10px !important;
        }
        .sun-editor .se-wrapper .se-wrapper-inner {
            padding: 40px !important;
        }
      `}</style>
    </motion.div>
  );
};

export default BlogEditor;