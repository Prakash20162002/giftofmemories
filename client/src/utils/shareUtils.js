/**
 * Share URL Generator — Gift of Memories
 *
 * All share links use the short brand subdomain https://gm.giftofmemories.in/d/{slug}
 * (or fallback https://api.giftofmemories.in/d/{slug})
 *
 * Crawlers (WhatsApp, Facebook, LinkedIn, Twitter, Discord, Telegram):
 * Receive full server-rendered Open Graph HTML with the 1200x630 Cloudinary product image card.
 *
 * Humans:
 * Express detects human browser User-Agent and issues an instant HTTP 302 redirect
 * to the clean page on https://giftofmemories.in/shop/product/{slug}.
 */

const API_BASE = "https://gm.giftofmemories.in";

/**
 * Safely converts any text/name/slug into a clean, URL-safe slug with ZERO spaces.
 * e.g. "Kolka Art Pan Pata For Subho Dristy" -> "kolka-art-pan-pata-for-subho-dristy"
 */
const safeSlugify = (input) => {
  if (!input) return "";
  return input
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-")  // Replace spaces and underscores with single hyphen
    .replace(/^-+|-+$/g, "");   // Remove leading/trailing hyphens
};

/**
 * Product share URL → https://gm.giftofmemories.in/d/{slug}
 */
export const getProductShareUrl = (product) => {
  if (!product) return "";
  
  // 1. Try slug field first (slugified)
  let cleanSlug = safeSlugify(product.slug);
  
  // 2. Fall back to name field (slugified)
  if (!cleanSlug) {
    cleanSlug = safeSlugify(product.name);
  }
  
  // 3. Fall back to _id if no name/slug available
  if (!cleanSlug) {
    cleanSlug = product._id ? product._id.toString() : "";
  }
  
  return `${API_BASE}/d/${cleanSlug}`;
};

/**
 * Blog share URL → https://gm.giftofmemories.in/d/b/{id}
 */
export const getBlogShareUrl = (blog) => {
  if (!blog) return "";
  const cleanSlug = safeSlugify(blog.slug) || blog._id;
  return `${API_BASE}/d/b/${cleanSlug}`;
};

/**
 * Service share URL → https://gm.giftofmemories.in/d/s/{id}
 */
export const getServiceShareUrl = (service) => {
  if (!service) return "";
  const cleanSlug = safeSlugify(service.slug) || service._id;
  return `${API_BASE}/d/s/${cleanSlug}`;
};

/**
 * Wedding story share URL → https://gm.giftofmemories.in/d/g/{id}
 */
export const getStoryShareUrl = (story) => {
  if (!story) return "";
  return `${API_BASE}/d/g/${story._id}`;
};
