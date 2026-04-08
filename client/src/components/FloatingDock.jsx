import { cn } from "../lib/utils";
import { Link } from "react-router-dom"; 
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion"; 
import { useRef, useState } from "react";

export const FloatingDock = ({ items, desktopClassName, mobileClassName }) => {
  return (
    <>
      <FloatingDockDesktop items={items} className={desktopClassName} />
      <FloatingDockMobile items={items} className={mobileClassName} />
    </>
  );
};

// --- FIX: MOBILE ICON CONTAINER ---
const MobileIconContainer = ({ title, icon, href }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      to={href}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setTimeout(() => setIsHovered(false), 1500)}
      // 1. Added flex-col to stack the icon and text vertically
      className="relative shrink-0 flex flex-col items-center justify-center gap-1 w-12 sm:w-14"
    >
      <motion.div
        animate={{
          scale: isHovered ? 1.1 : 1, 
          y: isHovered ? -2 : 0, // Reduced the bounce height so it doesn't detach from the text
        }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-gray-100 hover:bg-gold-accent/20 text-charcoal-black transition-colors"
      >
        <motion.div
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="flex items-center justify-center h-5 w-5 sm:h-6 sm:w-6 [&>svg]:w-full [&>svg]:h-full"
        >
          {icon}
        </motion.div>
      </motion.div>
      
      {/* 2. Added the permanent text label underneath the icon */}
      <span className="text-[8px] sm:text-[9px] font-inter font-bold uppercase tracking-wider text-charcoal-black/70 text-center leading-none">
        {title}
      </span>
      
      {/* (Removed the old AnimatePresence hover tooltip from mobile since the text is always visible now) */}
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
        // 3. Adjusted gap and padding to accommodate the new text labels perfectly
        "flex md:hidden items-center justify-center gap-1 sm:gap-2 rounded-[2rem] bg-white/90 backdrop-blur-md px-3 py-2 shadow-2xl border border-gray-200 max-w-[95vw] overflow-x-auto no-scrollbar",
        className,
      )}
    >
      {items.map((item) => (
        <MobileIconContainer key={item.title} {...item} />
      ))}
    </motion.div>
  );
};

// --- DESKTOP REMAINS UNTOUCHED ---
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