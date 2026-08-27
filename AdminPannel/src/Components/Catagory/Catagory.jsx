import React, { useState, useEffect, useRef } from "react";

import axios from "axios";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";

import {
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
  FiShoppingBag,
  FiDownload,
  FiCheck,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

import "./Catagory.css";

const API_BASE_URL = "http://localhost:5000/api";

// =====================================================
// DEFAULT CATEGORIES
// =====================================================

const initialCategories = [
  {
    _id: "all",
    name: "All Categories",
    icon: "▦",
  },
  {
    _id: "cat_1",
    name: "Fruits & Vegetables",
    icon: "🍎",
  },
  {
    _id: "cat_2",
    name: "Beverages",
    icon: "🥤",
  },
  {
    _id: "cat_3",
    name: "Snacks & Munchies",
    icon: "🍪",
  },
  {
    _id: "cat_4",
    name: "Grocery & Staples",
    icon: "🛍",
  },
  {
    _id: "cat_5",
    name: "Dairy & Bakery",
    icon: "🥛",
  },
  {
    _id: "cat_6",
    name: "Personal Care",
    icon: "🧴",
  },
  {
    _id: "cat_7",
    name: "Home Care",
    icon: "🏠",
  },
  {
    _id: "cat_8",
    name: "Baby Care",
    icon: "👶",
  },
  {
    _id: "cat_9",
    name: "Pet Care",
    icon: "🐾",
  },
];

// =====================================================
// LOCAL FALLBACK PRODUCTS
// =====================================================

const initialProducts = [
  {
    _id: "p1",
    name: "Fresh Banana",
    category: "Fruits & Vegetables",
    brand: "Local Farm",
    rating: 4.5,
    reviews: 120,
    quantity: "1 kg",
    sellingPrice: 40,
    originalPrice: 46.5,
    discount: 14,
    stock: 25,
    inStock: true,
    status: "unpublished",
    image: "",
    images: [],
  },
];

// =====================================================
// CATEGORY ICON
// =====================================================

const getCategoryIcon = (categoryName) => {
  const name = String(categoryName || "")
    .toLowerCase()
    .trim();

  if (name.includes("fruit") || name.includes("vegetable")) {
    return "🍎";
  }

  if (name.includes("beverage") || name.includes("drink")) {
    return "🥤";
  }

  if (name.includes("snack") || name.includes("munch")) {
    return "🍪";
  }

  if (
    name.includes("grocery") ||
    name.includes("staple") ||
    name.includes("foodgrain")
  ) {
    return "🛍";
  }

  if (
    name.includes("dairy") ||
    name.includes("bakery") ||
    name.includes("milk")
  ) {
    return "🥛";
  }

  if (name.includes("personal") || name.includes("care")) {
    return "🧴";
  }

  if (name.includes("home")) {
    return "🏠";
  }

  if (name.includes("baby")) {
    return "👶";
  }

  if (name.includes("pet")) {
    return "🐾";
  }

  return "📦";
};

const getCategoryName = (categoryValue, categoryList = []) => {
  if (!categoryValue) {
    return "";
  }

  // Backend returned populated category object
  if (typeof categoryValue === "object") {
    return (
      categoryValue?.name ||
      categoryValue?.categoryName ||
      categoryValue?.title ||
      categoryValue?._id ||
      ""
    );
  }

  const categoryId = String(categoryValue);

  // Find category by MongoDB ID
  const foundCategory = categoryList.find(
    (category) =>
      String(category?._id) === categoryId ||
      String(category?.id) === categoryId,
  );

  if (foundCategory) {
    return (
      foundCategory?.name ||
      foundCategory?.categoryName ||
      foundCategory?.title ||
      ""
    );
  }

  // If backend already returned category name
  return categoryId;
};

const getBrandName = (brandValue, brandList = []) => {
  if (!brandValue) {
    return "";
  }

  // Backend returned populated brand object
  if (typeof brandValue === "object") {
    return (
      brandValue?.name ||
      brandValue?.brandName ||
      brandValue?.title ||
      brandValue?._id ||
      ""
    );
  }

  const brandId = String(brandValue);

  // Find brand by MongoDB ID
  const foundBrand = brandList.find(
    (brand) => String(brand?._id) === brandId || String(brand?.id) === brandId,
  );

  if (foundBrand) {
    return foundBrand?.name || foundBrand?.brandName || foundBrand?.title || "";
  }

  return brandId;
};
// =====================================================
// NORMALIZE PRODUCT
// =====================================================

const normalizeImportedProduct = (
  product,
  brandList = [],
  categoryList = [],
) => {
  if (!product) {
    return null;
  }

  const categoryName = getCategoryName(product.category, categoryList);

  const brandName = getBrandName(product.brand, brandList);

  const productImages = Array.isArray(product.images) ? product.images : [];

  const firstImage = productImages[0];

  let image = "";

  if (firstImage) {
    if (typeof firstImage === "string") {
      image = firstImage;
    } else {
      image =
        firstImage?.url || firstImage?.path || firstImage?.secure_url || "";
    }
  }

  /*
   * MANUAL PRODUCT
   *
   * price
   * stockQuantity
   *
   * IMPORT PRODUCT
   *
   * sellingPrice
   * stock
   *
   * Support both.
   */

  const sellingPrice = Number(product?.sellingPrice ?? product?.price ?? 0);

  const writtenPrice = Number(
    product?.writtenPrice ?? product?.originalPrice ?? 0,
  );

  const stock = Number(product?.stock ?? product?.stockQuantity ?? 0);

  let discount = Number(product?.discount ?? 0);

  if (!discount && writtenPrice > sellingPrice && writtenPrice > 0) {
    discount = Math.round(((writtenPrice - sellingPrice) / writtenPrice) * 100);
  }

  const source = product?.source === "import" ? "import" : "manual";

  return {
    ...product,

    _id: product?._id,

    source,

    name: product?.productName || product?.name || "Unnamed Product",

    productName: product?.productName || product?.name || "Unnamed Product",

    category: categoryName,

    brand: brandName,

    sku: product?.sku || "",

    unit:
      typeof product?.unit === "object"
        ? product.unit?.name || product.unit?.unitName || ""
        : product?.unit || "",

    quantity:
      product?.quantity || product?.unit?.name || product?.unit || "1 unit",

    rating: Number(product?.rating ?? 5),

    reviews: Number(product?.reviews ?? 0),

    sellingPrice,

    price: sellingPrice,

    originalPrice: writtenPrice || sellingPrice,

    writtenPrice: writtenPrice || sellingPrice,

    purchasePrice: Number(product?.purchasePrice ?? 0),

    costPrice: Number(product?.costPrice ?? 0),

    discount,

    stock,

    stockQuantity: stock,

    inStock: product?.inStock ?? stock > 0,

    isOutOfStock: product?.isOutOfStock ?? stock <= 0,

    status: product?.status || "active",

    manufactureDate: product?.manufactureDate || null,

    expiryDate: product?.expiryDate || null,

    images: productImages,

    image,
  };
};

// =====================================================
// GET PRODUCT STATUS
// =====================================================

const getProductStatus = (product) => {
  const status = String(product?.status || "").toLowerCase();

  if (status === "active" || status === "published" || status === "publish") {
    return "published";
  }

  return "unpublished";
};

// =====================================================
// COMPONENT
// =====================================================

const Catagory = () => {
  const navigate = useNavigate();
  // ===================================================
  // STATE
  // ===================================================

  const [categories, setCategories] = useState(initialCategories);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState(initialProducts);

  const [selectedCategory, setSelectedCategory] = useState("all");

  const [search, setSearch] = useState("");

  const [sortBy, setSortBy] = useState("popular");

  const [currentPage, setCurrentPage] = useState(1);

  const productsPerPage = 10;

  // ===================================================
  // SELECTED PRODUCTS
  // ===================================================

  const [selectedProducts, setSelectedProducts] = useState([]);

  const [isPublishing, setIsPublishing] = useState(false);

  // ===================================================
  // MODALS
  // ===================================================

  const [showProductModal, setShowProductModal] = useState(false);

  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);

  // ===================================================
  // CATEGORY FORM
  // ===================================================

  const [newCatName, setNewCatName] = useState("");

  const [newCatIcon, setNewCatIcon] = useState("📦");

  // ===================================================
  // PRODUCT FORM
  // ===================================================

  const [productForm, setProductForm] = useState({
    name: "",
    category: "",
    brand: "",
    quantity: "",
    sellingPrice: "",
    originalPrice: "",
    discount: 0,
    stock: 10,
    image: "",
  });

  // ===================================================
  // FETCH IMPORTED PRODUCTS
  // ===================================================

  const fetchImportedProducts = async (brandList = []) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products`);

      

      let allProducts = [];

      if (Array.isArray(response.data)) {
        allProducts = response.data;
      } else if (Array.isArray(response.data?.data)) {
        allProducts = response.data.data;
      } else if (Array.isArray(response.data?.products)) {
        allProducts = response.data.products;
      } else if (Array.isArray(response.data?.items)) {
        allProducts = response.data.items;
      }

      // =====================================================
      // ONLY IMPORTED PRODUCTS
      // =====================================================

      const importedProducts = allProducts.filter(
        (product) => String(product?.source || "").toLowerCase() === "import",
      );

     

      const normalizedProducts = importedProducts
        .map((product) => normalizeImportedProduct(product, brandList, []))
        .filter(Boolean);

      setProducts(normalizedProducts);

      // =====================================================
      // BUILD CATEGORY LIST ONLY FROM IMPORTED PRODUCTS
      // =====================================================

      const categoryMap = new Map();

      normalizedProducts.forEach((product) => {
        const category = String(product.category || "").trim();

        if (!category) {
          return;
        }

        const key = category.toLowerCase();

        if (!categoryMap.has(key)) {
          categoryMap.set(key, {
            _id: category,
            name: category,
            icon: getCategoryIcon(category),
          });
        }
      });

      setCategories([
        {
          _id: "all",
          name: "All Categories",
          icon: "▦",
        },
        ...Array.from(categoryMap.values()),
      ]);

      setSelectedProducts([]);
      setCurrentPage(1);
    } catch (error) {
      console.error("Failed to fetch imported products:", error);

      // Do NOT show manual/fallback products
      setProducts([]);

      setCategories([
        {
          _id: "all",
          name: "All Categories",
          icon: "▦",
        },
      ]);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/brands`);

      const brandData =
        response.data?.data || response.data?.brands || response.data || [];

      const safeBrands = Array.isArray(brandData) ? brandData : [];

      setBrands(safeBrands);

      return safeBrands;
    } catch (error) {
      console.error("Failed to fetch brands:", error);
      setBrands([]);
      return [];
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const brandList = await fetchBrands();

      await fetchImportedProducts(brandList);
    };

    loadData();
  }, []);

  // ===================================================
  // CATEGORY COUNTS
  // ===================================================

  const getCategoryCount = (catId) => {
    const safeProducts = Array.isArray(products) ? products : [];

    if (String(catId).toLowerCase() === "all") {
      return safeProducts.length;
    }

    return safeProducts.filter((product) => {
      const productCategory = String(product?.category || "")
        .trim()
        .toLowerCase();

      return productCategory === String(catId).trim().toLowerCase();
    }).length;
  };

  // ===================================================
  // CHECKBOX SELECT PRODUCT
  // ===================================================

  const handleSelectProduct = (productId) => {
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }

      return [...prev, productId];
    });
  };

  // ===================================================
  // SELECT ALL VISIBLE PRODUCTS
  // ===================================================

  const handleSelectAll = (checked) => {
    const visibleIds = displayedProducts
      .map((product) => product._id)
      .filter(Boolean);

    if (!checked) {
      setSelectedProducts((prev) =>
        prev.filter((id) => !visibleIds.includes(id)),
      );

      return;
    }

    setSelectedProducts((prev) => [...new Set([...prev, ...visibleIds])]);
  };

  // ===================================================
  // IMAGE UPLOAD - MAX 5
  // ===================================================

  // ===================================================
  // IMAGE UPLOAD - MAX 5
  // ===================================================

  const handleCardImageUpload = async (productId, files) => {
    if (!files || files.length === 0) {
      return;
    }

    const fileArray = Array.from(files).slice(0, 5);

    if (files.length > 5) {
      alert("You can upload maximum 5 images.");
    }

    // ===============================================
    // LOCAL PREVIEW
    // ===============================================

    const previews = fileArray.map((file) => URL.createObjectURL(file));

    setProducts((prev) =>
      prev.map((item) => {
        if (item._id !== productId) {
          return item;
        }

        const existingImages = Array.isArray(item.images) ? item.images : [];

        const previewImages = previews.map((url) => ({
          url,
        }));

        const combinedImages = [...existingImages, ...previewImages].slice(
          0,
          5,
        );

        return {
          ...item,
          images: combinedImages,
          image: combinedImages[0]?.url || item.image || "",
        };
      }),
    );

    // ===============================================
    // BACKEND
    // ===============================================

    try {
      const formData = new FormData();

      fileArray.forEach((file) => {
        formData.append("images", file);
      });

      const response = await axios.post(
        `${API_BASE_URL}/import/${productId}/images`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      

      const updatedProduct =
        response.data?.product || response.data?.data || response.data;

      if (updatedProduct?._id) {
        setProducts((prev) =>
          prev.map((item) =>
            item._id === productId
              ? normalizeImportedProduct(updatedProduct, brands, categories)
              : item,
          ),
        );
      } else {
        await fetchImportedProducts(brands);
      }
    } catch (error) {
      console.error("Multiple image upload failed:", error);

      alert(error.response?.data?.message || "Image upload failed.");

      await fetchImportedProducts(brands);
    }
  };

  // ===================================================
  // PUBLISH / UNPUBLISH PRODUCTS
  // ===================================================

  const handlePublishProducts = async (status) => {
    if (selectedProducts.length === 0) {
      alert("Please select at least one product.");
      return;
    }

    const nextStatus = status === "published" ? "active" : "inactive";

    const actionName = status === "published" ? "publish" : "unpublish";

    if (
      !window.confirm(
        `Are you sure you want to ${actionName} ${selectedProducts.length} selected product(s)?`,
      )
    ) {
      return;
    }

    setIsPublishing(true);

    try {
      await axios.put(`${API_BASE_URL}/products/bulk-status`, {
        ids: selectedProducts,
        status: nextStatus,
      });

      setProducts((prev) =>
        prev.map((product) =>
          selectedProducts.includes(product._id)
            ? {
                ...product,
                status: nextStatus,
              }
            : product,
        ),
      );

      setSelectedProducts([]);

      alert(
        status === "published"
          ? "Selected products published successfully."
          : "Selected products unpublished successfully.",
      );
    } catch (error) {
      console.error("Publish/unpublish failed:", error);

      alert(
        error.response?.data?.message ||
          `Failed to ${actionName} selected products.`,
      );

      await fetchProducts(brands);
    } finally {
      setIsPublishing(false);
    }
  };

  // ===================================================
  // EXCEL REPORT
  // ===================================================

  const handleDownloadExcel = () => {
    try {
      if (products.length === 0) {
        alert("No products available for the report.");

        return;
      }

      const reportData = products.map((product, index) => {
        const imageUrls = Array.isArray(product.images)
          ? product.images
              .map((image) => {
                if (typeof image === "string") {
                  return image;
                }

                return image?.url || image?.path || image?.secure_url || "";
              })
              .filter(Boolean)
              .join(" | ")
          : "";

        return {
          "S.No": index + 1,

          "Product ID": product._id || "",

          "Product Name": product.name || "",

          Category: product.category || "",

          Brand: product.brand || "",

          SKU: product.sku || "",

          Quantity: product.quantity || "",

          Unit: product.unit || "",

          "Selling Price": Number(product.sellingPrice || 0),

          "Written Price": Number(
            product.writtenPrice || product.originalPrice || 0,
          ),

          "Discount (%)": Number(product.discount || 0),

          Stock: Number(product.stock || 0),

          "In Stock": product.inStock ? "Yes" : "No",

          Status: getProductStatus(product),

          Rating: Number(product.rating || 0),

          Reviews: Number(product.reviews || 0),

          "Image Count": Array.isArray(product.images)
            ? product.images.length
            : 0,

          "Image URLs": imageUrls,

          "Created At": product.createdAt
            ? new Date(product.createdAt).toLocaleString()
            : "",
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(reportData);

      worksheet["!cols"] = [
        { wch: 8 },
        { wch: 26 },
        { wch: 30 },
        { wch: 25 },
        { wch: 20 },
        { wch: 20 },
        { wch: 15 },
        { wch: 12 },
        { wch: 16 },
        { wch: 16 },
        { wch: 15 },
        { wch: 12 },
        { wch: 12 },
        { wch: 15 },
        { wch: 15 },
        { wch: 12 },
        { wch: 12 },
        { wch: 14 },
        { wch: 60 },
        { wch: 24 },
      ];

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "All Products");

      const today = new Date().toISOString().split("T")[0];

      XLSX.writeFile(workbook, `all-products-report-${today}.xlsx`);
    } catch (error) {
      console.error("Excel report generation failed:", error);

      alert("Failed to generate Excel report.");
    }
  };

  // ===================================================
  // DELETE PRODUCT
  // ===================================================

  const handleDeleteProduct = async (id, e) => {
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/products/${id}`);

      setProducts((prev) => prev.filter((product) => product._id !== id));

      setSelectedProducts((prev) =>
        prev.filter((productId) => productId !== id),
      );
    } catch (error) {
      console.error("Delete imported product failed:", error);

      alert(error.response?.data?.message || "Failed to delete product.");
    }
  };

  // =====================================================
  // OPEN EDIT PRODUCT BY ID
  // =====================================================

  const handleOpenEdit = (prod, e) => {
    e.stopPropagation();

    if (!prod?._id) {
      alert("Product ID not found.");
      return;
    }

    navigate(`/products/add-product/${prod._id}`);
  };

  // ===================================================
  // SAVE PRODUCT
  // ===================================================

  const handleSaveProduct = async (e) => {
    e.preventDefault();

    const payload = {
      name: productForm.name.trim(),

      category: productForm.category,

      brand: productForm.brand.trim(),

      quantity: productForm.quantity,

      sellingPrice: Number(productForm.sellingPrice),

      writtenPrice: Number(
        productForm.originalPrice || productForm.sellingPrice,
      ),

      discount: Number(productForm.discount),

      stock: Number(productForm.stock),

      inStock: Number(productForm.stock) > 0,

      status: editingProduct
        ? editingProduct.status || "unpublished"
        : "unpublished",
    };

    try {
      if (editingProduct) {
        const response = await axios.put(
          `${API_BASE_URL}/products/${editingProduct._id}`,
          payload,
        );

        const updatedProduct =
          response.data?.data || response.data?.product || response.data;

        setProducts((prev) =>
          prev.map((product) =>
            product._id === editingProduct._id
              ? normalizeImportedProduct(updatedProduct, brands, categories)
              : product,
          ),
        );

        setShowProductModal(false);

        setEditingProduct(null);

        return;
      }

      const response = await axios.post(`${API_BASE_URL}/import`, {
        products: [payload],
      });

      const newProduct =
        response.data?.products?.[0] ||
        response.data?.data?.[0] ||
        response.data?.product;

      if (newProduct) {
        setProducts((prev) => [normalizeImportedProduct(newProduct), ...prev]);
      } else {
        await fetchImportedProducts();
      }

      setShowProductModal(false);

      setEditingProduct(null);
    } catch (error) {
      console.error("Save product failed:", error);

      alert(error.response?.data?.message || "Failed to save product.");
    }
  };

  // ===================================================
  // ADD CATEGORY
  // ===================================================

  const handleAddCategory = async (e) => {
    e.preventDefault();

    if (!newCatName.trim()) {
      return;
    }

    const newCat = {
      _id: newCatName.trim(),

      name: newCatName.trim(),

      icon: newCatIcon || "📦",
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/categories`, newCat);

      setCategories((prev) => [...prev, response.data]);
    } catch (error) {
      console.warn("Category API unavailable. Added locally.");

      setCategories((prev) => [...prev, newCat]);
    }

    setNewCatName("");

    setNewCatIcon("📦");

    setShowCategoryModal(false);
  };

  // ===================================================
  // FILTER
  // ===================================================

  const filteredProducts = (Array.isArray(products) ? products : []).filter(
    (product) => {
      const productCategory = String(product.category || "")
        .trim()
        .toLowerCase();

      const selected = String(selectedCategory || "")
        .trim()
        .toLowerCase();

      const matchesCategory =
        selected === "all" || productCategory === selected;

      const productName = String(product.name || "").toLowerCase();

      const productBrand = String(product.brand || "").toLowerCase();

      const productSku = String(product.sku || "").toLowerCase();

      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        productName.includes(searchValue) ||
        productBrand.includes(searchValue) ||
        productSku.includes(searchValue);

      return matchesCategory && matchesSearch;
    },
  );

  // ===================================================
  // SORT
  // ===================================================

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") {
      return Number(a.sellingPrice || 0) - Number(b.sellingPrice || 0);
    }

    if (sortBy === "price-high") {
      return Number(b.sellingPrice || 0) - Number(a.sellingPrice || 0);
    }

    if (sortBy === "rating") {
      return Number(b.rating || 0) - Number(a.rating || 0);
    }

    return 0;
  });

  // ===================================================
  // PAGINATION
  // ===================================================

  const totalPages = Math.ceil(sortedProducts.length / productsPerPage) || 1;

  const startIndex = (currentPage - 1) * productsPerPage;

  const displayedProducts = sortedProducts.slice(
    startIndex,
    startIndex + productsPerPage,
  );

  // ===================================================
  // FIX: ALL VISIBLE SELECTED
  // ===================================================

  const allVisibleSelected =
    displayedProducts.length > 0 &&
    displayedProducts.every(
      (product) => product._id && selectedProducts.includes(product._id),
    );

  // ===================================================
  // ACTIVE CATEGORY
  // ===================================================

  const safeCategories = Array.isArray(categories) ? categories : [];

  const activeCategoryObj = safeCategories.find(
    (category) =>
      String(category?._id).toLowerCase() ===
      String(selectedCategory).toLowerCase(),
  );

  const activeCategoryName =
    selectedCategory === "all"
      ? "All Products"
      : activeCategoryObj?.name || selectedCategory || "Products";

  // ===================================================
  // UI
  // ===================================================

  return (
    <div className="catagory">
      <div className="catagory-header">
        <div className="catagory-headerLeft">
          <h1 className="catagory-title">Categories & Products</h1>

          <div className="catagory-breadcrumb">
            <span>Home</span>

            {" > "}

            <span className="catagory-activeCrumb">Categories & Products</span>
          </div>
        </div>
      </div>

      <div className="catagory-layout">
        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside className="catagory-sidebar">
          <div className="catagory-sidebarHeader">
            <h3 className="catagory-sidebarTitle">Categories</h3>
            {/* 
            <button
              type="button"
              className="catagory-btnAddCategory"
              onClick={() =>
                setShowCategoryModal(
                  true
                )
              }
            >
              <FiPlus />
              Add Category
            </button> */}
          </div>

          <div className="catagory-list">
            {categories.map((cat) => {
              const isSelected =
                String(selectedCategory).toLowerCase() ===
                String(cat._id).toLowerCase();

              const count = getCategoryCount(cat._id);

              return (
                <button
                  key={cat._id}
                  type="button"
                  className={`catagory-item ${isSelected ? "selected" : ""}`}
                  onClick={() => {
                    setSelectedCategory(cat._id);

                    setCurrentPage(1);

                    setSelectedProducts([]);
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

          <div className="catagory-totalBox">
            <div className="catagory-totalText">
              <span>Total Categories</span>

              <h2>{Math.max(categories.length - 1, 0)}</h2>
            </div>

            <div className="catagory-totalIcon">
              <FiShoppingBag />
            </div>
          </div>
        </aside>

        {/* =================================================
            MAIN
        ================================================= */}

        <main className="catagory-main">
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
              {/* SEARCH */}

              <div className="catagory-searchWrapper">
                <FiSearch className="catagory-searchIcon" />

                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);

                    setCurrentPage(1);
                  }}
                  className="catagory-searchInput"
                />
              </div>

              {/* SORT */}

              <div className="catagory-selectWrapper">
                <label>Sort by:</label>

                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);

                    setCurrentPage(1);
                  }}
                  className="catagory-sortSelect"
                >
                  <option value="popular">Popular</option>

                  <option value="price-low">Price: Low to High</option>

                  <option value="price-high">Price: High to Low</option>

                  <option value="rating">Top Rated</option>
                </select>
              </div>

              {/* SELECT ALL */}

              <label
                title="Select all products on this page"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  style={{
                    width: "17px",
                    height: "17px",
                    cursor: "pointer",
                  }}
                />

                <span>Select All</span>
              </label>

              {/* PUBLISH */}

              <button
                type="button"
                disabled={selectedProducts.length === 0 || isPublishing}
                onClick={() => handlePublishProducts("published")}
                title="Publish selected products"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  opacity:
                    selectedProducts.length === 0 || isPublishing ? 0.5 : 1,
                  cursor:
                    selectedProducts.length === 0 || isPublishing
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                <FiCheck />
                Publish
              </button>

              {/* UNPUBLISH */}

              <button
                type="button"
                disabled={selectedProducts.length === 0 || isPublishing}
                onClick={() => handlePublishProducts("unpublished")}
                title="Unpublish selected products"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  opacity:
                    selectedProducts.length === 0 || isPublishing ? 0.5 : 1,
                  cursor:
                    selectedProducts.length === 0 || isPublishing
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                <FiEyeOff />
                Unpublish
              </button>

              {/* EXCEL */}

              <button
                type="button"
                onClick={handleDownloadExcel}
                title="Download Excel report of all products"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                <FiDownload />
                Excel Report
              </button>

              {/* ADD PRODUCT */}

              {/* <button
                type="button"
                className="catagory-btnAddProduct"
                onClick={() => {

                  setEditingProduct(
                    null
                  );

                  setProductForm({
                    name: "",

                    category:
                      selectedCategory ===
                      "all"
                        ? categories.find(
                            (
                              cat
                            ) =>
                              cat._id !==
                              "all"
                          )?._id ||
                          ""
                        : selectedCategory,

                    brand: "",

                    quantity:
                      "",

                    sellingPrice:
                      "",

                    originalPrice:
                      "",

                    discount:
                      0,

                    stock:
                      10,

                    image:
                      "",
                  });

                  setShowProductModal(
                    true
                  );

                }}
              >

                <FiPlus />

                Add Product

              </button> */}
            </div>
          </div>

          {/* SELECTED COUNT */}

          {selectedProducts.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                marginBottom: "12px",
                borderRadius: "8px",
                background: "#f5f7fa",
              }}
            >
              <span>
                {selectedProducts.length} product
                {selectedProducts.length > 1 ? "s" : ""} selected
              </span>

              <button
                type="button"
                onClick={() => setSelectedProducts([])}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Clear Selection
              </button>
            </div>
          )}

          {/* PRODUCTS GRID */}

          <div className="catagory-productsGrid">
            {displayedProducts.map((prod) => (
              <ProductCardItem
                key={prod._id}
                product={prod}
                selected={selectedProducts.includes(prod._id)}
                onSelect={handleSelectProduct}
                onImageUpload={handleCardImageUpload}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteProduct}
              />
            ))}
          </div>

          {/* EMPTY */}

          {displayedProducts.length === 0 && (
            <div className="catagory-emptyState">
              <p>No products found for this category or search query.</p>
            </div>
          )}

          {/* PAGINATION */}

          <div className="catagory-pagination">
            <span className="catagory-paginationInfo">
              Showing {displayedProducts.length > 0 ? startIndex + 1 : 0} to{" "}
              {Math.min(startIndex + productsPerPage, filteredProducts.length)}{" "}
              of {filteredProducts.length} products
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

      {/* =================================================
          ADD / EDIT PRODUCT MODAL
      ================================================= */}

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
                    setProductForm({
                      ...productForm,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="catagory-formRow">
                <div className="catagory-formGroup">
                  <label>Category *</label>

                  <select
                    required
                    value={productForm.category}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        category: e.target.value,
                      })
                    }
                  >
                    {(Array.isArray(categories) ? categories : [])
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
                      setProductForm({
                        ...productForm,
                        brand: e.target.value,
                      })
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
                      setProductForm({
                        ...productForm,
                        quantity: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="catagory-formGroup">
                  <label>Stock</label>

                  <input
                    type="number"
                    min="0"
                    value={productForm.stock}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        stock: e.target.value,
                      })
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
                    min="0"
                    required
                    value={productForm.sellingPrice}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        sellingPrice: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="catagory-formGroup">
                  <label>Original Price (₹)</label>

                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={productForm.originalPrice}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        originalPrice: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="catagory-formGroup">
                  <label>Discount (%)</label>

                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={productForm.discount}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        discount: e.target.value,
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

      {/* =================================================
          ADD CATEGORY MODAL
      ================================================= */}

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

// =====================================================
// PRODUCT CARD
// =====================================================

const ProductCardItem = ({
  product,
  selected,
  onSelect,
  onImageUpload,
  onEdit,
  onDelete,
}) => {
  const fileInputRef = useRef(null);

  const productStatus = getProductStatus(product);

  // ===================================================
  // IMAGE BOX CLICK
  // ===================================================

  const handleBoxClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // ===================================================
  // IMAGE FILE CHANGE
  // ===================================================

  const handleFileChange = (e) => {
    const files = e.target.files;

    if (files && files.length > 0) {
      onImageUpload(product._id, files);
    }

    e.target.value = "";
  };

  // ===================================================
  // CHECKBOX
  // ===================================================

  const handleCheckbox = (e) => {
    e.stopPropagation();

    onSelect(product._id);
  };

  return (
    <div
      className="catagory-card"
      style={{
        position: "relative",
      }}
    >
      {/* SELECT CHECKBOX */}

      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          zIndex: 10,
          background: "#fff",
          borderRadius: "5px",
          padding: "3px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
        }}
      >
        <input
          type="checkbox"
          checked={selected}
          onChange={handleCheckbox}
          title="Select product"
          style={{
            width: "18px",
            height: "18px",
            cursor: "pointer",
          }}
        />
      </div>

      {/* HEADER */}

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

      {/* IMAGE BOX */}

      <div
        className="catagory-cardImageBox"
        onClick={handleBoxClick}
        title="Click to upload up to 5 images"
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          hidden
        />

        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="catagory-cardImg"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="catagory-emptyImage">
            <FiUpload className="catagory-uploadIcon" />

            <span>Upload Image</span>
          </div>
        )}
      </div>

      {/* IMAGE COUNT */}

      {Array.isArray(product.images) && product.images.length > 0 && (
        <div
          style={{
            fontSize: "12px",
            textAlign: "center",
            marginTop: "5px",
            opacity: 0.7,
          }}
        >
          {product.images.length} / 5 images
        </div>
      )}

      {/* PRODUCT INFO */}

      <div className="catagory-cardInfo">
        <h4 className="catagory-cardName">{product.name}</h4>

        <div className="catagory-ratingRow">
          <span className="catagory-ratingStar">
            <FiStar /> {Number(product.rating || 5).toFixed(1)}
          </span>

          <span className="catagory-ratingReviews">
            ({product.reviews || 0})
          </span>
        </div>

        <p className="catagory-cardBrand">
          Brand: <strong>{product.brand || "Local Farm"}</strong>
        </p>

        <p className="catagory-cardQty">
          {product.quantity || product.unit || "1 unit"}
        </p>

        {/* STATUS */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            marginBottom: "8px",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          {productStatus === "published" ? (
            <>
              <FiEye />

              <span>Published</span>
            </>
          ) : (
            <>
              <FiEyeOff />

              <span>Unpublished</span>
            </>
          )}
        </div>

        {/* PRICE */}

        <div className="catagory-priceRow">
          <div className="catagory-prices">
            <span className="catagory-sellPrice">
              ₹{Number(product.sellingPrice || 0).toFixed(2)}
            </span>

            {product.originalPrice &&
              Number(product.originalPrice) > Number(product.sellingPrice) && (
                <span className="catagory-origPrice">
                  ₹{Number(product.originalPrice).toFixed(2)}
                </span>
              )}
          </div>

          {Number(product.discount || 0) > 0 && (
            <span className="catagory-discountTag">
              {product.discount}% OFF
            </span>
          )}
        </div>

        {/* ACTIONS */}

        <div className="catagory-cardActions">
          <button
            type="button"
            className="catagory-actionBtn edit"
            onClick={(e) => onEdit(product, e)}
          >
            <FiEdit />
            Edit
          </button>

          <button
            type="button"
            className="catagory-actionBtn delete"
            onClick={(e) => onDelete(product._id, e)}
          >
            <FiTrash2 />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default Catagory;
