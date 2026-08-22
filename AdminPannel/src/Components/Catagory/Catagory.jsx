import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  FiGrid,
  FiList,
  FiFilter,
  FiSearch,
  FiPlus,
  FiUpload,
  FiEdit,
  FiTrash2,
  FiHeart,
  FiStar,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiShoppingBag
} from "react-icons/fi";
import "./Catagory.css";

const API_BASE_URL = "http://localhost:5000/api";

const initialCategories = [
  { _id: "all", name: "All Categories", icon: "▦" },
  { _id: "cat_1", name: "Fruits & Vegetables", icon: "🍎" },
  { _id: "cat_2", name: "Beverages", icon: "🥤" },
  { _id: "cat_3", name: "Snacks & Munchies", icon: "🍪" },
  { _id: "cat_4", name: "Grocery & Staples", icon: "🛍" },
  { _id: "cat_5", name: "Dairy & Bakery", icon: "🥛" },
  { _id: "cat_6", name: "Personal Care", icon: "🧴" },
  { _id: "cat_7", name: "Home Care", icon: "🏠" },
  { _id: "cat_8", name: "Baby Care", icon: "👶" },
  { _id: "cat_9", name: "Pet Care", icon: "🐾" }
];

const initialProducts = [
  {
    _id: "p1",
    name: "Fresh Banana",
    category: "cat_1",
    brand: "Local Farm",
    rating: 4.5,
    reviews: 120,
    quantity: "1 kg",
    sellingPrice: 40.0,
    originalPrice: 46.5,
    discount: 14,
    stock: 25,
    inStock: true,
    image: ""
  },
  {
    _id: "p2",
    name: "Red Apple",
    category: "cat_1",
    brand: "Himalayan",
    rating: 4.6,
    reviews: 98,
    quantity: "500 g",
    sellingPrice: 120.0,
    originalPrice: 140.0,
    discount: 14,
    stock: 18,
    inStock: true,
    image: ""
  },
  {
    _id: "p3",
    name: "Sweet Orange",
    category: "cat_1",
    brand: "Nagpur Fresh",
    rating: 4.4,
    reviews: 76,
    quantity: "1 kg",
    sellingPrice: 60.0,
    originalPrice: 80.0,
    discount: 25,
    stock: 30,
    inStock: true,
    image: ""
  },
  {
    _id: "p4",
    name: "Potato",
    category: "cat_1",
    brand: "Local Farm",
    rating: 4.3,
    reviews: 110,
    quantity: "1 kg",
    sellingPrice: 25.0,
    originalPrice: 25.0,
    discount: 0,
    stock: 50,
    inStock: true,
    image: ""
  },
  {
    _id: "p5",
    name: "Fresh Tomato",
    category: "cat_1",
    brand: "Local Farm",
    rating: 4.4,
    reviews: 130,
    quantity: "1 kg",
    sellingPrice: 30.0,
    originalPrice: 40.0,
    discount: 25,
    stock: 40,
    inStock: true,
    image: ""
  },
  {
    _id: "p6",
    name: "Cucumber",
    category: "cat_1",
    brand: "Local Farm",
    rating: 4.2,
    reviews: 60,
    quantity: "1 kg",
    sellingPrice: 28.0,
    originalPrice: 28.0,
    discount: 0,
    stock: 15,
    inStock: true,
    image: ""
  },
  {
    _id: "p7",
    name: "Fresh Carrot",
    category: "cat_1",
    brand: "Local Farm",
    rating: 4.5,
    reviews: 89,
    quantity: "1 kg",
    sellingPrice: 35.0,
    originalPrice: 45.0,
    discount: 22,
    stock: 22,
    inStock: true,
    image: ""
  },
  {
    _id: "p8",
    name: "Capsicum Green",
    category: "cat_1",
    brand: "Local Farm",
    rating: 4.3,
    reviews: 70,
    quantity: "500 g",
    sellingPrice: 45.0,
    originalPrice: 45.0,
    discount: 0,
    stock: 12,
    inStock: true,
    image: ""
  },
  {
    _id: "p9",
    name: "Cauliflower",
    category: "cat_1",
    brand: "Local Farm",
    rating: 4.1,
    reviews: 55,
    quantity: "1 pc",
    sellingPrice: 40.0,
    originalPrice: 40.0,
    discount: 0,
    stock: 14,
    inStock: true,
    image: ""
  },
  {
    _id: "p10",
    name: "Pomegranate",
    category: "cat_1",
    brand: "Bhagwa Farms",
    rating: 4.6,
    reviews: 65,
    quantity: "1 kg",
    sellingPrice: 160.0,
    originalPrice: 200.0,
    discount: 20,
    stock: 10,
    inStock: true,
    image: ""
  }
];

const Catagory = () => {
  // State
  const [categories, setCategories] = useState(initialCategories);
  const [products, setProducts] = useState(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState("cat_1");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  // Modals state
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form states
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("📦");
  const [productForm, setProductForm] = useState({
    name: "",
    category: "cat_1",
    brand: "",
    quantity: "",
    sellingPrice: "",
    originalPrice: "",
    discount: 0,
    stock: 10,
    image: ""
  });

  // Fetch from backend (fallback to initial if backend is offline)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await axios.get(`${API_BASE_URL}/categories`);
        if (catRes.data && catRes.data.length > 0) {
          setCategories([{ _id: "all", name: "All Categories", icon: "▦" }, ...catRes.data]);
        }
      } catch (err) {
        console.warn("Backend categories unavailable, using local mock data.");
      }

      try {
        const prodRes = await axios.get(`${API_BASE_URL}/products`);
        if (prodRes.data && prodRes.data.length > 0) {
          setProducts(prodRes.data);
        }
      } catch (err) {
        console.warn("Backend products unavailable, using local mock data.");
      }
    };
    fetchData();
  }, []);

  // Category counts calculation
  const getCategoryCount = (catId) => {
    if (catId === "all") return products.length;
    return products.filter(
      (p) => p.category === catId || p.category?._id === catId
    ).length;
  };

  // Card Image Upload Handler
  const handleCardImageUpload = async (productId, file) => {
    if (!file) return;

    // Instant local preview
    const localPreview = URL.createObjectURL(file);
    setProducts((prev) =>
      prev.map((item) =>
        item._id === productId ? { ...item, image: localPreview } : item
      )
    );

    // Upload to Backend
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await axios.patch(
        `${API_BASE_URL}/products/${productId}/image`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (res.data?.image) {
        setProducts((prev) =>
          prev.map((item) =>
            item._id === productId ? { ...item, image: res.data.image } : item
          )
        );
      }
    } catch (error) {
      console.warn("Backend upload failed, kept local preview:", error.message);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`${API_BASE_URL}/products/${id}`);
      } catch (err) {
        console.warn("Backend delete not reachable, deleting locally.");
      }
      setProducts((prev) => prev.filter((p) => p._id !== id));
    }
  };

  // Open Edit Product Modal
  const handleOpenEdit = (prod, e) => {
    e.stopPropagation();
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      category: prod.category?._id || prod.category,
      brand: prod.brand || "",
      quantity: prod.quantity || "",
      sellingPrice: prod.sellingPrice || "",
      originalPrice: prod.originalPrice || "",
      discount: prod.discount || 0,
      stock: prod.stock || 0,
      image: prod.image || ""
    });
    setShowProductModal(true);
  };

  // Save Product (Add / Edit)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const payload = {
      ...productForm,
      sellingPrice: Number(productForm.sellingPrice),
      originalPrice: Number(productForm.originalPrice || productForm.sellingPrice),
      discount: Number(productForm.discount),
      stock: Number(productForm.stock),
      inStock: Number(productForm.stock) > 0,
      rating: editingProduct ? editingProduct.rating : 5.0,
      reviews: editingProduct ? editingProduct.reviews : 1
    };

    if (editingProduct) {
      try {
        await axios.put(`${API_BASE_URL}/products/${editingProduct._id}`, payload);
      } catch (err) {
        console.warn("Backend update failed, updating locally.");
      }
      setProducts((prev) =>
        prev.map((p) => (p._id === editingProduct._id ? { ...p, ...payload } : p))
      );
    } else {
      const newId = `p_${Date.now()}`;
      try {
        const res = await axios.post(`${API_BASE_URL}/products`, payload);
        setProducts((prev) => [res.data, ...prev]);
      } catch (err) {
        setProducts((prev) => [{ ...payload, _id: newId }, ...prev]);
      }
    }
    setShowProductModal(false);
    setEditingProduct(null);
  };

  // Add Category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCat = {
      _id: `cat_${Date.now()}`,
      name: newCatName.trim(),
      icon: newCatIcon || "📦"
    };

    try {
      const res = await axios.post(`${API_BASE_URL}/categories`, newCat);
      setCategories((prev) => [...prev, res.data]);
    } catch (err) {
      setCategories((prev) => [...prev, newCat]);
    }

    setNewCatName("");
    setShowCategoryModal(false);
  };

  // Filter & Search Logic
  const filteredProducts = products.filter((p) => {
    const pCat = p.category?._id || p.category;
    const matchesCat = selectedCategory === "all" || pCat === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") return a.sellingPrice - b.sellingPrice;
    if (sortBy === "price-high") return b.sellingPrice - a.sellingPrice;
    if (sortBy === "rating") return b.rating - a.rating;
    return 0; // Default / Popular
  });

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage) || 1;
  const startIndex = (currentPage - 1) * productsPerPage;
  const displayedProducts = sortedProducts.slice(
    startIndex,
    startIndex + productsPerPage
  );

  const activeCategoryObj = categories.find((c) => c._id === selectedCategory);
  const activeCategoryName =
    selectedCategory === "all"
      ? "All Products"
      : activeCategoryObj?.name || "Products";

  return (
    <div className="catagory">
      {/* Header */}
      <div className="catagory-header">
        <div className="catagory-headerLeft">
          <h1 className="catagory-title">Categories & Products</h1>
          <div className="catagory-breadcrumb">
            <span>Home</span> &gt; <span className="catagory-activeCrumb">Categories & Products</span>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="catagory-layout">
        {/* Left Category Sidebar */}
        <aside className="catagory-sidebar">
          <div className="catagory-sidebarHeader">
            <h3 className="catagory-sidebarTitle">Categories</h3>
            <button
              type="button"
              className="catagory-btnAddCategory"
              onClick={() => setShowCategoryModal(true)}
            >
              <FiPlus /> Add Category
            </button>
          </div>

          <div className="catagory-list">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat._id;
              const count = getCategoryCount(cat._id);
              return (
                <button
                  key={cat._id}
                  type="button"
                  className={`catagory-item ${isSelected ? "selected" : ""}`}
                  onClick={() => {
                    setSelectedCategory(cat._id);
                    setCurrentPage(1);
                  }}
                >
                  <div className="catagory-itemContent">
                    <span className="catagory-itemIcon">{cat.icon}</span>
                    <span className="catagory-itemName">{cat.name}</span>
                  </div>
                  <span className="catagory-itemCount">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Bottom Total Categories Card */}
          <div className="catagory-totalBox">
            <div className="catagory-totalText">
              <span>Total Categories</span>
              <h2>{categories.length - 1}</h2>
            </div>
            <div className="catagory-totalIcon">
              <FiShoppingBag />
            </div>
          </div>
        </aside>

        {/* Right Main Product Section */}
        <main className="catagory-main">
          {/* Action Toolbar */}
          <div className="catagory-toolbar">
            <div className="catagory-toolbarLeft">
              <h2 className="catagory-toolbarTitle">
                Products ({activeCategoryName})
              </h2>
              <span className="catagory-toolbarCount">
                {filteredProducts.length} Products
              </span>
            </div>

            <div className="catagory-toolbarRight">
              {/* Search Bar */}
              <div className="catagory-searchWrapper">
                <FiSearch className="catagory-searchIcon" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="catagory-searchInput"
                />
              </div>

              {/* Sort Dropdown */}
              <div className="catagory-selectWrapper">
                <label>Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="catagory-sortSelect"
                >
                  <option value="popular">Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>

              {/* Add Product Button */}
              <button
                type="button"
                className="catagory-btnAddProduct"
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({
                    name: "",
                    category: selectedCategory === "all" ? "cat_1" : selectedCategory,
                    brand: "",
                    quantity: "",
                    sellingPrice: "",
                    originalPrice: "",
                    discount: 0,
                    stock: 10,
                    image: ""
                  });
                  setShowProductModal(true);
                }}
              >
                <FiPlus /> Add Product
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="catagory-productsGrid">
            {displayedProducts.map((prod) => (
              <ProductCardItem
                key={prod._id}
                product={prod}
                onImageUpload={handleCardImageUpload}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteProduct}
              />
            ))}
          </div>

          {displayedProducts.length === 0 && (
            <div className="catagory-emptyState">
              <p>No products found for this category or search query.</p>
            </div>
          )}

          {/* Pagination Footer */}
          <div className="catagory-pagination">
            <span className="catagory-paginationInfo">
              Showing {displayedProducts.length > 0 ? startIndex + 1 : 0} to{" "}
              {Math.min(startIndex + productsPerPage, filteredProducts.length)} of{" "}
              {filteredProducts.length} products
            </span>

            <div className="catagory-pageControls">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="catagory-pageNav"
              >
                <FiChevronLeft />
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  type="button"
                  className={`catagory-pageNumber ${
                    currentPage === i + 1 ? "active" : ""
                  }`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="catagory-pageNav"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Modal 1: Add/Edit Product */}
      {showProductModal && (
        <div className="catagory-modalOverlay">
          <div className="catagory-modal">
            <div className="catagory-modalHeader">
              <h3>{editingProduct ? "Edit Product" : "Add New Product"}</h3>
              <button
                type="button"
                className="catagory-modalClose"
                onClick={() => setShowProductModal(false)}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="catagory-modalForm">
              <div className="catagory-formGroup">
                <label>Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fresh Banana"
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm({ ...productForm, name: e.target.value })
                  }
                />
              </div>

              <div className="catagory-formRow">
                <div className="catagory-formGroup">
                  <label>Category *</label>
                  <select
                    value={productForm.category}
                    onChange={(e) =>
                      setProductForm({ ...productForm, category: e.target.value })
                    }
                  >
                    {categories
                      .filter((c) => c._id !== "all")
                      .map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="catagory-formGroup">
                  <label>Brand</label>
                  <input
                    type="text"
                    placeholder="e.g. Local Farm"
                    value={productForm.brand}
                    onChange={(e) =>
                      setProductForm({ ...productForm, brand: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="catagory-formRow">
                <div className="catagory-formGroup">
                  <label>Quantity / Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. 1 kg / 500 g"
                    value={productForm.quantity}
                    onChange={(e) =>
                      setProductForm({ ...productForm, quantity: e.target.value })
                    }
                  />
                </div>
                <div className="catagory-formGroup">
                  <label>Stock</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) =>
                      setProductForm({ ...productForm, stock: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="catagory-formRow">
                <div className="catagory-formGroup">
                  <label>Selling Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.sellingPrice}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        sellingPrice: e.target.value
                      })
                    }
                  />
                </div>
                <div className="catagory-formGroup">
                  <label>Original Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.originalPrice}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        originalPrice: e.target.value
                      })
                    }
                  />
                </div>
                <div className="catagory-formGroup">
                  <label>Discount (%)</label>
                  <input
                    type="number"
                    value={productForm.discount}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        discount: e.target.value
                      })
                    }
                  />
                </div>
              </div>

              <div className="catagory-modalActions">
                <button
                  type="button"
                  className="catagory-btnCancel"
                  onClick={() => setShowProductModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="catagory-btnSubmit">
                  {editingProduct ? "Update Product" : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add Category */}
      {showCategoryModal && (
        <div className="catagory-modalOverlay">
          <div className="catagory-modal catagory-smallModal">
            <div className="catagory-modalHeader">
              <h3>Add New Category</h3>
              <button
                type="button"
                className="catagory-modalClose"
                onClick={() => setShowCategoryModal(false)}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="catagory-modalForm">
              <div className="catagory-formGroup">
                <label>Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Frozen Food"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                />
              </div>

              <div className="catagory-formGroup">
                <label>Icon / Emoji</label>
                <input
                  type="text"
                  placeholder="e.g. 🥦 or 📦"
                  value={newCatIcon}
                  onChange={(e) => setNewCatIcon(e.target.value)}
                />
              </div>

              <div className="catagory-modalActions">
                <button
                  type="button"
                  className="catagory-btnCancel"
                  onClick={() => setShowCategoryModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="catagory-btnSubmit">
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* Individual Product Card Subcomponent */
const ProductCardItem = ({ product, onImageUpload, onEdit, onDelete }) => {
  const fileInputRef = useRef(null);

  const handleBoxClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onImageUpload(product._id, file);
    }
  };

  return (
    <div className="catagory-card">
      {/* Top Tag & Heart */}
      <div className="catagory-cardHeader">
        <span
          className={`catagory-stockBadge ${
            product.inStock ? "inStock" : "outStock"
          }`}
        >
          {product.inStock ? "In Stock" : "Out of Stock"}
        </span>
        <button type="button" className="catagory-wishlistBtn">
          <FiHeart />
        </button>
      </div>

      {/* Upload/Image Box */}
      <div
        className="catagory-cardImageBox"
        onClick={handleBoxClick}
        title="Click to upload or change image"
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          ref={fileInputRef}
          onChange={handleFileChange}
          hidden
        />

        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="catagory-cardImg"
          />
        ) : (
          <div className="catagory-emptyImage">
            <FiUpload className="catagory-uploadIcon" />
            <span>Upload Image</span>
          </div>
        )}
      </div>

      {/* Card Info */}
      <div className="catagory-cardInfo">
        <h4 className="catagory-cardName">{product.name}</h4>

        <div className="catagory-ratingRow">
          <span className="catagory-ratingStar">
            <FiStar /> {product.rating || 5.0}
          </span>
          <span className="catagory-ratingReviews">
            ({product.reviews || 0})
          </span>
        </div>

        <p className="catagory-cardBrand">
          Brand: <strong>{product.brand || "Local Farm"}</strong>
        </p>

        <p className="catagory-cardQty">{product.quantity || "1 unit"}</p>

        {/* Pricing Row */}
        <div className="catagory-priceRow">
          <div className="catagory-prices">
            <span className="catagory-sellPrice">
              ₹{Number(product.sellingPrice).toFixed(2)}
            </span>
            {product.originalPrice &&
              Number(product.originalPrice) > Number(product.sellingPrice) && (
                <span className="catagory-origPrice">
                  ₹{Number(product.originalPrice).toFixed(2)}
                </span>
              )}
          </div>
          {product.discount > 0 && (
            <span className="catagory-discountTag">
              {product.discount}% OFF
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="catagory-cardActions">
          <button
            type="button"
            className="catagory-actionBtn edit"
            onClick={(e) => onEdit(product, e)}
          >
            <FiEdit /> Edit
          </button>
          <button
            type="button"
            className="catagory-actionBtn delete"
            onClick={(e) => onDelete(product._id, e)}
          >
            <FiTrash2 /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default Catagory;