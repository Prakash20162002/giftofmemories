import { cn } from "../lib/utils";
import { Link } from "react-router-dom"; // CRITICAL: Use Link instead of <a>
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion"; // Make sure this is "framer-motion", not "motion/react"
import { useRef, useState } from "react";

export const FloatingDock = ({ items, desktopClassName, mobileClassName }) => {
  return (
    <>
      <FloatingDockDesktop items={items} className={desktopClassName} />
      <FloatingDockMobile items={items} className={mobileClassName} />
    </>
  );
};

const MobileIconContainer = ({ title, icon, href }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      to={href}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setTimeout(() => setIsHovered(false), 1500)}
      className="relative shrink-0 flex items-center justify-center"
    >
      <motion.div
        animate={{
          scale: isHovered ? 1.2 : 1,
          y: isHovered ? -8 : 0,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        // Added text-charcoal-black so the icons are dark and crisp against the light background
        className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-gray-100 hover:bg-gold-accent/20 text-charcoal-black transition-colors"
      >
        <motion.div
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          // THE FIX: [&>svg] forces any icon passed in to perfectly scale to the 20x20px container
          className="flex items-center justify-center h-5 w-5 sm:h-6 sm:w-6 [&>svg]:w-full [&>svg]:h-full"
        >
          {icon}
        </motion.div>
      </motion.div>
      
      <AnimatePresence>
        {isHovered && (
          <motion.span
            initial={{ opacity: 0, y: 5, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 5, x: "-50%" }}
            className="absolute -top-8 left-1/2 whitespace-nowrap rounded-md bg-charcoal-black px-2 py-1 text-[10px] sm:text-xs text-white pointer-events-none drop-shadow-md z-50"
          >
            {title}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
};

const FloatingDockMobile = ({ items, className }) => {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={cn(
        "flex md:hidden items-center justify-center gap-2 sm:gap-3 rounded-full bg-white/90 backdrop-blur-md px-4 py-3 shadow-2xl border border-gray-200 max-w-[95vw] overflow-x-auto no-scrollbar",
        className,
      )}
    >
      {items.map((item) => (
        <MobileIconContainer key={item.title} {...item} />
      ))}
    </motion.div>
  );
};

const FloatingDockDesktop = ({ items, className }) => {
  let mouseX = useMotionValue(Infinity);
  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "mx-auto hidden h-16 items-end gap-4 rounded-2xl bg-gray-50 px-4 pb-3 md:flex dark:bg-neutral-900",
        className,
      )}
    >
      {items.map((item) => (
        <IconContainer mouseX={mouseX} key={item.title} {...item} />
      ))}
    </motion.div>
  );
};

function IconContainer({ mouseX, title, icon, href }) {
  let ref = useRef(null);

  let distance = useTransform(mouseX, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  let widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  let heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);

  let widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);
  let heightTransformIcon = useTransform(
    distance,
    [-150, 0, 150],
    [20, 40, 20],
  );

  let width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  let widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const [hovered, setHovered] = useState(false);

  return (
    <Link to={href}>
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex aspect-square items-center justify-center rounded-full bg-gray-200 text-charcoal-black transition-colors hover:bg-gold-accent/20"
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className="absolute -top-10 left-1/2 w-fit rounded-md border border-gray-200 bg-charcoal-black px-3 py-1.5 text-xs whitespace-pre text-white z-50 pointer-events-none drop-shadow-md"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className="flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
        >
          {icon}
        </motion.div>
      </motion.div>
    </Link>
  );
}