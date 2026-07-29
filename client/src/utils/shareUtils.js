/**
 * Amazon-style short share link generator on the main website domain (https://giftofmemories.in/d/...)
 * Generates clean URLs without any 'api.' subdomain or '/api/' path prefixes.
 */

const MAIN_DOMAIN = "https://giftofmemories.in";

/**
 * Amazon-style short product share URL:
 * e.g. https://giftofmemories.in/d/gorgeous-hand-printed-pan-pata-for-wedding-rituals
 */
export const getProductShareUrl = (product) => {
  if (!product) return "";
  const slug = product.slug || (
    product.name
      ? product.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-')
      : product._id
  );
  return `${MAIN_DOMAIN}/d/${slug}`;
};

/**
 * Amazon-style short blog share URL:
 * e.g. https://giftofmemories.in/b/article-slug
 */
export const getBlogShareUrl = (blog) => {
  if (!blog) return "";
  const identifier = blog.slug || blog._id;
  return `${MAIN_DOMAIN}/b/${identifier}`;
};

/**
 * Amazon-style short service share URL:
 * e.g. https://giftofmemories.in/s/service-slug
 */
export const getServiceShareUrl = (service) => {
  if (!service) return "";
  const identifier = service.slug || service._id;
  return `${MAIN_DOMAIN}/s/${identifier}`;
};

/**
 * Amazon-style short story share URL:
 * e.g. https://giftofmemories.in/g/story-id
 */
export const getStoryShareUrl = (story) => {
  if (!story) return "";
  return `${MAIN_DOMAIN}/g/${story._id}`;
};
