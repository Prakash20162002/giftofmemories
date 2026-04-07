import { motion } from "framer-motion";

const RevealOnScroll = ({ children, className = "", delay = 0 }) => {
  return (
    <motion.div
      // FIX 1: Reduced y: 75 to y: 40. 
      // 75px is a massive jump on a small phone screen and can cause horizontal scrollbar clipping. 40px feels much snappier!
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      // FIX 2: Changed margin to -50px. 
      // It still waits for the element to peek into view, but guarantees bottom-of-page elements will actually trigger.
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.7, 
        ease: "easeOut",
        delay: delay // Allows you to pass delay={0.2} for staggered card reveals
      }}
      // FIX 3: Allows the parent component to pass Tailwind classes down to the wrapper
      className={className} 
    >
      {children}
    </motion.div>
  );
};

export default RevealOnScroll;