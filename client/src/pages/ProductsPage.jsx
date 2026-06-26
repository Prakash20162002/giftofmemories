import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, PackageX, ArrowLeft } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";

import ProductsHero from "../components/products/ProductsHero";
import ProductCard from "../components/products/ProductCard";
import Loader from "../components/Loader";
import CTASection from "../components/products/CTASection";
import TrustStrip from "../components/products/TrustStrip";

import CategoryScrollSection from "../components/CategoryScroll";
import SidebarFilter from "../components/ProductSideBar";
import MobileFilterDrawer from "../components/MoblieFilter";
import PageVideoSection from "../components/PageVideoSection";

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryQuery = searchParams.get("category");

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const optimizeUrl = (url) => {
    if (!url || !url.includes("cloudinary.com")) return url;
    if (url.includes("f_auto,q_auto")) return url;
    return url.replace("/upload/", "/upload/f_auto,q_auto/");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_NODE_URL}/api/shop/get-products`),
          axios.get(`${import.meta.env.VITE_NODE_URL}/api/product-categories/get-categories`),
        ]);

        const optimizedProducts = productsRes.data.map((p) => ({
          ...p,
          media: p.media?.map((file) => optimizeUrl(file)) || [],
          preview: p.media?.length ? optimizeUrl(p.media[0]) : null,
        }));

        setProducts(optimizedProducts);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error("Error fetching shop data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);



  useEffect(() => {
    if (categoryQuery && categories.length > 0) {
      const slugify = (str) => {
        if (!str) return "";
        return str
          .trim()
          .replace(/^["'“‘”’]+|["'“‘”’]+$/g, "")
          .toLowerCase()
          .replace(/[^a-z0-9\s+_-]/g, "")
          .replace(/[\s+_-]+/g, "-");
      };

      const cleanQuery = slugify(categoryQuery);
      const matchedCategory = categories.find(
        (c) => slugify(c.name) === cleanQuery
      );

      if (matchedCategory) {
        const cleanName = slugify(matchedCategory.name);
        if (categoryQuery !== cleanName) {
          navigate(`/shop?category=${encodeURIComponent(cleanName)}`, { replace: true });
        }
        setSelectedCategories([matchedCategory.name]);
      } else {
        const fallback = slugify(categoryQuery);
        if (categoryQuery !== fallback) {
          navigate(`/shop?category=${encodeURIComponent(fallback)}`, { replace: true });
        }
        setSelectedCategories([fallback]);
      }
    }
  }, [categoryQuery, categories, navigate]);

  // Single Select (Top Scroll Bar) - Acts as a "Redirect"
  const handleSingleCategorySelect = (name) => {
    if (selectedCategories.length === 1 && selectedCategories[0] === name) {
      navigate("/shop", { replace: true });
      setSelectedCategories([]);
    } else {
      const slugify = (str) => {
        if (!str) return "";
        return str
          .trim()
          .replace(/^["'“‘”’]+|["'“‘”’]+$/g, "")
          .toLowerCase()
          .replace(/[^a-z0-9\s+_-]/g, "")
          .replace(/[\s+_-]+/g, "-");
      };
      const cleanName = slugify(name);
      navigate(`/shop?category=${encodeURIComponent(cleanName)}`, { replace: true });
      setSelectedCategories([name]);
      setTimeout(() => {
        window.scrollTo({ top: 380, behavior: "smooth" });
      }, 100);
    }
  };

  // Multi Select (Sidebar checkboxes)
  const handleMultiCategorySelect = (name) => {
    if (categoryQuery) {
      navigate("/shop", { replace: true });
    }
    setSelectedCategories((prev) =>
      prev.includes(name)
        ? prev.filter((c) => c !== name)
        : [...prev, name]
    );
  };

  const clearFilters = () => {
    navigate("/shop", { replace: true });
    setSelectedCategories([]);
    setMinPrice("");
    setMaxPrice("");
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategories.length > 0) {
      result = result.filter((p) =>
        selectedCategories.includes(p.category?.name)
      );
    }
    if (minPrice) result = result.filter((p) => p.price >= Number(minPrice));
    if (maxPrice) result = result.filter((p) => p.price <= Number(maxPrice));

    return result;
  }, [selectedCategories, minPrice, maxPrice, products]);

  // Determine if we are acting as a "Dedicated Category Page"
  const activeCategoryObj = categories.find(c => c.name === selectedCategories[0]);
  const isDedicatedCategoryPage = selectedCategories.length === 1 && activeCategoryObj;

  return (
    <div className="bg-[#FAF9F6] min-h-[100dvh] font-inter overflow-x-hidden selection:bg-gold-accent selection:text-white flex flex-col">
      <h1 className="sr-only">Premium Bengali Wedding Samogri & Accessories in Kolkata - Gift of Memories</h1>

      <section aria-label="Shop Header">
        <ProductsHero />
      </section>



      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-[40] border-b border-charcoal-black/5 shadow-sm">
        <CategoryScrollSection
          categories={categories}
          selectedCategories={selectedCategories}
          onToggle={handleSingleCategorySelect}
        />
      </div>

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 w-full flex-1">
        
        <header className="max-w-3xl mx-auto text-center mb-6 md:mb-8 px-2 relative">
          
          {/* BACK BUTTON (Only shows on dedicated category pages) */}
          <AnimatePresence>
            {isDedicatedCategoryPage && (
              <motion.button
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onClick={clearFilters}
                className="cursor-pointer mx-auto flex items-center justify-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-slate-gray hover:text-gold-accent transition-colors mb-6 md:mb-8"
              >
                <ArrowLeft size={14} /> Back to Full Collection
              </motion.button>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {isDedicatedCategoryPage ? (
              <motion.div key={activeCategoryObj._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl text-charcoal-black font-bold mb-2 leading-tight">
                  {activeCategoryObj.name}
                </h2>
                <div className="w-12 h-[1px] bg-gold-accent mx-auto mb-3" />
                <p className="text-slate-gray text-xs md:text-sm leading-relaxed font-light">
                  Explore our exclusive collection of authentic {activeCategoryObj.name}, designed to honor your traditions with timeless craftsmanship.
                </p>
              </motion.div>
            ) : (
              <motion.div key="default" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl text-charcoal-black font-bold mb-2 leading-tight">
                  The Ritual <span className="italic font-light text-charcoal-black/80">Collection</span>
                </h2>
                <div className="w-12 h-[1px] bg-gold-accent mx-auto mb-3" />
                <p className="text-slate-gray text-xs md:text-sm leading-relaxed font-light">
                  A curated selection of handcrafted wedding samogri, designed to honor tradition with timeless craftsmanship.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Hides the mobile filter button when viewing a dedicated category */}
          {!isDedicatedCategoryPage && (
            <div className="lg:hidden w-full mt-4 flex justify-center">
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="cursor-pointer w-full sm:w-64 flex items-center justify-center gap-2 bg-charcoal-black text-gold-accent py-3 px-6 rounded-full shadow-md font-black text-[10px] uppercase tracking-[0.3em] hover:-translate-y-0.5 transition-transform"
              >
                <Filter size={14} />
                Filter Collection
              </button>
            </div>
          )}
        </header>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start w-full">

          {/* SIDEBAR FILTER - Disappears on Dedicated Category Pages! */}
          {!isDedicatedCategoryPage && (
            <aside className="hidden lg:block w-56 xl:w-64 shrink-0 sticky top-32 z-[30]">
              <SidebarFilter
                categories={categories}
                selectedCategories={selectedCategories}
                onToggleCategory={handleMultiCategorySelect}
                minPrice={minPrice}
                maxPrice={maxPrice}
                setMinPrice={setMinPrice}
                setMaxPrice={setMaxPrice}
                clearFilters={clearFilters}
              />
            </aside>
          )}

          <div className="flex-1 w-full min-w-0 relative z-10 transition-all duration-500">
            <div className="flex flex-wrap items-center justify-between mb-4 pb-2 border-b border-charcoal-black/10 gap-4">
              <span className="text-[10px] font-inter font-semibold text-charcoal-black/60 uppercase tracking-[0.2em]">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'Piece' : 'Pieces'}
              </span>

              {/* Only show "Clear Filters" if we are NOT on a dedicated page but still have filters applied */}
              {!isDedicatedCategoryPage && (selectedCategories.length > 0 || minPrice || maxPrice) && (
                <button
                  onClick={clearFilters}
                  className="cursor-pointer text-[10px] font-bold text-red-500 hover:text-charcoal-black transition-colors uppercase tracking-widest"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-16">
                <Loader color="#C9A24D" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-12 px-6 text-center bg-white rounded-2xl border border-charcoal-black/5 shadow-sm"
              >
                <div className="w-12 h-12 rounded-full bg-gold-accent/5 flex items-center justify-center mb-3">
                  <PackageX size={24} className="text-gold-accent" />
                </div>
                <h3 className="font-playfair text-lg md:text-xl text-charcoal-black font-bold mb-1">
                  No Pieces Found
                </h3>
                <p className="text-slate-gray text-xs mb-4 max-w-xs font-light">
                  Try adjusting your filters to discover our collection.
                </p>
                <button
                  onClick={clearFilters}
                  className="cursor-pointer px-6 py-2.5 bg-charcoal-black text-gold-accent rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-gold-accent hover:text-charcoal-black transition-all shadow-sm"
                >
                  Reset Collection
                </button>
              </motion.div>
            ) : (
              <motion.div
                layout
                // If the sidebar is hidden, we allow the grid to stretch to 5 columns on massive screens!
                className={`grid grid-cols-2 md:grid-cols-3 ${isDedicatedCategoryPage ? 'lg:grid-cols-4 xl:grid-cols-5' : 'xl:grid-cols-4'} gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 lg:gap-x-6 lg:gap-y-10 w-full transition-all duration-500`}
              >
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product) => (
                    <motion.div
                      key={product._id}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.3 }}
                      className="h-full w-full"
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* ---------------- DYNAMIC VIDEOS AREA ---------------- */}
      <PageVideoSection pageType="shop" title="Shop Guides" subtitle="Explore Our Product Stories" layout="floating" />

      <section className="relative z-[10] bg-white border-t border-charcoal-black/5 mt-auto">
        <CTASection />
        <TrustStrip />
      </section>

      <MobileFilterDrawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        categories={categories}
        selectedCategories={selectedCategories}
        onToggleCategory={handleMultiCategorySelect}
        minPrice={minPrice}
        maxPrice={maxPrice}
        setMinPrice={setMinPrice}
        setMaxPrice={setMaxPrice}
        clearFilters={clearFilters}
      />
    </div>
  );
};

export default ProductsPage;