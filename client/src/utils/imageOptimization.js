/**
 * Optimizes Cloudinary image URLs for faster loading
 * @param {string} url - The original Cloudinary image URL
 * @param {Object} options - Optimization options
 * @param {string} options.size - Size preset: 'thumbnail', 'medium', 'large', 'original'
 * @param {boolean} options.lazy - Whether this is for lazy loading
 * @returns {string} - Optimized Cloudinary URL
 */
export const optimizeCloudinaryImage = (url, options = {}) => {
  if (!url || !url.includes('cloudinary.com')) {
    return url; // Return original URL if not a Cloudinary URL
  }

  const { size = 'medium', lazy = false } = options;

  // Define size presets
  const sizePresets = {
    thumbnail: { width: 300, height: 300, crop: 'fill' },
    medium: { width: 600, height: 600, crop: 'fill' },
    large: { width: 1200, height: 1200, crop: 'fill' },
    original: {} // No transformation for original
  };

  const preset = sizePresets[size];
  if (!preset) {
    console.warn(`Unknown size preset: ${size}. Using 'medium'.`);
    return optimizeCloudinaryImage(url, { ...options, size: 'medium' });
  }

  // If original size, just add optimization parameters
  if (size === 'original') {
    return addOptimizationParams(url, lazy);
  }

  // Build transformation string
  const transformations = [];

  if (preset.width) transformations.push(`w_${preset.width}`);
  if (preset.height) transformations.push(`h_${preset.height}`);
  if (preset.crop) transformations.push(`c_${preset.crop}`);

  // Add quality and format optimization
  transformations.push('q_auto');
  transformations.push('f_auto');

  // Add progressive loading for larger images
  if (size === 'large') {
    transformations.push('fl_progressive');
  }

  // Insert transformations into the URL
  const transformationString = transformations.join(',');
  const optimizedUrl = url.replace('/upload/', `/upload/${transformationString}/`);

  return lazy ? addLazyParams(optimizedUrl) : optimizedUrl;
};

/**
 * Adds optimization parameters to Cloudinary URL
 */
const addOptimizationParams = (url, lazy = false) => {
  let optimizedUrl = url.replace('/upload/', '/upload/q_auto,f_auto/');

  if (lazy) {
    optimizedUrl = addLazyParams(optimizedUrl);
  }

  return optimizedUrl;
};

/**
 * Adds lazy loading parameters to Cloudinary URL
 */
const addLazyParams = (url) => {
  // Add blur placeholder and lazy loading
  return url.replace('/upload/', '/upload/e_blur:1000,q_1,f_auto/');
};

/**
 * Gets optimized image URLs for different use cases
 * @param {string[]} images - Array of image URLs
 * @returns {Object} - Object with optimized URLs for different contexts
 */
export const getOptimizedImages = (images) => {
  if (!Array.isArray(images)) return {};

  return {
    thumbnail: images.map(img => optimizeCloudinaryImage(img, { size: 'thumbnail' })),
    medium: images.map(img => optimizeCloudinaryImage(img, { size: 'medium' })),
    large: images.map(img => optimizeCloudinaryImage(img, { size: 'large' })),
    original: images.map(img => optimizeCloudinaryImage(img, { size: 'original' })),
    lazy: images.map(img => optimizeCloudinaryImage(img, { size: 'medium', lazy: true }))
  };
};

/**
 * Preloads critical images
 * @param {string[]} imageUrls - Array of image URLs to preload
 */
export const preloadImages = (imageUrls) => {
  if (!Array.isArray(imageUrls)) return;

  imageUrls.forEach(url => {
    const img = new Image();
    img.src = url;
  });
};

/**
 * Generates responsive image sources for <picture> element
 * @param {string} url - Original Cloudinary URL
 * @returns {Object} - Object with srcSet and sizes for responsive images
 */
export const getResponsiveImageSources = (url) => {
  if (!url || !url.includes('cloudinary.com')) {
    return { src: url, srcSet: '', sizes: '' };
  }

  const baseUrl = url.replace('/upload/', '/upload/');

  // Generate different sizes
  const sizes = [
    { width: 480, descriptor: '480w' },
    { width: 768, descriptor: '768w' },
    { width: 1024, descriptor: '1024w' },
    { width: 1200, descriptor: '1200w' }
  ];

  const srcSet = sizes.map(size => {
    const transformedUrl = baseUrl.replace('/upload/', `/upload/w_${size.width},c_fill,q_auto,f_auto/`);
    return `${transformedUrl} ${size.descriptor}`;
  }).join(', ');

  const sizesAttr = '(max-width: 480px) 480px, (max-width: 768px) 768px, (max-width: 1024px) 1024px, 1200px';

  return {
    src: optimizeCloudinaryImage(url, { size: 'medium' }),
    srcSet,
    sizes: sizesAttr
  };
};
