import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, ArrowLeft, Clock, PackageCheck, Sparkles } from "lucide-react";
import axios from "axios";
import ServiceSidebar from "../components/services/ServiceSidebar";
import ServiceBookingForm from "../components/services/ServiceBookingForm";
import RevealOnScroll from "../components/RevealOnScroll";
import { useClientAuth } from "../context/ClientAuthContext";
import Loader from "../components/Loader";
import PageVideoSection from "../components/PageVideoSection";

const ServiceDetailsPage = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isClientLoggedIn } = useClientAuth();

  // Extract numeric price from string safely
  const extractPrice = (priceString) => {
    if (!priceString) return 0;
    const match = priceString.match(/[\d,]+/);
    return match ? parseInt(match[0].replace(/,/g, "")) : 0;
  };

  useEffect(() => {
    const fetchService = async () => {
      if (!id) return;
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_NODE_URL}/api/services/service/${id}`
        );
        setService(response.data);
      } catch (error) {
        console.error("Error fetching service:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchService();
  }, [id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-warm-ivory/30 flex flex-col items-center justify-center">
        <Loader color="#C9A24D" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-warm-ivory/30 flex flex-col items-center justify-center text-center px-6">
        <div className="w-20 h-20 bg-charcoal-black/5 rounded-full flex items-center justify-center mb-6">
          <PackageCheck size={32} className="text-slate-gray/50" />
        </div>
        <h2 className="font-playfair text-3xl md:text-4xl text-charcoal-black font-bold mb-4">Service Not Found</h2>
        <p className="font-inter text-slate-gray mb-8 max-w-md">This package may have been removed or updated.</p>
        <Link to="/services" className="px-8 py-3.5 bg-charcoal-black text-gold-accent uppercase tracking-widest text-[10px] font-bold rounded-xl hover:bg-gold-accent hover:text-charcoal-black transition-all shadow-lg">
          Explore All Services
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-warm-ivory/30 min-h-[100dvh] pt-24 md:pt-32 pb-20 overflow-x-hidden font-inter">
      
      {/* ---------------- BREADCRUMB & HEADER SECTION ---------------- */}
      <div className="bg-white border-y border-charcoal-black/5 py-10 md:py-16 mb-8 md:mb-12 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-wrap items-center gap-2 text-[10px] md:text-xs uppercase tracking-widest text-slate-gray mb-6 font-bold">
            <Link to="/" className="hover:text-gold-accent transition-colors">Home</Link>
            <ChevronRight size={12} className="text-charcoal-black/20" />
            <Link to="/services" className="hover:text-gold-accent transition-colors">Services</Link>
            <ChevronRight size={12} className="text-charcoal-black/20" />
            <span className="text-gold-accent truncate max-w-[200px] sm:max-w-none">{service.title}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-5 md:gap-6">
            {service.logo && (
              <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 bg-warm-ivory/50 rounded-2xl border border-charcoal-black/5 p-3 flex items-center justify-center shadow-sm">
                <img
                  src={service.logo}
                  alt={service.title}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold text-charcoal-black leading-tight">
              {service.title}
            </h1>
          </div>

        </div>
      </div>

      {/* ---------------- MAIN CONTENT GRID ---------------- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* LEFT SIDEBAR (Desktop Only) - 3 Columns */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-28">
              <ServiceSidebar
                currentServiceId={id}
                packageId={typeof service.package === "string" ? service.package : service.package?._id}
                packageTitle={typeof service.package === "object" ? service.package?.title : null}
              />
            </div>
          </div>

          {/* RIGHT CONTENT AREA - 9 Columns */}
          <div className="lg:col-span-9">
            <div className="flex flex-col xl:flex-row gap-8 lg:gap-12 items-start">
              
              {/* Left Side: Images & Descriptions */}
              <div className="flex-1 min-w-0 w-full space-y-8 md:space-y-12">
                
                {/* Main Feature Image */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="rounded-[2rem] overflow-hidden shadow-lg aspect-video lg:aspect-[16/10] relative bg-charcoal-black/5 border border-charcoal-black/5"
                >
                  <img
                    src={service.images && service.images.length > 0 ? service.images[0] : service.image}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                  {isClientLoggedIn && (
                    <div className="absolute top-4 right-4 md:top-6 md:right-6 bg-gold-accent text-charcoal-black text-[10px] md:text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
                      <Sparkles size={14} /> VIP Pricing Applied
                    </div>
                  )}
                </motion.div>

                <RevealOnScroll>
                  <div className="space-y-8 md:space-y-10">
                    
                    {/* About Section */}
                    <div className="bg-white p-6 sm:p-8 md:p-12 rounded-[2rem] border border-charcoal-black/5 shadow-sm">
                      <div className="flex items-center gap-4 mb-6 md:mb-8">
                        <div className="w-1.5 h-8 bg-gold-accent rounded-full" />
                        <h2 className="font-playfair text-2xl md:text-3xl lg:text-4xl text-charcoal-black font-bold">
                          About This Service
                        </h2>
                      </div>
                      <div className="font-inter text-slate-gray leading-relaxed text-sm md:text-base whitespace-pre-line break-words overflow-wrap-anywhere">
                        {service.description}
                      </div>
                    </div>

                    {/* Dark Pricing & Highlights Card */}
                    <div className="bg-charcoal-black p-6 sm:p-8 md:p-12 rounded-[2rem] shadow-xl relative overflow-hidden">
                      {/* Subtle Background Pattern */}
                      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                        <div className="w-full h-full" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, #C9A24D 1px, transparent 0)`, backgroundSize: "24px 24px" }} />
                      </div>

                      <h3 className="relative z-10 font-playfair font-bold text-2xl md:text-3xl text-warm-ivory mb-8 flex items-center gap-4">
                        Service Details
                      </h3>

                      <ul className="relative z-10 space-y-4">
                        {/* Price Row */}
                        <li className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                          <div className="w-10 h-10 rounded-xl bg-gold-accent/20 flex items-center justify-center shrink-0">
                            <span className="text-gold-accent font-bold">₹</span>
                          </div>
                          <div>
                            <span className="text-warm-ivory/60 text-[10px] md:text-xs uppercase tracking-widest font-bold block mb-1">
                              Investment {isClientLoggedIn && "(Your Discounted Rate)"}
                            </span>
                            {isClientLoggedIn && extractPrice(service.price) > 0 ? (
                              <div className="flex items-baseline gap-3">
                                <span className="text-warm-ivory/40 line-through text-sm md:text-base">
                                  ₹{extractPrice(service.price).toLocaleString("en-IN")}
                                </span>
                                <span className="text-gold-accent font-bold text-xl md:text-2xl">
                                  ₹{Math.round(extractPrice(service.price) * 0.85).toLocaleString("en-IN")}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gold-accent font-bold text-xl md:text-2xl">
                                {service.price}
                              </span>
                            )}
                          </div>
                        </li>

                        {/* Duration Row */}
                        <li className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                          <div className="w-10 h-10 rounded-xl bg-gold-accent/20 flex items-center justify-center shrink-0">
                            <Clock size={18} className="text-gold-accent" />
                          </div>
                          <div>
                            <span className="text-warm-ivory/60 text-[10px] md:text-xs uppercase tracking-widest font-bold block mb-1">
                              Typical Duration
                            </span>
                            <p className="text-warm-ivory font-semibold text-sm md:text-base">
                              {service.details?.duration || "Contact for details"}
                            </p>
                          </div>
                        </li>

                        {/* Deliverables Row */}
                        <li className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-6 p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                          <div className="w-10 h-10 rounded-xl bg-gold-accent/20 flex items-center justify-center shrink-0">
                            <PackageCheck size={18} className="text-gold-accent" />
                          </div>
                          <div>
                            <span className="text-warm-ivory/60 text-[10px] md:text-xs uppercase tracking-widest font-bold block mb-1">
                              Deliverables
                            </span>
                            <p className="text-warm-ivory font-semibold text-sm md:text-base leading-relaxed break-words">
                              {service.details?.deliverables || "Standard package deliverables"}
                            </p>
                          </div>
                        </li>
                      </ul>
                    </div>

                  </div>
                </RevealOnScroll>
              </div>

              {/* Right Side: Sticky Booking Form & Video */}
              <div className="w-full xl:w-[420px] shrink-0">
                <div className="sticky top-28 space-y-8">
                  
                  {/* Instructional Video (if any) */}
                  <div className="rounded-[2rem] overflow-hidden shadow-sm border border-charcoal-black/5 bg-white p-2">
                    <PageVideoSection
                      pageType="booking"
                      title="Booking Guide"
                      subtitle="How to Secure Your Date"
                    />
                  </div>
                  
                  {/* Booking Form Component */}
                  <div className="rounded-[2rem] shadow-xl border border-charcoal-black/5 bg-white overflow-hidden">
                    <ServiceBookingForm
                      serviceTitle={service.title}
                      servicePrice={service.price}
                      isLoggedIn={isClientLoggedIn}
                    />
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailsPage;