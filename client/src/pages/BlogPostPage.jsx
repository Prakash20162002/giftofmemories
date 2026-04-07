import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowLeft, Share2, Check, CalendarDays, Clock, Bookmark } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import LoadingScreen from "../components/LoadingScreen";

const BlogPostPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Reading Progress Bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_NODE_URL}/api/blogs/${id}`);
        setPost(response.data);
      } catch (err) {
        console.error("Fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPost();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  if (loading) return <LoadingScreen />;
  if (!post) return <div className="min-h-screen flex items-center justify-center font-playfair text-2xl">Story not found.</div>;

  return (
    <article className="min-h-screen bg-[#FAF9F6] selection:bg-gold-accent selection:text-white pb-24">
      {/* Progress Bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-1.5 bg-gold-accent origin-left z-[100]" style={{ scaleX }} />

      {/* --- 1. TOP EDITORIAL HEADER --- */}
      <header className="container mx-auto px-6 pt-32 pb-12 md:pt-48 md:pb-20 max-w-5xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="bg-gold-accent/10 text-gold-accent px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
              {post.category}
            </span>
            <span className="h-px w-8 bg-charcoal-black/10" />
            <span className="text-[10px] font-black text-slate-gray uppercase tracking-[0.2em] flex items-center gap-2">
              <CalendarDays size={14} className="text-gold-accent" /> {post.date || "Recent Entry"}
            </span>
          </div>

          <h1 className="font-playfair text-4xl md:text-7xl text-charcoal-black font-bold mb-8 leading-[1.1] tracking-tighter">
            {post.title}
          </h1>
          
          <p className="font-inter text-slate-gray text-base md:text-xl max-w-2xl mx-auto leading-relaxed font-light italic opacity-80">
            {post.excerpt || "A cinematic journey through the lens of Gift of Memories."}
          </p>
        </motion.div>
      </header>

      {/* --- 2. MAIN HERO IMAGE (Cinematic Wide) --- */}
      <div className="container mx-auto px-4 md:px-12 mb-16 md:mb-24">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="aspect-[16/9] md:aspect-[21/9] rounded-[2rem] md:rounded-[4rem] overflow-hidden shadow-2xl bg-charcoal-black"
        >
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover opacity-90"
          />
        </motion.div>
      </div>

      {/* --- 3. STORY CONTENT AREA --- */}
      <div className="container mx-auto px-6 max-w-3xl relative">
        
        {/* Floating Share Side-bar (Desktop Only) */}
        <div className="hidden lg:flex flex-col gap-4 absolute -left-20 top-0 pt-2">
          <button 
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success("Link copied!");
            }}
            className="w-12 h-12 rounded-full border border-charcoal-black/5 bg-white flex items-center justify-center text-slate-gray hover:text-gold-accent hover:border-gold-accent transition-all shadow-sm"
          >
            <Share2 size={18} />
          </button>
        </div>

        {/* --- DYNAMIC HTML CONTENT --- */}
        <div
          className="
            prose prose-lg md:prose-xl max-w-none font-inter text-slate-gray leading-[1.8]
            prose-headings:font-playfair prose-headings:text-charcoal-black prose-headings:font-bold prose-headings:tracking-tight
            prose-p:mb-8 prose-p:font-light
            prose-img:rounded-[2rem] prose-img:shadow-2xl prose-img:my-16 prose-img:w-full
            prose-blockquote:border-l-[6px] prose-blockquote:border-gold-accent prose-blockquote:bg-white prose-blockquote:shadow-sm prose-blockquote:py-10 prose-blockquote:px-12 prose-blockquote:rounded-r-[2rem] prose-blockquote:italic prose-blockquote:text-charcoal-black prose-blockquote:not-italic
            prose-strong:text-charcoal-black prose-strong:font-bold
            prose-a:text-gold-accent prose-a:font-bold prose-a:no-underline hover:prose-a:underline
            drop-cap
          "
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* --- 4. FOOTER & AUTHOR --- */}
        <footer className="mt-24 pt-12 border-t border-charcoal-black/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-full bg-gold-accent/10 flex items-center justify-center text-gold-accent">
                  <Bookmark size={20} />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-gray">Published by</p>
                  <p className="font-playfair text-lg font-bold text-charcoal-black">Gift of Memories Studio</p>
               </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(window.location.href);
                    setCopied(true);
                    toast.success("Link copied!");
                    setTimeout(() => setCopied(false), 2000);
                  } catch (err) { toast.error("Failed to copy"); }
                }}
                className={`flex items-center justify-center gap-3 px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl ${
                  copied ? "bg-emerald-500 text-white" : "bg-charcoal-black text-gold-accent hover:bg-gold-accent hover:text-white"
                }`}
              >
                {copied ? <Check size={14} /> : <Share2 size={14} />}
                {copied ? "Link Copied" : "Share Story"}
              </button>
            </div>
          </div>
          
          <div className="mt-20 text-center">
            <Link
              to="/blog"
              className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-slate-gray hover:text-gold-accent transition-all"
            >
              <ArrowLeft size={16} /> Back to Journal Archive
            </Link>
          </div>
        </footer>
      </div>

      {/* CUSTOM CSS FOR DROP CAPS & SPACING */}
      <style>{`
        .drop-cap p:first-of-type::first-letter {
          font-family: 'Playfair Display', serif;
          font-size: 5rem;
          line-height: 0.8;
          float: left;
          padding-top: 4px;
          padding-right: 12px;
          padding-left: 3px;
          color: #C9A24D;
          font-weight: 700;
        }
        @media (max-width: 768px) {
          .drop-cap p:first-of-type::first-letter {
            font-size: 3.5rem;
          }
        }
      `}</style>
    </article>
  );
};

export default BlogPostPage;