import React, { useState } from 'react';
import { useProducts } from '../contexts/ProductsContext.js';
import { Edit, Trash2, Tag, GripVertical, Plus } from 'lucide-react';
import { API_URL } from '../config';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import './ProductManagement.css';

const ProductManagement = () => {
  useAdminAuth();
  const { products, addProduct, updateProduct, deleteProduct, toggleSoldStatus } = useProducts();
  
  // Define available categories
  const categories = ['Dresses', 'Tops', 'Bottoms', 'Outerwear', 'Accessories', 'Shoes'];
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    image1: '',
    image2: '',
    image3: '',
    description: '',
    price: '',
    discountedPrice: '',
    sizes: '',
    stockQuantity: ''
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [draggedProduct, setDraggedProduct] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [dropPosition, setDropPosition] = useState(null); // 'top' or 'bottom'
  const [isDragEnabled, setIsDragEnabled] = useState(false);

  // Calculations for stats cards
  const totalPrice = products.reduce((sum, p) => sum + parseFloat(p.price), 0);
  const soldDressesPrice = products
    .filter(p => p.category.toLowerCase() === 'dresses' && p.sold)
    .reduce((sum, p) => sum + parseFloat(p.price), 0);
  const currentPrice = products
    .filter(p => !p.sold)
    .reduce((sum, p) => sum + parseFloat(p.price), 0);

  const handleDragStart = (e, product, index) => {
    if (!isDragEnabled) {
      e.preventDefault();
      return;
    }
    setDraggedProduct({ product, index });
    e.dataTransfer.effectAllowed = 'move';
    // Transparent ghost image or custom styling could be added here
    // e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    // Calculate if we are in the top or bottom half of the row
    const row = e.currentTarget;
    const rect = row.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const position = e.clientY < midY ? 'top' : 'bottom';
    
    setDragOverIndex(index);
    setDropPosition(position);
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    setDragOverIndex(null);
    setDropPosition(null);
    setIsDragEnabled(false);

    if (!draggedProduct || draggedProduct.index === dropIndex) {
      setDraggedProduct(null);
      return;
    }

    const reorderedProducts = [...products];
    const [movedProduct] = reorderedProducts.splice(draggedProduct.index, 1);
    
    // Adjust drop index based on position - SIMPLIFIED
    // We removed item at oldIndex.
    // If dropping at newIndex, effectively:
    // if dropping at same index, do nothing.
    // if dropping 'top' of index X, we want to insert at X.
    // if dropping 'bottom' of index X, we want to insert at X+1.
    
    let insertIndex = dropIndex;
    if (dropPosition === 'bottom') insertIndex++;
    
    // Since we removed the item primarily, indices shifted.
    // If original index < insertIndex, we need to decrement insertIndex by 1
    if (draggedProduct.index < insertIndex) insertIndex--;

    reorderedProducts.splice(insertIndex, 0, movedProduct);

    // Update positions
    const updatedProducts = reorderedProducts.map((p, idx) => ({
      id: p.id,
      position: idx + 1
    }));

    console.log('Reordering products:', updatedProducts);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/products/reorder`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ products: updatedProducts })
      });

      if (response.ok) {
        console.log('Reorder successful, reloading...');
        // Refresh products to get updated order
        window.location.reload();
      } else {
        const errorText = await response.text();
        console.error('Reorder failed:', response.status, errorText);
        alert(`Failed to reorder products: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error reordering products:', error);
      alert(`Error reordering products: ${error.message}`);
    }

    setDraggedProduct(null);
  };

  const handleDragEnd = () => {
    setDraggedProduct(null);
    setDragOverIndex(null);
    setDropPosition(null);
    setIsDragEnabled(false);
  };

  // Mobile touch handlers
  const handleTouchStart = (e, product, index) => {
    // Only allow drag if initiated via handle
    if (!isDragEnabled) return;
    
    e.preventDefault();
    setDraggedProduct({ product, index });
    
    // Add haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleTouchMove = (e) => {
    if (!draggedProduct) return;
    
    e.preventDefault(); // Prevent scrolling
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const row = element?.closest('tr[data-index]');
    
    if (row) {
      const index = parseInt(row.dataset.index);
      if (!isNaN(index)) {
         // Determine position like in desktop
         const rect = row.getBoundingClientRect();
         const midY = rect.top + rect.height / 2;
         const position = touch.clientY < midY ? 'top' : 'bottom';
         
         setDragOverIndex(index);
         setDropPosition(position);
      }
    }
  };

  const handleTouchEnd = async (e) => {
    e.preventDefault();
    
    if (!draggedProduct) return;
    
    // Logic similar to desktop drop
    // We reuse the last known dragOverIndex and dropPosition
    
    if (dragOverIndex === null || draggedProduct.index === dragOverIndex) {
        setDraggedProduct(null);
        setDragOverIndex(null);
        setDropPosition(null);
        setIsDragEnabled(false);
        return;
    }

    const reorderedProducts = [...products];
    const [movedProduct] = reorderedProducts.splice(draggedProduct.index, 1);
    
    let insertIndex = dragOverIndex;
    if (dropPosition === 'bottom') insertIndex++;
    if (draggedProduct.index < insertIndex) insertIndex--;
    
    reorderedProducts.splice(insertIndex, 0, movedProduct);

    // Update positions
    const updatedProducts = reorderedProducts.map((p, idx) => ({
      id: p.id,
      position: idx + 1
    }));

    console.log('Reordering products (touch):', updatedProducts);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/products/reorder`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ products: updatedProducts })
      });

      if (response.ok) {
        console.log('Reorder successful, reloading...');
        // Refresh products to get updated order
        window.location.reload();
      } else {
        const errorText = await response.text();
        console.error('Reorder failed:', response.status, errorText);
        alert(`Failed to reorder products: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error reordering products:', error);
      alert(`Error reordering products: ${error.message}`);
    }

    setDraggedProduct(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const imageUrls = [formData.image1, formData.image2, formData.image3]
      .map(url => url.trim())
      .filter(url => url !== '');

    const productData = {
      name: formData.name,
      category: formData.category,
      images: imageUrls,
      description: formData.description,
      price: formData.discountedPrice ? parseFloat(formData.discountedPrice) : parseFloat(formData.price),
      originalPrice: formData.discountedPrice ? parseFloat(formData.price) : null,
      sizes: formData.sizes.split(',').map(s => s.trim()),
      newArrival: true,
      stock_quantity: parseInt(formData.stockQuantity) || 0
    };

    const success = await addProduct(productData);
    if (success) {
      alert('Product added successfully!');
      setFormData({
        name: '',
        category: '',
        image1: '',
        image2: '',
        image3: '',
        description: '',
        price: '',
        discountedPrice: '',
        sizes: '',
        stockQuantity: ''
      });
      setShowAddForm(false);
    } else {
      alert('Failed to add product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      image1: product.images && product.images[0] ? product.images[0] : '',
      image2: product.images && product.images[1] ? product.images[1] : '',
      image3: product.images && product.images[2] ? product.images[2] : '',
      description: product.description,
      price: product.originalPrice ? product.originalPrice.toString() : product.price.toString(),
      discountedPrice: product.originalPrice ? product.price.toString() : '',
      sizes: product.sizes.join(', '),
      stockQuantity: product.stockQuantity ? product.stockQuantity.toString() : '0'
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const imageUrls = [formData.image1, formData.image2, formData.image3]
      .map(url => url.trim())
      .filter(url => url !== '');

    const productData = {
      name: formData.name,
      category: formData.category,
      images: imageUrls,
      description: formData.description,
      price: formData.discountedPrice ? parseFloat(formData.discountedPrice) : parseFloat(formData.price),
      originalPrice: formData.discountedPrice ? parseFloat(formData.price) : null,
      sizes: formData.sizes.split(',').map(s => s.trim()),
      stock_quantity: parseInt(formData.stockQuantity) || 0
    };

    const success = await updateProduct(editingProduct.id, productData);
    if (success) {
      alert('Product updated successfully!');
      setShowEditModal(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        category: '',
        image1: '',
        image2: '',
        image3: '',
        description: '',
        price: '',
        discountedPrice: '',
        sizes: '',
        stockQuantity: ''
      });
    } else {
      alert('Failed to update product');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const success = await deleteProduct(id);
      if (success) {
        alert('Product deleted successfully!');
      } else {
        alert('Failed to delete product');
      }
    }
  };

  const handleToggleSold = async (id) => {
    const success = await toggleSoldStatus(id);
    if (success) {
      alert('Product status updated!');
    } else {
      alert('Failed to update product status');
    }
  };

  const closeModal = () => {
    setShowEditModal(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      category: '',
      image1: '',
      image2: '',
      image3: '',
      description: '',
      price: '',
      discountedPrice: '',
      sizes: '',
      stockQuantity: ''
    });
  };

  return (
    <div className="admin-section product-management">
      <div className="management-stats">
        <div className="stat-card pink">
          <div className="stat-label">TOTAL PRICE</div>
          <div className="stat-value">₵{totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div className="stat-card red">
          <div className="stat-label">SOLD DRESSES PRICE</div>
          <div className="stat-value">₵{soldDressesPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">CURRENT PRICE</div>
          <div className="stat-value">₵{currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
      </div>

      <header className="content-header table-header">
        <h1>Product List ({products.length})</h1>
        <button className="btn btn-primary add-toggle" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={20} /> {showAddForm ? 'Cancel' : 'Add Product'}
        </button>
      </header>

      {showAddForm && (
        <div className="add-product-form-container">
          <h2>Add New Product</h2>
          <form onSubmit={handleSubmit} className="product-form compact-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Product Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select name="category" value={formData.category} onChange={handleChange} required>
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Price</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} step="0.01" required />
              </div>
              <div className="form-group">
                <label>Discounted Price (Optional)</label>
                <input type="number" name="discountedPrice" value={formData.discountedPrice} onChange={handleChange} step="0.01" />
              </div>
              <div className="form-group">
                <label>Stock Quantity</label>
                <input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange} required min="0" />
              </div>
              <div className="form-group">
                <label>Image URL 1</label>
                <input type="text" name="image1" value={formData.image1} onChange={handleChange} placeholder="Main Image URL" required />
              </div>
              <div className="form-group">
                <label>Image URL 2 (Optional)</label>
                <input type="text" name="image2" value={formData.image2} onChange={handleChange} placeholder="Second Image URL" />
              </div>
              <div className="form-group">
                <label>Image URL 3 (Optional)</label>
                <input type="text" name="image3" value={formData.image3} onChange={handleChange} placeholder="Third Image URL" />
              </div>
              <div className="form-group full-width">
                <label>Sizes (comma-separated)</label>
                <input type="text" name="sizes" value={formData.sizes} onChange={handleChange} placeholder="S, M, L, XL" required />
              </div>
              <div className="form-group full-width">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Save Product</button>
          </form>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th className="col-grip"></th>
              <th className="col-id">ID</th>
              <th className="col-image">Image</th>
              <th className="col-price">Price</th>
              <th className="col-sizes">Sizes</th>
              <th className="col-stock">Stock</th>
              <th className="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-msg">No products added yet.</td>
              </tr>
            ) : (
              products.map((product, index) => (
                <tr 
                  key={product.id}
                  data-index={index}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, product, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  onTouchStart={(e) => handleTouchStart(e, product, index)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className={`
                    ${product.sold ? 'row-sold' : ''}
                    ${draggedProduct?.index === index ? 'dragging' : ''}
                    ${dragOverIndex === index ? (dropPosition === 'top' ? 'drag-over-top' : 'drag-over-bottom') : ''}
                  `}
                >
                  <td 
                    className="drag-handle"
                    onMouseDown={() => setIsDragEnabled(true)}
                    onMouseUp={() => setIsDragEnabled(false)}
                    onTouchStart={() => setIsDragEnabled(true)}
                    onTouchEnd={() => setIsDragEnabled(false)}
                  >
                    <GripVertical size={18} className="grip-icon" />
                  </td>
                  <td className="col-id">{product.id}</td>
                  <td>
                    <div className="product-cell">
                      <div className="product-image-wrapper">
                        <img 
                          src={product.images && product.images[0] ? product.images[0] : ''} 
                          alt={product.name}
                          className="product-thumbnail"
                        />
                        {product.sold && <span className="table-sold-badge">SOLD</span>}
                        {product.images && product.images.length > 1 && (
                          <span className="image-count">+{product.images.length - 1}</span>
                        )}
                      </div>
                      <div className="product-info">
                        <div className="product-name">{product.name}</div>
                        <div className="product-category">{product.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="col-price">₵{parseFloat(product.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="col-sizes">{product.sizes.join(', ')}</td>
                  <td className="col-stock">{product.stockQuantity || 0}</td>
                  <td className="col-actions">
                    <div className="action-btn-group">
                      <button onClick={() => handleEdit(product)} className="action-btn edit" title="Edit">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleToggleSold(product.id)} className={`action-btn toggle ${product.sold ? 'active' : ''}`} title={product.sold ? 'Mark Available' : 'Mark Sold'}>
                        <Tag size={18} />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="action-btn delete" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal remains similar but styled */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Product</h2>
              <button onClick={closeModal} className="close-btn">&times;</button>
            </div>
            <form onSubmit={handleUpdate} className="product-form">
              <div className="form-group">
                <label>Product Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select name="category" value={formData.category} onChange={handleChange} required>
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Image URL 1</label>
                <input type="text" name="image1" value={formData.image1} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Image URL 2</label>
                <input type="text" name="image2" value={formData.image2} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Image URL 3</label>
                <input type="text" name="image3" value={formData.image3} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Price</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} step="0.01" required />
              </div>
              <div className="form-group">
                <label>Discounted Price (Optional)</label>
                <input type="number" name="discountedPrice" value={formData.discountedPrice} onChange={handleChange} step="0.01" />
              </div>
              <div className="form-group">
                <label>Sizes (comma-separated)</label>
                <input type="text" name="sizes" value={formData.sizes} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Stock Quantity</label>
                <input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange} required min="0" />
              </div>
              <div className="form-group full-width">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} required />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">Update</button>
                <button type="button" onClick={closeModal} className="btn btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
