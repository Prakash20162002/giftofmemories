import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  CalendarDays, ArrowLeft, Share2, Clock, Check,
  ChevronRight, BookOpen, ExternalLink, List,
} from "lucide-react";
import LoadingScreen from "../components/LoadingScreen";
import "suneditor/dist/css/suneditor.min.css";

const SITE_NAME = "Gift of Memories";
const BASE_URL = "https://giftofmemories.in";

/* ─────────────────────────────────────────────── Utilities */
const optimizeUrl = (url) => {
  if (!url || !url.includes("cloudinary.com")) return url;
  if (url.includes("f_auto,q_auto")) return url;
  return url.replace("/upload/", "/upload/f_auto,q_auto/");
};

const estimateReadTime = (text = "") => {
  const words = text?.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length || 0;
  return Math.max(1, Math.ceil(words / 200));
};

const extractHeadings = (html = "") => {
  const div = document.createElement("div");
  div.innerHTML = html;
  return Array.from(div.querySelectorAll("h2, h3")).map((el, i) => ({
    id: `heading-${i}`,
    level: el.tagName.toLowerCase(),
    text: el.textContent.trim(),
  }));
};

const injectHeadingIds = (html = "") => {
  let i = 0;
  return html.replace(/<(h[23])([^>]*)>/gi, (_, tag, attrs) => `<${tag}${attrs} id="heading-${i++}">`);
};

/* ─────────────────────────────────────────────── SEO */
const useSEO = (post) => {
  useEffect(() => {
    if (!post) return;
    const readTime = estimateReadTime(post.content);
    const title = `${post.title} | ${SITE_NAME} Blog`;
    const description = post.excerpt || `Read "${post.title}" on the ${SITE_NAME} Journal.`;
    const canonical = `${BASE_URL}/blog/${post._id}`;
    const image = optimizeUrl(post.image);
    document.title = title;
    const setMeta = (name, content, prop = false) => {
      const sel = prop ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.querySelector(sel);
      if (!el) { el = document.createElement("meta"); prop ? el.setAttribute("property", name) : el.setAttribute("name", name); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    const setLink = (rel, href) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) { el = document.createElement("link"); el.setAttribute("rel", rel); document.head.appendChild(el); }
      el.setAttribute("href", href);
    };
    setMeta("description", description);
    setMeta("robots", "index, follow");
    setMeta("og:type", "article", true);
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("og:url", canonical, true);
    setMeta("og:site_name", SITE_NAME, true);
    if (image) setMeta("og:image", image, true);
    if (post.date) setMeta("article:published_time", post.date, true);
    if (post.category) setMeta("article:section", post.category, true);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    if (image) setMeta("twitter:image", image);
    setLink("canonical", canonical);
    const existing = document.getElementById("blog-post-schema");
    if (existing) existing.remove();
    const script = document.createElement("script");
    script.id = "blog-post-schema";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description,
      url: canonical,
      datePublished: post.date,
      image: { "@type": "ImageObject", url: image },
      author: { "@type": "Organization", name: SITE_NAME, url: BASE_URL },
      publisher: { "@type": "Organization", name: SITE_NAME, url: BASE_URL, logo: { "@type": "ImageObject", url: `${BASE_URL}/logo.png` } },
      timeRequired: `PT${readTime}M`,
      articleSection: post.category,
      mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    });
    document.head.appendChild(script);
    return () => { const s = document.getElementById("blog-post-schema"); if (s) s.remove(); };
  }, [post]);
};

/* ─────────────────────────────────────────── Reading Progress Bar */
const ReadingProgressBar = () => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? (el.scrollTop / total) * 100 : 0);
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 z-[999] h-[3px] bg-transparent" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Reading progress">
      <motion.div
        className="h-full bg-gradient-to-r from-gold-accent via-yellow-300 to-gold-accent shadow-[0_0_8px_rgba(201,162,77,0.8)]"
        style={{ width: `${progress}%` }}
        transition={{ ease: "linear", duration: 0.1 }}
      />
    </div>
  );
};

/* ─────────────────────────────────────── Table of Contents (fixed overlay) */
const TableOfContents = ({ headings, activeId }) => {
  if (!headings.length) return null;
  return (
    <aside aria-label="Table of contents" className="hidden 2xl:block fixed top-24 right-6 w-56 z-30">
      <div className="bg-white border border-charcoal-black/8 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <List size={13} className="text-gold-accent" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-charcoal-black">Contents</span>
        </div>
        <nav>
          <ul className="space-y-1.5">
            {headings.map((h) => (
              <li key={h.id} className={h.level === "h3" ? "pl-3" : ""}>
                <a
                  href={`#${h.id}`}
                  className={`block text-[11px] leading-snug transition-colors duration-200 py-0.5 ${activeId === h.id ? "text-gold-accent font-semibold" : "text-slate-gray/60 hover:text-charcoal-black font-light"}`}
                  onClick={(e) => { e.preventDefault(); document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth" }); }}
                >
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

/* ─────────────────────── Related Post Card */
const RelatedCard = ({ post }) => (
  <Link
    to={`/blog/${post._id}`}
    className="group flex-shrink-0 w-72 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-black/5 hover:-translate-y-1 transition-all duration-300"
    aria-label={`Read related: ${post.title}`}
  >
    <div className="aspect-[16/9] overflow-hidden">
      <img src={optimizeUrl(post.image)} alt={post.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
    </div>
    <div className="p-5">
      {post.category && <span className="text-[8px] font-black uppercase tracking-widest text-gold-accent mb-2 block">{post.category}</span>}
      <h3 className="font-playfair text-base font-bold text-charcoal-black leading-snug line-clamp-2 group-hover:text-gold-accent transition-colors">{post.title}</h3>
      <div className="mt-3 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-slate-gray/50 group-hover:text-gold-accent transition-colors">
        Read Story <ChevronRight size={11} />
      </div>
    </div>
  </Link>
);

/* ─────────────────────── Share Button */
const ShareButton = ({ post }) => {
  const [copied, setCopied] = useState(false);
  const handleShare = async () => {
    const url = `${import.meta.env.VITE_NODE_URL}/api/blogs/share-blog/${post._id}`;
    if (navigator.share) { try { await navigator.share({ title: post.title, text: post.excerpt || post.title, url }); return; } catch {} }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };
  return (
    <button id="share-story-btn" onClick={handleShare} className="flex items-center gap-2 px-6 py-3 bg-charcoal-black text-white rounded-full text-[9px] font-black uppercase tracking-[0.2em] hover:bg-gold-accent hover:text-charcoal-black transition-all duration-300 shadow-lg" aria-label="Share this story">
      <AnimatePresence mode="wait">
        {copied
          ? <motion.span key="copied" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-1.5"><Check size={13} /> Copied!</motion.span>
          : <motion.span key="share" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-1.5"><Share2 size={13} /> Share Story</motion.span>
        }
      </AnimatePresence>
    </button>
  );
};

/* ──────────────────────────────────────── Main Component */
const BlogPostPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [headings, setHeadings] = useState([]);
  const [activeHeadingId, setActiveHeadingId] = useState("");
  const contentRef = useRef(null);

  useSEO(post);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const [postRes, allRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_NODE_URL}/api/blogs/${id}`),
          axios.get(`${import.meta.env.VITE_NODE_URL}/api/blogs`),
        ]);
        setPost(postRes.data);
        setRelatedPosts((allRes.data || []).filter((p) => p._id !== id).slice(0, 4));
      } catch (err) {
        console.error("Failed to fetch blog post:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (post?.content) setHeadings(extractHeadings(post.content));
  }, [post]);

  useEffect(() => {
    if (!headings.length) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActiveHeadingId(e.target.id); }),
      { rootMargin: "-20% 0% -60% 0%", threshold: 0 }
    );
    headings.forEach((h) => { const el = document.getElementById(h.id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [headings]);

  if (loading) return <LoadingScreen />;

  if (!post) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center gap-5 pt-24">
        <BookOpen size={56} className="text-charcoal-black/15" />
        <h1 className="font-playfair text-3xl font-bold text-charcoal-black">Story Not Found</h1>
        <Link to="/blog" className="flex items-center gap-2 text-gold-accent text-[10px] font-black uppercase tracking-widest hover:gap-3 transition-all">
          <ArrowLeft size={14} /> Return to Journal
        </Link>
      </div>
    );
  }

  const readTime = estimateReadTime(post.content);
  const processedContent = injectHeadingIds(post.content || "");

  return (
    <>
      <ReadingProgressBar />

      <div className="min-h-screen bg-[#FAF9F6] selection:bg-gold-accent selection:text-white">

        {/* ── 1. ARTICLE HEADER ─────────────────────────────────────── */}
        <header className="max-w-[1000px] mx-auto px-6 pt-10 md:pt-14 pb-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-slate-gray/40 mb-3">
              <Link to="/" className="hover:text-charcoal-black transition-colors">Home</Link>
              <ChevronRight size={9} />
              <Link to="/blog" className="hover:text-charcoal-black transition-colors">Journal</Link>
              <ChevronRight size={9} />
              <span className="text-gold-accent">{post.category || "Article"}</span>
            </nav>

            {/* Category + meta row */}
            <div className="flex flex-wrap items-center gap-3 mb-3">
              {post.category && (
                <span className="bg-charcoal-black text-gold-accent text-[8px] font-black uppercase tracking-[0.25em] px-4 py-1.5 rounded-full">
                  {post.category}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-slate-gray/55 text-[10px] font-medium">
                <CalendarDays size={12} /> {post.date}
              </span>
              <span className="flex items-center gap-1.5 text-slate-gray/55 text-[10px] font-medium">
                <Clock size={12} /> {readTime} min read
              </span>
            </div>

            {/* H1 — SEO primary heading */}
            <h1 className="font-playfair text-4xl md:text-5xl lg:text-[3.5rem] text-charcoal-black font-bold leading-[1.1] tracking-tight mb-4">
              {post.title}
            </h1>

            {/* Decorative divider */}
            <div className="flex items-center gap-4">
              <div className="h-px w-12 bg-gold-accent/60" />
              <div className="h-1.5 w-1.5 rounded-full bg-gold-accent" />
              <div className="h-px flex-1 bg-charcoal-black/8" />
            </div>
          </motion.div>
        </header>

        {/* ── 2. ARTICLE BODY ───────────────────────────────────────── */}
        <div className="relative max-w-[1000px] mx-auto px-6 pb-10 md:pb-14">

          {/* TOC fixed overlay — doesn't affect article column width */}
          <TableOfContents headings={headings} activeId={activeHeadingId} />

          <article ref={contentRef}>

            {/* Excerpt — italic pull-quote */}
            {post.excerpt && (
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="font-inter text-lg md:text-xl text-slate-gray italic font-light leading-relaxed mb-5 pl-6 border-l-4 border-gold-accent"
              >
                {post.excerpt}
              </motion.p>
            )}

            {/* ── FEATURED IMAGE (inline in article, not hero) ── */}
            {post.image && (
              <motion.figure
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-6 rounded-2xl overflow-hidden shadow-xl"
              >
                <img
                  src={optimizeUrl(post.image)}
                  alt={post.title}
                  className="w-full object-cover"
                  style={{ maxHeight: "520px" }}
                  loading="eager"
                />
              </motion.figure>
            )}

            {/* ── WHITE DOCUMENT CARD — SunEditor-faithful rendering ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden"
            >
              <div
                className="sun-editor-editable public-blog-content"
                dangerouslySetInnerHTML={{ __html: processedContent }}
              />
            </motion.div>

            {/* ── FOOTER ── */}
            <footer className="mt-8 pt-5 border-t border-charcoal-black/10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <Link
                  to="/blog"
                  className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-slate-gray hover:text-gold-accent transition-colors"
                  aria-label="Back to journal"
                >
                  <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform duration-300" />
                  Back to Journal
                </Link>
                <ShareButton post={post} />
              </div>

              {/* Author card */}
              <div className="mt-6 p-5 md:p-6 bg-muted-beige/50 border border-charcoal-black/8 rounded-2xl flex items-center gap-5">
                <div className="w-14 h-14 rounded-full bg-gold-accent/15 flex items-center justify-center flex-shrink-0">
                  <BookOpen size={22} className="text-gold-accent" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gold-accent mb-1">Written by</p>
                  <h3 className="font-playfair text-lg font-bold text-charcoal-black">{SITE_NAME}</h3>
                  <p className="text-xs text-slate-gray font-light mt-1 leading-relaxed">
                    Kolkata's premier photography studio — capturing love stories, portraits, and timeless memories.
                  </p>
                </div>
              </div>
            </footer>
          </article>
        </div>

        {/* ── 3. RELATED POSTS ── */}
        {relatedPosts.length > 0 && (
          <section className="bg-white border-t border-charcoal-black/6 py-10 md:py-12 px-6" aria-labelledby="related-heading">
            <div className="max-w-[1000px] mx-auto">
              <div className="flex items-center gap-4 mb-6">
                <h2 id="related-heading" className="font-playfair text-2xl md:text-3xl font-bold text-charcoal-black">More Stories</h2>
                <div className="flex-1 h-px bg-charcoal-black/8" />
                <Link to="/blog" className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-gold-accent hover:gap-2 transition-all">
                  View All <ExternalLink size={10} />
                </Link>
              </div>
              <div className="flex gap-5 overflow-x-auto pb-4 no-scrollbar">
                {relatedPosts.map((rp) => <RelatedCard key={rp._id} post={rp} />)}
              </div>
            </div>
          </section>
        )}

      </div>

      {/* ── Styles: mirror SunEditor A4 editor canvas exactly ── */}
      <style>{`
        .public-blog-content {
          font-family: 'Inter', sans-serif !important;
          font-size: 18px !important;
          line-height: 1.8 !important;
          color: #000000;
          background-color: #ffffff !important;
          padding: 40px !important;
          overflow-wrap: break-word;
          word-break: break-word;
        }
        @media (max-width: 640px) {
          .public-blog-content {
            padding: 20px !important;
          }
        }
        .public-blog-content ul {
          list-style-type: disc !important;
          padding-left: 40px !important;
          margin-top: 0 !important;
          margin-bottom: 0 !important;
        }
        .public-blog-content ol {
          list-style-type: decimal !important;
          padding-left: 40px !important;
          margin-top: 0 !important;
          margin-bottom: 0 !important;
        }
        .public-blog-content li {
          display: list-item !important;
          list-style-position: outside !important;
        }
        .public-blog-content ul ul { list-style-type: circle !important; }
        .public-blog-content ul ul ul { list-style-type: square !important; }
        .public-blog-content ol ol { list-style-type: lower-alpha !important; }
        .public-blog-content h1 { font-size: 2em !important;    font-weight: bold !important; margin: 0.67em 0 !important; }
        .public-blog-content h2 { font-size: 1.5em !important;  font-weight: bold !important; margin: 0.83em 0 !important; }
        .public-blog-content h3 { font-size: 1.17em !important; font-weight: bold !important; margin: 1em 0 !important; }
        .public-blog-content h4 { font-size: 1em !important;    font-weight: bold !important; margin: 1.33em 0 !important; }
        .public-blog-content h5 { font-size: 0.83em !important; font-weight: bold !important; margin: 1.67em 0 !important; }
        .public-blog-content h6 { font-size: 0.67em !important; font-weight: bold !important; margin: 2.33em 0 !important; }
        .public-blog-content a { color: #0000EE; text-decoration: underline; cursor: pointer; }
        .public-blog-content a:visited { color: #551A8B; }
        .public-blog-content blockquote { margin-left: 40px; margin-right: 40px; }
        .public-blog-content hr { display: block !important; border: none !important; border-top: 1px solid #aaaaaa !important; margin: 0.5em 0 !important; height: 0 !important; }
        .public-blog-content table { border-collapse: collapse; width: auto; margin: 1em 0; }
        .public-blog-content td, .public-blog-content th { padding: 12px 16px; border: 1px solid #dddddd; vertical-align: middle; }
        .public-blog-content img { max-width: 100%; height: auto; }
        .public-blog-content .image-row {
          display: flex;
          gap: 16px;
          margin: 1.5em 0;
          flex-wrap: wrap;
          align-items: stretch;
        }
        .public-blog-content .image-row > * {
          flex: 1;
          min-width: 280px;
        }
        .public-blog-content .image-row img {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover;
        }
        .public-blog-content figure,
        .public-blog-content .se-component,
        .public-blog-content .se-image-container,
        .public-blog-content .se-video-container { max-width: 100% !important; overflow: visible !important; }
        .public-blog-content iframe, .public-blog-content video { max-width: 100%; height: auto; }
        .public-blog-content::after { content: ""; display: table; clear: both; }
      `}</style>
    </>
  );
};

export default BlogPostPage;