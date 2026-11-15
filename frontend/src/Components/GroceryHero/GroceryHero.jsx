import React, { useState, useEffect, useCallback } from "react";
import API, { BASE_URL } from "../../api/axios";
import "./GroceryHero.css";
import {
  Ticket,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  ShoppingBag,
  Clock,
  Leaf,
} from "lucide-react";

// Helper to resolve absolute or relative image URLs
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

// Curated themes & meta tailored strictly to active database categories
const CATEGORY_THEMES = {
  "dairy & breakfast": {
    themeClass: "promo-card--dairy",
    badge: "⚡ 10 MINS",
    defaultTitle: "Fresh Dairy & Morning Essentials",
    defaultSubtitle: "Eggs, farm milk, butter, curd & whole wheat bread",
  },
  "snacks & biscuits": {
    themeClass: "promo-card--snacks",
    badge: "🍪 TEA-TIME BITES",
    defaultTitle: "Crunchy Snacks & Munchies",
    defaultSubtitle: "Dark Fantasy, potato crisps & delicious cookies",
  },
  "fresh fruits": {
    themeClass: "promo-card--fruits",
    badge: "🍎 100% FARM FRESH",
    defaultTitle: "Orchard Fresh Juicy Fruits",
    defaultSubtitle: "Thompson grapes, sweet oranges & crisp apples",
  },
  "cooking oils & ghee": {
    themeClass: "promo-card--oils",
    badge: "🍳 COOKING ESSENTIALS",
    defaultTitle: "Pure Cooking Oils & Desi Ghee",
    defaultSubtitle: "Amul cow ghee, olive oil & mustard oil",
  },
  "fresh vegetables": {
    themeClass: "promo-card--veggies",
    badge: "🥦 DAILY HARVEST",
    defaultTitle: "Farm Crisp Vegetables",
    defaultSubtitle: "Tender spinach, cauliflower, onions & greens",
  },
  "beverages & tea": {
    themeClass: "promo-card--beverages",
    badge: "☕ SIPS & BREWS",
    defaultTitle: "Beverages, Tea & Coffee",
    defaultSubtitle: "Ayurvedic tea, Bournvita & 100% fruit juices",
  },
  "staples & grains": {
    themeClass: "promo-card--staples",
    badge: "🌾 PANTRY STAPLES",
    defaultTitle: "Kitchen Staples & Grains",
    defaultSubtitle: "High-protein dals, basmati raw rice & atta",
  },
  "organic & health foods": {
    themeClass: "promo-card--organic",
    badge: "🍃 PURE & HEALTHY",
    defaultTitle: "Organic Dry Fruits & Health",
    defaultSubtitle: "Jumbo walnuts, white quinoa & roasted almonds",
  },
  "spices & masalas": {
    themeClass: "promo-card--spices",
    badge: "🌶️ AROMATIC SPICES",
    defaultTitle: "Authentic Spices & Masalas",
    defaultSubtitle: "Malabar cardamom, kitchen king & coriander",
  },
  "household & cleaning": {
    themeClass: "promo-card--cleaning",
    badge: "🧼 HOME HYGIENE",
    defaultTitle: "Cleaning & Daily Hygiene",
    defaultSubtitle: "Dettol handwash, Lizol & surface cleaners",
  },
};

const DEFAULT_THEME_ORDER = [
  "dairy & breakfast",
  "snacks & biscuits",
  "fresh fruits",
];

const GroceryHero = () => {
  const [publicCoupon, setPublicCoupon] = useState(null);
  const [copied, setCopied] = useState(false);
  const [promoCards, setPromoCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);

  // Fetch active public coupon from backend
  const fetchCoupon = useCallback(async () => {
    try {
      const res = await API.get("/coupons?status=Active&isPublic=true");
      const list = res.data?.data || res.data?.coupons || [];
      const now = new Date();

      const validCoupons = (Array.isArray(list) ? list : []).filter((c) => {
        if (c.status !== "Active") return false;
        if (c.isPublic === false) return false;
        if (c.expiryDate && new Date(c.expiryDate) <= now) return false;
        if (c.startDate && new Date(c.startDate) > now) return false;
        if (
          c.usageLimit !== null &&
          c.usageLimit !== undefined &&
          c.usageCount >= c.usageLimit
        ) {
          return false;
        }
        return true;
      });

      if (validCoupons.length > 0) {
        validCoupons.sort(
          (a, b) =>
            (Number(b.discountValue) || 0) - (Number(a.discountValue) || 0)
        );
        setPublicCoupon(validCoupons[0]);
      } else {
        setPublicCoupon({
          code: "VIP50",
          discountType: "percentage",
          discountValue: 50,
          minPurchase: 200,
        });
      }
    } catch {
      setPublicCoupon({
        code: "VIP50",
        discountType: "percentage",
        discountValue: 50,
        minPurchase: 200,
      });
    }
  }, []);

  // Fetch real categories and products from database to generate promo cards
  const fetchPromoCardsFromDB = useCallback(async () => {
    try {
      setLoadingCards(true);
      const [catRes, prodRes] = await Promise.all([
        API.get("/categories?hasProducts=true"),
        API.get("/products?limit=100"),
      ]);

      const categories = catRes.data?.data || catRes.data?.categories || [];
      const products =
        prodRes.data?.data?.products ||
        prodRes.data?.products ||
        prodRes.data?.data ||
        [];

      // Group products by category name
      const categoryMap = new Map();
      (Array.isArray(categories) ? categories : []).forEach((c) => {
        if (c.status !== "Inactive") {
          categoryMap.set(c.name.toLowerCase().trim(), {
            categoryName: c.name,
            products: [],
          });
        }
      });

      (Array.isArray(products) ? products : []).forEach((p) => {
        const catName = (
          p.category?.name ||
          p.categoryName ||
          ""
        ).toLowerCase().trim();
        if (catName && categoryMap.has(catName)) {
          categoryMap.get(catName).products.push(p);
        }
      });

      // Filter only categories that ACTUALLY have products in the database
      const availableCategories = [];
      categoryMap.forEach((val, key) => {
        if (val.products.length > 0) {
          availableCategories.push({
            key,
            categoryName: val.categoryName,
            products: val.products,
          });
        }
      });

      // Select top 3 categories matching priority order or fallback to available ones
      const selected = [];
      const usedKeys = new Set();

      // First pass: try to pick in priority order (Dairy, Snacks, Fruits)
      for (const targetKey of DEFAULT_THEME_ORDER) {
        const found = availableCategories.find(
          (c) => c.key === targetKey && !usedKeys.has(c.key)
        );
        if (found) {
          selected.push(found);
          usedKeys.add(found.key);
        }
      }

      // Second pass: fill up to 3 cards with any other categories that have products in DB
      for (const c of availableCategories) {
        if (selected.length >= 3) break;
        if (!usedKeys.has(c.key)) {
          selected.push(c);
          usedKeys.add(c.key);
        }
      }

      // Format cards using 100% real database products and images
      const builtCards = selected.map((item, idx) => {
        const theme =
          CATEGORY_THEMES[item.key] ||
          (idx === 0
            ? CATEGORY_THEMES["dairy & breakfast"]
            : idx === 1
            ? CATEGORY_THEMES["snacks & biscuits"]
            : CATEGORY_THEMES["fresh fruits"]);

        // Pick top product with a valid image from database
        const productWithImg =
          item.products.find(
            (p) => (p.images && p.images.length > 0) || p.image
          ) || item.products[0];

        const rawImg =
          productWithImg?.images?.[0] || productWithImg?.image || "";
        const imgUrl = resolveImage(rawImg);

        // Calculate minimum starting price
        const prices = item.products
          .map((p) => Number(p.discountPrice || p.price) || 0)
          .filter((p) => p > 0);
        const minPrice = prices.length > 0 ? Math.min(...prices) : null;

        // Compose descriptive subtitle from actual product names in this category
        const sampleNames = item.products
          .slice(0, 3)
          .map((p) => {
            const full = p.productName || p.name || "";
            return full.split(" ").slice(0, 2).join(" ");
          })
          .filter(Boolean);

        const subtitle =
          sampleNames.length > 0
            ? `${sampleNames.join(", ")} & more`
            : theme.defaultSubtitle;

        return {
          id: `db-card-${item.key.replace(/[^a-z0-9]/g, "-")}`,
          title: theme.defaultTitle,
          subtitle: subtitle,
          btnText: "Order Now",
          bgClass: theme.themeClass,
          categoryTarget: item.categoryName,
          badge: theme.badge,
          imgUrl: imgUrl,
          alt: productWithImg?.productName || productWithImg?.name || item.categoryName,
          minPrice: minPrice,
        };
      });

      setPromoCards(builtCards);
    } catch (err) {
      console.error("Failed to load promo cards from DB:", err);
      // Fallback matching real DB categories and images
      setPromoCards([
        {
          id: "dairy-fallback",
          title: "Fresh Dairy & Morning Essentials",
          subtitle: "Eggs, farm milk, butter, curd & whole wheat bread",
          btnText: "Order Now",
          bgClass: "promo-card--dairy",
          categoryTarget: "Dairy & Breakfast",
          badge: "⚡ 10 MINS",
          imgUrl:
            "https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=600&auto=format&fit=crop&q=80",
          alt: "Farm Fresh White Table Eggs",
          minPrice: 45,
        },
        {
          id: "snacks-fallback",
          title: "Crunchy Snacks & Munchies",
          subtitle: "Dark Fantasy, potato crisps & cookies",
          btnText: "Order Now",
          bgClass: "promo-card--snacks",
          categoryTarget: "Snacks & Biscuits",
          badge: "🍪 TEA-TIME BITES",
          imgUrl:
            "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop&q=80",
          alt: "Sunfeast Dark Fantasy Cookies",
          minPrice: 25,
        },
        {
          id: "fruits-fallback",
          title: "Orchard Fresh Juicy Fruits",
          subtitle: "Thompson grapes, sweet oranges & apples",
          btnText: "Order Now",
          bgClass: "promo-card--fruits",
          categoryTarget: "Fresh Fruits",
          badge: "🍎 100% FARM FRESH",
          imgUrl:
            "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=600&auto=format&fit=crop&q=80",
          alt: "Thompson Seedless Green Grapes",
          minPrice: 55,
        },
      ]);
    } finally {
      setLoadingCards(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupon();
    fetchPromoCardsFromDB();
    window.addEventListener("couponUpdated", fetchCoupon);
    return () => window.removeEventListener("couponUpdated", fetchCoupon);
  }, [fetchCoupon, fetchPromoCardsFromDB]);

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  const scrollToProducts = (categoryName) => {
    if (categoryName) {
      window.dispatchEvent(
        new CustomEvent("selectCategory", { detail: categoryName })
      );
      const rowId = `cat-row-${categoryName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
      const catRow = document.getElementById(rowId);
      if (catRow) {
        catRow.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    const target =
      document.querySelector(".cat-wise-sections-container") ||
      document.querySelector(".home-cat-section");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="grocery-hero-section" aria-label="Grocery promotions and offers">
      <div className="grocery-hero-container">
        {/* =========================================================
            FLAGSHIP HERO BANNER (FIRST BIG PROMO GIG)
            ========================================================= */}
        <div className="grocery-hero-main-banner">
          {/* Ambient Lighting & Glow Layers */}
          <div className="grocery-hero-glow-left" aria-hidden="true" />
          <div className="grocery-hero-glow-right" aria-hidden="true" />

          {/* LEFT CONTENT */}
          <div className="grocery-hero-content">
            {/* Offer / Coupon Badge */}
            <div className="grocery-hero-offer-badge">
              <span className="hero-badge-pulse" />
              <Sparkles size={13} className="hero-sparkle-icon" />
              <span className="hero-badge-tag">EXCLUSIVE OFFER</span>
              <span className="hero-badge-dot">•</span>
              <span className="hero-badge-discount">
                {publicCoupon?.discountType === "percentage"
                  ? `FLAT ${publicCoupon.discountValue}% OFF`
                  : `FLAT ₹${publicCoupon?.discountValue || 50} OFF`}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="grocery-hero-heading">
              Stock up on{" "}
              <span className="grocery-hero-heading-highlight">
                daily essentials
              </span>
            </h1>

            {/* Subtext */}
            <p className="grocery-hero-subtext">
              Get farm-fresh goodness &amp; an artisan range of exotic fruits,
              crisp vegetables, farm milk &amp; grocery staples delivered in 10 minutes.
            </p>

            {/* Trust Highlights Row */}
            <div className="grocery-hero-trust-bar">
              <div className="grocery-trust-item">
                <Clock size={13} className="grocery-trust-icon" />
                <span>10 Mins Delivery</span>
              </div>
              <div className="grocery-trust-item">
                <Leaf size={13} className="grocery-trust-icon" />
                <span>100% Farm Fresh</span>
              </div>
              <div className="grocery-trust-item">
                <ShieldCheck size={13} className="grocery-trust-icon" />
                <span>Best Price Guarantee</span>
              </div>
            </div>

            {/* Interactive Coupon Box & CTA Row */}
            <div className="grocery-hero-action-row">
              <button
                type="button"
                className="grocery-hero-shop-btn"
                onClick={() => scrollToProducts()}
              >
                <span>Shop Now</span>
                <div className="hero-shop-arrow-circle">
                  <ArrowRight size={14} />
                </div>
              </button>

              {/* Coupon Pill with Ticket Design & Copy Action */}
              {publicCoupon && (
                <div
                  className={`grocery-hero-coupon-pill ${copied ? "copied" : ""}`}
                  onClick={() => handleCopyCode(publicCoupon.code)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleCopyCode(publicCoupon.code);
                    }
                  }}
                  title="Click to copy coupon code"
                  aria-label={`Coupon code ${publicCoupon.code}. Click to copy`}
                >
                  <div className="hero-coupon-left">
                    <Ticket size={15} className="hero-coupon-ticket" />
                    <span className="hero-coupon-label">USE CODE:</span>
                    <span className="hero-coupon-code">{publicCoupon.code}</span>
                  </div>

                  <button
                    type="button"
                    className="hero-coupon-copy-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyCode(publicCoupon.code);
                    }}
                  >
                    {copied ? (
                      <>
                        <Check size={12} />
                        <span>COPIED!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>COPY</span>
                      </>
                    )}
                  </button>

                  {publicCoupon.minPurchase > 0 && (
                    <span className="hero-coupon-min-hint">
                      (Above ₹{publicCoupon.minPurchase})
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT VISUAL: SEAMLESS BACKGROUND PRODUCE (NO FLOATING BOX OR BUTTONS) */}
          <div className="grocery-hero-visual-spacer" aria-hidden="true" />
        </div>

        {/* =========================================================
            BOTTOM 3 PROMO CARDS (DYNAMICALLY DERIVED FROM DATABASE PRODUCTS)
            No dummy categories (Pharmacy, Pets, Diapers removed).
            Purely real products, real categories, and real images from DB!
            ========================================================= */}
        <div className="grocery-hero-promo-grid">
          {promoCards.map((card) => (
            <div
              key={card.id}
              className={`grocery-promo-card ${card.bgClass}`}
              onClick={() => scrollToProducts(card.categoryTarget)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  scrollToProducts(card.categoryTarget);
                }
              }}
            >
              <div className="grocery-promo-content">
                <div className="grocery-promo-header-row">
                  {card.badge && (
                    <span className="grocery-promo-pill">{card.badge}</span>
                  )}
                  {card.minPrice && (
                    <span className="grocery-promo-price-tag">
                      From ₹{card.minPrice}
                    </span>
                  )}
                </div>

                <h3 className="grocery-promo-title">{card.title}</h3>
                <p className="grocery-promo-subtitle">{card.subtitle}</p>

                <button
                  type="button"
                  className="grocery-promo-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    scrollToProducts(card.categoryTarget);
                  }}
                >
                  <span>{card.btnText}</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              <div className="grocery-promo-img-wrap">
                {card.imgUrl ? (
                  <img
                    src={card.imgUrl}
                    alt={card.alt}
                    className="grocery-promo-img"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="grocery-promo-img-fallback">
                    <ShoppingBag size={34} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GroceryHero;
