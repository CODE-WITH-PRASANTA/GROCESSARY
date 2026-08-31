// MyWishlist.jsx
import React, { useState } from 'react';
import { 
  FaHeart, 
  FaShoppingCart, 
  FaShareAlt, 
  FaTrashAlt, 
  FaChevronDown, 
  FaShoppingBag 
} from 'react-icons/fa';
import './MyWishlist.css';

const MyWishlist = () => {
  // Initial sample data matching reference image exactly
  const initialItems = [
    {
      id: 1,
      name: 'Daawat Rozana Basmati Rice 5kg',
      weight: '5 kg',
      description: 'Premium quality basmati rice',
      addedDate: '24 May 2026',
      timestamp: new Date('2026-05-24').getTime(),
      price: 649,
      unitPrice: '₹129.80/kg',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 2,
      name: 'Fortune Sunlite Refined Sunflower Oil 1L',
      weight: '1 L',
      description: 'Light and healthy cooking oil',
      addedDate: '24 May 2026',
      timestamp: new Date('2026-05-24').getTime(),
      price: 139,
      unitPrice: '₹139/L',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 3,
      name: 'Tata Salt Vacuum Iodized Salt 1kg',
      weight: '1 kg',
      description: 'Iodized salt for daily use',
      addedDate: '24 May 2026',
      timestamp: new Date('2026-05-24').getTime(),
      price: 20,
      unitPrice: '₹20/kg',
      image: 'https://images.unsplash.com/photo-1518110165400-8451733ab412?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 4,
      name: 'Aashirvaad Atta Whole Wheat 5kg',
      weight: '5 kg',
      description: '100% whole wheat atta',
      addedDate: '23 May 2026',
      timestamp: new Date('2026-05-23').getTime(),
      price: 299,
      unitPrice: '₹59.80/kg',
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 5,
      name: 'Nescafe Classic Coffee 100g',
      weight: '100 g',
      description: 'Rich aroma and strong taste',
      addedDate: '23 May 2026',
      timestamp: new Date('2026-05-23').getTime(),
      price: 175,
      unitPrice: '₹175/100g',
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=150&auto=format&fit=crop&q=80'
    }
  ];

  const [wishlistItems, setWishlistItems] = useState(initialItems);
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortOption, setSortOption] = useState('Recently Added');

  // Select All functionality
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(wishlistItems.map((item) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Individual item select toggle
  const handleSelectItem = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((itemId) => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Delete individual item
  const handleDeleteItem = (id) => {
    const updated = wishlistItems.filter((item) => item.id !== id);
    setWishlistItems(updated);
    setSelectedIds(selectedIds.filter((itemId) => itemId !== id));
  };

  // Clear all items or selected items
  const handleClearAll = () => {
    if (wishlistItems.length === 0) return;
    if (window.confirm('Are you sure you want to clear your wishlist?')) {
      setWishlistItems([]);
      setSelectedIds([]);
    }
  };

  // Move selected items to Cart
  const handleMoveToCart = () => {
    if (selectedIds.length === 0) {
      alert('Please select items to move to cart!');
      return;
    }
    alert(`${selectedIds.length} item(s) moved to cart successfully!`);
    const remaining = wishlistItems.filter((item) => !selectedIds.includes(item.id));
    setWishlistItems(remaining);
    setSelectedIds([]);
  };

  // Add single item to cart
  const handleAddToCart = (item) => {
    alert(`"${item.name}" added to cart!`);
  };

  // Share Wishlist
  const handleShareWishlist = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Wishlist',
        text: 'Check out my saved items on Wishlist!',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Wishlist link copied to clipboard!');
    }
  };

  // Sorting functionality
  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortOption(value);
    let sorted = [...wishlistItems];

    if (value === 'Recently Added') {
      sorted.sort((a, b) => b.timestamp - a.timestamp);
    } else if (value === 'Price: Low to High') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (value === 'Price: High to Low') {
      sorted.sort((a, b) => b.price - a.price);
    } else if (value === 'Name: A-Z') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }

    setWishlistItems(sorted);
  };

  const isAllSelected = wishlistItems.length > 0 && selectedIds.length === wishlistItems.length;

  return (
    <div className="MyWishlist-container">
      {/* Top Header */}
      <div className="MyWishlist-header">
        <div className="MyWishlist-header-left">
          <FaHeart className="MyWishlist-heart-icon" />
          <div className="MyWishlist-title-group">
            <h2>My Wishlist</h2>
            <p>{wishlistItems.length} items saved for later</p>
          </div>
        </div>

        <div className="MyWishlist-sort-wrapper">
          <label htmlFor="wishlist-sort">Sort by:</label>
          <div className="MyWishlist-select-box">
            <select id="wishlist-sort" value={sortOption} onChange={handleSortChange}>
              <option value="Recently Added">Recently Added</option>
              <option value="Price: Low to High">Price: Low to High</option>
              <option value="Price: High to Low">Price: High to Low</option>
              <option value="Name: A-Z">Name: A-Z</option>
            </select>
            <FaChevronDown className="MyWishlist-dropdown-icon" />
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="MyWishlist-toolbar">
        <label className="MyWishlist-checkbox-label">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={handleSelectAll}
            disabled={wishlistItems.length === 0}
          />
          <span className="MyWishlist-select-text">Select All ({wishlistItems.length})</span>
        </label>

        <div className="MyWishlist-action-btns">
          <button className="MyWishlist-btn move-cart" onClick={handleMoveToCart}>
            <FaShoppingCart /> Move to Cart
          </button>
          <button className="MyWishlist-btn share-wishlist" onClick={handleShareWishlist}>
            <FaShareAlt /> Share Wishlist
          </button>
          <button className="MyWishlist-btn clear-all" onClick={handleClearAll}>
            <FaTrashAlt /> Clear All
          </button>
        </div>
      </div>

      {/* Items List */}
      <div className="MyWishlist-list">
        {wishlistItems.length > 0 ? (
          wishlistItems.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <div key={item.id} className={`MyWishlist-card ${isSelected ? 'selected' : ''}`}>
                <div className="MyWishlist-card-left">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectItem(item.id)}
                    className="MyWishlist-item-checkbox"
                  />
                  <div className="MyWishlist-image-container">
                    <img src={item.image} alt={item.name} className="MyWishlist-item-img" />
                  </div>
                  <div className="MyWishlist-item-info">
                    <h3 className="MyWishlist-item-name">{item.name}</h3>
                    <span className="MyWishlist-weight-badge">{item.weight}</span>
                    <p className="MyWishlist-item-desc">{item.description}</p>
                    <span className="MyWishlist-added-date">Added on {item.addedDate}</span>
                  </div>
                </div>

                <div className="MyWishlist-card-right">
                  <button
                    className="MyWishlist-delete-btn"
                    onClick={() => handleDeleteItem(item.id)}
                    title="Remove item"
                  >
                    <FaTrashAlt />
                  </button>
                  <div className="MyWishlist-price-group">
                    <span className="MyWishlist-price">₹{item.price}</span>
                    <span className="MyWishlist-unit-price">{item.unitPrice}</span>
                  </div>
                  <button className="MyWishlist-add-cart-btn" onClick={() => handleAddToCart(item)}>
                    <FaShoppingCart /> Add to Cart
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="MyWishlist-empty">
            <p>Your wishlist is empty!</p>
          </div>
        )}
      </div>

      {/* Bottom Promotion Banner */}
      <div className="MyWishlist-promo-banner">
        <div className="MyWishlist-promo-content">
          <div className="MyWishlist-promo-icon-bg">
            <FaShoppingBag className="MyWishlist-promo-icon" />
          </div>
          <div className="MyWishlist-promo-text">
            <h3>Can't find something?</h3>
            <p>Explore our store and discover more amazing products.</p>
          </div>
        </div>
        <button className="MyWishlist-shop-now-btn" onClick={() => alert('Redirecting to Store!')}>
          Shop Now
        </button>
      </div>
    </div>
  );
};

export default MyWishlist;