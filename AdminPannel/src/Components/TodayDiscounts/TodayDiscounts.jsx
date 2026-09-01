import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiSearch,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiPower,
  FiCalendar,
  FiTag,
  FiPackage,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiChevronDown,
  FiRefreshCw,
} from "react-icons/fi";

import API, {
  IMG_URL,
} from "../../api/axios";

import "./TodayDiscounts.css";


// ======================================================
// HELPERS
// ======================================================

const getProductName = (product) => {
  if (!product) return "";

  return (
    product.productName ||
    product.name ||
    ""
  );
};

const getCategoryName = (category) => {
  if (!category) return "";

  if (typeof category === "string") {
    return category;
  }

  return (
    category.name ||
    ""
  );
};

const getBrandName = (brand) => {
  if (!brand) return "";

  if (typeof brand === "string") {
    return brand;
  }

  return (
    brand.name ||
    ""
  );
};

const getUnitName = (unit) => {
  if (!unit) return "";

  if (typeof unit === "string") {
    return unit;
  }

  return (
    unit.name ||
    ""
  );
};

const getProductImage = (product) => {
  if (!product) return "";

  const image =
    Array.isArray(product.images) &&
    product.images.length > 0
      ? product.images[0]
      : product.image || "";

  if (!image) {
    return "";
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  return `${IMG_URL}${image}`;
};

const formatDateForInput = (date) => {
  if (!date) return "";

  const parsed =
    new Date(date);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return "";
  }

  const year =
    parsed.getFullYear();

  const month = String(
    parsed.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    parsed.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsed =
    new Date(date);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return "—";
  }

  return parsed.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};


// ======================================================
// COMPONENT
// ======================================================

const TodayDiscounts = () => {
  // ====================================================
  // STATE
  // ====================================================

  const [
    discounts,
    setDiscounts,
  ] = useState([]);

  const [
    products,
    setProducts,
  ] = useState([]);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    productsLoading,
    setProductsLoading,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    deletingId,
    setDeletingId,
  ] = useState(null);

  const [
    togglingId,
    setTogglingId,
  ] = useState(null);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    isModalOpen,
    setIsModalOpen,
  ] = useState(false);

  const [
    editingDiscount,
    setEditingDiscount,
  ] = useState(null);

  const [
    selectedProduct,
    setSelectedProduct,
  ] = useState(null);

  const [
    productSearch,
    setProductSearch,
  ] = useState("");

  const [
    productDropdownOpen,
    setProductDropdownOpen,
  ] = useState(false);

  const [
    discountPrice,
    setDiscountPrice,
  ] = useState("");

  const [
    startDate,
    setStartDate,
  ] = useState("");

  const [
    endDate,
    setEndDate,
  ] = useState("");

  const [
    status,
    setStatus,
  ] = useState("active");


  // ====================================================
  // FETCH DISCOUNTS
  // ====================================================

  const fetchDiscounts =
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await API.get(
            "/today-discounts"
          );

        const data =
          response?.data?.data;

        setDiscounts(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (err) {
        console.error(
          "Fetch Today Discounts error:",
          err
        );

        setError(
          err?.response?.data
            ?.message ||
            "Failed to load Today Discounts."
        );

        setDiscounts([]);
      } finally {
        setLoading(false);
      }
    };


  // ====================================================
  // FETCH PRODUCTS
  // ====================================================

  const fetchProducts =
    async () => {
      try {
        setProductsLoading(true);

        /*
          Adjust this endpoint only if your
          existing product route is different.
        */

        const response =
          await API.get(
            "/products",
            {
              params: {
                page: 1,
                limit: 500,
                status: "active",
              },
            }
          );

        const responseData =
          response?.data;

        const productData =
          responseData?.data ||
          responseData?.products ||
          [];

        setProducts(
          Array.isArray(productData)
            ? productData
            : []
        );
      } catch (err) {
        console.error(
          "Fetch products error:",
          err
        );

        setProducts([]);
      } finally {
        setProductsLoading(
          false
        );
      }
    };


  // ====================================================
  // INITIAL LOAD
  // ====================================================

  useEffect(() => {
    fetchDiscounts();
    fetchProducts();
  }, []);


  // ====================================================
  // FILTER DISCOUNTS
  // ====================================================

  const filteredDiscounts =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return discounts;
      }

      return discounts.filter(
        (item) => {
          const product =
            item?.product;

          const productName =
            getProductName(
              product
            ).toLowerCase();

          const category =
            getCategoryName(
              product?.category
            ).toLowerCase();

          const brand =
            getBrandName(
              product?.brand
            ).toLowerCase();

          return (
            productName.includes(
              value
            ) ||
            category.includes(
              value
            ) ||
            brand.includes(
              value
            )
          );
        }
      );
    }, [
      discounts,
      search,
    ]);


  // ====================================================
  // FILTER PRODUCTS
  // ====================================================

  const filteredProducts =
    useMemo(() => {
      const value =
        productSearch
          .trim()
          .toLowerCase();

      let result =
        products.filter(
          (product) => {
            const productName =
              getProductName(
                product
              ).toLowerCase();

            const sku =
              String(
                product?.sku || ""
              ).toLowerCase();

            const category =
              getCategoryName(
                product?.category
              ).toLowerCase();

            return (
              productName.includes(
                value
              ) ||
              sku.includes(
                value
              ) ||
              category.includes(
                value
              )
            );
          }
        );

      // ==================================================
      // DON'T SHOW PRODUCTS ALREADY ADDED
      // ==================================================

      result =
        result.filter(
          (product) => {
            const alreadyAdded =
              discounts.some(
                (discount) => {
                  const discountProductId =
                    discount?.product?._id ||
                    discount?.product;

                  return (
                    String(
                      discountProductId
                    ) ===
                    String(
                      product?._id
                    ) &&
                    String(
                      editingDiscount?._id
                    ) !==
                      String(
                        discount?._id
                      )
                  );
                }
              );

            return !alreadyAdded;
          }
        );

      return result.slice(
        0,
        20
      );
    }, [
      products,
      productSearch,
      discounts,
      editingDiscount,
    ]);


  // ====================================================
  // OPEN ADD MODAL
  // ====================================================

  const handleOpenAdd =
    () => {
      setEditingDiscount(null);

      setSelectedProduct(
        null
      );

      setProductSearch("");

      setDiscountPrice("");

      setStartDate("");

      setEndDate("");

      setStatus("active");

      setProductDropdownOpen(
        false
      );

      setError("");

      setSuccess("");

      setIsModalOpen(true);
    };


  // ====================================================
  // OPEN EDIT MODAL
  // ====================================================

  const handleOpenEdit =
    (discount) => {
      const product =
        discount?.product;

      setEditingDiscount(
        discount
      );

      setSelectedProduct(
        product || null
      );

      setProductSearch(
        getProductName(
          product
        )
      );

      setDiscountPrice(
        discount?.discountPrice ??
          ""
      );

      setStartDate(
        formatDateForInput(
          discount?.startDate
        )
      );

      setEndDate(
        formatDateForInput(
          discount?.endDate
        )
      );

      setStatus(
        discount?.status ===
          "inactive"
          ? "inactive"
          : "active"
      );

      setProductDropdownOpen(
        false
      );

      setError("");

      setSuccess("");

      setIsModalOpen(true);
    };


  // ====================================================
  // CLOSE MODAL
  // ====================================================

  const handleCloseModal =
    () => {
      if (submitting) {
        return;
      }

      setIsModalOpen(false);

      setEditingDiscount(
        null
      );

      setSelectedProduct(
        null
      );

      setProductSearch("");

      setDiscountPrice("");

      setStartDate("");

      setEndDate("");

      setStatus("active");

      setProductDropdownOpen(
        false
      );

      setError("");
    };


  // ====================================================
  // SELECT PRODUCT
  // ====================================================

  const handleSelectProduct =
    (product) => {
      setSelectedProduct(
        product
      );

      setProductSearch(
        getProductName(
          product
        )
      );

      setProductDropdownOpen(
        false
      );

      // Automatically use current price
      // until admin changes it.

      if (
        !editingDiscount &&
        product?.price !==
          undefined
      ) {
        setDiscountPrice(
          product.price
        );
      }
    };


  // ====================================================
  // DISCOUNT PERCENTAGE
  // ====================================================

  const discountPercentage =
    useMemo(() => {
      if (
        !selectedProduct
      ) {
        return 0;
      }

      const original =
        Number(
          selectedProduct?.price ||
            0
        );

      const discounted =
        Number(
          discountPrice || 0
        );

      if (
        original <= 0 ||
        discounted < 0 ||
        discounted >= original
      ) {
        return 0;
      }

      return Math.round(
        ((original -
          discounted) /
          original) *
          100
      );
    }, [
      selectedProduct,
      discountPrice,
    ]);


  // ====================================================
  // SUBMIT
  // ====================================================

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      try {
        setError("");
        setSuccess("");

        // ==============================================
        // PRODUCT
        // ==============================================

        if (
          !selectedProduct?._id
        ) {
          setError(
            "Please select a product."
          );

          return;
        }

        // ==============================================
        // PRICE
        // ==============================================

        const finalPrice =
          Number(
            discountPrice
          );

        const originalPrice =
          Number(
            selectedProduct?.price ||
              0
          );

        if (
          !Number.isFinite(
            finalPrice
          ) ||
          finalPrice < 0
        ) {
          setError(
            "Please enter a valid discount price."
          );

          return;
        }

        if (
          finalPrice >
          originalPrice
        ) {
          setError(
            "Discount price cannot be greater than the product price."
          );

          return;
        }

        // ==============================================
        // DATES
        // ==============================================

        if (!startDate) {
          setError(
            "Please select a start date."
          );

          return;
        }

        if (!endDate) {
          setError(
            "Please select an end date."
          );

          return;
        }

        if (
          new Date(endDate) <
          new Date(startDate)
        ) {
          setError(
            "End date cannot be before start date."
          );

          return;
        }

        // ==============================================
        // REQUEST
        // ==============================================

        setSubmitting(true);

        const payload = {
          productId:
            selectedProduct._id,

          discountPrice:
            finalPrice,

          startDate,

          endDate,

          status,
        };

        let response;

        if (
          editingDiscount?._id
        ) {
          response =
            await API.put(
              `/today-discounts/${editingDiscount._id}`,
              payload
            );
        } else {
          response =
            await API.post(
              "/today-discounts",
              payload
            );
        }

        // ==============================================
        // SUCCESS
        // ==============================================

        setSuccess(
          response?.data?.message ||
            (
              editingDiscount
                ? "Today Discount updated successfully."
                : "Today Discount added successfully."
            )
        );

        await fetchDiscounts();

        setTimeout(() => {
          handleCloseModal();
        }, 700);
      } catch (err) {
        console.error(
          "Save Today Discount error:",
          err
        );

        setError(
          err?.response?.data
            ?.message ||
            "Failed to save Today Discount."
        );
      } finally {
        setSubmitting(false);
      }
    };


  // ====================================================
  // DELETE
  // ====================================================

  const handleDelete =
    async (id) => {
      if (!id) return;

      const confirmed =
        window.confirm(
          "Are you sure you want to delete this Today Discount?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setDeletingId(id);

        setError("");

        setSuccess("");

        await API.delete(
          `/today-discounts/${id}`
        );

        setSuccess(
          "Today Discount deleted successfully."
        );

        await fetchDiscounts();
      } catch (err) {
        console.error(
          "Delete Today Discount error:",
          err
        );

        setError(
          err?.response?.data
            ?.message ||
            "Failed to delete Today Discount."
        );
      } finally {
        setDeletingId(null);
      }
    };


  // ====================================================
  // TOGGLE
  // ====================================================

  const handleToggle =
    async (id) => {
      if (!id) return;

      try {
        setTogglingId(id);

        setError("");

        setSuccess("");

        const response =
          await API.put(
            `/today-discounts/${id}/toggle-status`
          );

        setSuccess(
          response?.data?.message ||
            "Status updated successfully."
        );

        await fetchDiscounts();
      } catch (err) {
        console.error(
          "Toggle Today Discount error:",
          err
        );

        setError(
          err?.response?.data
            ?.message ||
            "Failed to update status."
        );
      } finally {
        setTogglingId(null);
      }
    };


  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="TodayDiscounts">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="TodayDiscounts-header">

        <div className="TodayDiscounts-heading">

          <div className="TodayDiscounts-heading-icon">
            <FiTag />
          </div>

          <div>
            <span className="TodayDiscounts-eyebrow">
              PROMOTIONS
            </span>

            <h1 className="TodayDiscounts-title">
              Today Discounts
            </h1>

            <p className="TodayDiscounts-subtitle">
              Manage products featured in
              your Today's Deals section.
            </p>
          </div>

        </div>

        <button
          type="button"
          className="TodayDiscounts-add-button"
          onClick={
            handleOpenAdd
          }
        >
          <FiPlus />
          <span>
            Add Discount
          </span>
        </button>

      </div>


      {/* ==================================================
          NOTIFICATIONS
      ================================================== */}

      {success && (
        <div className="TodayDiscounts-alert TodayDiscounts-alert--success">
          <FiCheck />

          <span>
            {success}
          </span>

          <button
            type="button"
            onClick={() =>
              setSuccess("")
            }
          >
            <FiX />
          </button>
        </div>
      )}

      {error && !isModalOpen && (
        <div className="TodayDiscounts-alert TodayDiscounts-alert--error">
          <FiAlertCircle />

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
          >
            <FiX />
          </button>
        </div>
      )}


      {/* ==================================================
          TOOLBAR
      ================================================== */}

      <div className="TodayDiscounts-toolbar">

        <div className="TodayDiscounts-search">

          <FiSearch />

          <input
            type="text"
            placeholder="Search discounts by product, category or brand..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

          {search && (
            <button
              type="button"
              onClick={() =>
                setSearch("")
              }
            >
              <FiX />
            </button>
          )}

        </div>

        <button
          type="button"
          className="TodayDiscounts-refresh"
          onClick={
            fetchDiscounts
          }
          disabled={loading}
        >
          <FiRefreshCw
            className={
              loading
                ? "TodayDiscounts-spin"
                : ""
            }
          />

          <span>
            Refresh
          </span>
        </button>

      </div>


      {/* ==================================================
          STATS
      ================================================== */}

      <div className="TodayDiscounts-stats">

        <div className="TodayDiscounts-stat-card">

          <div className="TodayDiscounts-stat-icon">
            <FiTag />
          </div>

          <div>
            <span>
              Total Discounts
            </span>

            <strong>
              {discounts.length}
            </strong>
          </div>

        </div>


        <div className="TodayDiscounts-stat-card">

          <div className="TodayDiscounts-stat-icon TodayDiscounts-stat-icon--green">
            <FiCheck />
          </div>

          <div>
            <span>
              Active
            </span>

            <strong>
              {
                discounts.filter(
                  (item) =>
                    item?.status ===
                    "active"
                ).length
              }
            </strong>
          </div>

        </div>


        <div className="TodayDiscounts-stat-card">

          <div className="TodayDiscounts-stat-icon TodayDiscounts-stat-icon--orange">
            <FiCalendar />
          </div>

          <div>
            <span>
              Scheduled
            </span>

            <strong>
              {
                discounts.filter(
                  (item) =>
                    item?.startDate &&
                    new Date(
                      item.startDate
                    ) >
                      new Date()
                ).length
              }
            </strong>
          </div>

        </div>


        <div className="TodayDiscounts-stat-card">

          <div className="TodayDiscounts-stat-icon TodayDiscounts-stat-icon--purple">
            <FiPackage />
          </div>

          <div>
            <span>
              Products
            </span>

            <strong>
              {products.length}
            </strong>
          </div>

        </div>

      </div>


      {/* ==================================================
          TABLE
      ================================================== */}

      <div className="TodayDiscounts-card">

        <div className="TodayDiscounts-card-header">

          <div>
            <h2>
              Discount Products
            </h2>

            <p>
              {filteredDiscounts.length}
              {" "}
              {filteredDiscounts.length ===
              1
                ? "product"
                : "products"}{" "}
              found
            </p>
          </div>

        </div>


        {loading ? (
          <div className="TodayDiscounts-loading">

            <div className="TodayDiscounts-loader" />

            <span>
              Loading discounts...
            </span>

          </div>
        ) : filteredDiscounts.length ===
          0 ? (
          <div className="TodayDiscounts-empty">

            <div className="TodayDiscounts-empty-icon">
              <FiTag />
            </div>

            <h3>
              No Today Discounts
            </h3>

            <p>
              Add your first discounted
              product to feature it on
              the homepage.
            </p>

            <button
              type="button"
              onClick={
                handleOpenAdd
              }
            >
              <FiPlus />
              Add Discount
            </button>

          </div>
        ) : (
          <div className="TodayDiscounts-table-wrap">

            <table className="TodayDiscounts-table">

              <thead>
                <tr>
                  <th>
                    Product
                  </th>

                  <th>
                    Category
                  </th>

                  <th>
                    Pricing
                  </th>

                  <th>
                    Discount
                  </th>

                  <th>
                    Duration
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

                {filteredDiscounts.map(
                  (item) => {
                    const product =
                      item?.product;

                    const originalPrice =
                      Number(
                        product?.price ||
                          0
                      );

                    const salePrice =
                      Number(
                        item?.discountPrice ||
                          0
                      );

                    const percentage =
                      originalPrice >
                        0 &&
                      salePrice <
                        originalPrice
                        ? Math.round(
                            ((originalPrice -
                              salePrice) /
                              originalPrice) *
                              100
                          )
                        : 0;

                    return (
                      <tr
                        key={
                          item?._id
                        }
                      >

                        {/* PRODUCT */}

                        <td>

                          <div className="TodayDiscounts-product">

                            <div className="TodayDiscounts-product-image">

                              {getProductImage(
                                product
                              ) ? (
                                <img
                                  src={getProductImage(
                                    product
                                  )}
                                  alt={getProductName(
                                    product
                                  )}
                                />
                              ) : (
                                <FiPackage />
                              )}

                            </div>

                            <div className="TodayDiscounts-product-info">

                              <strong>
                                {getProductName(
                                  product
                                )}
                              </strong>

                              <span>
                                SKU:{" "}
                                {product?.sku ||
                                  "—"}
                              </span>

                              {getBrandName(
                                product?.brand
                              ) && (
                                <small>
                                  {getBrandName(
                                    product?.brand
                                  )}
                                </small>
                              )}

                            </div>

                          </div>

                        </td>


                        {/* CATEGORY */}

                        <td>

                          <span className="TodayDiscounts-category">
                            {getCategoryName(
                              product?.category
                            ) ||
                              "Uncategorized"}
                          </span>

                        </td>


                        {/* PRICING */}

                        <td>

                          <div className="TodayDiscounts-pricing">

                            <strong>
                              ₹
                              {salePrice.toLocaleString(
                                "en-IN"
                              )}
                            </strong>

                            <del>
                              ₹
                              {originalPrice.toLocaleString(
                                "en-IN"
                              )}
                            </del>

                          </div>

                        </td>


                        {/* DISCOUNT */}

                        <td>

                          <span className="TodayDiscounts-discount-badge">
                            {percentage}%
                            OFF
                          </span>

                        </td>


                        {/* DURATION */}

                        <td>

                          <div className="TodayDiscounts-duration">

                            <span>
                              {formatDate(
                                item?.startDate
                              )}
                            </span>

                            <FiChevronDown />

                            <span>
                              {formatDate(
                                item?.endDate
                              )}
                            </span>

                          </div>

                        </td>


                        {/* STATUS */}

                        <td>

                          <button
                            type="button"
                            className={`TodayDiscounts-status TodayDiscounts-status--${
                              item?.status ===
                              "active"
                                ? "active"
                                : "inactive"
                            }`}
                            onClick={() =>
                              handleToggle(
                                item?._id
                              )
                            }
                            disabled={
                              togglingId ===
                              item?._id
                            }
                          >
                            <span />

                            {item?.status ===
                            "active"
                              ? "Active"
                              : "Inactive"}
                          </button>

                        </td>


                        {/* ACTIONS */}

                        <td>

                          <div className="TodayDiscounts-actions">

                            <button
                              type="button"
                              className="TodayDiscounts-action TodayDiscounts-action--edit"
                              onClick={() =>
                                handleOpenEdit(
                                  item
                                )
                              }
                              title="Edit"
                            >
                              <FiEdit2 />
                            </button>

                            <button
                              type="button"
                              className="TodayDiscounts-action TodayDiscounts-action--toggle"
                              onClick={() =>
                                handleToggle(
                                  item?._id
                                )
                              }
                              disabled={
                                togglingId ===
                                item?._id
                              }
                              title={
                                item?.status ===
                                "active"
                                  ? "Deactivate"
                                  : "Activate"
                              }
                            >
                              <FiPower />
                            </button>

                            <button
                              type="button"
                              className="TodayDiscounts-action TodayDiscounts-action--delete"
                              onClick={() =>
                                handleDelete(
                                  item?._id
                                )
                              }
                              disabled={
                                deletingId ===
                                item?._id
                              }
                              title="Delete"
                            >
                              {deletingId ===
                              item?._id ? (
                                <span className="TodayDiscounts-mini-spinner" />
                              ) : (
                                <FiTrash2 />
                              )}
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>
        )}

      </div>


      {/* ==================================================
          MODAL
      ================================================== */}

      {isModalOpen && (
        <div
          className="TodayDiscounts-modal-overlay"
          onMouseDown={(
            event
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              handleCloseModal();
            }
          }}
        >

          <div className="TodayDiscounts-modal">

            {/* MODAL HEADER */}

            <div className="TodayDiscounts-modal-header">

              <div>

                <span className="TodayDiscounts-modal-eyebrow">
                  PROMOTION MANAGEMENT
                </span>

                <h2>
                  {editingDiscount
                    ? "Edit Today Discount"
                    : "Add Today Discount"}
                </h2>

                <p>
                  Select a product and
                  configure its promotional
                  pricing.
                </p>

              </div>

              <button
                type="button"
                className="TodayDiscounts-modal-close"
                onClick={
                  handleCloseModal
                }
                disabled={
                  submitting
                }
              >
                <FiX />
              </button>

            </div>


            {/* MODAL ALERT */}

            {error && (
              <div className="TodayDiscounts-modal-alert">

                <FiAlertCircle />

                <span>
                  {error}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setError("")
                  }
                >
                  <FiX />
                </button>

              </div>
            )}


            {/* FORM */}

            <form
              className="TodayDiscounts-form"
              onSubmit={
                handleSubmit
              }
            >

              {/* PRODUCT */}

              <div className="TodayDiscounts-field">

                <label>
                  Product
                  <span>*</span>
                </label>

                <div className="TodayDiscounts-product-select">

                  <div className="TodayDiscounts-product-search">

                    <FiSearch />

                    <input
                      type="text"
                      placeholder="Search product by name, SKU or category..."
                      value={
                        productSearch
                      }
                      onFocus={() =>
                        setProductDropdownOpen(
                          true
                        )
                      }
                      onChange={(
                        event
                      ) => {
                        setProductSearch(
                          event.target
                            .value
                        );

                        setProductDropdownOpen(
                          true
                        );

                        if (
                          selectedProduct &&
                          event.target
                            .value !==
                            getProductName(
                              selectedProduct
                            )
                        ) {
                          setSelectedProduct(
                            null
                          );
                        }
                      }}
                      disabled={
                        Boolean(
                          editingDiscount
                        )
                      }
                    />

                    {productSearch && (
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            !editingDiscount
                          ) {
                            setProductSearch(
                              ""
                            );

                            setSelectedProduct(
                              null
                            );
                          }
                        }}
                      >
                        <FiX />
                      </button>
                    )}

                  </div>


                  {productDropdownOpen &&
                    !editingDiscount && (
                      <div className="TodayDiscounts-product-dropdown">

                        {productsLoading ? (
                          <div className="TodayDiscounts-dropdown-loading">

                            <div className="TodayDiscounts-mini-loader" />

                            Loading products...

                          </div>
                        ) : filteredProducts.length ===
                          0 ? (
                          <div className="TodayDiscounts-dropdown-empty">

                            <FiPackage />

                            <span>
                              No available
                              products found.
                            </span>

                          </div>
                        ) : (
                          filteredProducts.map(
                            (
                              product
                            ) => (
                              <button
                                type="button"
                                key={
                                  product?._id
                                }
                                className="TodayDiscounts-product-option"
                                onClick={() =>
                                  handleSelectProduct(
                                    product
                                  )
                                }
                              >

                                <div className="TodayDiscounts-option-image">

                                  {getProductImage(
                                    product
                                  ) ? (
                                    <img
                                      src={getProductImage(
                                        product
                                      )}
                                      alt=""
                                    />
                                  ) : (
                                    <FiPackage />
                                  )}

                                </div>

                                <div className="TodayDiscounts-option-info">

                                  <strong>
                                    {getProductName(
                                      product
                                    )}
                                  </strong>

                                  <span>
                                    {getCategoryName(
                                      product?.category
                                    ) ||
                                      "Uncategorized"}
                                    {" • "}
                                    SKU:{" "}
                                    {product?.sku ||
                                      "—"}
                                  </span>

                                </div>

                                <div className="TodayDiscounts-option-price">
                                  ₹
                                  {Number(
                                    product?.price ||
                                      0
                                  ).toLocaleString(
                                    "en-IN"
                                  )}
                                </div>

                              </button>
                            )
                          )
                        )}

                      </div>
                    )}

                </div>

                {/* SELECTED PRODUCT */}

                {selectedProduct && (
                  <div className="TodayDiscounts-selected-product">

                    <div className="TodayDiscounts-selected-image">

                      {getProductImage(
                        selectedProduct
                      ) ? (
                        <img
                          src={getProductImage(
                            selectedProduct
                          )}
                          alt={getProductName(
                            selectedProduct
                          )}
                        />
                      ) : (
                        <FiPackage />
                      )}

                    </div>

                    <div className="TodayDiscounts-selected-info">

                      <strong>
                        {getProductName(
                          selectedProduct
                        )}
                      </strong>

                      <span>
                        {
                          getCategoryName(
                            selectedProduct?.category
                          )
                        }
                        {" • "}
                        {
                          getUnitName(
                            selectedProduct?.unit
                          )
                        }
                      </span>

                    </div>

                    <div className="TodayDiscounts-selected-price">

                      <span>
                        Original
                      </span>

                      <strong>
                        ₹
                        {Number(
                          selectedProduct?.price ||
                            0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </strong>

                    </div>

                  </div>
                )}

              </div>


              {/* PRICE */}

              <div className="TodayDiscounts-form-grid">

                <div className="TodayDiscounts-field">

                  <label>
                    Discount Price
                    <span>*</span>
                  </label>

                  <div className="TodayDiscounts-input-prefix">

                    <span>
                      ₹
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Enter discount price"
                      value={
                        discountPrice
                      }
                      onChange={(
                        event
                      ) =>
                        setDiscountPrice(
                          event.target
                            .value
                        )
                      }
                      disabled={
                        !selectedProduct
                      }
                    />

                  </div>

                  {selectedProduct && (
                    <div className="TodayDiscounts-price-helper">

                      <span>
                        Original: ₹
                        {Number(
                          selectedProduct?.price ||
                            0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </span>

                      <strong>
                        {discountPercentage}%
                        OFF
                      </strong>

                    </div>
                  )}

                </div>


                {/* STATUS */}

                <div className="TodayDiscounts-field">

                  <label>
                    Status
                  </label>

                  <div className="TodayDiscounts-status-select">

                    <select
                      value={
                        status
                      }
                      onChange={(
                        event
                      ) =>
                        setStatus(
                          event.target
                            .value
                        )
                      }
                    >
                      <option value="active">
                        Active
                      </option>

                      <option value="inactive">
                        Inactive
                      </option>
                    </select>

                    <FiChevronDown />

                  </div>

                </div>

              </div>


              {/* DATES */}

              <div className="TodayDiscounts-form-grid">

                <div className="TodayDiscounts-field">

                  <label>
                    Start Date
                    <span>*</span>
                  </label>

                  <div className="TodayDiscounts-input-icon">

                    <FiCalendar />

                    <input
                      type="date"
                      value={
                        startDate
                      }
                      onChange={(
                        event
                      ) =>
                        setStartDate(
                          event.target
                            .value
                        )
                      }
                    />

                  </div>

                </div>


                <div className="TodayDiscounts-field">

                  <label>
                    End Date
                    <span>*</span>
                  </label>

                  <div className="TodayDiscounts-input-icon">

                    <FiCalendar />

                    <input
                      type="date"
                      value={
                        endDate
                      }
                      onChange={(
                        event
                      ) =>
                        setEndDate(
                          event.target
                            .value
                        )
                      }
                    />

                  </div>

                </div>

              </div>


              {/* PREVIEW */}

              {selectedProduct && (
                <div className="TodayDiscounts-preview">

                  <div className="TodayDiscounts-preview-heading">

                    <span>
                      LIVE PREVIEW
                    </span>

                    <FiTag />

                  </div>

                  <div className="TodayDiscounts-preview-content">

                    <div className="TodayDiscounts-preview-image">

                      {getProductImage(
                        selectedProduct
                      ) ? (
                        <img
                          src={getProductImage(
                            selectedProduct
                          )}
                          alt=""
                        />
                      ) : (
                        <FiPackage />
                      )}

                    </div>

                    <div className="TodayDiscounts-preview-info">

                      <span>
                        {getCategoryName(
                          selectedProduct?.category
                        )}
                      </span>

                      <h3>
                        {getProductName(
                          selectedProduct
                        )}
                      </h3>

                      <div>

                        <strong>
                          ₹
                          {Number(
                            discountPrice ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>

                        <del>
                          ₹
                          {Number(
                            selectedProduct?.price ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </del>

                      </div>

                    </div>

                    {discountPercentage >
                      0 && (
                      <span className="TodayDiscounts-preview-badge">
                        {discountPercentage}%
                        OFF
                      </span>
                    )}

                  </div>

                </div>
              )}


              {/* ACTIONS */}

              <div className="TodayDiscounts-form-actions">

                <button
                  type="button"
                  className="TodayDiscounts-cancel"
                  onClick={
                    handleCloseModal
                  }
                  disabled={
                    submitting
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="TodayDiscounts-submit"
                  disabled={
                    submitting ||
                    !selectedProduct
                  }
                >

                  {submitting ? (
                    <>
                      <span className="TodayDiscounts-button-spinner" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiCheck />

                      {editingDiscount
                        ? "Update Discount"
                        : "Add Discount"}
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};

export default TodayDiscounts;