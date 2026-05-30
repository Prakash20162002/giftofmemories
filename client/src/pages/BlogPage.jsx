import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import LoadingScreen from "../components/LoadingScreen";

const SITE_NAME = "Gift of Memories";
const BASE_URL = "https://giftofmemories.in";
const categories = ["All Posts", "Weddings", "Portraits", "Events", "Inspiration"];

const optimizeUrl = (url) => {
  if (!url || !url.includes("cloudinary.com")) return url;
  if (url.includes("f_auto,q_auto")) return url;
  return url.replace("/upload/", "/upload/f_auto,q_auto/");
};

/* ── SEO ── */
const useSEO = (posts) => {
  useEffect(() => {
    const title = `Photography Journal & Stories | ${SITE_NAME}`;
    const description = "Explore behind-the-lens stories, wedding photography tips, portrait inspiration and more from Gift of Memories — Kolkata's premier photography studio.";
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
    setMeta("og:type", "website", true);
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("og:url", `${BASE_URL}/blog`, true);
    setMeta("og:site_name", SITE_NAME, true);
    if (posts[0]?.image) setMeta("og:image", optimizeUrl(posts[0].image), true);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setLink("canonical", `${BASE_URL}/blog`);
    const existing = document.getElementById("blog-list-schema");
    if (existing) existing.remove();
    const script = document.createElement("script");
    script.id = "blog-list-schema";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Blog",
      name: `${SITE_NAME} Journal`,
      url: `${BASE_URL}/blog`,
      description,
      publisher: { "@type": "Organization", name: SITE_NAME, url: BASE_URL },
      blogPost: posts.slice(0, 10).map((p) => ({ "@type": "BlogPosting", headline: p.title, url: `${BASE_URL}/blog/${p._id}`, datePublished: p.date, image: optimizeUrl(p.image), description: p.excerpt })),
    });
    document.head.appendChild(script);
    return () => { const s = document.getElementById("blog-list-schema"); if (s) s.remove(); };
  }, [posts]);
};

/* ── Standard Post Card (As per the Rig Photography reference) ── */
const PostCard = ({ post, index }) => {
  const formattedDate = post.date ? post.date.toUpperCase() : "";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group"
    >
      <Link
        to={`/blog/${post._id}`}
        aria-label={`Read: ${post.title}`}
        className="block"
      >
        {/* Thumbnail */}
        <div className="relative w-full overflow-hidden rounded-[1.25rem] bg-muted-beige mb-4.5 aspect-[16/10] shadow-[0_4px_16px_rgba(0,0,0,0.04)] group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-500">
          <img
            src={optimizeUrl(post.image)}
            alt={post.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-700 ease-out"
          />
          {post.category && (
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-charcoal-black text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {post.category}
            </div>
          )}
        </div>

        {/* Body content */}
        <div className="text-left px-1">
          <h3 className="font-playfair text-base md:text-[1.125rem] text-charcoal-black font-bold leading-snug mb-2 group-hover:text-gold-accent transition-colors duration-300 line-clamp-2">
            {post.title}
          </h3>
          <span className="text-[10px] font-bold text-slate-gray/50 uppercase tracking-widest block">
            {formattedDate}
          </span>
        </div>
      </Link>
    </motion.article>
  );
};

/* ── Main Component ── */
const BlogPage = () => {
  const [activeCategory, setActiveCategory] = useState("All Posts");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroData, setHeroData] = useState({
    title: "",
    description: "",
  });

  useSEO(posts);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [heroRes, postsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_NODE_URL}/api/page-hero/get/blog`),
          axios.get(`${import.meta.env.VITE_NODE_URL}/api/blogs`),
        ]);
        if (heroRes.data) setHeroData(heroRes.data);
        setPosts(postsRes.data || []);
      } catch (err) {
        console.error("Blog fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, []);

  const filteredPosts = useMemo(() => {
    return activeCategory === "All Posts" ? posts : posts.filter((p) => p.category === activeCategory);
  }, [activeCategory, posts]);

  // Parse dynamic description from database
  const descText = heroData.description || "Make your photography session more special through our photography tips & wedding ideas - Rig Biswas";
  
  // Format description text and author signature correctly
  let textLine = descText;
  let authorLine = "";
  
  if (descText.includes(" - ")) {
    const parts = descText.split(" - ");
    textLine = parts[0] + " -";
    authorLine = parts[1];
  } else if (descText.includes(" -")) {
    const parts = descText.split(" -");
    textLine = parts[0] + " -";
    authorLine = parts[1];
  } else if (descText.includes("- ")) {
    const parts = descText.split("- ");
    textLine = parts[0] + " -";
    authorLine = parts[1];
  } else if (descText.includes("—")) {
    const parts = descText.split("—");
    textLine = parts[0] + " —";
    authorLine = parts[1];
  }

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-white selection:bg-gold-accent selection:text-white">

      {/* ── 1. HERO (Solid Soft Lavender Background) ── */}
      <section
        className="relative flex items-center justify-center overflow-hidden bg-charcoal-black py-20 md:py-28 px-6"
        style={{ minHeight: "300px", height: "38vh" }}
        aria-label="Blog hero"
      >
        {/* Background Image with cover ratio */}
        <div className="absolute inset-0">
          <img
            src={optimizeUrl(heroData.backgroundImage) || "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?q=80&w=2880"}
            alt="Gift of Memories Photography Journal"
            className="w-full h-full object-cover opacity-45"
            loading="eager"
          />
          {/* Subtle dark overlay for premium legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal-black/85 via-charcoal-black/50 to-[#FAF9F6]/20" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-playfair text-3xl md:text-[2.6rem] text-white font-semibold mb-5 leading-tight tracking-tight drop-shadow-sm">
              {heroData.title || "Photography Blog From Rig Photography"}
            </h1>
            <p className="font-inter text-sm md:text-[1.05rem] text-white/80 max-w-3xl mx-auto font-light leading-relaxed mb-2 drop-shadow-sm">
              {textLine}
            </p>
            {authorLine && (
              <p className="font-inter text-sm md:text-[1.05rem] text-white/85 font-light leading-relaxed drop-shadow-sm">
                {authorLine}
              </p>
            )}
            <div className="mt-6 flex items-center justify-center gap-3">
              <div className="h-px w-10 bg-gold-accent/40" />
              <div className="h-1.5 w-1.5 rounded-full bg-gold-accent" />
              <div className="h-px w-10 bg-gold-accent/40" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 2. CATEGORY FILTER (Minimal & Elegant Navigation) ── */}
      <nav
        aria-label="Blog category filter"
        className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-charcoal-black/5 py-3 shadow-sm"
      >
        <div className="max-w-[1140px] mx-auto px-6 flex overflow-x-auto no-scrollbar justify-start gap-6">
          {categories.map((cat) => (
            <button
              key={cat}
              id={`category-${cat.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => setActiveCategory(cat)}
              className={`relative py-1.5 text-[9px] font-black uppercase tracking-[0.25em] transition-all duration-300 whitespace-nowrap ${
                activeCategory === cat
                  ? "text-gold-accent"
                  : "text-slate-gray/60 hover:text-charcoal-black"
              }`}
            >
              {cat}
              {activeCategory === cat && (
                <motion.div
                  layoutId="activeCategoryUnderline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold-accent"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* ── 3. MAIN CONTENT (3-Column Grid) ── */}
      <main className="max-w-[1140px] mx-auto px-6 py-12 md:py-16">
        <AnimatePresence mode="wait">
          {filteredPosts.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-40 text-center"
            >
              <BookOpen size={52} className="mx-auto text-charcoal-black/10 mb-6" />
              <h2 className="font-playfair text-3xl font-bold text-charcoal-black mb-3">No Stories Yet</h2>
              <p className="text-slate-gray font-light text-sm">Check back soon for new entries in {activeCategory}.</p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10">
                {filteredPosts.map((post, i) => (
                  <PostCard key={post._id} post={post} index={i} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

    </div>
  );
};

export default BlogPage;