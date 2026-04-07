import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react"; // Swapped to Lucide for consistency
import axios from "axios";
import Loader from "../Loader";

const AnimatedTeamSlider = ({ members = [], autoplay = false }) => {
  const [active, setActive] = useState(0);

  const handleNext = () => {
    setActive((prev) => (prev + 1) % members.length);
  };

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + members.length) % members.length);
  };

  const isActive = (index) => index === active;

  useEffect(() => {
    if (autoplay && members.length > 0) {
      const interval = setInterval(handleNext, 5000);
      return () => clearInterval(interval);
    }
  }, [autoplay, members.length]);

  if (!members || members.length === 0) {
    return (
      <section className="bg-warm-ivory py-24 border-y border-charcoal-black/5">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-playfair text-3xl md:text-5xl font-bold text-charcoal-black mb-3">
            The Visionaries
          </h2>
          <p className="text-slate-gray font-inter italic">
            Curating the team...
          </p>
        </div>
      </section>
    );
  }

  // FIX 1: Safe data fallback logic to prevent fatal crashes
  const activeMember = members[active];
  const bioText = activeMember?.quote || activeMember?.bio || activeMember?.description || "A passionate storyteller dedicated to preserving your most precious memories.";

  return (
    <section className="bg-warm-ivory py-24 md:py-32 border-y border-charcoal-black/5 overflow-hidden">
      <div className="container mx-auto px-6 text-center mb-16 md:mb-20">
        <span className="text-gold-accent font-bold text-[10px] md:text-xs tracking-[0.3em] uppercase mb-4 block">
          Behind The Lens
        </span>
        <h2 className="font-playfair text-4xl md:text-5xl font-bold text-charcoal-black mb-4">
          Meet The Creators
        </h2>
        <p className="font-inter text-slate-gray max-w-xl mx-auto">
          The passionate visual storytellers dedicated to preserving your legacy.
        </p>
      </div>

      <div className="mx-auto max-w-sm px-4 md:max-w-5xl md:px-8">
        <div className="grid grid-cols-1 gap-12 md:gap-20 md:grid-cols-2 items-center">
          
          {/* Stacked Image Cards */}
          <div className="relative h-80 w-full md:h-[450px] perspective-1000">
            <AnimatePresence>
              {members.map((member, index) => {
                // FIX 3: Deterministic rotation based on index prevents render "jitter"
                const staticRotation = index % 2 === 0 ? 4 : -4;
                
                return (
                  <motion.div
                    key={member._id || index}
                    initial={{ opacity: 0, scale: 0.9, z: -100, rotate: staticRotation }}
                    animate={{
                      opacity: isActive(index) ? 1 : 0.4,
                      scale: isActive(index) ? 1 : 0.9,
                      z: isActive(index) ? 0 : -100,
                      rotate: isActive(index) ? 0 : staticRotation,
                      zIndex: isActive(index) ? 40 : members.length - index,
                      y: isActive(index) ? [0, -40, 0] : 0,
                    }}
                    exit={{ opacity: 0, scale: 0.9, z: 100, rotate: staticRotation }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0 origin-bottom"
                  >
                    <img
                      src={member.image || "/placeholder-avatar.jpg"}
                      alt={member.name}
                      draggable={false}
                      className="h-full w-full rounded-3xl object-cover object-center shadow-2xl border border-white/20"
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Text & Controls */}
          <div className="flex flex-col justify-between py-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                // FIX 2: Fixed minimum height to prevent buttons from bouncing
                className="min-h-[200px] md:min-h-[250px] flex flex-col justify-center"
              >
                <h3 className="text-3xl md:text-4xl font-playfair font-bold text-charcoal-black">
                  {activeMember?.name || "Team Member"}
                </h3>
                <p className="text-[10px] md:text-xs font-inter font-bold text-gold-accent uppercase tracking-[0.2em] mt-2 mb-6">
                  {activeMember?.designation || "Creative"}
                </p>
                
                <p className="text-base md:text-lg font-inter text-slate-gray leading-relaxed">
                  {bioText.split(" ").map((word, index) => (
                    <motion.span
                      key={index}
                      initial={{ filter: "blur(5px)", opacity: 0, y: 5 }}
                      animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.2,
                        ease: "easeOut",
                        delay: 0.015 * index,
                      }}
                      className="inline-block"
                    >
                      {word}&nbsp;
                    </motion.span>
                  ))}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Controls */}
            <div className="flex gap-4 pt-8 border-t border-charcoal-black/10 mt-4">
              <button
                onClick={handlePrev}
                className="group flex h-12 w-12 items-center justify-center rounded-full bg-white border border-charcoal-black/5 shadow-sm hover:bg-gold-accent transition-all duration-300 hover:shadow-lg hover:shadow-gold-accent/20 hover:-translate-y-1"
              >
                <ArrowLeft className="h-5 w-5 text-charcoal-black transition-transform duration-300 group-hover:-translate-x-1 group-hover:text-white" />
              </button>
              <button
                onClick={handleNext}
                className="group flex h-12 w-12 items-center justify-center rounded-full bg-white border border-charcoal-black/5 shadow-sm hover:bg-gold-accent transition-all duration-300 hover:shadow-lg hover:shadow-gold-accent/20 hover:-translate-y-1"
              >
                <ArrowRight className="h-5 w-5 text-charcoal-black transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white" />
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

// Default export wrapper
const NewTeamSection = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_NODE_URL}/api/about/get-about`
        );
        setTeamMembers(response.data.teamMembers || []);
      } catch (error) {
        console.error("Error fetching team members:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeamMembers();
  }, []);

  if (isLoading) {
    return (
      <section className="bg-warm-ivory py-32 flex justify-center items-center min-h-[500px]">
        <Loader color="#C9A24D" />
      </section>
    );
  }

  return <AnimatedTeamSlider members={teamMembers} autoplay={true} />;
};

export default NewTeamSection;