import { motion } from "framer-motion";
import team1 from "../../assets/images/team-member-1.png";
import team2 from "../../assets/images/team-member-2.png";
import team3 from "../../assets/images/team-member-3.png";

// Note: I've structured this so you can easily pass API data into it later
// if you decide to replace this static array!
const defaultTeam = [
  {
    name: "Aditya Roy",
    role: "Lead Photographer",
    image: team1,
  },
  {
    name: "Sarah Jen",
    role: "Creative Director",
    image: team3,
  },
  {
    name: "Rohan Mehta",
    role: "Senior Videographer",
    image: team2,
  },
];

const TeamSection = ({ team = defaultTeam }) => {
  return (
    <section className="py-24 md:py-32 bg-warm-ivory border-t border-charcoal-black/5">
      <div className="container mx-auto px-6 max-w-6xl text-center">
        
        {/* Section Header */}
        <div className="mb-16 md:mb-24">
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

        {/* Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {team.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="group cursor-default flex flex-col items-center"
            >
              {/* FIX 1 & 2: Portrait Aspect Ratio & Grayscale Transition */}
              <div className="w-full aspect-[4/5] rounded-[2rem] overflow-hidden mb-8 shadow-xl border border-charcoal-black/5 relative bg-muted-beige/20">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover transition-all duration-700 transform group-hover:scale-105 grayscale group-hover:grayscale-0"
                />
                {/* Subtle inner shadow for depth */}
                <div className="absolute inset-0 ring-1 ring-inset ring-charcoal-black/10 rounded-[2rem] pointer-events-none" />
              </div>
              
              {/* FIX 3: Tighter Typographic Hierarchy */}
              <div className="flex flex-col items-center transition-transform duration-500 group-hover:-translate-y-2">
                <h4 className="font-playfair text-2xl font-bold text-charcoal-black mb-2">
                  {member.name}
                </h4>
                <div className="font-inter text-[10px] font-bold text-gold-accent tracking-[0.2em] uppercase">
                  {member.role}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;