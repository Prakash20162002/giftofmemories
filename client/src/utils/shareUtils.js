/**
 * Generates clean share URLs directly on the main website domain (https://giftofmemories.in)
 * without any 'api.' subdomain or '/api/' path prefixes.
 * Format: https://giftofmemories.in/p/product-slug
 */

const MAIN_DOMAIN = "https://giftofmemories.in";

/**
 * Clean share URL for products:
 * e.g. https://giftofmemories.in/p/gorgeous-hand-printed-pan-pata-for-wedding-rituals
 */
export const getProductShareUrl = (product) => {
  if (!product) return "";
  const slug = product.slug || (
    product.name
      ? product.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-')
      : product._id
  );
  return `${MAIN_DOMAIN}/p/${slug}`;
};

/**
 * Clean share URL for blog posts:
 * e.g. https://giftofmemories.in/b/article-slug
 */
export const getBlogShareUrl = (blog) => {
  if (!blog) return "";
  const identifier = blog.slug || blog._id;
  return `${MAIN_DOMAIN}/b/${identifier}`;
};

/**
 * Clean share URL for services:
 * e.g. https://giftofmemories.in/s/service-slug
 */
export const getServiceShareUrl = (service) => {
  if (!service) return "";
  const identifier = service.slug || service._id;
  return `${MAIN_DOMAIN}/s/${identifier}`;
};

/**
 * Clean share URL for client gallery stories:
 * e.g. https://giftofmemories.in/g/story-id
 */
export const getStoryShareUrl = (story) => {
  if (!story) return "";
  return `${MAIN_DOMAIN}/g/${story._id}`;
};
