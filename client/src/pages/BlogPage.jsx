import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CalendarDays, Clock, BookOpen, Search } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import LoadingScreen from "../components/LoadingScreen";
import { toast } from "react-toastify";

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
    title: "The Journal",
    description: "Photography tips, behind-the-scenes moments, and cinematic stories from our lens.",
    breadcrumb: "Gift of Memories • Stories",
    backgroundImage: "",
  });

  // Helper for Cloudinary optimization (2026 Best Practice)
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
  }, []);

  const filteredPosts = useMemo(() => {
    return activeCategory === "All Posts"
      ? posts
      : posts.filter((post) => post.category === activeCategory);
  }, [activeCategory, posts]);

  // The latest post acts as the "Hero Featured" post
  const featuredPost = filteredPosts[0];
  const gridPosts = filteredPosts.slice(1);

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#FAF9F6] selection:bg-gold-accent selection:text-white">
      
      {/* ---------------- CINEMATIC HERO ---------------- */}
      <section className="relative h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden bg-charcoal-black">
        <motion.div initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 1.5 }} className="absolute inset-0 w-full h-full">
          <img
            src={optimizeUrl(heroData.backgroundImage) || "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?q=80&w=2880"}
            alt="Photography Journal"
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal-black/80 via-transparent to-[#FAF9F6]" />
        </motion.div>

        <div className="relative z-10 text-center px-6 mt-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="text-gold-accent font-inter text-[10px] uppercase tracking-[0.5em] font-black mb-4 block">
              {heroData.breadcrumb || "Archive / Stories"}
            </span>
            <h1 className="font-playfair text-5xl md:text-8xl text-warm-ivory font-bold tracking-tighter mb-6 leading-tight">
              {heroData.title}
            </h1>
            <p className="font-inter text-sm md:text-lg text-warm-ivory/70 max-w-2xl mx-auto font-light leading-relaxed px-4">
              {heroData.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ---------------- BOUTIQUE FILTER BAR ---------------- */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-charcoal-black/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex overflow-x-auto no-scrollbar md:justify-center gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeCategory === cat 
                ? "bg-charcoal-black text-gold-accent shadow-xl" 
                : "text-slate-gray hover:text-gold-accent"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-[1440px] mx-auto px-6 py-16 md:py-24">
        
        {/* ---------------- FEATURED CINEMATIC POST ---------------- */}
        <AnimatePresence mode="wait">
          {featuredPost && (
            <motion.div
              key={`featured-${featuredPost._id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-24"
            >
              <Link to={`/blog/${featuredPost._id}`} className="group relative block">
                <div className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-[2.5rem] md:rounded-[4rem] shadow-2xl bg-charcoal-black">
                  <img
                    src={optimizeUrl(featuredPost.image)}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover opacity-80 transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-black/90 via-charcoal-black/20 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 w-full p-8 md:p-20">
                    <div className="flex items-center gap-4 mb-6">
                      <span className="bg-gold-accent text-charcoal-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Featured Story</span>
                      <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                        <CalendarDays size={14} /> {featuredPost.date}
                      </span>
                    </div>
                    <h2 className="font-playfair text-3xl md:text-7xl text-white font-bold leading-[1.1] max-w-4xl group-hover:text-gold-accent transition-colors duration-300">
                      {featuredPost.title}
                    </h2>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------------- JOURNAL GRID ---------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16">
          {gridPosts.map((post, index) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`/blog/${post._id}`} className="group block">
                <div className="aspect-[4/5] overflow-hidden rounded-[2.5rem] mb-8 shadow-sm transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2 relative">
                  <img
                    src={optimizeUrl(post.image)}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-6 left-6 px-4 py-2 bg-white/95 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-charcoal-black shadow-sm">
                    {post.category}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gold-accent">
                    <CalendarDays size={12} /> {post.date}
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <Clock size={12} /> {post.readTime || "5 Min"}
                  </div>
                  
                  <h3 className="font-playfair text-2xl md:text-3xl text-charcoal-black font-bold leading-tight group-hover:text-gold-accent transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="font-inter text-sm text-slate-gray line-clamp-3 leading-relaxed font-light">
                    {post.excerpt}
                  </p>
                  
                  <div className="pt-2 flex items-center gap-3 text-charcoal-black font-black text-[10px] uppercase tracking-[0.2em] group-hover:gap-5 transition-all">
                    Explore Story <ArrowRight size={14} className="text-gold-accent" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* --- EMPTY STATE --- */}
        {filteredPosts.length === 0 && (
          <div className="py-40 text-center">
            <BookOpen size={48} className="mx-auto text-gray-200 mb-6" />
            <h3 className="font-playfair text-3xl font-bold text-charcoal-black mb-2">No Stories Yet</h3>
            <p className="text-slate-gray font-light">Check back soon for new journal entries in {activeCategory}.</p>
          </div>
        )}
      </main>

      {/* ---------------- NEWSLETTER ---------------- */}
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