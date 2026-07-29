/**
 * Helper utility to generate clean share URLs on the backend API server (api.giftofmemories.in)
 * which serves dynamic Open Graph HTML metadata (og:image) for WhatsApp picture link previews.
 */

const getApiShareBaseUrl = () => {
  let backendUrl = import.meta.env.VITE_NODE_URL || "";
  if (!backendUrl || backendUrl.includes("localhost")) {
    backendUrl = typeof window !== "undefined" && window.location.origin.includes("localhost")
      ? "http://localhost:4000"
      : "https://api.giftofmemories.in";
  }
  return backendUrl.replace(/\/+$/, "");
};

/**
 * Short clean share URL for products:
 * e.g. https://api.giftofmemories.in/p/gorgeous-hand-printed-pan-pata-for-wedding-rituals
 */
export const getProductShareUrl = (product) => {
  if (!product) return "";
  const slug = product.slug || (
    product.name
      ? product.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-')
      : product._id
  );
  return `${getApiShareBaseUrl()}/p/${slug}`;
};

/**
 * Short clean share URL for blog posts:
 * e.g. https://api.giftofmemories.in/b/article-slug
 */
export const getBlogShareUrl = (blog) => {
  if (!blog) return "";
  const identifier = blog.slug || blog._id;
  return `${getApiShareBaseUrl()}/b/${identifier}`;
};

/**
 * Short clean share URL for services:
 * e.g. https://api.giftofmemories.in/s/service-slug
 */
export const getServiceShareUrl = (service) => {
  if (!service) return "";
  const identifier = service.slug || service._id;
  return `${getApiShareBaseUrl()}/s/${identifier}`;
};

/**
 * Short clean share URL for client gallery stories:
 * e.g. https://api.giftofmemories.in/g/story-id
 */
export const getStoryShareUrl = (story) => {
  if (!story) return "";
  return `${getApiShareBaseUrl()}/g/${story._id}`;
};
