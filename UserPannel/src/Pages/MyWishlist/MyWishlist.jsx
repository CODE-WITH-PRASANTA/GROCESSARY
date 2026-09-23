import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHeart,
  FaShoppingCart,
  FaShareAlt,
  FaTrashAlt,
  FaChevronDown,
  FaShoppingBag,
} from "react-icons/fa";
import "./MyWishlist.css";
import API, { BASE_URL } from "../../api/axios";
import Swal from "sweetalert2";

const MyWishlist = () => {
  // ======================================================
  // STATE
  // ======================================================

  const [wishlistItems, setWishlistItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortOption, setSortOption] = useState("Recently Added");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);
  const navigate = useNavigate();

  // ======================================================
  // GET IMAGE
  // ======================================================

  const getProductImage = (product) => {
    const image = product?.images?.[0];

    if (!image) {
      return "/placeholder-product.png";
    }

    // Full URL
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    // Backend relative path
    return `${BASE_URL}${image.startsWith("/") ? image : `/${image}`}`;
  };

  // ======================================================
  // GET PRODUCT NAME
  // ======================================================

  const getProductName = (product) => {
    if (!product) {
      return "Product";
    }

    return product.productName || product.name || "Unnamed Product";
  };

  // ======================================================
  // GET PRODUCT DESCRIPTION
  // ======================================================

  const getProductDescription = (product) => {
    if (!product) {
      return "No description available";
    }

    return (
      product.shortDescription ||
      product.fullDescription ||
      "No description available"
    );
  };

  // ======================================================
  // GET PRODUCT WEIGHT / UNIT
  // ======================================================

  const getProductWeight = (product) => {
    if (!product) {
      return "";
    }

    /*
      Your Product schema contains:

      unitNo
      unit -> populated Unit document

      Depending on your Unit schema, the name could be:
      name / unitName / title / symbol
    */

    const quantity = product.unitNo || "";

    const unit = product.unit;

    if (typeof unit === "object" && unit !== null) {
      const unitName =
        unit.name ||
        unit.unitName ||
        unit.title ||
        unit.symbol ||
        unit.code ||
        "";

      if (quantity && unitName) {
        return `${quantity} ${unitName}`;
      }

      return unitName || quantity;
    }

    if (typeof unit === "string") {
      return quantity ? `${quantity} ${unit}` : unit;
    }

    return quantity ? `${quantity}` : "";
  };

  // ======================================================
  // GET UNIT PRICE
  // ======================================================

  const getUnitPrice = (product) => {
    if (!product) {
      return "";
    }

    const price =
      Number(product.discountPrice) > 0
        ? Number(product.discountPrice)
        : Number(product.price) || 0;

    const weight = getProductWeight(product);

    if (!price) {
      return "";
    }

    if (!weight) {
      return `₹${price}`;
    }

    return `₹${price}/${weight}`;
  };

  // ======================================================
  // GET PRODUCT PRICE
  // ======================================================

  const getProductPrice = (product) => {
    if (!product) {
      return 0;
    }

    /*
      If discountPrice exists and is greater than 0,
      show discount price.
    */

    if (
      product.discountPrice !== undefined &&
      Number(product.discountPrice) > 0
    ) {
      return Number(product.discountPrice);
    }

    return Number(product.price) || 0;
  };

  // ======================================================
  // FORMAT DATE
  // ======================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    try {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "-";
    }
  };

  // ======================================================
  // FETCH WISHLIST
  // ======================================================

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login to view your wishlist.");
        setWishlistItems([]);
        return;
      }

      const response = await API.get("/wishlist");

      console.log("Wishlist API response:", response.data);

      if (response.data?.success && Array.isArray(response.data?.wishlist)) {
        setWishlistItems(response.data.wishlist);
      } else {
        setWishlistItems([]);
        setError(response.data?.message || "Unable to fetch wishlist.");
      }
    } catch (error) {
      console.error("Fetch wishlist error:", error.response?.data || error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");

        setWishlistItems([]);
        setError("Session expired. Please login again.");
      } else {
        setWishlistItems([]);
        setError(error.response?.data?.message || "Failed to fetch wishlist.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    fetchWishlist();
  }, []);

  // ======================================================
  // SELECT ALL
  // ======================================================

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(wishlistItems.map((item) => item._id));
    } else {
      setSelectedIds([]);
    }
  };

  // ======================================================
  // SELECT ITEM
  // ======================================================

  const handleSelectItem = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((itemId) => itemId !== id);
      }

      return [...prev, id];
    });
  };

  // ======================================================
  // DELETE ITEM FROM WISHLIST
  // ======================================================

  const handleDeleteItem = async (id) => {
    try {
      const response = await API.delete(`/wishlist/${id}`);

      console.log("Remove wishlist response:", response.data);

      if (response.data?.success) {
        setWishlistItems((prev) => prev.filter((item) => item._id !== id));

        setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
      }
    } catch (error) {
      console.error("Remove wishlist error:", error.response?.data || error);

      alert(
        error.response?.data?.message ||
          "Failed to remove product from wishlist.",
      );
    }
  };

  // ======================================================
  // CLEAR ALL
  // ======================================================

  const handleClearAll = async () => {
    if (wishlistItems.length === 0) {
      return;
    }

    const shouldClear = window.confirm(
      "Are you sure you want to clear your wishlist?",
    );

    if (!shouldClear) {
      return;
    }

    try {
      /*
        Delete every wishlist item from backend.

        Your backend currently has DELETE:
        /wishlist/:productId

        So we use the populated product ID.
      */

      const deleteRequests = wishlistItems
        .map((item) => item.product?._id)
        .filter(Boolean)
        .map((productId) => API.delete(`/wishlist/${productId}`));

      await Promise.all(deleteRequests);

      setWishlistItems([]);
      setSelectedIds([]);
    } catch (error) {
      console.error("Clear wishlist error:", error.response?.data || error);

      alert(error.response?.data?.message || "Failed to clear wishlist.");

      /*
        Reload from database in case some
        products were deleted successfully.
      */
      fetchWishlist();
    }
  };

  // ======================================================
  // MOVE SELECTED TO CART
  // ======================================================

  const handleMoveToCart = () => {
    if (selectedIds.length === 0) {
      alert("Please select items to move to cart!");
      return;
    }

    /*
      Cart API is not provided in the current backend
      code, so this keeps your existing UI behavior.
    */

    alert(`${selectedIds.length} item(s) selected for cart.`);
  };

  // ======================================================
  // ADD SINGLE ITEM TO CART
  // ======================================================

  const handleAddToCart = async (item) => {
    try {
      const productId = item?.product?._id || item?.product;

      if (!productId) {
        Swal.fire({
          icon: "error",
          title: "Product not found",
          text: "Unable to add this product to cart.",
        });
        return;
      }

      const response = await API.post("/cart/add", {
        productId,
        quantity: 1,
      });

      if (response.data?.success) {
        await Swal.fire({
          icon: "success",
          title: "Added to Cart",
          text: "Product has been added to your cart.",
          showConfirmButton: false,
          timer: 1500,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Unable to Add",
          text: response.data?.message || "Failed to add product to cart.",
        });
      }
    } catch (error) {
      console.error("Add to cart error:", error);

      Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text: error.response?.data?.message || "Failed to add product to cart.",
      });
    }
  };
  // ======================================================
  // SHARE WISHLIST
  // ======================================================

  const handleShareWishlist = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "My Wishlist",
          text: "Check out my saved items on Wishlist!",
          url: window.location.href,
        })
        .catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => {
          alert("Wishlist link copied to clipboard!");
        })
        .catch(() => {
          alert("Unable to copy wishlist link.");
        });
    } else {
      alert("Wishlist sharing is not supported.");
    }
  };

  // ======================================================
  // SORT
  // ======================================================

  const handleSortChange = (e) => {
    const value = e.target.value;

    setSortOption(value);

    setWishlistItems((prev) => {
      const sorted = [...prev];

      if (value === "Recently Added") {
        sorted.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
        );
      } else if (value === "Price: Low to High") {
        sorted.sort(
          (a, b) => getProductPrice(a.product) - getProductPrice(b.product),
        );
      } else if (value === "Price: High to Low") {
        sorted.sort(
          (a, b) => getProductPrice(b.product) - getProductPrice(a.product),
        );
      } else if (value === "Name: A-Z") {
        sorted.sort((a, b) =>
          getProductName(a.product).localeCompare(getProductName(b.product)),
        );
      }

      return sorted;
    });
  };

  // ======================================================
  // ALL SELECTED
  // ======================================================

  const isAllSelected =
    wishlistItems.length > 0 && selectedIds.length === wishlistItems.length;

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="MyWishlist-container">
        <div className="MyWishlist-empty">
          <p>Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  // ======================================================
  // RETURN
  // ======================================================

  return (
    <div className="MyWishlist-container">
      {/* ==================================================
          TOP HEADER
      ================================================== */}

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
            <select
              id="wishlist-sort"
              value={sortOption}
              onChange={handleSortChange}
            >
              <option value="Recently Added">Recently Added</option>

              <option value="Price: Low to High">Price: Low to High</option>

              <option value="Price: High to Low">Price: High to Low</option>

              <option value="Name: A-Z">Name: A-Z</option>
            </select>

            <FaChevronDown className="MyWishlist-dropdown-icon" />
          </div>
        </div>
      </div>

      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="MyWishlist-empty">
          <p>{error}</p>
        </div>
      )}

      {/* ==================================================
          ACTION TOOLBAR
      ================================================== */}

      <div className="MyWishlist-toolbar">
        <label className="MyWishlist-checkbox-label">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={handleSelectAll}
            disabled={wishlistItems.length === 0}
          />

          <span className="MyWishlist-select-text">
            Select All ({wishlistItems.length})
          </span>
        </label>

        <div className="MyWishlist-action-btns">
          <button
            className="MyWishlist-btn move-cart"
            onClick={handleMoveToCart}
          >
            <FaShoppingCart />
            Move to Cart
          </button>

          <button
            className="MyWishlist-btn share-wishlist"
            onClick={handleShareWishlist}
          >
            <FaShareAlt />
            Share Wishlist
          </button>

          <button className="MyWishlist-btn clear-all" onClick={handleClearAll}>
            <FaTrashAlt />
            Clear All
          </button>
        </div>
      </div>

      {/* ==================================================
          ITEMS LIST
      ================================================== */}

      <div className="MyWishlist-list">
        {wishlistItems.length > 0 ? (
          wishlistItems.map((item) => {
            const product = item.product;

            /*
              Product could be null if the product
              was deleted from database.
            */

            if (!product) {
              return null;
            }

            const isSelected = selectedIds.includes(item._id);

            const productName = getProductName(product);

            const productImage = getProductImage(product);

            const productDescription = getProductDescription(product);

            const productWeight = getProductWeight(product);

            const productPrice = getProductPrice(product);

            const unitPrice = getUnitPrice(product);

            return (
              <div
                key={item._id}
                className={`MyWishlist-card ${isSelected ? "selected" : ""}`}
              >
                {/* ==================================================
                    LEFT
                ================================================== */}

                <div className="MyWishlist-card-left">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelectItem(item._id)}
                    className="MyWishlist-item-checkbox"
                  />

                  {/* ==================================================
                      PRODUCT IMAGE
                  ================================================== */}

                  <div className="MyWishlist-image-container">
                    {productImage ? (
                      <img
                        src={productImage}
                        alt={productName}
                        className="MyWishlist-item-img"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div
                        className="MyWishlist-item-img"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "28px",
                        }}
                      >
                        🛒
                      </div>
                    )}
                  </div>

                  {/* ==================================================
                      PRODUCT INFORMATION
                  ================================================== */}

                  <div className="MyWishlist-item-info">
                    <h3 className="MyWishlist-item-name">{productName}</h3>

                    {productWeight && (
                      <span className="MyWishlist-weight-badge">
                        {productWeight}
                      </span>
                    )}

                    <p className="MyWishlist-item-desc">{productDescription}</p>

                    <span className="MyWishlist-added-date">
                      Added on {formatDate(item.createdAt)}
                    </span>
                  </div>
                </div>

                {/* ==================================================
                    RIGHT
                ================================================== */}

                <div className="MyWishlist-card-right">
                  {/* DELETE */}

                  <button
                    className="MyWishlist-delete-btn"
                    onClick={() => handleDeleteItem(product._id)}
                    title="Remove item"
                  >
                    <FaTrashAlt />
                  </button>

                  {/* PRICE */}

                  <div className="MyWishlist-price-group">
                    <span className="MyWishlist-price">₹{productPrice}</span>

                    {/* {unitPrice && (
                      <span className="MyWishlist-unit-price">
                        {unitPrice}
                      </span>
                    )} */}
                  </div>

                  {/* ADD CART */}

                  <button
                    className="MyWishlist-add-cart-btn"
                    onClick={() => handleAddToCart(item)}
                  >
                    <FaShoppingCart />
                    Add to Cart
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

      {/* ==================================================
          PROMOTION BANNER
      ================================================== */}

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

        <button
          className="MyWishlist-shop-now-btn"
          onClick={() => alert("Redirecting to Store!")}
        >
          Shop Now
        </button>
      </div>
    </div>
  );
};

export default MyWishlist;
