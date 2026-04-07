"use client";
import { useEffect } from "react";
import { motion, stagger, useAnimate } from "motion/react"; // Assuming you are using Framer Motion v12+
import { cn } from "../lib/utils";

export const TextGenerateEffect = ({
  words,
  className,
  containerClassName,
  filter = true,
  duration = 0.5,
  appearingColor = "var(--color-slate-gray)",
  finalColor = "var(--color-charcoal-black)",
}) => {
  const [scope, animate] = useAnimate();
  
  useEffect(() => {
    const enterAnimation = async () => {
      await animate(
        "span",
        {
          opacity: 1,
          filter: filter ? "blur(0px)" : "none",
          color: appearingColor,
        },
        {
          duration: duration ? duration : 1,
          delay: stagger(0.12),
        }
      );
      await animate(
        "span",
        {
          color: finalColor,
        },
        { duration: 1 }
      );
    };

    // Only run if scope is ready
    if (scope.current) {
      enterAnimation();
    }
  // FIX 1: Corrected dependency array to watch 'words' so it can re-animate if the text changes
  }, [scope, animate, filter, duration, appearingColor, finalColor, words]);

  const renderWords = () => {
    const paragraphs = words.split(/\n{2,}/g);
    
    return (
      // FIX 2: Added aria-hidden to the animated container so screen readers ignore the broken-up spans
      <motion.div ref={scope} aria-hidden="true">
        {paragraphs.map((para, pIdx) => (
          <div key={pIdx} className="mb-8 min-h-[2.5em]">
            {para.split(" ").map((word, idx) => (
              // FIX 3: Moved the space OUTSIDE the span for natural line wrapping
              <span key={word + idx + pIdx} className="inline-block">
                <motion.span
                  // FIX 4: Added inline-block so iOS Safari can properly render the blur filter
                  className="inline-block opacity-0"
                  style={{
                    filter: filter ? "blur(10px)" : "none",
                    color: appearingColor,
                  }}
                >
                  {word}
                </motion.span>
                {" "}
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    );
  };

  return (
    <div className={cn("font-normal", className)}>
      <div className={cn("mt-6 mb-6", containerClassName)}>
        {/* FIX 5: Added the full string as an aria-label for screen readers to read flawlessly */}
        <div 
          className="text-base md:text-lg leading-relaxed tracking-wide"
          aria-label={words}
          role="text"
        >
          {renderWords()}
        </div>
      </div>
    </div>
  );
};