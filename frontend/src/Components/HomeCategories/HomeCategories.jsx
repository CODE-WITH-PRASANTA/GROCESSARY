import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API, { BASE_URL } from "../../api/axios";
import "./HomeCategories.css";

// Fallback icon emojis matching admin categories
const DEFAULT_CATEGORY_ICONS = {
  "fresh fruits": "🍎",
  "fresh vegetables": "🥦",
  "dairy & breakfast": "🥛",
  "staples & grains": "🌾",
  "cooking oils & ghee": "🍾",
  "spices & masalas": "🌶️",
  "snacks & biscuits": "🍪",
  "beverages & tea": "☕",
  "organic & health foods": "🍃",
  "household & cleaning": "🧼",
};

const resolveCategoryIcon = (cat) => {
  // If an iconUrl image has been uploaded in admin
  if (cat.iconUrl) {
    const src = cat.iconUrl.startsWith("http")
      ? cat.iconUrl
      : `${BASE_URL}${cat.iconUrl.startsWith("/") ? "" : "/"}${cat.iconUrl}`;
    return { type: "image", src };
  }

  // If an image URL has been provided
  if (cat.image) {
    const src = cat.image.startsWith("http")
      ? cat.image
      : `${BASE_URL}${cat.image.startsWith("/") ? "" : "/"}${cat.image}`;
    return { type: "image", src };
  }

  // Use the icon from http://localhost:5174/products/categories
  if (cat.icon && typeof cat.icon === "string" && cat.icon.trim()) {
    return { type: "icon", symbol: cat.icon.trim() };
  }

  const key = (cat.name || "").toLowerCase().trim();
  const fallbackSymbol = DEFAULT_CATEGORY_ICONS[key] || "🛒";
  return { type: "icon", symbol: fallbackSymbol };
};

const HomeCategories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch only active categories with products from the database (as managed in admin panel)
      const res = await API.get("/categories?hasProducts=true");
      const list = res.data?.data || res.data?.categories || [];
      const activeList = Array.isArray(list)
        ? list.filter(
            (c) =>
              c.status !== "Inactive" &&
              (c.productCount === undefined || c.productCount > 0)
          )
        : [];
      setCategories(activeList);
    } catch (err) {
      console.error("Failed to load categories:", err);
      // Fallback matching http://localhost:5174/products/categories
      setCategories([
        { _id: "1", name: "Fresh Fruits", icon: "🍎", productCount: 8 },
        { _id: "2", name: "Fresh Vegetables", icon: "🥦", productCount: 8 },
        { _id: "3", name: "Dairy & Breakfast", icon: "🥛", productCount: 5 },
        { _id: "4", name: "Staples & Grains", icon: "🌾", productCount: 8 },
        { _id: "5", name: "Cooking Oils & Ghee", icon: "🍾", productCount: 5 },
        { _id: "6", name: "Spices & Masalas", icon: "🌶️", productCount: 5 },
        { _id: "7", name: "Snacks & Biscuits", icon: "🍪", productCount: 5 },
        { _id: "8", name: "Beverages & Tea", icon: "☕", productCount: 5 },
        { _id: "9", name: "Organic & Health Foods", icon: "🍃", productCount: 5 },
        { _id: "10", name: "Household & Cleaning", icon: "🧼", productCount: 5 },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();

    const handleSelectCategory = (e) => {
      if (e?.detail) {
        setActiveCategory(e.detail);
      }
    };
    window.addEventListener("selectCategory", handleSelectCategory);
    return () => window.removeEventListener("selectCategory", handleSelectCategory);
  }, [fetchCategories]);

  const handleCardClick = (cat) => {
    const targetSlug =
      cat.slug ||
      cat._id ||
      (cat.name ? cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "");

    navigate(`/category/${encodeURIComponent(targetSlug)}`);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  if (!loading && categories.length === 0) {
    return null;
  }

  return (
    <section className="home-cat-section" aria-label="Product Categories">
      <div className="home-cat-container">
        {/* NO HEADING - Only categories shown directly */}
        {loading ? (
          <div className="home-cat-grid">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="home-cat-skeleton-card">
                <div className="home-cat-skeleton-tile" />
                <div className="home-cat-skeleton-text" />
              </div>
            ))}
          </div>
        ) : (
          <div className="home-cat-grid">
            {categories.map((cat) => {
              const isSelected = activeCategory === cat.name;
              const iconData = resolveCategoryIcon(cat);

              return (
                <div
                  key={cat._id || cat.name}
                  className={`home-cat-card ${
                    isSelected ? "home-cat-card--active" : ""
                  }`}
                  onClick={() => handleCardClick(cat)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleCardClick(cat);
                    }
                  }}
                  aria-pressed={isSelected}
                  title={cat.name}
                >
                  {/* ROUNDED TILE CONTAINER */}
                  <div className="home-cat-tile">
                    {iconData.type === "image" ? (
                      <img
                        src={iconData.src}
                        alt={cat.name}
                        className="home-cat-img"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="home-cat-icon-symbol-box">
                        <span
                          className="home-cat-icon-symbol"
                          role="img"
                          aria-label={cat.name}
                        >
                          {iconData.symbol}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* CATEGORY LABEL UNDER TILE */}
                  <div className="home-cat-label-wrap">
                    <span className="home-cat-name">{cat.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeCategories;
