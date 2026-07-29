/**
 * Helper utility to generate backend share URLs for products, blogs, services, and client stories.
 * WhatsApp and social crawlers hit these backend URLs to parse server-side Open Graph HTML tags
 * (og:image, og:title, og:description) and display rich media cards with pictures.
 */

const getBackendUrl = () => {
  let backendUrl = import.meta.env.VITE_NODE_URL || "";
  if (!backendUrl) {
    let origin = window.location.origin;
    if (origin.includes("localhost")) {
      backendUrl = "http://localhost:4000";
    } else {
      backendUrl = "https://giftofmemories.in";
    }
  }
  return backendUrl.replace(/\/+$/, "");
};

/**
 * Generates a share URL for products with Open Graph picture metadata
 */
export const getProductShareUrl = (product) => {
  if (!product) return "";
  const slug = product.slug || (
    product.name
      ? product.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-')
      : product._id
  );
  return `${getBackendUrl()}/api/shop/share-product/${slug}`;
};

/**
 * Generates a share URL for blog posts with Open Graph picture metadata
 */
export const getBlogShareUrl = (blog) => {
  if (!blog) return "";
  const identifier = blog.slug || blog._id;
  return `${getBackendUrl()}/api/blogs/share-blog/${identifier}`;
};

/**
 * Generates a share URL for services with Open Graph picture metadata
 */
export const getServiceShareUrl = (service) => {
  if (!service) return "";
  const identifier = service.slug || service._id;
  return `${getBackendUrl()}/api/services/share-service/${identifier}`;
};

/**
 * Generates a share URL for client gallery stories with Open Graph picture metadata
 */
export const getStoryShareUrl = (story) => {
  if (!story) return "";
  return `${getBackendUrl()}/api/client-gallery/share-story/${story._id}`;
};
