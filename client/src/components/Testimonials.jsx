import { motion } from "framer-motion";
import { Star } from "lucide-react";

// ==========================================
// 📝 MANUAL TESTIMONIALS LIST
// To change the reviews, simply edit the text, author, and role below.
// You can copy and paste a block to add more!
// ==========================================
const testimonials = [
  {
    id: 1,
    text: "Absolutely stunning photos. The way they captured the light and emotion of our wedding day was magical. We couldn't be happier.",
    author: "Sarah & James",
    role: "Wedding Clients",
  },
  {
    id: 2,
    text: "A true artist. The portrait session was professional, relaxed, and the results are some of the best photos I've ever seen of myself.",
    author: "Michael Chen",
    role: "Portrait Client",
  },
  {
    id: 3,
    text: "Gift of Memories's work elevated our brand campaign to a whole new level. The attention to detail and creative direction were impeccable.",
    author: "Elena Rossi",
    role: "Fashion Director",
  },
  {
    id: 4,
    text: "Simply the best. Professional, creative, and a joy to work with. Our family photos are treasures we will cherish forever.",
    author: "The Thompson Family",
    role: "Family Session",
  },
];

const STAR_COUNT = 5;

const Testimonials = () => {
  // Duplicate exactly once to create a perfect 50% split for the infinite scroll
  const seamlessTestimonials = [...testimonials, ...testimonials];

  return (
    <section className="py-16 md:py-24 bg-charcoal-black text-warm-ivory relative overflow-hidden">
      
      {/* Header */}
      <div className="container mx-auto px-4 md:px-6 text-center mb-12 md:mb-16 relative z-10">
        <div className="flex justify-center items-center gap-2 mb-3 md:mb-4">
          <div className="flex text-gold-accent">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} fill="currentColor" className="mr-0.5" />
            ))}
          </div>
          <span className="text-[10px] md:text-xs font-inter tracking-widest text-muted-beige uppercase font-semibold">
            Rated 4.9 Stars on Google
          </span>
        </div>

        <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl text-warm-ivory mb-4 md:mb-6 leading-tight px-2">
          Your feedback is what makes us{" "}
          <span className="italic text-gold-accent">better</span>
        </h2>
      </div>

      {/* Marquee Container */}
      <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <motion.div
          className="flex gap-6 md:gap-8 w-max"
          animate={{ x: "-50%" }}
          transition={{
            duration: 40, // Adjust this number to make the scroll faster or slower
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {seamlessTestimonials.map((testimonial, index) => (
            <div
              key={`testimonial-${index}`}
              className="w-[280px] sm:w-[350px] md:w-[450px] p-6 md:p-8 shrink-0 select-none bg-white/5 rounded-2xl border border-white/10"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4 md:mb-6 text-gold-accent">
                {[...Array(STAR_COUNT)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>

              {/* Quote */}
              <p className="font-inter text-sm md:text-lg leading-relaxed text-gray-300 font-light italic mb-6 md:mb-8">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div>
                <h4 className="font-playfair text-lg md:text-xl text-warm-ivory mb-1">
                  - {testimonial.author}
                </h4>
                {testimonial.role && (
                  <span className="font-inter text-[10px] md:text-xs tracking-wider text-gray-500 uppercase">
                    {testimonial.role}
                  </span>
                )}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;