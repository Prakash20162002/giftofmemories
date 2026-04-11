import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CalendarDays, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import LoadingScreen from "../components/LoadingScreen";

const categories = [
  "All Posts",
  "Weddings",
  "Portraits",
  "Events",
  "Inspiration",
];

const BlogPage = () => {
  const [activeCategory, setActiveCategory] = useState("All Posts");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroData, setHeroData] = useState({
    title: "Our Blog",
    description: "Stories, tips, and inspiration from behind the lens. Discover the art of capturing memories.",
    breadcrumb: "Gift of Memories • Blog",
    backgroundImage: "",
  });

  // Helper for Cloudinary optimization
  const optimizeUrl = (url) => {
    if (!url || !url.includes("cloudinary.com")) return url;
    if (url.includes("f_auto,q_auto")) return url;
    return url.replace("/upload/", "/upload/f_auto,q_auto/");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [heroRes, postsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_NODE_URL}/api/page-hero/get/blog`),
          axios.get(`${import.meta.env.VITE_NODE_URL}/api/blogs`)
        ]);
        if (heroRes.data) setHeroData(heroRes.data);
        setPosts(postsRes.data);
      } catch (err) {
        console.error("Journal fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, []);

  const filteredPosts = useMemo(() => {
    return activeCategory === "All Posts"
      ? posts
      : posts.filter((post) => post.category === activeCategory);
  }, [activeCategory, posts]);

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#FAF9F6] selection:bg-gold-accent selection:text-white">
      
      {/* ---------------- 1. CINEMATIC HERO (Reduced Height) ---------------- */}
      <section className="relative h-[40vh] md:h-[45vh] flex items-center justify-center overflow-hidden bg-charcoal-black">
        <motion.div initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 1.5 }} className="absolute inset-0 w-full h-full">
          <img
            src={optimizeUrl(heroData.backgroundImage) || "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?q=80&w=2880"}
            alt="Photography Journal"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal-black/80 via-transparent to-[#FAF9F6]" />
        </motion.div>

        <div className="relative z-10 text-center px-6 mt-10 md:mt-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="text-gold-accent font-inter text-[10px] md:text-xs uppercase tracking-[0.5em] font-black mb-4 block drop-shadow-md">
              {heroData.breadcrumb || "Gift of Memories • Blog"}
            </span>
            <h1 className="font-playfair text-5xl md:text-7xl lg:text-8xl text-warm-ivory font-bold tracking-tighter mb-6 leading-tight drop-shadow-xl">
              {heroData.title}
            </h1>
            <p className="font-inter text-sm md:text-lg text-warm-ivory/80 max-w-2xl mx-auto font-light leading-relaxed px-4 drop-shadow-md">
              {heroData.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ---------------- 2. BOUTIQUE FILTER NAVBAR ---------------- */}
      <nav className="sticky top-0 z-40 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-charcoal-black/5 pb-4 pt-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 flex overflow-x-auto no-scrollbar md:justify-center gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeCategory === cat 
                ? "bg-charcoal-black text-gold-accent shadow-xl" 
                : "text-slate-gray hover:text-charcoal-black hover:bg-charcoal-black/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto px-6 py-16 md:py-24">
        
        {/* ---------------- 3. UNIFORM EDITORIAL GRID (4-COLUMN) ---------------- */}
        {/* CHANGED: grid-cols-1 -> sm:grid-cols-2 -> lg:grid-cols-3 -> xl:grid-cols-4 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          <AnimatePresence>
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="h-full"
              >
                <Link 
                  to={`/blog/${post._id}`} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col h-full bg-white rounded-[1.25rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-charcoal-black/5 hover:-translate-y-1"
                >
                  
                  <div className="w-full aspect-[16/9] overflow-hidden relative bg-charcoal-black/5">
                    <img
                      src={optimizeUrl(post.image)}
                      alt={post.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                    
                    <div className="absolute top-3 left-3 px-3 py-1 bg-white/95 backdrop-blur-md rounded-full text-[8px] font-black uppercase tracking-widest text-charcoal-black shadow-sm">
                      {post.category}
                    </div>
                  </div>
                  
                  {/* CHANGED: Adjusted padding and text sizes to fit perfectly in 4 columns */}
                  <div className="flex flex-col flex-grow p-5 md:p-6">
                    <h3 className="font-playfair text-lg md:text-xl text-charcoal-black font-bold leading-snug mb-3 group-hover:text-gold-accent transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    
                    <p className="font-inter text-xs md:text-sm text-slate-gray line-clamp-2 leading-relaxed font-light mb-5 flex-grow">
                      {post.excerpt}
                    </p>
                    
                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-gray/70">
                        <CalendarDays size={12} /> {post.date}
                      </div>
                      
                      <div className="flex items-center gap-1 text-charcoal-black font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] group-hover:gap-2 transition-all">
                        Read Story <ArrowRight size={12} className="text-gold-accent" />
                      </div>
                    </div>

                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* --- EMPTY STATE --- */}
        {filteredPosts.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="py-40 text-center"
          >
            <BookOpen size={48} className="mx-auto text-charcoal-black/10 mb-6" />
            <h3 className="font-playfair text-3xl font-bold text-charcoal-black mb-2">No Stories Found</h3>
            <p className="text-slate-gray font-light">Check back soon for new journal entries in {activeCategory}.</p>
          </motion.div>
        )}
      </main>

      {/* ---------------- 4. NEWSLETTER ---------------- */}
      <section className="bg-charcoal-black py-24 md:py-32 px-6 relative overflow-hidden border-t border-white/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-accent/5 rounded-full blur-[100px]" />
        
        <div className="container mx-auto text-center max-w-3xl relative z-10">
          <span className="text-gold-accent font-inter text-[10px] uppercase tracking-[0.5em] font-black mb-6 block">Stay Inspired</span>
          <h2 className="font-playfair text-4xl md:text-6xl font-bold text-warm-ivory mb-8 tracking-tight">Join Our Journal</h2>
          <p className="font-inter text-sm md:text-lg text-warm-ivory/50 mb-12 font-light leading-relaxed max-w-xl mx-auto">
            Weekly stories of love, heritage, and the technical artistry behind our lens.
          </p>

          <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 bg-white/5 border border-white/10 px-8 py-5 text-warm-ivory rounded-full text-sm outline-none focus:border-gold-accent transition-all"
            />
            <button
              type="submit"
              className="bg-gold-accent text-charcoal-black px-10 py-5 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white transition-all rounded-full shadow-2xl"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

    </div>
  );
};

export default BlogPage;