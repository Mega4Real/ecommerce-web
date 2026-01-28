import './ProductSkeleton.css';

const ProductSkeleton = () => {
  return (
    <div className="product-skeleton-card">
      <div className="skeleton skeleton-image"></div>
      <div className="product-skeleton-info">
        <div className="skeleton skeleton-category"></div>
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-price"></div>
      </div>
    </div>
  );
};

export default ProductSkeleton;
