import React, { useMemo, useState } from "react";
import {
  ShoppingCart,
  Plus,
  Minus,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
} from "lucide-react";
import "./PopularProducts.css";

const PRODUCTS_PER_PAGE = 8;

const PRODUCTS = [
  {
    id: 1,
    name: "Premium Dried Mango Slices",
    category: "Fruits",
    tags: "Mango, Dried Fruits, Organic",
    price: 549,
    oldPrice: 599,
    discount: 8,
    unit: "250g",
    image:
      "https://images.unsplash.com/photo-1591073113125-e46713c829ed?auto=format&fit=crop&w=700&q=85",
    description:
      "Naturally sweet dried mango slices prepared from premium quality ripe mangoes.",
  },
  {
    id: 2,
    name: "Organic Classic Coffee",
    category: "Coffees & Teas",
    tags: "Coffee, Organic, Arabica",
    price: 699,
    oldPrice: 799,
    discount: 13,
    unit: "250g",
    image:
      "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=700&q=85",
    description:
      "Rich and aromatic organic coffee with a smooth roasted finish.",
  },
  {
    id: 3,
    name: "Fresh Mango Juice",
    category: "Fruits",
    tags: "Mango, Juice, Fresh",
    price: 249,
    oldPrice: 299,
    discount: 17,
    unit: "1 Litre",
    image:
      "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=700&q=85",
    description:
      "Refreshing mango juice made with naturally ripe mangoes and no artificial flavour.",
  },
  {
    id: 4,
    name: "Fresh Watermelon Slices",
    category: "Fruits",
    tags: "Watermelon, Fresh Fruits",
    price: 179,
    oldPrice: 199,
    discount: 10,
    unit: "500g",
    image:
      "https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?auto=format&fit=crop&w=700&q=85",
    description:
      "Fresh juicy watermelon slices, carefully selected and packed for freshness.",
  },
  {
    id: 5,
    name: "Raspberry Cashew Mix",
    category: "Pet Foods",
    tags: "Cashew, Raspberry, Snacks",
    price: 399,
    oldPrice: 479,
    discount: 17,
    unit: "200g",
    image:
      "https://images.unsplash.com/photo-1601379760883-1bb497c558b8?auto=format&fit=crop&w=700&q=85",
    description:
      "A delicious premium snack blend with cashews and naturally sweet berry flavours.",
  },
  {
    id: 6,
    name: "Fresh Organic Bananas",
    category: "Fruits",
    tags: "Banana, Organic Fruits",
    price: 89,
    oldPrice: 99,
    discount: 10,
    unit: "1 Dozen",
    image:
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=700&q=85",
    description:
      "Naturally ripened organic bananas selected for excellent taste and freshness.",
  },
  {
    id: 7,
    name: "Organic Spirulina Powder",
    category: "Vegetables",
    tags: "Organic, Spirulina, Superfood",
    price: 499,
    oldPrice: 549,
    discount: 9,
    unit: "100g",
    image:
      "https://images.unsplash.com/photo-1611080541599-8c6dbde6ed28?auto=format&fit=crop&w=700&q=85",
    description:
      "Premium organic spirulina powder that can be added to smoothies and healthy drinks.",
  },
  {
    id: 8,
    name: "Fresh Color Bell Peppers",
    category: "Vegetables",
    tags: "Bell Pepper, Fresh Vegetables",
    price: 159,
    oldPrice: 179,
    discount: 11,
    unit: "500g",
    image:
      "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=700&q=85",
    description:
      "Colourful and crunchy fresh bell peppers, perfect for salads and cooking.",
  },

  {
    id: 9,
    name: "Organic Turmeric Latte",
    category: "Coffees & Teas",
    tags: "Turmeric, Latte, Organic",
    price: 449,
    oldPrice: 599,
    discount: 25,
    unit: "200g",
    image:
      "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=700&q=85",
    description:
      "A warming turmeric latte blend made from carefully selected organic ingredients.",
  },
  {
    id: 10,
    name: "Fresh Pomegranate",
    category: "Fruits",
    tags: "Pomegranate, Fresh Fruits",
    price: 229,
    oldPrice: 259,
    discount: 12,
    unit: "500g",
    image:
      "https://images.unsplash.com/photo-1541344999736-83eca272f6fc?auto=format&fit=crop&w=700&q=85",
    description:
      "Fresh premium pomegranates with juicy ruby-red seeds.",
  },
  {
    id: 11,
    name: "Farm Fresh Milk",
    category: "Milks & Dairies",
    tags: "Milk, Dairy, Fresh",
    price: 72,
    oldPrice: 80,
    discount: 10,
    unit: "1 Litre",
    image:
      "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=700&q=85",
    description:
      "Fresh farm milk packed with care and delivered for everyday nutrition.",
  },
  {
    id: 12,
    name: "Organic Greek Yogurt",
    category: "Milks & Dairies",
    tags: "Yogurt, Greek Yogurt, Dairy",
    price: 149,
    oldPrice: 169,
    discount: 12,
    unit: "400g",
    image:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=700&q=85",
    description:
      "Creamy organic Greek yogurt with a smooth texture and rich taste.",
  },
  {
    id: 13,
    name: "Premium Chicken Breast",
    category: "Meats",
    tags: "Chicken, Meat, Fresh",
    price: 329,
    oldPrice: 379,
    discount: 13,
    unit: "500g",
    image:
      "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=700&q=85",
    description:
      "Fresh premium chicken breast carefully packed to retain quality and freshness.",
  },
  {
    id: 14,
    name: "Fresh Organic Tomatoes",
    category: "Vegetables",
    tags: "Tomato, Organic, Vegetables",
    price: 69,
    oldPrice: 79,
    discount: 13,
    unit: "500g",
    image:
      "https://images.unsplash.com/photo-1546470427-e26264be0b0d?auto=format&fit=crop&w=700&q=85",
    description:
      "Farm-fresh organic tomatoes, naturally juicy and ideal for everyday cooking.",
  },
  {
    id: 15,
    name: "Premium Green Tea",
    category: "Coffees & Teas",
    tags: "Green Tea, Tea, Organic",
    price: 299,
    oldPrice: 349,
    discount: 14,
    unit: "100g",
    image:
      "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=700&q=85",
    description:
      "A refreshing premium green tea with a light aroma and smooth finish.",
  },
  {
    id: 16,
    name: "Healthy Mixed Fruit Box",
    category: "Fruits",
    tags: "Fruits, Mixed Fruits, Fresh",
    price: 499,
    oldPrice: 599,
    discount: 17,
    unit: "1 Box",
    image:
      "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=700&q=85",
    description:
      "A colourful selection of fresh seasonal fruits packed together for your convenience.",
  },
];

const CATEGORIES = [
  "All",
  "Milks & Dairies",
  "Coffees & Teas",
  "Pet Foods",
  "Meats",
  "Vegetables",
  "Fruits",
];

const PopularProducts = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(() => {
    try {
      const cart = JSON.parse(
        localStorage.getItem("healthy_heaven_cart_items") || "[]"
      );

      return cart.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0
      );
    } catch {
      return 0;
    }
  });

  const filteredProducts = useMemo(() => {
    if (activeCategory === "All") {
      return PRODUCTS;
    }

    return PRODUCTS.filter(
      (product) => product.category === activeCategory
    );
  }, [activeCategory]);

  const totalPages = Math.ceil(
    filteredProducts.length / PRODUCTS_PER_PAGE
  );

  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;

    return filteredProducts.slice(
      startIndex,
      startIndex + PRODUCTS_PER_PAGE
    );
  }, [filteredProducts, currentPage]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  const getCart = () => {
    try {
      return JSON.parse(
        localStorage.getItem("healthy_heaven_cart_items") || "[]"
      );
    } catch {
      return [];
    }
  };

  const saveCart = (cart) => {
    localStorage.setItem(
      "healthy_heaven_cart_items",
      JSON.stringify(cart)
    );

    window.dispatchEvent(
      new CustomEvent("healthy-heaven-cart-updated", {
        detail: cart,
      })
    );
  };

  const addToCart = (product, productQuantity = 1) => {
    const cart = getCart();

    const existingProduct = cart.find(
      (item) => item.id === product.id
    );

    if (existingProduct) {
      existingProduct.quantity += productQuantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        oldPrice: product.oldPrice,
        image: product.image,
        unit: product.unit,
        quantity: productQuantity,
      });
    }

    saveCart(cart);

    const newCount = cart.reduce(
      (total, item) => total + Number(item.quantity || 0),
      0
    );

    setCartCount(newCount);
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
  };

  const openProductDetails = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
  };

  const closeProductDetails = () => {
    setSelectedProduct(null);
    setQuantity(1);
  };

  const handleModalAddToCart = () => {
    if (!selectedProduct) return;

    addToCart(selectedProduct, quantity);
    closeProductDetails();
  };

  const handlePrevious = () => {
    setCurrentPage((page) => Math.max(page - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((page) =>
      Math.min(page + 1, totalPages)
    );
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <section className="popular-products">
      <div className="popular-products__container">

        {/* HEADER */}
        <div className="popular-products__header">
          <h2 className="popular-products__title">
            Popular Products
          </h2>

          <div className="popular-products__categories">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                className={`popular-products__category ${
                  activeCategory === category
                    ? "popular-products__category--active"
                    : ""
                }`}
                onClick={() =>
                  handleCategoryChange(category)
                }
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* PRODUCT GRID */}
        <div className="popular-products__grid">
          {currentProducts.map((product) => (
            <article
              className="popular-products__card"
              key={product.id}
            >
              {/* DISCOUNT */}
              <div className="popular-products__discount">
                -{product.discount}%
              </div>

              {/* IMAGE */}
              <button
                type="button"
                className="popular-products__image-button"
                onClick={() =>
                  openProductDetails(product)
                }
                aria-label={`View ${product.name}`}
              >
                <div className="popular-products__image-wrapper">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="popular-products__image"
                    loading="lazy"
                  />
                </div>
              </button>

              {/* BODY */}
              <div className="popular-products__body">
                <p className="popular-products__tags">
                  {product.tags}
                </p>

                <p className="popular-products__stock">
                  In stock
                </p>

                <button
                  type="button"
                  className="popular-products__name"
                  onClick={() =>
                    openProductDetails(product)
                  }
                >
                  {product.name}
                </button>

                <div className="popular-products__bottom">
                  <div className="popular-products__prices">
                    <span className="popular-products__price">
                      {formatPrice(product.price)}
                    </span>

                    <span className="popular-products__old-price">
                      {formatPrice(product.oldPrice)}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="popular-products__cart-button"
                    onClick={() =>
                      handleAddToCart(product)
                    }
                  >
                    <ShoppingCart size={16} />
                    <span>Add To Cart</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* EMPTY */}
        {currentProducts.length === 0 && (
          <div className="popular-products__empty">
            <h3>No products found</h3>
            <p>
              There are no products available in this
              category.
            </p>
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="popular-products__pagination">
            <button
              type="button"
              className="popular-products__pagination-button"
              disabled={currentPage === 1}
              onClick={handlePrevious}
            >
              <ChevronLeft size={18} />
              <span>Previous</span>
            </button>

            <div className="popular-products__pages">
              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              ).map((page) => (
                <button
                  key={page}
                  type="button"
                  className={`popular-products__page ${
                    currentPage === page
                      ? "popular-products__page--active"
                      : ""
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="popular-products__pagination-button"
              disabled={currentPage === totalPages}
              onClick={handleNext}
            >
              <span>Next</span>
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* CART FLOATING INDICATOR */}
      <button
        type="button"
        className="popular-products__cart-floating"
        aria-label={`Cart with ${cartCount} items`}
      >
        <ShoppingCart size={21} />

        {cartCount > 0 && (
          <span className="popular-products__cart-count">
            {cartCount}
          </span>
        )}
      </button>

      {/* BACK TO TOP */}
      <button
        type="button"
        className="popular-products__top-button"
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <ArrowUp size={20} />
      </button>

      {/* PRODUCT DETAILS MODAL */}
      {selectedProduct && (
        <div
          className="popular-products__modal-overlay"
          onClick={closeProductDetails}
        >
          <div
            className="popular-products__modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="popular-products__modal-close"
              onClick={closeProductDetails}
            >
              <X size={21} />
            </button>

            <div className="popular-products__modal-image">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
              />
            </div>

            <div className="popular-products__modal-content">
              <span className="popular-products__modal-category">
                {selectedProduct.category}
              </span>

              <h3 className="popular-products__modal-title">
                {selectedProduct.name}
              </h3>

              <p className="popular-products__modal-stock">
                ● In stock
              </p>

              <p className="popular-products__modal-description">
                {selectedProduct.description}
              </p>

              <div className="popular-products__modal-unit">
                Pack Size:{" "}
                <strong>{selectedProduct.unit}</strong>
              </div>

              <div className="popular-products__modal-price-row">
                <span className="popular-products__modal-price">
                  {formatPrice(selectedProduct.price)}
                </span>

                <span className="popular-products__modal-old-price">
                  {formatPrice(selectedProduct.oldPrice)}
                </span>

                <span className="popular-products__modal-discount">
                  {selectedProduct.discount}% OFF
                </span>
              </div>

              <div className="popular-products__modal-actions">
                <div className="popular-products__quantity">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((value) =>
                        Math.max(1, value - 1)
                      )
                    }
                  >
                    <Minus size={16} />
                  </button>

                  <span>{quantity}</span>

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((value) => value + 1)
                    }
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  type="button"
                  className="popular-products__modal-cart"
                  onClick={handleModalAddToCart}
                >
                  <ShoppingCart size={18} />
                  Add To Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PopularProducts;