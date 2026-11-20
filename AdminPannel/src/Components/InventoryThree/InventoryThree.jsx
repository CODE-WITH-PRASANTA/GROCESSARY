
import React, { useMemo, useState } from "react";
import "./InventoryThree.css";

/* ==========================================
   PREMIUM CUSTOM DROPDOWN
========================================== */

const InventoryThreeDropdown = ({
  value,
  options,
  onChange,
  icon,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={`InventoryThreeDropdown ${open ? "is-open" : ""}`}>
      <button
        type="button"
        className="InventoryThreeDropdownTrigger"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="InventoryThreeDropdownLeft">
          <span className="InventoryThreeDropdownIcon">{icon}</span>
          <span>{value}</span>
        </span>

        <svg
          className="InventoryThreeDropdownChevron"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <>
          <button
            type="button"
            className="InventoryThreeDropdownBackdrop"
            aria-label="Close dropdown"
            onClick={() => setOpen(false)}
          />

          <div className="InventoryThreeDropdownMenu">
            <div className="InventoryThreeDropdownMenuTitle">
              Select an option
            </div>

            {options.map((option) => (
              <button
                type="button"
                key={option}
                className={`InventoryThreeDropdownOption ${
                  value === option ? "selected" : ""
                }`}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
              >
                <span>{option}</span>

                {value === option && (
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="m5 12 5 5L20 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

/* ==========================================
   INITIAL PRODUCT DATA
========================================== */

const initialProducts = [
  {
    id: 1,
    name: "Basmati Rice 5kg",
    sku: "GRS-001",
    category: "Rice",
    stock: 124,
    reserved: 8,
    reorder: 25,
    price: 420,
    status: "In Stock",
    image: "/rice.jpg",
  },
  {
    id: 2,
    name: "Aashirvaad Atta 10kg",
    sku: "GRS-002",
    category: "Flour",
    stock: 18,
    reserved: 3,
    reorder: 30,
    price: 510,
    status: "Low Stock",
    image: "/atta.jpg",
  },
  {
    id: 3,
    name: "Amul Milk 1L",
    sku: "GRS-003",
    category: "Dairy",
    stock: 0,
    reserved: 0,
    reorder: 20,
    price: 68,
    status: "Out of Stock",
    image: "/milk.jpg",
  },
  {
    id: 4,
    name: "Fortune Sunflower Oil 1L",
    sku: "GRS-004",
    category: "Oil",
    stock: 64,
    reserved: 5,
    reorder: 15,
    price: 145,
    status: "In Stock",
    image: "/oil.jpg",
  },
  {
    id: 5,
    name: "Tata Salt 1kg",
    sku: "GRS-005",
    category: "Staples",
    stock: 9,
    reserved: 2,
    reorder: 20,
    price: 28,
    status: "Low Stock",
    image: "/salt.jpg",
  },
];

/* ==========================================
   MAIN COMPONENT
========================================== */

const InventoryThree = () => {
  const [products, setProducts] = useState(initialProducts);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("All Status");

  const [currentPage, setCurrentPage] = useState(1);
  const [openAction, setOpenAction] = useState(null);

  const [modal, setModal] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAllAlerts, setShowAllAlerts] = useState(false);

  const pageSize = 5;

  const emptyForm = {
    name: "",
    sku: "",
    category: "Rice",
    stock: "",
    reserved: "0",
    reorder: "",
    price: "",
    image: "",
  };

  const [form, setForm] = useState(emptyForm);

  const categories = [
    "All Categories",
    "Rice",
    "Flour",
    "Dairy",
    "Oil",
    "Staples",
  ];

  const statuses = [
    "All Status",
    "In Stock",
    "Low Stock",
    "Out of Stock",
  ];

  /* ==========================================
     FILTER PRODUCTS
  ========================================== */

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.sku.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "All Categories" ||
        product.category === category;

      const matchesStatus =
        status === "All Status" ||
        product.status === status;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [products, search, category, status]);

  /* ==========================================
     PAGINATION
  ========================================== */

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / pageSize)
  );

  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const changePage = (page) => {
    setCurrentPage(
      Math.min(Math.max(1, page), totalPages)
    );
    setOpenAction(null);
  };

  /* ==========================================
     PRODUCT STATUS
  ========================================== */

  const getStatus = (stock, reorder) => {
    if (Number(stock) <= 0) return "Out of Stock";

    if (Number(stock) <= Number(reorder)) {
      return "Low Stock";
    }

    return "In Stock";
  };

  const getStatusClass = (value) =>
    value.toLowerCase().replaceAll(" ", "-");

  /* ==========================================
     FORM HANDLING
  ========================================== */

  const updateForm = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openAddModal = () => {
    setSelectedProduct(null);
    setForm(emptyForm);
    setModal("add");
    setOpenAction(null);
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);

    setForm({
      name: product.name,
      sku: product.sku,
      category: product.category,
      stock: String(product.stock),
      reserved: String(product.reserved),
      reorder: String(product.reorder),
      price: String(product.price),
      image: product.image,
    });

    setOpenAction(null);
    setModal("edit");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const stock = Number(form.stock);
    const reorder = Number(form.reorder);

    const productData = {
      ...form,
      name: form.name.trim(),
      sku: form.sku.trim(),
      stock,
      reserved: Number(form.reserved),
      reorder,
      price: Number(form.price),
      image: form.image.trim() || "/rice.jpg",
      status: getStatus(stock, reorder),
    };

    if (modal === "edit" && selectedProduct) {
      setProducts((previous) =>
        previous.map((product) =>
          product.id === selectedProduct.id
            ? { ...product, ...productData }
            : product
        )
      );
    } else {
      setProducts((previous) => [
        {
          id: Date.now(),
          ...productData,
        },
        ...previous,
      ]);

      setCurrentPage(1);
    }

    setModal(null);
    setSelectedProduct(null);
  };

  /* ==========================================
     VIEW PRODUCT
  ========================================== */

  const openViewModal = (product) => {
    setSelectedProduct(product);
    setOpenAction(null);
    setModal("view");
  };

  /* ==========================================
     DELETE PRODUCT
  ========================================== */

  const handleDelete = (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${product.name}?`
    );

    if (!confirmed) return;

    setProducts((previous) =>
      previous.filter((item) => item.id !== product.id)
    );

    setOpenAction(null);
  };

  /* ==========================================
     EXPORT CSV
  ========================================== */

  const handleExport = () => {
    const headers = [
      "Product",
      "SKU",
      "Category",
      "Available Stock",
      "Reserved",
      "Reorder Level",
      "Selling Price",
      "Status",
    ];

    const rows = filteredProducts.map((product) => [
      product.name,
      product.sku,
      product.category,
      product.stock,
      product.reserved,
      product.reorder,
      product.price,
      product.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      ["\uFEFF" + csv],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "product-inventory.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  /* ==========================================
     AUTOMATIC STOCK ALERTS
  ========================================== */

  const alerts = products
    .filter((product) => product.status !== "In Stock")
    .map((product) => ({
      ...product,
      message:
        product.status === "Out of Stock"
          ? "Out of stock"
          : product.stock <= product.reorder / 2
            ? "Reorder soon"
            : "Below reorder level",

      quantity: `${product.stock} left`,

      type:
        product.status === "Out of Stock"
          ? "danger"
          : "warning",
    }));

  const displayedAlerts = showAllAlerts
    ? alerts
    : alerts.slice(0, 3);

  /* ==========================================
     IMAGE FALLBACK
  ========================================== */

  const handleImageError = (e, name) => {
    e.currentTarget.style.display = "none";

    const parent = e.currentTarget.parentElement;

    parent.classList.add("InventoryThreeImageFallback");

    parent.dataset.fallback = name.charAt(0).toUpperCase();
  };

  /* ==========================================
     RENDER
  ========================================== */

  return (
    <section className="InventoryThree">

      {/* MAIN INVENTORY CARD */}

      <div className="InventoryThreeMainCard">

        {/* HEADER */}

        <div className="InventoryThreeHeader">

          <div className="InventoryThreeTitle">

            <div className="InventoryThreeTitleIcon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2 21 7v10l-9 5-9-5V7l9-5Zm0 2.4L7 7.1l5 2.8 5-2.8-5-2.7Zm-7 4.4v7l6 3.3v-7L5 8.8Zm8 10.3 6-3.3v-7l-6 3.3v7Z" />
              </svg>
            </div>

            <h2>Product Inventory</h2>

          </div>

          <div className="InventoryThreeControls">

            {/* SEARCH */}

            <div className="InventoryThreeSearch">

              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="10.8" cy="10.8" r="6.8" />
                <path d="m16 16 5 5" />
              </svg>

              <input
                type="text"
                placeholder="Search product..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />

              {search && (
                <button
                  type="button"
                  className="InventoryThreeClearSearch"
                  onClick={() => {
                    setSearch("");
                    setCurrentPage(1);
                  }}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}

            </div>

            {/* CATEGORY DROPDOWN */}

            <InventoryThreeDropdown
              value={category}
              options={categories}
              icon="▦"
              onChange={(value) => {
                setCategory(value);
                setCurrentPage(1);
              }}
            />

            {/* STATUS DROPDOWN */}

            <InventoryThreeDropdown
              value={status}
              options={statuses}
              icon="◉"
              onChange={(value) => {
                setStatus(value);
                setCurrentPage(1);
              }}
            />

            {/* EXPORT */}

            <button
              type="button"
              className="InventoryThreeExportButton"
              onClick={handleExport}
            >
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
                <path d="M4 17v3h16v-3" />
              </svg>

              <span>Export</span>
            </button>

            {/* ADD PRODUCT */}

            <button
              type="button"
              className="InventoryThreeAddButton"
              onClick={openAddModal}
            >
              <span>+</span>
              Add Product
            </button>

          </div>

        </div>

        {/* TABLE */}

        <div className="InventoryThreeTableWrapper">

          <table className="InventoryThreeTable">

            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Available Stock</th>
                <th>Reserved</th>
                <th>Reorder Level</th>
                <th>Selling Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {currentProducts.length > 0 ? (
                currentProducts.map((product) => (
                  <tr key={product.id}>

                    {/* PRODUCT */}

                    <td className="InventoryThreeProductCell">

                      <div className="InventoryThreeProductInfo">

                        <div className="InventoryThreeProductImage">

                          <img
                            src={product.image}
                            alt={product.name}
                            onError={(e) =>
                              handleImageError(e, product.name)
                            }
                          />

                        </div>

                        <span>{product.name}</span>

                      </div>

                    </td>

                    <td>{product.sku}</td>

                    <td>{product.category}</td>

                    <td className="InventoryThreeNumber">
                      {product.stock}
                    </td>

                    <td className="InventoryThreeNumber">
                      {product.reserved}
                    </td>

                    <td className="InventoryThreeNumber">
                      {product.reorder}
                    </td>

                    <td className="InventoryThreePrice">
                      ₹{product.price.toLocaleString("en-IN")}
                    </td>

                    {/* STATUS */}

                    <td>

                      <span
                        className={`InventoryThreeStatus ${getStatusClass(
                          product.status
                        )}`}
                      >
                        <span className="InventoryThreeStatusDot" />
                        {product.status}
                      </span>

                    </td>

                    {/* ACTION MENU */}

                    <td className="InventoryThreeActionCell">

                      <button
                        type="button"
                        className="InventoryThreeActionButton"
                        aria-label={`Actions for ${product.name}`}
                        aria-expanded={openAction === product.id}
                        onClick={() =>
                          setOpenAction(
                            openAction === product.id
                              ? null
                              : product.id
                          )
                        }
                      >
                        ⋮
                      </button>

                      {openAction === product.id && (
                        <>
                          <button
                            type="button"
                            className="InventoryThreeMenuBackdrop"
                            aria-label="Close actions"
                            onClick={() => setOpenAction(null)}
                          />

                          <div className="InventoryThreeActionMenu">

                            <button
                              type="button"
                              onClick={() => openViewModal(product)}
                            >
                              <span>◉</span>
                              View
                            </button>

                            <button
                              type="button"
                              onClick={() => openEditModal(product)}
                            >
                              <span>✎</span>
                              Edit
                            </button>

                            <button
                              type="button"
                              className="InventoryThreeDeleteAction"
                              onClick={() => handleDelete(product)}
                            >
                              <span>⌫</span>
                              Delete
                            </button>

                          </div>
                        </>
                      )}

                    </td>

                  </tr>
                ))
              ) : (

                <tr>
                  <td colSpan="9" className="InventoryThreeEmpty">

                    <div>
                      <span>⌕</span>
                      <strong>No products found</strong>
                      <small>
                        Try changing your search or filters.
                      </small>
                    </div>

                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

        {/* FOOTER AND PAGINATION */}

        <div className="InventoryThreeTableFooter">

          <div className="InventoryThreeShowing">
            Showing{" "}
            {filteredProducts.length === 0
              ? 0
              : (currentPage - 1) * pageSize + 1}
            {" "}to{" "}
            {Math.min(
              currentPage * pageSize,
              filteredProducts.length
            )}
            {" "}of{" "}
            {filteredProducts.length.toLocaleString("en-IN")}
            {" "}products
          </div>

          <div className="InventoryThreePagination">

            <button
              type="button"
              className="InventoryThreePageArrow"
              disabled={currentPage === 1}
              onClick={() => changePage(currentPage - 1)}
            >
              ‹
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            )
              .filter(
                (page) =>
                  page <= 3 ||
                  page === currentPage ||
                  page === totalPages
              )
              .map((page, index, array) => (
                <React.Fragment key={page}>

                  {index > 0 &&
                    page - array[index - 1] > 1 && (
                      <span className="InventoryThreeDots">
                        ...
                      </span>
                    )}

                  <button
                    type="button"
                    className={
                      currentPage === page
                        ? "InventoryThreePageNumber active"
                        : "InventoryThreePageNumber"
                    }
                    onClick={() => changePage(page)}
                  >
                    {page}
                  </button>

                </React.Fragment>
              ))}

            <button
              type="button"
              className="InventoryThreePageArrow"
              disabled={currentPage === totalPages}
              onClick={() => changePage(currentPage + 1)}
            >
              ›
            </button>

          </div>

        </div>

      </div>

      {/* RIGHT SIDE STOCK ALERTS */}

      <aside className="InventoryThreeAlertsCard">

        <div className="InventoryThreeAlertsHeader">

          <div className="InventoryThreeAlertsTitle">
            <span className="InventoryThreeBell">🔔</span>
            <h2>Stock Alerts</h2>
          </div>

          <button
            type="button"
            className="InventoryThreeViewAlerts"
            onClick={() =>
              setShowAllAlerts((previous) => !previous)
            }
          >
            {showAllAlerts ? "Show less" : "View all alerts"}
            <span>→</span>
          </button>

        </div>

        <div className="InventoryThreeAlertsList">

          {displayedAlerts.length > 0 ? (

            displayedAlerts.map((alert) => (
              <div
                className="InventoryThreeAlertItem"
                key={alert.id}
              >

                <div className="InventoryThreeAlertImage">

                  <img
                    src={alert.image}
                    alt={alert.name}
                    onError={(e) =>
                      handleImageError(e, alert.name)
                    }
                  />

                </div>

                <div className="InventoryThreeAlertContent">

                  <h3>{alert.name}</h3>

                  <p className={alert.type}>
                    {alert.message}
                  </p>

                  <span>({alert.quantity})</span>

                </div>

              </div>
            ))

          ) : (

            <div className="InventoryThreeNoAlerts">
              <span>✓</span>
              <strong>All stock levels are healthy!</strong>
              <small>No products currently need attention.</small>
            </div>

          )}

        </div>

      </aside>

      {/* ADD / EDIT / VIEW MODAL */}

      {modal && (

        <div
          className="InventoryThreeModalOverlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setModal(null);
            }
          }}
        >

          <div className="InventoryThreeModal">

            <div className="InventoryThreeModalHeader">

              <div>
                <h2>
                  {modal === "add"
                    ? "Add New Product"
                    : modal === "edit"
                      ? "Edit Product"
                      : "Product Details"}
                </h2>

                <p>
                  {modal === "view"
                    ? "Review your product information."
                    : "Enter the product inventory details below."}
                </p>
              </div>

              <button
                type="button"
                className="InventoryThreeModalClose"
                onClick={() => setModal(null)}
              >
                ×
              </button>

            </div>

            {/* VIEW DETAILS */}

            {modal === "view" && selectedProduct ? (

              <div className="InventoryThreeViewDetails">

                <div className="InventoryThreeViewImage">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                  />
                </div>

                <h3>{selectedProduct.name}</h3>

                <span
                  className={`InventoryThreeStatus ${getStatusClass(
                    selectedProduct.status
                  )}`}
                >
                  <span className="InventoryThreeStatusDot" />
                  {selectedProduct.status}
                </span>

                <div className="InventoryThreeDetailGrid">

                  {[
                    ["SKU", selectedProduct.sku],
                    ["Category", selectedProduct.category],
                    ["Available Stock", selectedProduct.stock],
                    ["Reserved", selectedProduct.reserved],
                    ["Reorder Level", selectedProduct.reorder],
                    [
                      "Selling Price",
                      `₹${selectedProduct.price.toLocaleString("en-IN")}`,
                    ],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <span>{label}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}

                </div>

                <button
                  type="button"
                  className="InventoryThreeModalPrimary"
                  onClick={() => openEditModal(selectedProduct)}
                >
                  Edit Product
                </button>

              </div>

            ) : (

              /* ADD / EDIT FORM */

              <form
                className="InventoryThreeForm"
                onSubmit={handleSubmit}
              >

                <div className="InventoryThreeFormGrid">

                  <label>
                    Product Name
                    <input
                      name="name"
                      value={form.name}
                      onChange={updateForm}
                      placeholder="Enter product name"
                      required
                    />
                  </label>

                  <label>
                    SKU
                    <input
                      name="sku"
                      value={form.sku}
                      onChange={updateForm}
                      placeholder="e.g. GRS-006"
                      required
                    />
                  </label>

                  <label>
                    Category
                    <select
                      name="category"
                      value={form.category}
                      onChange={updateForm}
                    >
                      {categories.slice(1).map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Available Stock
                    <input
                      name="stock"
                      type="number"
                      min="0"
                      value={form.stock}
                      onChange={updateForm}
                      placeholder="Enter quantity"
                      required
                    />
                  </label>

                  <label>
                    Reserved Stock
                    <input
                      name="reserved"
                      type="number"
                      min="0"
                      value={form.reserved}
                      onChange={updateForm}
                      required
                    />
                  </label>

                  <label>
                    Reorder Level
                    <input
                      name="reorder"
                      type="number"
                      min="0"
                      value={form.reorder}
                      onChange={updateForm}
                      placeholder="Enter reorder level"
                      required
                    />
                  </label>

                  <label>
                    Selling Price (₹)
                    <input
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={updateForm}
                      placeholder="Enter price"
                      required
                    />
                  </label>

                  <label>
                    Product Image URL
                    <input
                      name="image"
                      value={form.image}
                      onChange={updateForm}
                      placeholder="/product.jpg"
                    />
                  </label>

                </div>

                <div className="InventoryThreeModalActions">

                  <button
                    type="button"
                    className="InventoryThreeCancelButton"
                    onClick={() => setModal(null)}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="InventoryThreeModalPrimary"
                  >
                    {modal === "edit"
                      ? "Save Changes"
                      : "Add Product"}
                  </button>

                </div>

              </form>

            )}

          </div>

        </div>

      )}

    </section>
  );
};

export default InventoryThree;
