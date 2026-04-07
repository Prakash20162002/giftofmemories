import { RichTextEditor } from "@mantine/tiptap";
import { useEditor, NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import Highlight from "@tiptap/extension-highlight";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Superscript from "@tiptap/extension-superscript";
import SubScript from "@tiptap/extension-subscript";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { useEffect, useState, useRef } from "react";
import { 
  X, Save, Image as ImageIcon, ImagePlus, 
  AlignLeft, AlignCenter, AlignRight, Trash2 
} from "lucide-react";
import { motion } from "framer-motion";

// --- THE FIX: ADDED TOUCH SUPPORT FOR MOBILE RESIZING ---
const ResizableImageComponent = ({ node, updateAttributes, selected }) => {
  const imgRef = useRef(null);

  const startResizing = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if it's a touch event (mobile) or mouse event (desktop)
    const isTouch = e.type === 'touchstart';
    const startX = isTouch ? e.touches[0].clientX : e.clientX;
    const startWidth = imgRef.current.clientWidth;

    const onMove = (moveEvent) => {
      requestAnimationFrame(() => {
        const currentX = isTouch ? moveEvent.touches[0].clientX : moveEvent.clientX;
        const newWidth = startWidth + (currentX - startX);
        if (imgRef.current) {
          // Allow smaller minimum width for mobile screens
          imgRef.current.style.width = `${Math.max(100, newWidth)}px`; 
        }
      });
    };

    const onEnd = () => {
      if (isTouch) {
        document.removeEventListener("touchmove", onMove);
        document.removeEventListener("touchend", onEnd);
      } else {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onEnd);
      }
      if (imgRef.current) {
        updateAttributes({ width: imgRef.current.style.width });
      }
    };

    if (isTouch) {
      document.addEventListener("touchmove", onMove, { passive: false });
      document.addEventListener("touchend", onEnd);
    } else {
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onEnd);
    }
  };

  return (
    <NodeViewWrapper className="relative inline-block my-6 md:my-8 max-w-full">
      <img
        ref={imgRef}
        src={node.attrs.src}
        alt="Editorial Image"
        style={{ width: node.attrs.width, transition: selected ? 'none' : 'width 0.3s ease' }}
        className={`rounded-[1rem] md:rounded-[1.5rem] shadow-xl block max-w-full ${
          selected ? 'outline outline-4 outline-gold-accent outline-offset-4' : 'border border-charcoal-black/5'
        }`}
        data-drag-handle
      />
      
      {/* DRAG HANDLE: Increased size for easier mobile tapping, added touch-none to prevent scrolling while dragging */}
      {selected && (
        <div
          onMouseDown={startResizing}
          onTouchStart={startResizing}
          className="absolute -bottom-3 -right-3 w-10 h-10 md:w-8 md:h-8 bg-charcoal-black rounded-full shadow-lg border-2 border-white flex items-center justify-center cursor-nwse-resize z-50 hover:scale-110 active:scale-95 transition-transform touch-none"
          title="Drag to resize"
        >
          <div className="w-2 h-2 md:w-1.5 md:h-1.5 bg-gold-accent rounded-full" />
        </div>
      )}
    </NodeViewWrapper>
  );
};

const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        renderHTML: attributes => ({
          style: `width: ${attributes.width};`,
        }),
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent);
  },
});

const BlogEditor = ({ blog, onSave, onCancel }) => {
  const [imagePreview, setImagePreview] = useState(blog?.image || null);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef(null); 
  const editorImageRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Superscript,
      SubScript,
      Highlight,
      TextStyle,
      Color,
      ResizableImage.configure({
        allowBase64: true,
      }),
      TextAlign.configure({ types: ["heading", "paragraph", "image"] }),
    ],
    content: blog?.content || "",
    editorProps: {
      attributes: {
        // Adjusted padding and min-height for mobile
        class: "prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[300px] md:min-h-[450px] p-5 sm:p-8 md:p-14 text-slate-gray leading-relaxed",
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const { schema } = view.state;
              const node = schema.nodes.image.create({ src: e.target.result });
              const transaction = view.state.tr.replaceSelectionWith(node);
              view.dispatch(transaction);
            };
            reader.readAsDataURL(file);
            return true;
          }
        }
        return false;
      },
    },
  });

  const handleInternalImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        editor.chain().focus().setImage({ src: event.target.result }).run();
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  useEffect(() => {
    if (editor && blog) {
      if (editor.getHTML() !== blog.content) {
        editor.commands.setContent(blog.content);
      }
      if (blog.image !== imagePreview) {
        setImagePreview(blog.image);
      }
    }
  }, [blog, editor]);

  const handleFile = (file) => {
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
    if (fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const date = blog?.date || new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    formData.set("date", date);
    formData.set("content", editor.getHTML());
    if (!fileInputRef.current?.files?.length && typeof imagePreview === 'string' && imagePreview.startsWith("http")) {
      formData.set("image", imagePreview);
    }
    onSave(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      // Adjusted wrapper for mobile (smaller rounded corners, less padding)
      className="bg-warm-ivory rounded-[1.5rem] md:rounded-[3rem] shadow-2xl p-4 sm:p-6 md:p-12 w-full max-w-6xl mx-auto max-h-[95vh] md:max-h-[92vh] overflow-y-auto no-scrollbar border border-charcoal-black/5"
    >
      <div className="flex justify-between items-center mb-6 md:mb-10 border-b border-charcoal-black/10 pb-4 md:pb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold text-charcoal-black">
            {blog ? "Refine Journal" : "Compose Story"}
          </h2>
          <p className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.4em] font-black text-gold-accent mt-1 md:mt-2">Editorial Studio</p>
        </div>
        <button type="button" onClick={onCancel} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white text-charcoal-black hover:bg-red-500 hover:text-white transition-all shadow-sm">
          <X size={20} className="md:w-6 md:h-6" />
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8 md:space-y-12" encType="multipart/form-data">
        <input type="file" ref={editorImageRef} className="hidden" accept="image/*" onChange={handleInternalImageUpload} />

        {/* Adjusted grid gap for mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
          <div className="md:col-span-2 space-y-2 md:space-y-3">
            <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-gray ml-2">Story Title</label>
            <input type="text" name="title" defaultValue={blog?.title} required className="w-full px-0 py-2 md:py-4 bg-transparent border-b-2 border-charcoal-black/10 focus:outline-none focus:border-gold-accent transition-all font-playfair text-3xl md:text-6xl text-charcoal-black placeholder:text-slate-gray/20" placeholder="The Unspoken Vows..." />
          </div>

          <div className="space-y-2 md:space-y-3">
            <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-gray ml-2">Primary Cover</label>
            <div className={`relative border-2 border-dashed rounded-2xl md:rounded-[2rem] transition-all cursor-pointer min-h-[200px] md:min-h-[300px] overflow-hidden ${dragActive ? "border-gold-accent bg-gold-accent/5" : "border-charcoal-black/10 bg-white hover:border-gold-accent"}`} onClick={() => fileInputRef.current?.click()}>
              <input ref={fileInputRef} type="file" name="image" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
              {imagePreview ? <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover" alt="Preview" /> : <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-gray/40"><ImageIcon size={32} className="mb-2 md:mb-4 md:w-10 md:h-10" strokeWidth={1} /><p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Upload Cover Photography</p></div>}
            </div>
          </div>

          <div className="flex flex-col gap-6 md:gap-8">
            <div className="space-y-2 md:space-y-3"><label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-gray ml-2">Collection</label><select name="category" defaultValue={blog?.category || "Weddings"} className="w-full p-4 md:p-5 bg-white border border-charcoal-black/5 rounded-xl md:rounded-2xl text-xs font-bold uppercase tracking-widest focus:ring-4 focus:ring-gold-accent/5 outline-none appearance-none"><option value="Weddings">Weddings</option><option value="Portraits">Portraits</option><option value="Events">Events</option><option value="Inspiration">Inspiration</option></select></div>
            <div className="space-y-2 md:space-y-3 flex-grow"><label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-gray ml-2">Short Narrative Preview</label><textarea name="excerpt" defaultValue={blog?.excerpt} required className="w-full h-full min-h-[120px] md:min-h-[150px] p-4 md:p-6 bg-white border border-charcoal-black/5 rounded-xl md:rounded-2xl text-sm font-inter focus:ring-4 focus:ring-gold-accent/5 outline-none resize-none leading-relaxed" placeholder="Briefly capture the essence of this journal entry..." /></div>
          </div>
        </div>

        <div className="space-y-2 md:space-y-4">
          <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-gray ml-2">Journal Body</label>
          <div className="border border-charcoal-black/5 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden bg-white shadow-xl md:shadow-2xl blog-editor-params relative">
            <RichTextEditor editor={editor} className="border-0">
              <RichTextEditor.Toolbar sticky stickyOffset={0} className="bg-gray-50 border-b border-charcoal-black/5 p-3 md:p-4 flex flex-wrap gap-2 md:gap-3">
                <RichTextEditor.ControlsGroup><RichTextEditor.Bold /><RichTextEditor.Italic /><RichTextEditor.Underline /></RichTextEditor.ControlsGroup>
                
                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Control onClick={() => editorImageRef.current.click()} title="Insert Photography">
                    <ImagePlus size={18} strokeWidth={2.5} className="text-gold-accent" />
                  </RichTextEditor.Control>
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Control onClick={() => editor.chain().focus().setTextAlign('left').run()}><AlignLeft size={16}/></RichTextEditor.Control>
                  <RichTextEditor.Control onClick={() => editor.chain().focus().setTextAlign('center').run()}><AlignCenter size={16}/></RichTextEditor.Control>
                  <RichTextEditor.Control onClick={() => editor.chain().focus().setTextAlign('right').run()}><AlignRight size={16}/></RichTextEditor.Control>
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                   <RichTextEditor.Control onClick={() => editor.chain().focus().deleteSelection().run()} className="hover:!text-red-500"><Trash2 size={16}/></RichTextEditor.Control>
                </RichTextEditor.ControlsGroup>
              </RichTextEditor.Toolbar>
              <RichTextEditor.Content className="bg-white" />
            </RichTextEditor>
          </div>
        </div>

        {/* Buttons now stack on mobile to prevent overflow */}
        <div className="flex flex-col-reverse md:flex-row justify-end gap-4 md:gap-6 pt-6 md:pt-10 border-t border-charcoal-black/5">
          <button type="button" onClick={onCancel} className="w-full md:w-auto px-6 py-4 md:px-10 md:py-5 text-[10px] font-black uppercase tracking-[0.4em] text-slate-gray hover:text-red-500 transition-colors bg-white md:bg-transparent rounded-full md:rounded-none border md:border-none border-charcoal-black/10">Discard</button>
          <button type="submit" className="w-full md:w-auto px-6 py-4 md:px-16 md:py-6 bg-charcoal-black text-gold-accent rounded-full font-black text-[10px] uppercase tracking-[0.4em] hover:bg-gold-accent hover:text-white transition-all shadow-xl md:shadow-2xl md:hover:-translate-y-2">{blog ? "Update Story" : "Publish Journal"}</button>
        </div>
      </form>

      <style>{`
        .blog-editor-params .mantine-RichTextEditor-content { background-color: white !important; }
        /* Remove default blue outline from Tiptap */
        .ProseMirror-selectednode { outline: none !important; }
      `}</style>
    </motion.div>
  );
};

export default BlogEditor;