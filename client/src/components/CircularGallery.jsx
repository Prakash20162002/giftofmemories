import {
  Camera,
  Mesh,
  Plane,
  Program,
  Renderer,
  Texture,
  Transform,
} from "ogl";
import { useEffect, useRef } from "react";
import galleryEvent1 from "../assets/images/gallery-event-1.png";
import galleryWedding1 from "../assets/images/gallery-wedding-1.png";

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function lerp(p1, p2, t) {
  return p1 + (p2 - p1) * t;
}

function drawCardTexture(gl, image, title, duration) {
  const canvas = document.createElement("canvas");
  const scale = 2; // Retina scaling for sharpness
  const width = 400 * scale;
  const height = 225 * scale; // 16:9 Aspect Ratio
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const radius = 12 * scale; // rounded-xl

  // 1. Background (bg-stone-900)
  ctx.fillStyle = "#1c1917";
  ctx.beginPath();
  ctx.roundRect(0, 0, width, height, radius);
  ctx.fill();

  // 2. Clip for Image
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(0, 0, width, height, radius);
  ctx.clip();

  // 3. Image (object-cover equivalent)
  if (image) {
    const imgRatio = image.naturalWidth / image.naturalHeight;
    const canvasRatio = width / height;
    let dw, dh, dx, dy;
    if (imgRatio > canvasRatio) {
      dh = height;
      dw = height * imgRatio;
      dx = (width - dw) / 2;
      dy = 0;
    } else {
      dw = width;
      dh = width / imgRatio;
      dx = 0;
      dy = (height - dh) / 2;
    }

    ctx.globalAlpha = 0.7; // opacity-70
    ctx.drawImage(image, dx, dy, dw, dh);
    ctx.globalAlpha = 1.0;
  }

  // 4. Gradient Overlay
  const gradient = ctx.createLinearGradient(0, height, 0, height * 0.5);
  gradient.addColorStop(0, "rgba(0,0,0,1)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // 5. Play Button Overlay
  const cx = width / 2;
  const cy = height / 2;
  const btnSize = 64 * scale;

  // Shadow
  ctx.shadowColor = "rgba(201,162,77,0.4)";
  ctx.shadowBlur = 30;

  // Button Circle (bg-gold-accent/90)
  ctx.fillStyle = "rgba(201, 162, 77, 0.9)";
  ctx.beginPath();
  ctx.arc(cx, cy, btnSize / 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;

  // Play Icon (Triangle)
  const iconSize = 28 * scale;
  ctx.fillStyle = "black";
  ctx.beginPath();
  const triH = iconSize;
  const triW = iconSize * 0.866;
  const offsetX = 4 * scale;
  ctx.moveTo(cx - triW / 3 + offsetX, cy - triH / 2);
  ctx.lineTo(cx + (triW * 2) / 3 + offsetX, cy);
  ctx.lineTo(cx - triW / 3 + offsetX, cy + triH / 2);
  ctx.fill();

  // 6. Text Content
  const padding = 24 * scale; // p-6
  const bottomY = height - padding;

  // Duration Badge
  const durationText = duration || "0:00";
  ctx.font = `${12 * scale}px Inter, sans-serif`;
  const metrics = ctx.measureText(durationText);
  const badgeHPadding = 8 * scale; // px-2
  const badgeVPadding = 4 * scale; // py-1
  const badgeWidth = metrics.width + badgeHPadding * 2;
  const badgeHeight = 12 * scale + badgeVPadding * 2 + 4; // Approx height
  const badgeY = bottomY - badgeHeight;

  ctx.fillStyle = "rgba(0,0,0,0.6)"; // bg-black/60
  ctx.beginPath();
  ctx.roundRect(padding, badgeY, badgeWidth, badgeHeight, 4 * scale);
  ctx.fill();

  ctx.fillStyle = "#d6d3d1"; // text-stone-300
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    durationText,
    padding + badgeWidth / 2,
    badgeY + badgeHeight / 2
  );

  // Title
  ctx.font = `600 ${20 * scale}px "Playfair Display", serif`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";
  ctx.fillText(title || "", padding, badgeY - 8 * scale);

  ctx.restore();

  // 7. Border (border-stone-800)
  ctx.strokeStyle = "#292524";
  ctx.lineWidth = 1 * scale;
  ctx.beginPath();
  ctx.roundRect(0, 0, width, height, radius);
  ctx.stroke();

  const texture = new Texture(gl, { generateMipmaps: true });
  texture.image = canvas;
  return { texture, width: canvas.width, height: canvas.height };
}

class Media {
  constructor({
    geometry,
    gl,
    image,
    index,
    length,
    renderer,
    scene,
    screen,
    text,
    viewport,
    bend,
    duration,
  }) {
    this.extra = 0;
    this.geometry = geometry;
    this.gl = gl;
    this.image = image;
    this.index = index;
    this.length = length;
    this.renderer = renderer;
    this.scene = scene;
    this.screen = screen;
    this.text = text;
    this.duration = duration;
    this.viewport = viewport;
    this.bend = bend;

    this.createShader();
    this.createMesh();
    this.onResize();
  }

  createShader() {
    const texture = new Texture(this.gl, {
      generateMipmaps: true,
    });

    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpeed;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          p.z = 0.0;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform sampler2D tMap;
        varying vec2 vUv;
        
        void main() {
          vec4 color = texture2D(tMap, vUv);
          if (color.a < 0.01) discard;
          gl_FragColor = color;
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uSpeed: { value: 0 },
        uTime: { value: 100 * Math.random() },
      },
      transparent: true,
    });

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = this.image;
    img.onload = () => {
      const { texture: cardTexture } = drawCardTexture(
        this.gl,
        img,
        this.text,
        this.duration
      );
      this.program.uniforms.tMap.value = cardTexture;
    };
  }

  createMesh() {
    this.plane = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program,
    });
    this.plane.setParent(this.scene);
  }

  update(scroll, direction) {
    this.plane.position.x = this.x - scroll.current - this.extra;

    const x = this.plane.position.x;
    const H = this.viewport.width / 2;

    if (this.bend === 0) {
      this.plane.position.y = 0;
      this.plane.rotation.z = 0;
    } else {
      const B_abs = Math.abs(this.bend);
      const R = (H * H + B_abs * B_abs) / (2 * B_abs);
      const effectiveX = Math.min(Math.abs(x), H);

      const arc = R - Math.sqrt(R * R - effectiveX * effectiveX);
      if (this.bend > 0) {
        this.plane.position.y = -arc;
        this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R);
      } else {
        this.plane.position.y = arc;
        this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R);
      }
    }

    this.speed = scroll.current - scroll.last;
    this.program.uniforms.uTime.value += 0.04;
    this.program.uniforms.uSpeed.value = this.speed;

    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.viewport.width / 2;
    this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
    this.isAfter = this.plane.position.x - planeOffset > viewportOffset;
    if (direction === "right" && this.isBefore) {
      this.extra -= this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
    if (direction === "left" && this.isAfter) {
      this.extra += this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
  }

  onResize({ screen, viewport } = {}) {
    if (screen) this.screen = screen;
    if (viewport) {
      this.viewport = viewport;
    }
    const aspect = 16 / 9;
    const cardHeight = this.viewport.height * 0.85;
    const cardWidth = cardHeight * aspect;

    this.plane.scale.x = cardWidth;
    this.plane.scale.y = cardHeight;

    this.padding = cardWidth * 0.05; 
    this.width = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;
  }
}

class App {
  constructor(
    container,
    { items, bend, scrollSpeed = 2, scrollEase = 0.05 } = {}
  ) {
    document.documentElement.classList.remove("no-js");
    this.container = container;
    this.scrollSpeed = scrollSpeed;
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
    this.onCheckDebounce = debounce(this.onCheck, 200);
    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.onResize();
    this.createGeometry();
    this.createMedias(items, bend);
    this.update();
    this.addEventListeners();
  }
  createRenderer() {
    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    this.container.appendChild(this.gl.canvas);
  }
  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }
  createScene() {
    this.scene = new Transform();
  }
  createGeometry() {
    this.planeGeometry = new Plane(this.gl, {
      heightSegments: 50,
      widthSegments: 100,
    });
  }
  createMedias(items, bend = 1) {
    const defaultItems = [
      {
        title: "The Royal Jaipur Wedding",
        thumbnail: galleryWedding1,
        duration: "4:32",
      },
      {
        title: "Global Tech Summit Highlights",
        thumbnail: galleryEvent1,
        duration: "2:15",
      },
      {
        title: "The Royal Jaipur Wedding",
        thumbnail: galleryWedding1,
        duration: "4:32",
      },
      {
        title: "Global Tech Summit Highlights",
        thumbnail: galleryEvent1,
        duration: "2:15",
      },
    ];
    const galleryItems = items && items.length ? items : defaultItems;
    this.mediasImages = galleryItems.concat(galleryItems);
    this.medias = this.mediasImages.map((data, index) => {
      return new Media({
        geometry: this.planeGeometry,
        gl: this.gl,
        image: data.thumbnail,
        index,
        length: this.mediasImages.length,
        renderer: this.renderer,
        scene: this.scene,
        screen: this.screen,
        text: data.title,
        duration: data.duration, 
        viewport: this.viewport,
        bend,
      });
    });
  }
  onTouchDown(e) {
    this.isDown = true;
    this.scroll.position = this.scroll.current;
    this.start = e.touches ? e.touches[0].clientX : e.clientX;
  }
  onTouchMove(e) {
    if (!this.isDown) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const distance = (this.start - x) * (this.scrollSpeed * 0.025);
    this.scroll.target = this.scroll.position + distance;
  }
  onTouchUp() {
    this.isDown = false;
    this.onCheck();
  }
  onWheel(e) {
    const delta = e.deltaY || e.wheelDelta || e.detail;
    this.scroll.target +=
      (delta > 0 ? this.scrollSpeed : -this.scrollSpeed) * 0.2;
    this.onCheckDebounce();
  }
  onCheck() {
    if (!this.medias || !this.medias[0]) return;
    const width = this.medias[0].width;
    const itemIndex = Math.round(Math.abs(this.scroll.target) / width);
    const item = width * itemIndex;
    this.scroll.target = this.scroll.target < 0 ? -item : item;
  }
  onResize() {
    this.screen = {
      width: this.container.clientWidth,
      height: this.container.clientHeight,
    };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({
      aspect: this.screen.width / this.screen.height,
    });
    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;
    this.viewport = { width, height };
    if (this.medias) {
      this.medias.forEach((media) =>
        media.onResize({ screen: this.screen, viewport: this.viewport })
      );
    }
  }

  // --- CRITICAL FIX 1: Attach events to container, not window ---
  addEventListeners() {
    this.boundOnResize = this.onResize.bind(this);
    this.boundOnWheel = this.onWheel.bind(this);
    this.boundOnTouchDown = this.onTouchDown.bind(this);
    this.boundOnTouchMove = this.onTouchMove.bind(this);
    this.boundOnTouchUp = this.onTouchUp.bind(this);

    window.addEventListener("resize", this.boundOnResize);
    
    // Attach downward events to the specific container, NOT the whole window!
    this.container.addEventListener("wheel", this.boundOnWheel);
    this.container.addEventListener("mousedown", this.boundOnTouchDown);
    this.container.addEventListener("touchstart", this.boundOnTouchDown, { passive: true });

    // Move and up events stay on window so the drag doesn't stop if finger leaves the bounds
    window.addEventListener("mousemove", this.boundOnTouchMove);
    window.addEventListener("mouseup", this.boundOnTouchUp);
    window.addEventListener("touchmove", this.boundOnTouchMove, { passive: true });
    window.addEventListener("touchend", this.boundOnTouchUp);
  }

  destroy() {
    window.cancelAnimationFrame(this.raf);
    
    window.removeEventListener("resize", this.boundOnResize);
    this.container.removeEventListener("wheel", this.boundOnWheel);
    this.container.removeEventListener("mousedown", this.boundOnTouchDown);
    this.container.removeEventListener("touchstart", this.boundOnTouchDown);
    
    window.removeEventListener("mousemove", this.boundOnTouchMove);
    window.removeEventListener("mouseup", this.boundOnTouchUp);
    window.removeEventListener("touchmove", this.boundOnTouchMove);
    window.removeEventListener("touchend", this.boundOnTouchUp);
    
    if (
      this.renderer &&
      this.renderer.gl &&
      this.renderer.gl.canvas.parentNode
    ) {
      this.renderer.gl.canvas.parentNode.removeChild(this.renderer.gl.canvas);
    }
  }
}

export default function CircularGallery({
  items,
  bend = 3,
  textColor = "#ffffff",
  borderRadius = 0.05,
  font = "bold 30px Figtree",
  scrollSpeed = 2,
  scrollEase = 0.05,
}) {
  const containerRef = useRef(null);
  useEffect(() => {
    const app = new App(containerRef.current, {
      items,
      bend,
      textColor,
      borderRadius,
      font,
      scrollSpeed,
      scrollEase,
    });
    return () => {
      app.destroy();
    };
  }, [items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase]);
  
  return (
    <div
      // --- CRITICAL FIX 2: Responsive Height ---
      className="w-full h-[350px] md:h-[500px] overflow-hidden cursor-grab active:cursor-grabbing"
      ref={containerRef}
    />
  );
}