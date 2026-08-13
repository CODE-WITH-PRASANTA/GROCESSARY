import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AllProduct.css";

const API_BASE_URL = "http://localhost:5000";

const Allproduct = () => {
  const navigate = useNavigate();

  // ======================================================
  // API DATA
  // ======================================================

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // ======================================================
  // TAB & CATEGORY FILTER
  // ======================================================

  const [activeTab, setActiveTab] = useState(
    "All Products"
  );

  const [selectedCategory, setSelectedCategory] =
    useState("All Categories");

  // ======================================================
  // SEARCH & FILTER
  // ======================================================

  const [showFilterBar, setShowFilterBar] =
    useState(false);

  const [searchTerm, setSearchTerm] =
    useState("");

  // ======================================================
  // PAGINATION
  // ======================================================

  const [currentPage, setCurrentPage] =
    useState(1);

  const itemsPerPage = 4;

  // ======================================================
  // VIEW MODAL
  // ======================================================

  const [showViewModal, setShowViewModal] =
    useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  // ======================================================
  // GET ALL PRODUCTS
  // GET /api/products
  // ======================================================

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await fetch(
        `${API_BASE_URL}/api/products?limit=1000`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Failed to fetch products"
        );
      }

      /*
        Expected backend response:

        {
          success: true,
          data: [],
          pagination: {}
        }
      */

      if (result?.success) {
        setProducts(
          Array.isArray(result.data)
            ? result.data
            : []
        );
      } else {
        setProducts([]);
        setErrorMessage(
          result?.message ||
            "Failed to load products"
        );
      }
    } catch (error) {
      console.error(
        "Fetch Products Error:",
        error
      );

      setProducts([]);

      setErrorMessage(
        error.message ||
          "Error connecting to server."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    fetchProducts();
  }, []);

  // ======================================================
  // ADD PRODUCT ROUTE
  // ======================================================

  const handleAddProduct = () => {
    navigate("/products/add-product");
  };

  // ======================================================
  // EDIT PRODUCT ROUTE
  // ======================================================

  const handleEditProduct = (product) => {
    navigate(
      "/products/add-product",
      {
        state: {
          product,
        },
      }
    );
  };

  // ======================================================
  // VIEW PRODUCT
  // ======================================================

  const openViewModal = (product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  // ======================================================
  // CLOSE VIEW MODAL
  // ======================================================

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedProduct(null);
  };

  // ======================================================
  // IMAGE URL
  // ======================================================

  const getImageUrl = (imageArray) => {
    if (
      Array.isArray(imageArray) &&
      imageArray.length > 0
    ) {
      const imgPath = imageArray[0];

      if (!imgPath) {
        return "https://via.placeholder.com/80";
      }

      if (
        imgPath.startsWith("http://") ||
        imgPath.startsWith("https://")
      ) {
        return imgPath;
      }

      return `${API_BASE_URL}${
        imgPath.startsWith("/")
          ? ""
          : "/"
      }${imgPath}`;
    }

    return "https://via.placeholder.com/80";
  };

  // ======================================================
  // CATEGORY NAME
  // ======================================================

  const getCategoryName = (product) => {
    if (!product) return "";

    if (
      product.category &&
      typeof product.category ===
        "object"
    ) {
      return (
        product.category.name || ""
      );
    }

    if (
      typeof product.category ===
      "string"
    ) {
      return product.category;
    }

    return "";
  };

  // ======================================================
  // BRAND NAME
  // ======================================================

  const getBrandName = (product) => {
    if (!product) return "";

    if (
      product.brand &&
      typeof product.brand ===
        "object"
    ) {
      return (
        product.brand.name || ""
      );
    }

    if (
      typeof product.brand ===
      "string"
    ) {
      return product.brand;
    }

    return "";
  };

  // ======================================================
  // UNIT NAME
  // ======================================================

  const getUnitName = (product) => {
    if (!product) return "";

    if (
      product.unit &&
      typeof product.unit ===
        "object"
    ) {
      return (
        product.unit.shortName ||
        product.unit.name ||
        ""
      );
    }

    if (
      typeof product.unit ===
      "string"
    ) {
      return product.unit;
    }

    return "";
  };

  // ======================================================
  // DELETE PRODUCT
  // DELETE /api/products/:id
  // ======================================================

  const handleDeleteProduct = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this product?"
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/products/${id}`,
        {
          method: "DELETE",
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Failed to delete product"
        );
      }

      alert(
        "Product deleted successfully!"
      );

      await fetchProducts();

    } catch (error) {
      console.error(
        "Delete Product Error:",
        error
      );

      alert(
        error.message ||
          "Failed to delete product"
      );
    }
  };

  // ======================================================
  // EXPORT CSV
  // ======================================================

  const handleExportCSV = () => {
    if (
      filteredProducts.length === 0
    ) {
      alert(
        "No products available to export."
      );
      return;
    }

    const headers =
      "ID,Name,SKU,Category,Brand,Unit,Price,DiscountPrice,Stock,Status\n";

    const csvRows =
      filteredProducts
        .map((p) => {
          const category =
            getCategoryName(p);

          const brand =
            getBrandName(p);

          const unit =
            getUnitName(p);

          return (
            `"${p._id || ""}",` +
            `"${p.productName || ""}",` +
            `"${p.sku || ""}",` +
            `"${category}",` +
            `"${brand}",` +
            `"${unit}",` +
            `${p.price || 0},` +
            `${p.discountPrice || 0},` +
            `${p.stockQuantity || 0},` +
            `"${p.status || ""}"`
          );
        })
        .join("\n");

    const blob = new Blob(
      [
        headers,
        csvRows,
      ],
      {
        type: "text/csv",
      }
    );

    const url =
      window.URL.createObjectURL(
        blob
      );

    const a =
      document.createElement("a");

    a.href = url;

    a.download =
      "products_export.csv";

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);

    window.URL.revokeObjectURL(
      url
    );
  };

  // ======================================================
  // FILTER PRODUCTS
  // ======================================================

  const filteredProducts =
    products.filter((p) => {
      const pStatus =
        (
          p.status || ""
        ).toLowerCase();

      const pName =
        (
          p.productName || ""
        ).toLowerCase();

      const pSku =
        (
          p.sku || ""
        ).toLowerCase();

      const pCat =
        getCategoryName(
          p
        ).toLowerCase();

      const pBrand =
        getBrandName(
          p
        ).toLowerCase();

      const search =
        searchTerm
          .toLowerCase()
          .trim();

      // ================================================
      // TAB
      // ================================================

      let matchesTab = true;

      if (
        activeTab ===
        "Active"
      ) {
        matchesTab =
          pStatus === "active";
      }

      if (
        activeTab ===
        "Inactive"
      ) {
        matchesTab =
          pStatus ===
          "inactive";
      }

      if (
        activeTab ===
        "Out of Stock"
      ) {
        matchesTab =
          Number(
            p.stockQuantity || 0
          ) === 0 ||
          p.isOutOfStock === true;
      }

      if (
        activeTab ===
        "Low Stock"
      ) {
        const stock =
          Number(
            p.stockQuantity || 0
          );

        const alertLevel =
          Number(
            p.lowStockAlert || 5
          );

        matchesTab =
          stock > 0 &&
          stock <= alertLevel;
      }

      // ================================================
      // CATEGORY
      // ================================================

      const matchesCategory =
        selectedCategory ===
          "All Categories" ||
        pCat ===
          selectedCategory.toLowerCase();

      // ================================================
      // SEARCH
      // ================================================

      const matchesSearch =
        !search ||
        pName.includes(search) ||
        pSku.includes(search) ||
        pCat.includes(search) ||
        pBrand.includes(search);

      return (
        matchesTab &&
        matchesCategory &&
        matchesSearch
      );
    });

  // ======================================================
  // PAGINATION
  // ======================================================

  const totalPages =
    Math.ceil(
      filteredProducts.length /
        itemsPerPage
    ) || 1;

  useEffect(() => {
    if (
      currentPage > totalPages
    ) {
      setCurrentPage(
        totalPages
      );
    }
  }, [
    currentPage,
    totalPages,
  ]);

  const indexOfLastItem =
    currentPage *
    itemsPerPage;

  const indexOfFirstItem =
    indexOfLastItem -
    itemsPerPage;

  const currentProducts =
    filteredProducts.slice(
      indexOfFirstItem,
      indexOfLastItem
    );

  // ======================================================
  // CATEGORY COUNTS
  // ======================================================

  const getCategoryCount =
    (categoryName) => {
      if (
        categoryName ===
        "All Categories"
      ) {
        return products.length;
      }

      return products.filter(
        (product) =>
          getCategoryName(
            product
          ).toLowerCase() ===
          categoryName.toLowerCase()
      ).length;
    };

  // ======================================================
  // CREATE CATEGORY LIST FROM PRODUCTS
  // ======================================================

  const uniqueCategoryMap =
    new Map();

  products.forEach(
    (product) => {
      const categoryName =
        getCategoryName(
          product
        );

      if (
        categoryName &&
        !uniqueCategoryMap.has(
          categoryName.toLowerCase()
        )
      ) {
        uniqueCategoryMap.set(
          categoryName.toLowerCase(),
          {
            name:
              categoryName,
            icon: "📁",
          }
        );
      }
    }
  );

  const displayCategories = [
    {
      name: "All Categories",
      icon: "📁",
    },
    ...Array.from(
      uniqueCategoryMap.values()
    ),
  ];

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="ap-container">

      {/* HEADER */}

      <div className="ap-header">

        <div>

          <h1 className="ap-title">
            Products
          </h1>

          <p className="ap-breadcrumb">
            Dashboard &gt; Products &gt;{" "}
            <span>
              All Products
            </span>
          </p>

        </div>

        <button
          className="ap-btn-primary"
          onClick={
            handleAddProduct
          }
        >
          + Add New Product
        </button>

      </div>

      {/* METRICS */}

      <div className="ap-metrics-grid">

        <div className="ap-metric-card">

          <div className="ap-metric-icon ap-icon-bg-1">
            🛒
          </div>

          <div className="ap-metric-info">

            <span className="ap-metric-label">
              Total Products
            </span>

            <h2 className="ap-metric-value">
              {products.length}
            </h2>

            <span className="ap-metric-trend ap-trend-up">
              ↑ Updated live
            </span>

          </div>

        </div>


        <div className="ap-metric-card">

          <div className="ap-metric-icon ap-icon-bg-2">
            📁
          </div>

          <div className="ap-metric-info">

            <span className="ap-metric-label">
              Categories
            </span>

            <h2 className="ap-metric-value">
              {
                new Set(
                  products
                    .map(
                      (p) =>
                        getCategoryName(
                          p
                        )
                    )
                    .filter(Boolean)
                ).size
              }
            </h2>

            <span className="ap-metric-trend ap-trend-up">
              ↑ Active categories
            </span>

          </div>

        </div>


        <div className="ap-metric-card">

          <div className="ap-metric-icon ap-icon-bg-3">
            👁️
          </div>

          <div className="ap-metric-info">

            <span className="ap-metric-label">
              Active Products
            </span>

            <h2 className="ap-metric-value">

              {
                products.filter(
                  (p) =>
                    (
                      p.status ||
                      ""
                    ).toLowerCase() ===
                    "active"
                ).length
              }

            </h2>

            <span className="ap-metric-trend ap-trend-up">
              ↑ Live in store
            </span>

          </div>

        </div>


        <div className="ap-metric-card">

          <div className="ap-metric-icon ap-icon-bg-4">
            🚫
          </div>

          <div className="ap-metric-info">

            <span className="ap-metric-label">
              Inactive Products
            </span>

            <h2 className="ap-metric-value">

              {
                products.filter(
                  (p) =>
                    (
                      p.status ||
                      ""
                    ).toLowerCase() ===
                    "inactive"
                ).length
              }

            </h2>

            <span className="ap-metric-trend ap-trend-down">
              ↓ Drafts/Hidden
            </span>

          </div>

        </div>

      </div>


      {/* MAIN CONTENT */}

      <div className="ap-main-content">

        {/* CATEGORY PANEL */}

        <div className="ap-categories-panel">

          <div className="ap-panel-header">

            <h3>
              Categories
            </h3>

            <button
              className="ap-btn-plus"
              onClick={
                handleAddProduct
              }
            >
              +
            </button>

          </div>

          <ul className="ap-category-list">

            {displayCategories.map(
              (cat, index) => {

                const catCount =
                  getCategoryCount(
                    cat.name
                  );

                return (
                  <li
                    key={`${cat.name}-${index}`}
                    className={`ap-category-item ${
                      selectedCategory ===
                      cat.name
                        ? "active"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedCategory(
                        cat.name
                      );

                      setCurrentPage(
                        1
                      );
                    }}
                  >

                    <span className="ap-cat-name">

                      <span className="ap-cat-icon">
                        {cat.icon}
                      </span>

                      {" "}
                      {cat.name}

                    </span>

                    <span className="ap-cat-count">
                      {catCount}
                    </span>

                  </li>
                );
              }
            )}

          </ul>

        </div>


        {/* PRODUCTS PANEL */}

        <div className="ap-products-panel">

          {/* FILTER BAR */}

          <div className="ap-filter-bar">

            <div className="ap-tabs">

              {[
                "All Products",
                "Active",
                "Inactive",
                "Out of Stock",
                "Low Stock",
              ].map(
                (tab) => (

                  <button
                    key={tab}
                    className={`ap-tab ${
                      activeTab ===
                      tab
                        ? "active"
                        : ""
                    }`}
                    onClick={() => {
                      setActiveTab(
                        tab
                      );

                      setCurrentPage(
                        1
                      );
                    }}
                  >
                    {tab}
                  </button>

                )
              )}

            </div>

            <div className="ap-action-btns">

              <button
                className={`ap-btn-outline ${
                  showFilterBar
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setShowFilterBar(
                    !showFilterBar
                  )
                }
              >
                ⚙️ Filters
              </button>

              <button
                className="ap-btn-outline"
                onClick={
                  handleExportCSV
                }
              >
                📥 Export
              </button>

            </div>

          </div>


          {/* SEARCH */}

          {showFilterBar && (
            <div className="ap-search-container">

              <input
                type="text"
                placeholder="Search product by name or SKU..."
                value={
                  searchTerm
                }
                onChange={(e) => {
                  setSearchTerm(
                    e.target.value
                  );

                  setCurrentPage(
                    1
                  );
                }}
                className="ap-search-input"
              />

            </div>
          )}


          {/* TABLE */}

          <div className="ap-table-wrapper">

            {isLoading ? (

              <div
                style={{
                  padding:
                    "2rem",
                  textAlign:
                    "center",
                }}
              >
                Loading products...
              </div>

            ) : errorMessage ? (

              <div
                style={{
                  padding:
                    "2rem",
                  textAlign:
                    "center",
                  color:
                    "red",
                }}
              >

                {errorMessage}

                <br />

                <button
                  className="ap-btn-outline"
                  style={{
                    marginTop:
                      "1rem",
                  }}
                  onClick={
                    fetchProducts
                  }
                >
                  Retry
                </button>

              </div>

            ) : (

              <table className="ap-table">

                <thead>

                  <tr>

                    <th>
                      Product
                    </th>

                    <th>
                      Category
                    </th>

                    <th>
                      Price
                    </th>

                    <th>
                      Discount Price
                    </th>

                    <th>
                      Stock
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {currentProducts.length >
                  0 ? (

                    currentProducts.map(
                      (prod) => (

                        <tr
                          key={
                            prod._id
                          }
                        >

                          <td>

                            <div className="ap-product-cell">

                              <img
                                src={getImageUrl(
                                  prod.images
                                )}
                                alt={
                                  prod.productName
                                }
                                className="ap-product-img"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "https://via.placeholder.com/80";
                                }}
                              />

                              <div>

                                <div className="ap-product-title">
                                  {
                                    prod.productName
                                  }
                                </div>

                                <div className="ap-product-sku">
                                  SKU:{" "}
                                  {
                                    prod.sku
                                  }
                                </div>

                              </div>

                            </div>

                          </td>


                          <td>

                            <span className="ap-badge-category">

                              {
                                getCategoryName(
                                  prod
                                ) ||
                                  "N/A"
                              }

                            </span>

                          </td>


                          <td>
                            ₹
                            {parseFloat(
                              prod.price ||
                                0
                            ).toFixed(
                              2
                            )}
                          </td>


                          <td className="ap-text-success">
                            ₹
                            {parseFloat(
                              prod.discountPrice ||
                                0
                            ).toFixed(
                              2
                            )}
                          </td>


                          <td>

                            {
                              prod.stockQuantity ||
                              0
                            }{" "}

                            {
                              getUnitName(
                                prod
                              )
                            }

                          </td>


                          <td>

                            <span
                              className={`ap-status-badge ${
                                (
                                  prod.status ||
                                  "active"
                                )
                                  .toLowerCase()
                                  .replace(
                                    /\s+/g,
                                    "-"
                                  )
                              }`}
                            >
                              {
                                prod.status ||
                                "active"
                              }
                            </span>

                          </td>


                          <td>

                            <div className="ap-action-icons">

                              <button
                                className="ap-icon-btn edit"
                                title="Edit"
                                onClick={() =>
                                  handleEditProduct(
                                    prod
                                  )
                                }
                              >
                                ✏️
                              </button>


                              <button
                                className="ap-icon-btn view"
                                title="View"
                                onClick={() =>
                                  openViewModal(
                                    prod
                                  )
                                }
                              >
                                👁️
                              </button>


                              <button
                                className="ap-icon-btn delete"
                                title="Delete"
                                onClick={() =>
                                  handleDeleteProduct(
                                    prod._id
                                  )
                                }
                              >
                                🗑️
                              </button>

                            </div>

                          </td>

                        </tr>

                      )
                    )

                  ) : (

                    <tr>

                      <td
                        colSpan="7"
                        className="ap-no-data"
                      >
                        No products found.
                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            )}

          </div>


          {/* PAGINATION */}

          <div className="ap-pagination">

            <button
              disabled={
                currentPage ===
                1
              }
              onClick={() =>
                setCurrentPage(
                  (p) =>
                    p - 1
                )
              }
              className="ap-page-btn"
            >
              Previous
            </button>


            <span className="ap-page-info">

              Page{" "}
              {currentPage}{" "}
              of{" "}
              {totalPages}

            </span>


            <button
              disabled={
                currentPage ===
                  totalPages ||
                totalPages === 0
              }
              onClick={() =>
                setCurrentPage(
                  (p) =>
                    p + 1
                )
              }
              className="ap-page-btn"
            >
              Next
            </button>

          </div>

        </div>

      </div>


      {/* VIEW MODAL */}

      {showViewModal &&
        selectedProduct && (

          <div className="ap-modal-overlay">

            <div className="ap-modal ap-view-modal">

              <div className="ap-modal-header">

                <h3>
                  Product Details
                </h3>

                <button
                  className="ap-close-btn"
                  onClick={
                    closeViewModal
                  }
                >
                  ✕
                </button>

              </div>


              <div className="ap-view-card">

                <div className="ap-view-header">

                  <img
                    src={getImageUrl(
                      selectedProduct.images
                    )}
                    alt={
                      selectedProduct.productName
                    }
                    className="ap-view-img"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://via.placeholder.com/100";
                    }}
                  />

                  <div>

                    <h4 className="ap-view-title">
                      {
                        selectedProduct.productName
                      }
                    </h4>

                    <span className="ap-view-sku">
                      SKU:{" "}
                      {
                        selectedProduct.sku
                      }
                    </span>

                  </div>

                </div>


                <div className="ap-view-grid">

                  <div className="ap-view-box">

                    <span className="ap-view-label">
                      Category
                    </span>

                    <span className="ap-view-val cat-badge">
                      {
                        getCategoryName(
                          selectedProduct
                        ) ||
                          "N/A"
                      }
                    </span>

                  </div>


                  <div className="ap-view-box">

                    <span className="ap-view-label">
                      Brand
                    </span>

                    <span className="ap-view-val">
                      {
                        getBrandName(
                          selectedProduct
                        ) ||
                          "N/A"
                      }
                    </span>

                  </div>


                  <div className="ap-view-box">

                    <span className="ap-view-label">
                      Unit
                    </span>

                    <span className="ap-view-val">
                      {
                        getUnitName(
                          selectedProduct
                        ) ||
                          "N/A"
                      }
                    </span>

                  </div>


                  <div className="ap-view-box">

                    <span className="ap-view-label">
                      Status
                    </span>

                    <span
                      className={`ap-status-badge ${
                        (
                          selectedProduct.status ||
                          "active"
                        )
                          .toLowerCase()
                          .replace(
                            /\s+/g,
                            "-"
                          )
                      }`}
                    >
                      {
                        selectedProduct.status ||
                        "active"
                      }
                    </span>

                  </div>


                  <div className="ap-view-box">

                    <span className="ap-view-label">
                      Regular Price
                    </span>

                    <span className="ap-view-val price-regular">

                      ₹
                      {parseFloat(
                        selectedProduct.price ||
                          0
                      ).toFixed(
                        2
                      )}

                    </span>

                  </div>


                  <div className="ap-view-box">

                    <span className="ap-view-label">
                      Discount Price
                    </span>

                    <span className="ap-view-val price-discount">

                      ₹
                      {parseFloat(
                        selectedProduct.discountPrice ||
                          0
                      ).toFixed(
                        2
                      )}

                    </span>

                  </div>


                  <div className="ap-view-box full-width">

                    <span className="ap-view-label">
                      Available Stock
                    </span>

                    <span className="ap-view-val stock-val">

                      {
                        selectedProduct.stockQuantity ||
                        0
                      }{" "}

                      {
                        getUnitName(
                          selectedProduct
                        ) ||
                          "Items"
                      }{" "}

                      in Stock

                    </span>

                  </div>


                  <div className="ap-view-box full-width">

                    <span className="ap-view-label">
                      Slug
                    </span>

                    <span className="ap-view-val">
                      {
                        selectedProduct.slug ||
                        "N/A"
                      }
                    </span>

                  </div>


                  <div className="ap-view-box full-width">

                    <span className="ap-view-label">
                      Short Description
                    </span>

                    <span className="ap-view-val">
                      {
                        selectedProduct.shortDescription ||
                        "N/A"
                      }
                    </span>

                  </div>

                </div>

              </div>


              <div className="ap-modal-actions">

                <button
                  className="ap-btn-primary"
                  onClick={
                    closeViewModal
                  }
                >
                  Close
                </button>

              </div>

            </div>

          </div>

        )}

    </div>
  );
};

export default Allproduct;