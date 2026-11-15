import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import API, { BASE_URL } from "../../api/axios";
import { addToCart } from "../../Utils/cartService";
import { Plus, Check, Clock, Sparkles, ShoppingBag } from "lucide-react";
import Swal from "sweetalert2";
import formatUnit from "../../Utils/formatUnit";
import "./CartRelatedProducts.css";

const resolveImage = (rawImage) => {
  if (!rawImage) return "";
  if (typeof rawImage !== "string") return "";
  if (rawImage.startsWith("http://") || rawImage.startsWith("https://")) {
    return rawImage;
  }
  const cleanPath = rawImage.startsWith("/") ? rawImage : `/${rawImage}`;
  const base = BASE_URL || "http://localhost:5000";
  return `${base}${cleanPath}`;
};

const CartRelatedProducts = ({ cartItems = [], onItemAdded }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);

  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/products?limit=100");
      const all = data?.data?.products || data?.products || data?.data || [];

      if (!Array.isArray(all) || all.length === 0) {
        setRecommendations([]);
        return;
      }

      // Collect IDs and categories currently in the cart
      const cartIds = new Set(
        cartItems.map((item) => String(item.id || item.productId || ""))
      );

      const cartCategories = new Set(
        cartItems
          .map((item) => {
            if (typeof item.category === "string") return item.category.toLowerCase().trim();
            if (item.category?.name) return item.category.name.toLowerCase().trim();
            return "";
          })
          .filter(Boolean)
      );

      // Filter out products already in the cart
      const candidates = all.filter(
        (p) => !cartIds.has(String(p._id || p.id))
      );

      // Separate into same-category matches vs other popular items
      const categoryMatches = [];
      const others = [];

      candidates.forEach((p) => {
        const catName = (
          p.category?.name ||
          p.categoryName ||
          (typeof p.category === "string" ? p.category : "")
        )
          .toLowerCase()
          .trim();

        if (cartCategories.has(catName)) {
          categoryMatches.push(p);
        } else {
          others.push(p);
        }
      });

      // Combine priority matches with other store items (up to 4-6 items)
      const selected = [...categoryMatches, ...others].slice(0, 4);
      setRecommendations(selected);
    } catch (err) {
      console.error("Failed to load cart recommendations:", err);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, [cartItems]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handleAdd = async (product) => {
    const pid = String(product._id || product.id);
    setAddingId(pid);
    try {
      const res = await addToCart(product, 1);
      if (res?.success) {
        if (typeof onItemAdded === "function") {
          onItemAdded();
        }
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: `${product.productName || product.name} added!`,
          showConfirmButton: false,
          timer: 1600,
          timerProgressBar: true,
        });
      }
    } finally {
      setTimeout(() => setAddingId(null), 1200);
    }
  };

  if (!loading && recommendations.length === 0) {
    return null;
  }

  return (
    <div className="cart-related-card" aria-label="Frequently Added Together">
      <div className="cart-related-header">
        <div className="cart-related-title-wrap">
          <div className="cart-related-tag">
            <Sparkles size={12} />
            <span>QUICK ADDITIONS</span>
          </div>
          <h3 className="cart-related-title">Frequently Added Together</h3>
          <p className="cart-related-sub">
            Fresh picks that pair nicely with items in your cart
          </p>
        </div>
      </div>

      <div className="cart-related-grid">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="cart-related-item-skeleton">
                <div className="cart-rel-skel-img" />
                <div className="cart-rel-skel-info">
                  <div className="cart-rel-skel-line" />
                  <div className="cart-rel-skel-line short" />
                </div>
              </div>
            ))
          : recommendations.map((p) => {
              const pid = String(p._id || p.id);
              const name = p.productName || p.name || "Grocery Item";
              const price = Number(p.price) || 0;
              const discountPrice = Number(p.discountPrice) || 0;
              const effectivePrice =
                discountPrice > 0 && discountPrice < price
                  ? discountPrice
                  : price;
              const unit = formatUnit(p.unit, p.unitNo);
              const imgUrl = resolveImage(
                (p.images && p.images[0]) || p.image
              );
              const isAdding = addingId === pid;

              return (
                <div key={pid} className="cart-related-item">
                  <Link
                    to={`/product/${p.slug || pid}`}
                    className="cart-related-img-link"
                  >
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={name}
                        className="cart-related-img"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="cart-related-noimg">
                        <ShoppingBag size={20} />
                      </div>
                    )}
                  </Link>

                  <div className="cart-related-details">
                    <span className="cart-related-unit">
                      <Clock size={10} /> 10 MINS • {unit}
                    </span>
                    <Link
                      to={`/product/${p.slug || pid}`}
                      className="cart-related-name"
                      title={name}
                    >
                      {name}
                    </Link>

                    <div className="cart-related-bottom-row">
                      <div className="cart-related-price-box">
                        <span className="cart-related-curr">
                          ₹{effectivePrice}
                        </span>
                        {discountPrice > 0 && discountPrice < price && (
                          <span className="cart-related-orig">₹{price}</span>
                        )}
                      </div>

                      <button
                        type="button"
                        className={`cart-related-add-btn ${
                          isAdding ? "added" : ""
                        }`}
                        onClick={() => handleAdd(p)}
                        disabled={p.stockQuantity === 0 || isAdding}
                        aria-label={`Add ${name} to cart`}
                      >
                        {isAdding ? (
                          <>
                            <Check size={12} />
                            <span>ADDED</span>
                          </>
                        ) : p.stockQuantity === 0 ? (
                          "OUT"
                        ) : (
                          <>
                            <Plus size={12} />
                            <span>ADD</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
};

export default CartRelatedProducts;
