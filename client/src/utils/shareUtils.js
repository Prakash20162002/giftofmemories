/**
 * Generates clean, standard website URLs directly on main domain (https://giftofmemories.in)
 * without any 'api.' subdomain or extra share path segments.
 */

const MAIN_DOMAIN = "https://giftofmemories.in";

/**
 * Standard product URL:
 * e.g. https://giftofmemories.in/shop/product/gorgeous-hand-printed-pan-pata-for-wedding-rituals
 */
export const getProductShareUrl = (product) => {
  if (!product) return "";
  const slug = product.slug || (
    product.name
      ? product.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-')
      : product._id
  );
  return `${MAIN_DOMAIN}/shop/product/${slug}`;
};

/**
 * Standard blog post URL:
 * e.g. https://giftofmemories.in/blog/article-slug
 */
export const getBlogShareUrl = (blog) => {
  if (!blog) return "";
  const identifier = blog.slug || blog._id;
  return `${MAIN_DOMAIN}/blog/${identifier}`;
};

/**
 * Standard service URL:
 * e.g. https://giftofmemories.in/services/service-slug
 */
export const getServiceShareUrl = (service) => {
  if (!service) return "";
  const identifier = service.slug || service._id;
  return `${MAIN_DOMAIN}/services/${identifier}`;
};

/**
 * Standard client gallery story URL:
 * e.g. https://giftofmemories.in/stories/story-id
 */
export const getStoryShareUrl = (story) => {
  if (!story) return "";
  return `${MAIN_DOMAIN}/stories/${story._id}`;
};
