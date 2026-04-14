import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { CalendarDays, ArrowLeft, Share2 } from "lucide-react";
import LoadingScreen from "../components/LoadingScreen";

const BlogPostPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper for Cloudinary optimization
  const optimizeUrl = (url) => {
    if (!url || !url.includes("cloudinary.com")) return url;
    if (url.includes("f_auto,q_auto")) return url;
    return url.replace("/upload/", "/upload/f_auto,q_auto/");
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_NODE_URL}/api/blogs/${id}`);
        setPost(response.data);
      } catch (err) {
        console.error("Failed to fetch the blog post:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return <LoadingScreen />;

  if (!post) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center pt-24">
        <h2 className="font-playfair text-3xl text-charcoal-black mb-4">Story Not Found</h2>
        <Link to="/blog" className="text-gold-accent flex items-center gap-2 uppercase tracking-widest text-[10px] font-bold">
          <ArrowLeft size={14} /> Return to Journal
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] selection:bg-gold-accent selection:text-white pb-24">
      
      {/* ---------------- 1. STRICTLY SLIM POST HERO ---------------- */}
      {/* h-[35vh] for mobile, but caps at max-h-[400px] on desktops. 
        This guarantees it will NEVER look massive or ugly on large monitors!
      */}
      <section className="relative w-full h-[35vh] md:h-[40vh] max-h-[400px] flex items-center justify-center overflow-hidden bg-charcoal-black mt-16 md:mt-0">
        
        {/* Background Image with Dark Gradient Overlay */}
        <motion.div 
          initial={{ scale: 1.05 }} 
          animate={{ scale: 1 }} 
          transition={{ duration: 1.5, ease: "easeOut" }} 
          className="absolute inset-0 w-full h-full"
        >
          <img 
            src={optimizeUrl(post.image)} 
            alt={post.title} 
            className="w-full h-full object-cover object-center opacity-60"
          />
          {/* Even darker overlay so the white text pops perfectly */}
          <div className="absolute inset-0 bg-black/40" />
        </motion.div>

        {/* Floating Text Content - Moved to CENTER to fit the slim banner perfectly */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-6 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-4 mb-4"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal-black bg-gold-accent px-4 py-1.5 rounded-full shadow-lg">
              {post.category}
            </span>
            <span className="text-xs text-white/90 flex items-center gap-1.5 font-medium">
              <CalendarDays size={14} /> {post.date}
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }}
            className="font-playfair text-3xl md:text-5xl lg:text-6xl text-white font-bold leading-[1.1] tracking-tight drop-shadow-xl max-w-4xl mx-auto"
          >
            {post.title}
          </motion.h1>
        </div>
      </section>

      {/* ---------------- 2. BLOG CONTENT (Narrow Reading Width) ---------------- */}
      <article className="max-w-3xl mx-auto px-6 pt-12 md:pt-16">
        
        {post.excerpt && (
          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="font-inter text-lg md:text-xl text-slate-gray font-light mb-10 text-center italic border-b border-charcoal-black/10 pb-8"
          >
            "{post.excerpt}"
          </motion.p>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3 }}
        >
          {/* The sun-editor-content class wraps your HTML to apply the CSS below */}
          <div 
            className="sun-editor-content font-inter text-charcoal-black"
            dangerouslySetInnerHTML={{ __html: post.content }} 
          />

          {/* ---------------- 3. SHARE & FOOTER ---------------- */}
          <div className="mt-16 pt-8 border-t border-charcoal-black/10 flex flex-col md:flex-row items-center justify-between gap-6">
            <Link to="/blog" className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-gray hover:text-gold-accent transition-colors">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Journal
            </Link>
            
            <button className="flex items-center gap-2 px-6 py-3 bg-charcoal-black text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-gold-accent transition-colors shadow-xl">
              <Share2 size={14} /> Share Story
            </button>
          </div>

        </motion.div>
      </article>

      {/* ---------------- CSS FOR SUNEDITOR HTML OUTPUT ---------------- */}
      <style>{`
        /* Typography */
        .sun-editor-content p {
          font-size: 1.125rem;
          line-height: 1.8;
          margin-bottom: 2rem;
          color: #334155; 
          font-weight: 300;
        }
        
        .sun-editor-content h2, 
        .sun-editor-content h3 {
          font-family: 'Playfair Display', serif;
          color: #1e293b;
          font-weight: 700;
          margin-top: 3rem;
          margin-bottom: 1.5rem;
          line-height: 1.3;
        }
        
        .sun-editor-content h2 { font-size: 2.25rem; }
        .sun-editor-content h3 { font-size: 1.75rem; }

        .sun-editor-content a {
          color: #C9A24D;
          text-decoration: underline;
          text-underline-offset: 4px;
        }

        .sun-editor-content blockquote {
          border-left: 4px solid #C9A24D;
          padding-left: 1.5rem;
          font-style: italic;
          font-size: 1.25rem;
          color: #1e293b;
          margin: 3rem 0;
          background: #fdf9ed; 
          padding: 2rem;
          border-radius: 0 1rem 1rem 0;
        }

        /* Forces inline images to NEVER get cut off */
        .sun-editor-content img {
          max-width: 100% !important;
          height: auto !important;
          object-fit: contain !important; 
          border-radius: 1rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        }

        .sun-editor-content figure,
        .sun-editor-content .se-component,
        .sun-editor-content .se-image-container {
          max-width: 100% !important;
          height: auto !important;
          overflow: visible !important;
        }

        .sun-editor-content img[style*="float: left"] {
          margin: 0.5rem 2rem 1.5rem 0;
        }

        .sun-editor-content img[style*="float: right"] {
          margin: 0.5rem 0 1.5rem 2rem;
        }

        .sun-editor-content img:not([style*="float: left"]):not([style*="float: right"]) {
          display: block;
          margin: 3rem auto;
        }

        /* Video / iframe styling */
        .sun-editor-content iframe,
        .sun-editor-content video {
          width: 100%;
          height: auto;
          aspect-ratio: 16/9;
          border-radius: 1rem;
          margin: 3rem 0;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }

        /* Lists */
        .sun-editor-content ul, .sun-editor-content ol {
          margin-bottom: 2rem;
          padding-left: 1.5rem;
          font-size: 1.125rem;
          line-height: 1.8;
          color: #334155;
          font-weight: 300;
        }
        .sun-editor-content ul { list-style-type: disc; }
        .sun-editor-content ol { list-style-type: decimal; }
        .sun-editor-content li { margin-bottom: 0.5rem; }

        .sun-editor-content::after {
          content: "";
          clear: both;
          display: table;
        }
      `}</style>

    </div>
  );
};

export default BlogPostPage;