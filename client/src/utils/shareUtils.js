/**
 * Helper utility to generate clean share URLs on the main domain (https://giftofmemories.in)
 * without any 'api.' subdomain or '/api/' path prefixes.
 */

const getCleanDomain = () => {
  let origin = typeof window !== "undefined" ? window.location.origin : "https://giftofmemories.in";
  if (origin.includes("api.")) {
    origin = origin.replace("api.", "");
  }
  if (!origin || origin.includes("localhost")) {
    origin = "https://giftofmemories.in";
  }
  return origin.replace(/\/+$/, "");
};

/**
 * Generates a clean share URL for products:
 * Format: https://giftofmemories.in/shop/share-product/gorgeous-hand-printed-pan-pata-for-wedding-rituals
 */
export const getProductShareUrl = (product) => {
  if (!product) return "";
  const slug = product.slug || (
    product.name
      ? product.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-')
      : product._id
  );
  return `${getCleanDomain()}/shop/share-product/${slug}`;
};

/**
 * Generates a clean share URL for blog posts:
 * Format: https://giftofmemories.in/blog/share-blog/article-slug
 */
export const getBlogShareUrl = (blog) => {
  if (!blog) return "";
  const identifier = blog.slug || blog._id;
  return `${getCleanDomain()}/blog/share-blog/${identifier}`;
};

/**
 * Generates a clean share URL for services:
 * Format: https://giftofmemories.in/services/share-service/service-slug
 */
export const getServiceShareUrl = (service) => {
  if (!service) return "";
  const identifier = service.slug || service._id;
  return `${getCleanDomain()}/services/share-service/${identifier}`;
};

/**
 * Generates a clean share URL for client gallery stories:
 * Format: https://giftofmemories.in/stories/share-story/story-id
 */
export const getStoryShareUrl = (story) => {
  if (!story) return "";
  return `${getCleanDomain()}/stories/share-story/${story._id}`;
};
