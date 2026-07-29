/**
 * Share URL Generator — Gift of Memories
 *
 * ARCHITECTURE DECISION:
 * giftofmemories.in is a static React SPA hosted on shared/static hosting.
 * Social media crawlers (WhatsApp, Facebook, etc.) do NOT execute JavaScript,
 * so they cannot render the SPA to read dynamic Open Graph metadata.
 *
 * The Express backend at api.giftofmemories.in correctly generates
 * server-side Open Graph HTML for all share endpoints. It is confirmed working.
 *
 * Therefore, all share links point to api.giftofmemories.in/d/{slug}.
 * When a HUMAN (not a crawler) clicks the link, Express immediately issues an
 * HTTP 302 redirect to the clean giftofmemories.in frontend page.
 *
 * Result for social platforms:
 *   Crawler hits api.giftofmemories.in/d/{slug}
 *   → Receives server-rendered HTML with og:image, og:title, og:description
 *   → Displays image preview card in WhatsApp, Facebook, LinkedIn, etc.
 *
 * Result for human users:
 *   Browser hits api.giftofmemories.in/d/{slug}
 *   → Express detects browser User-Agent, issues HTTP 302 to giftofmemories.in
 *   → Browser loads giftofmemories.in/shop/product/{slug} (clean URL, no api.)
 *   → User never sees api.giftofmemories.in in their browser address bar after redirect
 */

const API_BASE = "https://api.giftofmemories.in";

/**
 * Product share URL → api.giftofmemories.in/d/{slug}
 * Crawlers: Receive full Open Graph HTML with product image
 * Humans:   Redirected to giftofmemories.in/shop/product/{slug}
 */
export const getProductShareUrl = (product) => {
  if (!product) return "";
  const slug =
    product.slug ||
    (product.name
      ? product.name
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_-]+/g, "-")
      : product._id);
  return `${API_BASE}/d/${slug}`;
};

/**
 * Blog share URL → api.giftofmemories.in/d/b/{id}
 * Crawlers: Receive full Open Graph HTML with blog cover image
 * Humans:   Redirected to giftofmemories.in/blog/{id}
 */
export const getBlogShareUrl = (blog) => {
  if (!blog) return "";
  const identifier = blog.slug || blog._id;
  return `${API_BASE}/d/b/${identifier}`;
};

/**
 * Service share URL → api.giftofmemories.in/d/s/{id}
 * Crawlers: Receive full Open Graph HTML with service image
 * Humans:   Redirected to giftofmemories.in/services/{id}
 */
export const getServiceShareUrl = (service) => {
  if (!service) return "";
  const identifier = service.slug || service._id;
  return `${API_BASE}/d/s/${identifier}`;
};

/**
 * Wedding story share URL → api.giftofmemories.in/d/g/{id}
 * Crawlers: Receive full Open Graph HTML with gallery cover image
 * Humans:   Redirected to giftofmemories.in/stories/{id}
 */
export const getStoryShareUrl = (story) => {
  if (!story) return "";
  return `${API_BASE}/d/g/${story._id}`;
};
