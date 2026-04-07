import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Camera, Award, Users, ArrowRight } from "lucide-react";
import axios from "axios";
import Loader from "../components/Loader";
import RevealOnScroll from "../components/RevealOnScroll";
import ReactMarkdown from 'react-markdown';

const AboutPage = () => {
  const [aboutData, setAboutData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const optimizeUrl = (url) => {
    if (!url || !url.includes("cloudinary.com")) return url;
    return url.replace("/upload/", "/upload/f_auto,q_auto/");
  };

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_NODE_URL}/api/about/get-about`);
        if (res.data) setAboutData(res.data);
      } catch (e) { 
        console.error("About page fetch failed:", e); 
      } finally { 
        setIsLoading(false); 
      }
    };
    fetchAbout();
  }, []);

  if (isLoading) return <Loader />;

  const foundationItems = [
    { icon: <Heart className="w-4 h-4 md:w-6 md:h-6" />, title: "Authentic", desc: "Real emotions." },
    { icon: <Camera className="w-4 h-4 md:w-6 md:h-6" />, title: "Artistry", desc: "Fine art." },
    { icon: <Award className="w-4 h-4 md:w-6 md:h-6" />, title: "Excellence", desc: "Top editing." },
    { icon: <Users className="w-4 h-4 md:w-6 md:h-6" />, title: "Connect", desc: "Family soul." }
  ];

  return (
    <main className="bg-[#FAF9F6] min-h-screen overflow-x-hidden selection:bg-gold-accent selection:text-white">
      
      {/* --- CINEMATIC HERO (FIXED HEIGHT & REMOVED FOG) --- */}
      <section className="relative h-[40vh] min-h-[300px] md:h-[50vh] md:min-h-[400px] w-full bg-charcoal-black flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.img 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.6 }}
            transition={{ duration: 1.5 }}
            src="/about-hero.jpg" 
            className="w-full h-full object-cover"
            alt="Gift of Memories Studio"
          />
          <div className="absolute inset-0 bg-charcoal-black/50" />
        </div>

        <div className="relative z-10 text-center px-6 mt-8 md:mt-12">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gold-accent font-inter text-[10px] md:text-xs uppercase tracking-[0.4em] md:tracking-[0.5em] font-black mb-3 md:mb-4 block">
            Since 2018
          </motion.span>
          <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-warm-ivory font-bold tracking-tighter mb-4 md:mb-6 drop-shadow-lg">
            The Art of <span className="italic text-gold-accent">Legacy</span>
          </h1>
          <div className="h-px w-12 md:w-20 bg-gold-accent mx-auto" />
        </div>
      </section>

      {/* --- OUR STORY --- */}
      <section className="py-16 md:py-32 container mx-auto px-6">
        <RevealOnScroll>
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
            <div className="w-full md:w-1/2">
              <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl bg-black">
                <img src={optimizeUrl(aboutData?.storyImage || "/story.jpg")} className="w-full h-full object-cover opacity-80" alt="Our Story" />
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <span className="text-gold-accent font-inter text-[10px] uppercase tracking-[0.4em] font-black mb-6 block">Our Philosophy</span>
              <h2 className="font-playfair text-3xl md:text-6xl text-charcoal-black font-bold mb-6 leading-tight">Gift of Memories is more than a <span className="italic">studio</span>.</h2>
              
              {/* FIX: Replaced the standard <p> tag with a div wrapping ReactMarkdown */}
              {/* Added space-y-4 so multiple paragraphs are perfectly spaced out */}
              <div className="text-slate-gray font-inter text-base md:text-lg leading-relaxed font-light mb-8 space-y-4">
                <ReactMarkdown>
                  {aboutData?.storyContent || "A curated collection of handcrafted Samogri and cinematic stories designed for every Bengali wedding ritual. We began with a simple belief: that every wedding is a historical event."}
                </ReactMarkdown>
              </div>

              <div className="grid grid-cols-2 gap-8 border-t border-charcoal-black/5 pt-8">
                <div><h4 className="font-playfair text-2xl md:text-3xl text-gold-accent font-bold">500+</h4><p className="text-[9px] uppercase font-black tracking-widest text-charcoal-black">Stories Told</p></div>
                <div><h4 className="font-playfair text-2xl md:text-3xl text-gold-accent font-bold">12+</h4><p className="text-[9px] uppercase font-black tracking-widest text-charcoal-black">Awards Won</p></div>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* --- OUR FOUNDATION --- */}
      <section className="bg-charcoal-black py-16 md:py-32 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-10 md:mb-20">
            <h2 className="font-playfair text-3xl md:text-6xl text-warm-ivory font-bold mb-4">Our <span className="italic text-gold-accent">Foundation</span></h2>
            <div className="h-px w-10 bg-gold-accent/30 mx-auto" />
          </div>

          <div className="grid grid-cols-4 gap-1 md:gap-12 items-start max-w-5xl mx-auto">
            {foundationItems.map((value, i) => (
              <div key={i} className="text-center group px-1">
                <div className="w-9 h-9 md:w-14 md:h-14 rounded-lg md:rounded-2xl bg-white/5 flex items-center justify-center text-gold-accent mx-auto mb-3 group-hover:bg-gold-accent group-hover:text-charcoal-black transition-all">
                  {value.icon}
                </div>
                <h3 className="font-playfair text-[8px] sm:text-[10px] md:text-xl text-warm-ivory mb-1 font-bold uppercase tracking-tighter sm:tracking-normal">
                  {value.title}
                </h3>
                <p className="hidden md:block text-warm-ivory/40 text-xs leading-relaxed uppercase tracking-widest">
                  {value.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- THE TEAM --- */}
      <section className="py-16 md:py-32 container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-gold-accent font-inter text-[10px] uppercase tracking-[0.4em] font-black mb-4 block">The Artists</span>
          <h2 className="font-playfair text-3xl md:text-6xl text-charcoal-black font-bold">Meet the <span className="italic text-gold-accent">Visionaries</span></h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(aboutData?.teamMembers || [
            { name: "Suman Das", role: "Lead Photographer", image: "/team1.jpg", designation: "Lead Photographer" },
            { name: "Rahul Sen", role: "Cinematographer", image: "/team2.jpg", designation: "Cinematographer" },
            { name: "Priya Singh", role: "Creative Director", image: "/team3.jpg", designation: "Creative Director" }
          ]).map((member, i) => (
            <RevealOnScroll key={i}>
              <div className="group relative overflow-hidden rounded-[2rem] bg-white border border-charcoal-black/5 shadow-sm hover:shadow-2xl transition-all">
                <div className="aspect-[3/4] overflow-hidden bg-gray-100">
                  <img src={optimizeUrl(member.image)} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={member.name} />
                </div>
                <div className="p-6 text-center">
                  <h3 className="font-playfair text-xl md:text-2xl text-charcoal-black font-bold mb-1">{member.name}</h3>
                  <p className="text-gold-accent font-inter text-[9px] uppercase font-black">{member.designation}</p>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="py-16 bg-charcoal-black border-t border-white/5">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-playfair text-2xl md:text-5xl text-warm-ivory mb-8 leading-tight">
            Ready to begin your <span className="italic text-gold-accent">story?</span>
          </h2>
          <div className="flex justify-center">
            <button 
                onClick={() => window.location.href = '/contact'}
                className="w-max group inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-10 md:py-5 bg-gold-accent text-charcoal-black font-black text-[9px] md:text-xs uppercase tracking-[0.2em] rounded-full hover:bg-white transition-all shadow-2xl"
            >
                Start a Conversation
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

    </main>
  );
};

export default AboutPage;