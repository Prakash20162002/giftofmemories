import React, { Children, cloneElement, forwardRef, isValidElement, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import '../App.css'

export const Card = forwardRef(({ customClass, ...rest }, ref) => (
  <div ref={ref} {...rest} className={`card ${customClass ?? ''} ${rest.className ?? ''}`.trim()} />
));
Card.displayName = 'Card';

const makeSlot = (i, distX, distY, total) => ({
  x: i * distX,
  y: -i * distY,
  z: -i * distX * 1.5,
  zIndex: total - i
});

const placeNow = (el, slot, skew) =>
  gsap.set(el, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: 'center center',
    zIndex: slot.zIndex,
    force3D: true
  });

const CardSwap = ({
  width: desktopWidth = 500,
  height: desktopHeight = 400,
  cardDistance: desktopDistX = 60,
  verticalDistance: desktopDistY = 70,
  delay = 5000,
  pauseOnHover = false,
  onCardClick,
  skewAmount = 6,
  easing = 'elastic',
  children
}) => {
  const [screenSize, setScreenSize] = useState({
    isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
    width: typeof window !== 'undefined' ? window.innerWidth : 1200
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        isMobile: window.innerWidth < 768,
        width: window.innerWidth
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Responsive dimensions calculation
  const width = screenSize.isMobile ? Math.min(screenSize.width * 0.85, desktopWidth) : desktopWidth;
  const height = screenSize.isMobile ? (width * 0.8) : desktopHeight;
  const cardDistance = screenSize.isMobile ? desktopDistX * 0.4 : desktopDistX;
  const verticalDistance = screenSize.isMobile ? desktopDistY * 0.4 : desktopDistY;

  const config =
    easing === 'elastic'
      ? {
          ease: 'elastic.out(0.6,0.9)',
          durDrop: 2,
          durMove: 2,
          durReturn: 2,
          promoteOverlap: 0.9,
          returnDelay: 0.05
        }
      : {
          ease: 'power1.inOut',
          durDrop: 0.8,
          durMove: 0.8,
          durReturn: 0.8,
          promoteOverlap: 0.45,
          returnDelay: 0.2
        };

  const childArr = useMemo(() => Children.toArray(children), [children]);
  const refs = useMemo(
    () => childArr.map(() => React.createRef()),
    [childArr.length]
  );

  const order = useRef(Array.from({ length: childArr.length }, (_, i) => i));
  const tlRef = useRef(null);
  const intervalRef = useRef(null);
  const container = useRef(null);

  useEffect(() => {
    const total = refs.length;
    refs.forEach((r, i) => {
      if(r.current) placeNow(r.current, makeSlot(i, cardDistance, verticalDistance, total), skewAmount);
    });

    const swap = () => {
      if (order.current.length < 2) return;

      const [front, ...rest] = order.current;
      const elFront = refs[front].current;
      if (!elFront) return;

      // FIX 1: Ensure any previous timeline is killed before starting a new one to prevent glitching
      if (tlRef.current) tlRef.current.kill();

      const tl = gsap.timeline();
      tlRef.current = tl;

      tl.to(elFront, {
        y: `+=${height + 100}`,
        duration: config.durDrop,
        ease: config.ease
      });

      tl.addLabel('promote', `-=${config.durDrop * config.promoteOverlap}`);
      rest.forEach((idx, i) => {
        const el = refs[idx].current;
        if(!el) return;
        const slot = makeSlot(i, cardDistance, verticalDistance, refs.length);
        tl.set(el, { zIndex: slot.zIndex }, 'promote');
        tl.to(
          el,
          {
            x: slot.x,
            y: slot.y,
            z: slot.z,
            duration: config.durMove,
            ease: config.ease
          },
          `promote+=${i * 0.15}`
        );
      });

      const backSlot = makeSlot(refs.length - 1, cardDistance, verticalDistance, refs.length);
      tl.addLabel('return', `promote+=${config.durMove * config.returnDelay}`);
      tl.call(() => {
        gsap.set(elFront, { zIndex: backSlot.zIndex });
      }, null, 'return');
      
      tl.to(
        elFront,
        {
          x: backSlot.x,
          y: backSlot.y,
          z: backSlot.z,
          duration: config.durReturn,
          ease: config.ease
        },
        'return'
      );

      tl.call(() => {
        order.current = [...rest, front];
      });
    };

    intervalRef.current = window.setInterval(swap, delay);

    // FIX 2: Disabled pauseOnHover for mobile devices to prevent touch-sticking bugs
    if (pauseOnHover && !screenSize.isMobile) {
      const node = container.current;
      const pause = () => {
        tlRef.current?.pause();
        clearInterval(intervalRef.current);
      };
      const resume = () => {
        tlRef.current?.play();
        intervalRef.current = window.setInterval(swap, delay);
      };
      node.addEventListener('mouseenter', pause);
      node.addEventListener('mouseleave', resume);
      
      return () => {
        node.removeEventListener('mouseenter', pause);
        node.removeEventListener('mouseleave', resume);
        clearInterval(intervalRef.current);
        tlRef.current?.kill(); // CRITICAL GSAP CLEANUP
      };
    }

    return () => {
      clearInterval(intervalRef.current);
      tlRef.current?.kill(); // CRITICAL GSAP CLEANUP
    };
  }, [cardDistance, verticalDistance, height, delay, pauseOnHover, skewAmount, easing, refs, screenSize.isMobile]);

  const rendered = childArr.map((child, i) =>
    isValidElement(child)
      ? cloneElement(child, {
          key: i,
          ref: refs[i],
          // FIX 3: Force absolute centering so xPercent/yPercent works flawlessly
          style: { 
            width, 
            height, 
            position: 'absolute', 
            top: '50%', 
            left: '50%',
            ...(child.props.style ?? {}) 
          },
          onClick: e => {
            child.props.onClick?.(e);
            onCardClick?.(i);
          }
        })
      : child
  );

  return (
    <div 
      ref={container} 
      className="card-swap-container" 
      style={{ 
        // FIX 4: Capped max-width so the offset cards don't break the mobile horizontal scroll
        width: width + (cardDistance * childArr.length), 
        maxWidth: "100%", 
        height: height + 100, // Added padding to account for the drop animation bounds
        position: 'relative',
        margin: '0 auto',
        // FIX 5: Added perspective so the Z-axis translations actually look 3D!
        perspective: '1200px',
        overflow: 'hidden' // Keeps the drop animation from bleeding into the section below
      }}
    >
      {rendered}
    </div>
  );
};

export default CardSwap;