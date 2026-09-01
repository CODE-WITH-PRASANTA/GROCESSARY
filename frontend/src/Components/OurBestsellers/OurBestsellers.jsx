import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  FaHeart,
  FaExchangeAlt,
  FaEye,
  FaStar,
  FaRegStar,
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
  FaTimes,
  FaShoppingBag,
  FaPlus,
  FaMinus,
} from "react-icons/fa";

import "./OurBestsellers.css";

// =========================================================
// API CONFIG
// =========================================================

const BASE_URL = "http://localhost:5000";
const API_URL = `${BASE_URL}/api`;

// =========================================================
// COMPONENT
// =========================================================

export const OurBestsellers = () => {
  const navigate = useNavigate();

  // =======================================================
  // STATE
  // =======================================================

  const [activeCategory, setActiveCategory] =
    useState("All Categories");

  const [currentIndex, setCurrentIndex] = useState(0);

  const [quickViewItem, setQuickViewItem] = useState(null);

  const [modalImageIndex, setModalImageIndex] = useState(0);

  const [quantity, setQuantity] = useState(1);

  const [addingProductId, setAddingProductId] = useState(null);

  const [cartMessage, setCartMessage] = useState("");

  const [selectedDropdowns, setSelectedDropdowns] = useState({});

  const [backendProducts, setBackendProducts] = useState([]);

  const [backendCategories, setBackendCategories] = useState([]);

  const [productsLoading, setProductsLoading] = useState(false);

  const [viewingProductId, setViewingProductId] = useState(null);

  // =======================================================
  // SAFE TEXT
  // =======================================================

  const getSafeText = (value, fallback = "") => {
    if (value === null || value === undefined) {
      return fallback;
    }

    if (typeof value === "string") {
      return value.trim();
    }

    if (typeof value === "number" || typeof value === "boolean") {
      return String(value);
    }

    if (typeof value === "object") {
      const text =
        value?.name ??
        value?.label ??
        value?.title ??
        value?.value ??
        value?.unitName ??
        value?.categoryName ??
        value?.brandName ??
        "";

      if (
        typeof text === "string" ||
        typeof text === "number"
      ) {
        return String(text).trim();
      }

      return fallback;
    }

    return fallback;
  };

  // =======================================================
  // EXTRACT ARRAY FROM API RESPONSE
  // =======================================================

  const extractArray = (responseData, keys = []) => {
    if (Array.isArray(responseData)) {
      return responseData;
    }

    for (const key of keys) {
      if (Array.isArray(responseData?.[key])) {
        return responseData[key];
      }
    }

    if (
      responseData?.data &&
      typeof responseData.data === "object"
    ) {
      for (const key of keys) {
        if (Array.isArray(responseData.data?.[key])) {
          return responseData.data[key];
        }
      }

      if (Array.isArray(responseData.data)) {
        return responseData.data;
      }
    }

    return [];
  };

  // =======================================================
  // PRODUCT ID
  // =======================================================

  const getProductId = (item) => {
    if (!item) return null;

    const id =
      item?._id ??
      item?.id ??
      item?.productId ??
      null;

    return getSafeText(id, "");
  };

  // =======================================================
  // PRODUCT NAME
  // =======================================================

  const getProductName = (item) => {
    if (!item) return "Unnamed Product";

    return getSafeText(
      item?.productName ??
        item?.name ??
        item?.title,
      "Unnamed Product"
    );
  };

  // =======================================================
  // CATEGORY NAME
  // =======================================================

  const getCategoryName = (category) => {
    return getSafeText(
      category,
      ""
    );
  };

  // =======================================================
  // BRAND NAME
  // =======================================================

  const getBrandName = (brand) => {
    return getSafeText(
      brand,
      ""
    );
  };

  // =======================================================
  // UNIT NAME
  // =======================================================

  const getUnitName = (unit) => {
    return getSafeText(
      unit,
      ""
    );
  };

  // =======================================================
  // NORMALIZE OPTION
  // =======================================================

  const normalizeOption = (option) => {
    return getSafeText(option, "");
  };

  // =======================================================
  // IMAGE URL
  // =======================================================

  const getImageUrl = (image) => {
    if (!image) {
      return "";
    }

    if (typeof image === "object") {
      image =
        image?.url ??
        image?.path ??
        image?.secure_url ??
        image?.src ??
        "";
    }

    if (!image) {
      return "";
    }

    const imageString = String(image).trim();

    if (!imageString) {
      return "";
    }

    if (
      imageString.startsWith("http://") ||
      imageString.startsWith("https://")
    ) {
      return imageString;
    }

    return `${BASE_URL}${
      imageString.startsWith("/")
        ? imageString
        : `/${imageString}`
    }`;
  };

  // =======================================================
  // PRODUCT IMAGE
  // =======================================================

  const getProductImage = (product) => {
    if (!product) {
      return "";
    }

    if (
      Array.isArray(product?.images) &&
      product.images.length > 0
    ) {
      return getImageUrl(product.images[0]);
    }

    if (product?.image) {
      return getImageUrl(product.image);
    }

    return "";
  };

  // =======================================================
  // PRODUCT GALLERY
  // =======================================================

  const getProductGallery = (product) => {
    if (!product) {
      return [];
    }

    let gallery = [];

    if (Array.isArray(product?.images)) {
      gallery = product.images
        .map((image) => getImageUrl(image))
        .filter(Boolean);
    }

    if (
      gallery.length === 0 &&
      product?.image
    ) {
      const image = getImageUrl(product.image);

      if (image) {
        gallery = [image];
      }
    }

    return gallery;
  };

  // =======================================================
  // PRODUCT PRICE
  // =======================================================

  const getProductPrice = (product) => {
    const price = Number(
      product?.price ??
        product?.sellingPrice ??
        product?.discountPrice ??
        0
    );

    return Number.isFinite(price) ? price : 0;
  };

  // =======================================================
  // ORIGINAL PRICE
  // =======================================================

  const getOriginalPrice = (product) => {
    const writtenPrice = Number(
      product?.writtenPrice ?? 0
    );

    const price = getProductPrice(product);

    if (
      Number.isFinite(writtenPrice) &&
      writtenPrice > 0 &&
      writtenPrice >= price
    ) {
      return writtenPrice;
    }

    return price;
  };

  // =======================================================
  // DISCOUNT
  // =======================================================

  const getDiscountPrice = (product) => {
    const discountPrice = Number(
      product?.discountPrice ?? 0
    );

    return Number.isFinite(discountPrice) &&
      discountPrice > 0
      ? discountPrice
      : 0;
  };

  // =======================================================
  // RATING
  // =======================================================

  const getProductRating = (product) => {
    const rating = Number(
      product?.rating ??
        product?.averageRating ??
        product?.ratings ??
        0
    );

    if (!Number.isFinite(rating)) {
      return 0;
    }

    return Math.max(
      0,
      Math.min(5, Math.round(rating))
    );
  };

  // =======================================================
  // DESCRIPTION
  // =======================================================

  const getProductDescription = (product) => {
    return getSafeText(
      product?.shortDescription ??
        product?.fullDescription ??
        product?.description,
      ""
    );
  };

  // =======================================================
  // CATEGORY OBJECT
  // =======================================================

  const getProductCategory = (product) => {
    if (!product) {
      return null;
    }

    const category =
      product?.category ??
      product?.categoryId ??
      product?.category_id ??
      null;

    if (!category) {
      return null;
    }

    // Backend populated category
    if (
      typeof category === "object" &&
      !Array.isArray(category)
    ) {
      return {
        ...category,
        name: getCategoryName(category),
      };
    }

    const categoryString =
      getSafeText(category, "");

    if (!categoryString) {
      return null;
    }

    const matchedCategory =
      backendCategories.find((cat) => {
        const id = getSafeText(
          cat?._id ?? cat?.id,
          ""
        );

        const name = getCategoryName(cat);

        return (
          id.toLowerCase() ===
            categoryString.toLowerCase() ||
          name.toLowerCase() ===
            categoryString.toLowerCase()
        );
      });

    return (
      matchedCategory ?? {
        _id: categoryString,
        name: categoryString,
      }
    );
  };

  // =======================================================
  // NORMALIZE PRODUCT
  // =======================================================

  const normalizeProduct = (product) => {
    if (!product) {
      return null;
    }

    const productId = getProductId(product);

    if (!productId) {
      return null;
    }

    const productName = getProductName(product);

    const category = getProductCategory(product);

    const categoryName = getCategoryName(category);

    const image = getProductImage(product);

    const gallery = getProductGallery(product);

    const price = getProductPrice(product);

    const originalPrice =
      getOriginalPrice(product);

    const discountPrice =
      getDiscountPrice(product);

    const rating =
      getProductRating(product);

    const unit =
      getUnitName(product?.unit);

    const brandName =
      getBrandName(product?.brand);

    const rawStock =
      product?.stockQuantity ??
      product?.stock ??
      product?.availableStock ??
      product?.inventory ??
      product?.quantity ??
      0;

    const parsedStock = Number(rawStock);

    const stockQuantity =
      Number.isFinite(parsedStock)
        ? parsedStock
        : 0;

    const productLabel =
      unit ? "Unit:" : "Option:";

    // IMPORTANT:
    // Never allow object to enter selectedOption.
    const rawSelectedOption =
      product?.selectedOption ??
      product?.selectedUnit ??
      unit ??
      "";

    const selectedOption =
      normalizeOption(rawSelectedOption);

    // IMPORTANT:
    // Convert every option object into a string.
    let options = [];

    if (unit) {
      options = [unit];
    } else if (
      Array.isArray(product?.options)
    ) {
      options = product.options
        .map((option) =>
          normalizeOption(option)
        )
        .filter(Boolean);
    }

    if (
      options.length === 0 &&
      selectedOption
    ) {
      options = [selectedOption];
    }

    let badge = "";

    if (
      product?.isOutOfStock ||
      stockQuantity <= 0
    ) {
      badge = "Out of Stock";
    } else if (discountPrice > 0) {
      badge = "Sale";
    } else if (
      product?.source === "import"
    ) {
      badge = "New";
    }

    return {
      ...product,

      id: productId,
      _id: productId,
      productId,

      name: productName,
      productName,

      category,
      categoryName,

      // Keep original objects for backend/API use
      brand: product?.brand ?? null,
      brandName,

      unit: product?.unit ?? null,
      unitName: unit,

      image,
      gallery,

      description:
        getProductDescription(product),

      rating,

      price,
      originalPrice,
      discountPrice,

      stockQuantity,

      badge,

      // ALWAYS STRING
      label: productLabel,

      // ALWAYS STRING
      selectedOption,

      // ALWAYS ARRAY OF STRINGS
      options,
    };
  };

  // =======================================================
  // FETCH PRODUCTS
  // =======================================================

  const fetchBackendProducts = async () => {
    try {
      setProductsLoading(true);

      const response = await axios.get(
        `${API_URL}/products`,
        {
          params: {
            limit: 1000,
          },

          headers: {
            Accept: "application/json",
          },

          timeout: 30000,
        }
      );

      const result = response?.data;

     

      const productList = extractArray(
        result,
        [
          "data",
          "products",
          "result",
        ]
      );

      

      const activeProducts =
        productList.filter((product) => {
          if (!product) {
            return false;
          }

          return (
            product?.status === undefined ||
            product?.status === "active" ||
            product?.status === "Active" ||
            product?.status === true
          );
        });

      setBackendProducts(activeProducts);
    } catch (error) {
      console.error(
        "Fetch bestseller products error:",
        error
      );

      console.error(
        "Products API response:",
        error?.response?.data
      );

      setBackendProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  // =======================================================
  // FETCH CATEGORIES
  // =======================================================

  const fetchBackendCategories = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/categories`,
        {
          headers: {
            Accept: "application/json",
          },

          timeout: 30000,
        }
      );

      const result = response?.data;

     

      const categoryList = extractArray(
        result,
        [
          "data",
          "categories",
          "result",
        ]
      );

    

      setBackendCategories(categoryList);
    } catch (error) {
      console.warn(
        "Category API unavailable:",
        error?.response?.data ??
          error?.message
      );

      setBackendCategories([]);
    }
  };

  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {
    fetchBackendProducts();
    fetchBackendCategories();
  }, []);

  // =======================================================
  // NORMALIZED PRODUCTS
  // =======================================================

  const normalizedProducts = useMemo(() => {
    if (!Array.isArray(backendProducts)) {
      return [];
    }

    return backendProducts
      .map((product) =>
        normalizeProduct(product)
      )
      .filter(Boolean);
  }, [
    backendProducts,
    backendCategories,
  ]);

  // =======================================================
  // CATEGORIES
  // =======================================================

  const categories = useMemo(() => {
    const categoryNames = [];

    backendCategories.forEach(
      (category) => {
        const name =
          getCategoryName(category);

        if (
          name &&
          !categoryNames.some(
            (existing) =>
              existing.toLowerCase() ===
              name.toLowerCase()
          )
        ) {
          categoryNames.push(name);
        }
      }
    );

    normalizedProducts.forEach(
      (product) => {
        const name =
          getSafeText(
            product?.categoryName,
            ""
          );

        if (
          name &&
          !categoryNames.some(
            (existing) =>
              existing.toLowerCase() ===
              name.toLowerCase()
          )
        ) {
          categoryNames.push(name);
        }
      }
    );

    return [
      "All Categories",
      ...categoryNames,
    ];
  }, [
    backendCategories,
    normalizedProducts,
  ]);

  // =======================================================
  // RESET CATEGORY
  // =======================================================

  useEffect(() => {
    if (
      activeCategory !==
        "All Categories" &&
      !categories.some(
        (category) =>
          String(category).toLowerCase() ===
          String(
            activeCategory
          ).toLowerCase()
      )
    ) {
      setActiveCategory(
        "All Categories"
      );

      setCurrentIndex(0);
    }
  }, [
    categories,
    activeCategory,
  ]);

  // =======================================================
  // FILTER PRODUCTS
  // =======================================================

  const filteredItems = useMemo(() => {
    if (
      activeCategory ===
      "All Categories"
    ) {
      return normalizedProducts;
    }

    return normalizedProducts.filter(
      (item) => {
        const categoryName =
          getSafeText(
            item?.categoryName ??
              getCategoryName(
                item?.category
              ),
            ""
          );

        return (
          categoryName
            .trim()
            .toLowerCase() ===
          String(
            activeCategory || ""
          )
            .trim()
            .toLowerCase()
        );
      }
    );
  }, [
    normalizedProducts,
    activeCategory,
  ]);

  // =======================================================
  // KEEP INDEX VALID
  // =======================================================

  useEffect(() => {
    const maxIndex = Math.max(
      0,
      filteredItems.length - 4
    );

    if (currentIndex > maxIndex) {
      setCurrentIndex(0);
    }
  }, [
    filteredItems.length,
    currentIndex,
  ]);

  // =======================================================
  // FETCH SINGLE PRODUCT
  // =======================================================

  const fetchSingleProduct = async (
    productId
  ) => {
    if (!productId) {
      return null;
    }

    try {
      const response = await axios.get(
        `${API_URL}/products/${productId}`,
        {
          headers: {
            Accept: "application/json",
          },

          timeout: 30000,
        }
      );

      const result = response?.data;

      const product =
        result?.data?.product ??
        result?.data ??
        result?.product ??
        result;

      return product || null;
    } catch (error) {
      console.warn(
        "Single product fetch failed:",
        error?.response?.data ??
          error?.message
      );

      return null;
    }
  };

  // =======================================================
  // RESOLVE CATEGORY
  // =======================================================

  const resolveProductCategory = async (
    product
  ) => {
    if (!product) {
      return null;
    }

    const rawCategory =
      product?.category ??
      product?.categoryId ??
      product?.category_id ??
      null;

    if (!rawCategory) {
      return null;
    }

    // Populated object
    if (
      typeof rawCategory === "object" &&
      !Array.isArray(rawCategory)
    ) {
      return {
        ...rawCategory,
        name: getCategoryName(
          rawCategory
        ),
      };
    }

    const categoryValue =
      getSafeText(
        rawCategory,
        ""
      );

    if (!categoryValue) {
      return null;
    }

    const loadedCategory =
      backendCategories.find(
        (category) => {
          const categoryId =
            getSafeText(
              category?._id ??
                category?.id,
              ""
            );

          const categoryName =
            getCategoryName(category);

          return (
            categoryId.toLowerCase() ===
              categoryValue.toLowerCase() ||
            categoryName.toLowerCase() ===
              categoryValue.toLowerCase()
          );
        }
      );

    if (loadedCategory) {
      return loadedCategory;
    }

    return {
      _id: categoryValue,
      name: categoryValue,
    };
  };

  // =======================================================
  // VIEW MORE
  // =======================================================

  const handleViewMore = async (item) => {
    if (!item) {
      return;
    }

    try {
      const productId =
        getProductId(item);

      if (!productId) {
        console.error(
          "Product ID missing:",
          item
        );

        alert(
          "Product information is missing."
        );

        return;
      }

      setViewingProductId(productId);

    

      // Fetch latest product
      let latestProduct =
        await fetchSingleProduct(
          productId
        );

      // Fallback to current product
      if (!latestProduct) {
        latestProduct = item;
      }

      // Resolve category
      const category =
        await resolveProductCategory(
          latestProduct
        );

      // ===================================================
      // IMPORTANT
      // Do NOT overwrite populated category
      // with a string.
      // ===================================================

      const productForDetails = {
        ...latestProduct,

        _id:
          latestProduct?._id ??
          productId,

        id:
          latestProduct?.id ??
          productId,

        productId,

        category:
          latestProduct?.category ??
          category ??
          item?.category ??
          null,

        categoryName:
          getCategoryName(
            latestProduct?.category ??
              category ??
              item?.category
          ),

        brandName:
          getBrandName(
            latestProduct?.brand
          ),

        unitName:
          getUnitName(
            latestProduct?.unit
          ),

        images:
          Array.isArray(
            latestProduct?.images
          )
            ? latestProduct.images
            : item?.images ?? [],
      };

     

      navigate(
        `/productdetails/${productId}`,
        {
          state: {
            product:
              productForDetails,

            category,

            from:
              "our-bestsellers",
          },
        }
      );
    } catch (error) {
      console.error(
        "View product details error:",
        error
      );

      alert(
        error?.response?.data
          ?.message ??
          error?.message ??
          "Unable to open product details."
      );
    } finally {
      setViewingProductId(null);
    }
  };

  // =======================================================
  // FORMAT INR
  // =======================================================

  const formatINR = (amount) => {
    const value = Number(amount);

    return `₹${(
      Number.isFinite(value)
        ? value
        : 0
    ).toLocaleString("en-IN")}`;
  };

  // =======================================================
  // IMAGE ERROR
  // =======================================================

  const handleImageError = (e) => {
    if (
      e.currentTarget.dataset
        .fallbackApplied === "true"
    ) {
      return;
    }

    e.currentTarget.dataset
      .fallbackApplied = "true";

    e.currentTarget.src =
      "https://via.placeholder.com/600x400?text=Grocery+Sathi+Product";
  };

  // =======================================================
  // PREVIOUS
  // =======================================================

  const handlePrev = () => {
    setCurrentIndex((prev) => {
      if (filteredItems.length <= 4) {
        return 0;
      }

      return prev === 0
        ? Math.max(
            0,
            filteredItems.length - 4
          )
        : prev - 1;
    });
  };

  // =======================================================
  // NEXT
  // =======================================================

  const handleNext = () => {
    setCurrentIndex((prev) => {
      if (filteredItems.length <= 4) {
        return 0;
      }

      return prev >=
        filteredItems.length - 4
        ? 0
        : prev + 1;
    });
  };

  // =======================================================
  // DROPDOWN
  // =======================================================

  const handleDropdownChange = (
    id,
    value
  ) => {
    setSelectedDropdowns((prev) => ({
      ...prev,
      [id]: getSafeText(value, ""),
    }));
  };

  // =======================================================
  // OPEN QUICK VIEW
  // =======================================================

  const handleOpenQuickView = (item) => {
    if (!item) {
      return;
    }

    setQuickViewItem(item);
    setModalImageIndex(0);
    setQuantity(1);
  };

  // =======================================================
  // CLOSE QUICK VIEW
  // =======================================================

  const handleCloseQuickView = () => {
    setQuickViewItem(null);
    setModalImageIndex(0);
    setQuantity(1);
  };

  // =======================================================
  // QUANTITY
  // =======================================================

  const increaseQuantity = () => {
    if (!quickViewItem) {
      return;
    }

    const stock = Number(
      quickViewItem?.stockQuantity
    );

    setQuantity((prev) => {
      if (
        Number.isFinite(stock) &&
        stock > 0
      ) {
        return Math.min(
          prev + 1,
          stock
        );
      }

      return prev + 1;
    });
  };

  const decreaseQuantity = () => {
    setQuantity((prev) =>
      prev > 1 ? prev - 1 : 1
    );
  };

  // =======================================================
  // SAVE GUEST CART
  // =======================================================

  const saveGuestCart = (
    item,
    requestedQuantity
  ) => {
    try {
      const stored =
        localStorage.getItem(
          "guestCart"
        );

      let existingCart = [];

      try {
        existingCart = stored
          ? JSON.parse(stored)
          : [];
      } catch {
        existingCart = [];
      }

      if (!Array.isArray(existingCart)) {
        existingCart = [];
      }

      const productId =
        getProductId(item);

      if (!productId) {
        throw new Error(
          "Product ID missing."
        );
      }

      const safeQuantity = Number(
        requestedQuantity
      );

      const existingIndex =
        existingCart.findIndex(
          (cartItem) =>
            String(
              cartItem?.productId
            ) === String(productId)
        );

      if (existingIndex !== -1) {
        const oldQuantity = Number(
          existingCart[existingIndex]
            ?.quantity
        );

        existingCart[
          existingIndex
        ].quantity =
          (Number.isFinite(oldQuantity)
            ? oldQuantity
            : 0) + safeQuantity;
      } else {
        const productName =
          getProductName(item);

        const category =
          item?.category ?? null;

        const brand =
          item?.brand ?? null;

        const unit =
          item?.unit ?? null;

        const productImage =
          getProductImage(item);

        // VERY IMPORTANT:
        // Cart stores string values for
        // fields that may be rendered.
        const selectedOption =
          getSafeText(
            selectedDropdowns[
              productId
            ] ??
              item?.selectedOption ??
              getUnitName(unit),
            ""
          );

        const images = Array.isArray(
          item?.images
        )
          ? item.images
              .map((img) =>
                getImageUrl(img)
              )
              .filter(Boolean)
          : productImage
          ? [productImage]
          : [];

        existingCart.push({
          productId,

          _id: productId,

          productName,

          name: productName,

          price: Number(
            item?.price ?? 0
          ),

          writtenPrice: Number(
            item?.originalPrice ??
              item?.writtenPrice ??
              item?.price ??
              0
          ),

          discountPrice: Number(
            item?.discountPrice ?? 0
          ),

          stockQuantity: Number(
            item?.stockQuantity ?? 0
          ),

          quantity: safeQuantity,

          // Keep backend object
          // because cart/backend may need ID.
          unit,

          unitName:
            getUnitName(unit),

          images,

          image:
            productImage || "",

          slug:
            getSafeText(
              item?.slug,
              ""
            ),

          sku:
            getSafeText(
              item?.sku,
              ""
            ),

          category,

          categoryName:
            getCategoryName(category),

          brand,

          brandName:
            getBrandName(brand),

          // ALWAYS STRING
          selectedOption,
        });
      }

      localStorage.setItem(
        "guestCart",
        JSON.stringify(existingCart)
      );

      window.dispatchEvent(
        new CustomEvent(
          "cartUpdated",
          {
            detail: {
              cart: existingCart,
            },
          }
        )
      );

      return existingCart;
    } catch (error) {
      console.error(
        "Guest cart error:",
        error
      );

      throw error;
    }
  };

  // =======================================================
  // ADD PRODUCT TO CART
  // =======================================================

  const handleAddToCart = async (
    item,
    requestedQuantity = 1
  ) => {
    if (!item) {
      return;
    }

    const productId =
      getProductId(item);

    if (!productId) {
      alert(
        "Product information is missing."
      );

      return;
    }

    const qty = Number(
      requestedQuantity
    );

    if (
      !Number.isInteger(qty) ||
      qty < 1
    ) {
      alert(
        "Quantity must be at least 1."
      );

      return;
    }

    const stock = Number(
      item?.stockQuantity
    );

    if (
      Number.isFinite(stock) &&
      stock <= 0
    ) {
      alert("Product is out of stock.");
      return;
    }

    if (
      Number.isFinite(stock) &&
      qty > stock
    ) {
      alert(
        `Only ${stock} item(s) available.`
      );

      return;
    }

    try {
      setAddingProductId(productId);
      setCartMessage("");

      const token =
        localStorage.getItem(
          "token"
        );

      // =================================================
      // LOGGED-IN USER
      // =================================================

      if (token) {
        const response =
          await axios.post(
            `${API_URL}/cart/add`,
            {
              productId,

              quantity: qty,
            },
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,

                Accept:
                  "application/json",
              },

              timeout: 30000,
            }
          );

        

        setCartMessage(
          `${getProductName(
            item
          )} added to cart`
        );

        window.dispatchEvent(
          new CustomEvent(
            "cartUpdated",
            {
              detail: {
                productId,

                quantity: qty,
              },
            }
          )
        );

        setTimeout(() => {
          setCartMessage("");
        }, 2500);

        return;
      }

      // =================================================
      // GUEST USER
      // =================================================

      saveGuestCart(
        item,
        qty
      );

      setCartMessage(
        `${getProductName(
          item
        )} added to cart`
      );

      setTimeout(() => {
        setCartMessage("");
      }, 2500);
    } catch (error) {
      console.error(
        "Add to cart error:",
        error
      );

      console.error(
        "Add to cart response:",
        error?.response?.data
      );

      alert(
        error?.response?.data
          ?.message ??
          error?.message ??
          "Unable to add product to cart."
      );
    } finally {
      setAddingProductId(null);
    }
  };

  // =======================================================
  // RETURN
  // =======================================================

  return (
    <section
      className="OurBestsellers-container"
      aria-labelledby="bestsellers-heading"
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="OurBestsellers-header-wrap">
        <h2
          id="bestsellers-heading"
          className="OurBestsellers-title"
        >
          Grocery Sathi Bestsellers
        </h2>

        <nav
          className="OurBestsellers-categories"
          aria-label="Bestseller Categories"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`OurBestsellers-cat-btn ${
                activeCategory === cat
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                setActiveCategory(cat);
                setCurrentIndex(0);
              }}
              aria-pressed={
                activeCategory === cat
              }
            >
              {cat}
            </button>
          ))}
        </nav>
      </div>

      {/* =====================================================
          LOADING
      ===================================================== */}

      {productsLoading &&
        backendProducts.length === 0 && (
          <div
            style={{
              width: "100%",
              textAlign: "center",
              padding: "30px 15px",
            }}
          >
            Loading products...
          </div>
        )}

      {/* =====================================================
          SLIDER
      ===================================================== */}

      <div className="OurBestsellers-slider-section">
        <button
          type="button"
          className="OurBestsellers-arrow left"
          onClick={handlePrev}
          aria-label="Previous products"
        >
          <FaChevronLeft
            aria-hidden="true"
          />
        </button>

        <div className="OurBestsellers-grid">
          {filteredItems
            .slice(
              currentIndex,
              currentIndex + 4
            )
            .map((item) => {
              const productId =
                getProductId(item);

              const isAdding =
                String(
                  addingProductId
                ) ===
                String(productId);

              const isViewing =
                String(
                  viewingProductId
                ) ===
                String(productId);

              const categoryName =
                getSafeText(
                  item?.categoryName ??
                    getCategoryName(
                      item?.category
                    ),
                  "General"
                );

              const productName =
                getProductName(item);

              const rating =
                getProductRating(item);

              // =================================================
              // IMPORTANT FIX
              // =================================================

              const selectedOption =
                getSafeText(
                  selectedDropdowns[
                    productId
                  ] ??
                    item?.selectedOption ??
                    "",
                  ""
                );

              const options =
                Array.isArray(
                  item?.options
                )
                  ? item.options
                      .map((option) =>
                        normalizeOption(
                          option
                        )
                      )
                      .filter(Boolean)
                  : [];

              const optionLabel =
                getSafeText(
                  item?.label,
                  "Option:"
                );

              return (
                <article
                  key={productId}
                  className="OurBestsellers-card"
                  itemScope
                  itemType="https://schema.org/Product"
                >
                  {/* IMAGE */}

                  <div className="OurBestsellers-img-box">
                    {item.badge && (
                      <span
                        className="OurBestsellers-badge"
                        aria-label={`Status: ${item.badge}`}
                      >
                        {getSafeText(
                          item.badge
                        )}
                      </span>
                    )}

                    {/* ACTION ICONS */}

                    <div className="OurBestsellers-action-icons">
                      <button
                        type="button"
                        className="OurBestsellers-icon-btn"
                        aria-label={`Add ${productName} to wishlist`}
                      >
                        <FaHeart
                          aria-hidden="true"
                        />
                      </button>

                      <button
                        type="button"
                        className="OurBestsellers-icon-btn"
                        aria-label={`Compare ${productName}`}
                      >
                        <FaExchangeAlt
                          aria-hidden="true"
                        />
                      </button>

                      <button
                        type="button"
                        className="OurBestsellers-icon-btn"
                        onClick={() =>
                          handleOpenQuickView(
                            item
                          )
                        }
                        aria-label={`Quick view details for ${productName}`}
                      >
                        <FaEye
                          aria-hidden="true"
                        />
                      </button>
                    </div>

                    <img
                      src={item.image}
                      alt={`Buy ${productName} online from Grocery Sathi`}
                      className="OurBestsellers-product-img"
                      onError={
                        handleImageError
                      }
                      itemProp="image"
                    />
                  </div>

                  {/* CONTENT */}

                  <div className="OurBestsellers-content">
                    <span
                      className="OurBestsellers-cat-label"
                      itemProp="category"
                    >
                      {categoryName}
                    </span>

                    <h3
                      className="OurBestsellers-prod-name"
                      itemProp="name"
                    >
                      {productName}
                    </h3>

                    {/* RATING */}

                    <div
                      className="OurBestsellers-rating"
                      aria-label={`Rated ${rating} out of 5 stars`}
                    >
                      {[...Array(5)].map(
                        (_, i) =>
                          i < rating ? (
                            <FaStar
                              key={i}
                              className="star filled"
                              aria-hidden="true"
                            />
                          ) : (
                            <FaRegStar
                              key={i}
                              className="star"
                              aria-hidden="true"
                            />
                          )
                      )}
                    </div>

                    {/* PRICE */}

                    <div
                      className="OurBestsellers-price-box"
                      itemProp="offers"
                      itemScope
                      itemType="https://schema.org/Offer"
                    >
                      <meta
                        itemProp="priceCurrency"
                        content="INR"
                      />

                      <meta
                        itemProp="price"
                        content={item.price}
                      />

                      <span className="OurBestsellers-current-price">
                        {formatINR(
                          item.price
                        )}
                      </span>

                      {Number(
                        item.originalPrice
                      ) >
                        Number(
                          item.price
                        ) && (
                        <span
                          className="OurBestsellers-original-price"
                          aria-label={`Original price: ${formatINR(
                            item.originalPrice
                          )}`}
                        >
                          {formatINR(
                            item.originalPrice
                          )}
                        </span>
                      )}
                    </div>

                    {/* OPTION */}

                    {options.length > 0 && (
                      <div className="OurBestsellers-dropdown-group">
                        <label
                          htmlFor={`select-option-${productId}`}
                          className="OurBestsellers-drop-label"
                        >
                          {optionLabel}
                        </label>

                        <div className="OurBestsellers-select-wrapper">
                          <select
                            id={`select-option-${productId}`}
                            value={
                              selectedOption ||
                              options[0] ||
                              ""
                            }
                            onChange={(e) =>
                              handleDropdownChange(
                                productId,
                                e.target.value
                              )
                            }
                            className="OurBestsellers-select"
                            aria-label={`Select ${optionLabel}`}
                          >
                            {options.map(
                              (
                                opt,
                                index
                              ) => (
                                <option
                                  key={`${productId}-${opt}-${index}`}
                                  value={opt}
                                >
                                  {opt}
                                </option>
                              )
                            )}
                          </select>

                          <FaChevronDown
                            className="OurBestsellers-select-icon"
                            aria-hidden="true"
                          />
                        </div>
                      </div>
                    )}

                    {/* VIEW MORE + ADD TO CART */}

                    <div className="OurBestsellers-buttons">
                      <button
                        type="button"
                        className="OurBestsellers-view-more-btn"
                        onClick={() =>
                          handleViewMore(
                            item
                          )
                        }
                        disabled={
                          isViewing
                        }
                      >
                        {isViewing
                          ? "Loading..."
                          : "View More"}
                      </button>

                      <button
                        type="button"
                        className="OurBestsellers-cart-btn"
                        onClick={() =>
                          handleAddToCart(
                            item,
                            1
                          )
                        }
                        disabled={
                          isAdding ||
                          Number(
                            item.stockQuantity
                          ) <= 0
                        }
                        aria-label={`Add ${productName} to Cart`}
                      >
                        <span>
                          {isAdding
                            ? "Adding..."
                            : Number(
                                item.stockQuantity
                              ) <= 0
                            ? "Out of Stock"
                            : "Add to Cart"}
                        </span>

                        {!isAdding &&
                          Number(
                            item.stockQuantity
                          ) > 0 && (
                            <FaShoppingBag
                              className="btn-arrow-icon"
                              aria-hidden="true"
                            />
                          )}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
        </div>

        <button
          type="button"
          className="OurBestsellers-arrow right"
          onClick={handleNext}
          aria-label="Next products"
        >
          <FaChevronRight
            aria-hidden="true"
          />
        </button>
      </div>

      {/* =====================================================
          NO PRODUCTS
      ===================================================== */}

      {!productsLoading &&
        filteredItems.length === 0 && (
          <div
            style={{
              width: "100%",
              textAlign: "center",
              padding: "30px 15px",
            }}
          >
            No products found in this category.
          </div>
        )}

      {/* =====================================================
          CART SUCCESS MESSAGE
      ===================================================== */}

      {cartMessage && (
        <div
          className="OurBestsellers-cart-toast"
          role="status"
        >
          <FaShoppingBag />

          <span>
            {cartMessage}
          </span>
        </div>
      )}

      {/* =====================================================
          QUICK VIEW MODAL
      ===================================================== */}

      {quickViewItem && (
        <div
          className="OurBestsellers-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-product-title"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              handleCloseQuickView();
            }
          }}
        >
          <div className="OurBestsellers-modal-content">
            {/* CLOSE */}

            <button
              type="button"
              className="OurBestsellers-modal-close"
              onClick={
                handleCloseQuickView
              }
              aria-label="Close modal"
            >
              <FaTimes
                aria-hidden="true"
              />
            </button>

            <div className="OurBestsellers-modal-body">
              {/* MODAL IMAGE */}

              <div className="OurBestsellers-modal-img-col">
                <div className="OurBestsellers-modal-main-img-wrap">
                  <button
                    type="button"
                    className="modal-arr left"
                    onClick={() =>
                      setModalImageIndex(
                        (prev) => {
                          const gallery =
                            Array.isArray(
                              quickViewItem?.gallery
                            )
                              ? quickViewItem.gallery
                              : [];

                          if (
                            gallery.length <=
                            1
                          ) {
                            return 0;
                          }

                          return prev === 0
                            ? gallery.length -
                                1
                            : prev - 1;
                        }
                      )
                    }
                    aria-label="Previous gallery image"
                  >
                    <FaChevronLeft
                      aria-hidden="true"
                    />
                  </button>

                  <img
                    src={
                      quickViewItem
                        ?.gallery?.[
                        modalImageIndex
                      ] ||
                      quickViewItem?.image ||
                      ""
                    }
                    alt={`${getProductName(
                      quickViewItem
                    )} detailed view`}
                    onError={
                      handleImageError
                    }
                  />

                  <button
                    type="button"
                    className="modal-arr right"
                    onClick={() =>
                      setModalImageIndex(
                        (prev) => {
                          const gallery =
                            Array.isArray(
                              quickViewItem?.gallery
                            )
                              ? quickViewItem.gallery
                              : [];

                          if (
                            gallery.length <=
                            1
                          ) {
                            return 0;
                          }

                          return prev >=
                            gallery.length -
                              1
                            ? 0
                            : prev + 1;
                        }
                      )
                    }
                    aria-label="Next gallery image"
                  >
                    <FaChevronRight
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>

              {/* MODAL INFORMATION */}

              <div className="OurBestsellers-modal-info-col">
                <h3
                  id="modal-product-title"
                  className="modal-title"
                >
                  {getProductName(
                    quickViewItem
                  )}
                </h3>

                <p className="modal-desc">
                  {getProductDescription(
                    quickViewItem
                  )}
                </p>

                {/* CATEGORY */}

                <div
                  style={{
                    marginBottom:
                      "12px",
                  }}
                >
                  <span>
                    Category:{" "}
                  </span>

                  <strong>
                    {getSafeText(
                      quickViewItem?.categoryName ??
                        getCategoryName(
                          quickViewItem?.category
                        ),
                      "General"
                    )}
                  </strong>
                </div>

                {/* BRAND */}

                {getBrandName(
                  quickViewItem?.brand
                ) && (
                  <div
                    style={{
                      marginBottom:
                        "12px",
                    }}
                  >
                    <span>
                      Brand:{" "}
                    </span>

                    <strong>
                      {getBrandName(
                        quickViewItem?.brand
                      )}
                    </strong>
                  </div>
                )}

                {/* OPTION */}

                {Array.isArray(
                  quickViewItem?.options
                ) &&
                  quickViewItem.options
                    .length > 0 && (
                    <div className="modal-option-picker">
                      <span className="modal-opt-title">
                        {getSafeText(
                          quickViewItem?.label,
                          "Option:"
                        )}{" "}
                        {getSafeText(
                          selectedDropdowns[
                            getProductId(
                              quickViewItem
                            )
                          ] ??
                            quickViewItem?.selectedOption ??
                            "",
                          ""
                        )}
                      </span>

                      <div className="modal-thumb-row">
                        {(
                          quickViewItem?.gallery ??
                          []
                        ).map(
                          (
                            img,
                            i
                          ) => (
                            <button
                              key={`${img}-${i}`}
                              type="button"
                              className={`modal-thumb-box ${
                                modalImageIndex ===
                                i
                                  ? "active"
                                  : ""
                              }`}
                              onClick={() =>
                                setModalImageIndex(
                                  i
                                )
                              }
                              aria-label={`Show image variation ${
                                i + 1
                              }`}
                            >
                              <img
                                src={img}
                                alt={`${getProductName(
                                  quickViewItem
                                )} thumbnail ${
                                  i + 1
                                }`}
                                onError={
                                  handleImageError
                                }
                              />
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* PRICE */}

                <div className="modal-price-row">
                  <span className="modal-cur-price">
                    {formatINR(
                      quickViewItem?.price
                    )}
                  </span>

                  {Number(
                    quickViewItem?.originalPrice
                  ) >
                    Number(
                      quickViewItem?.price
                    ) && (
                    <span className="modal-orig-price">
                      {formatINR(
                        quickViewItem?.originalPrice
                      )}
                    </span>
                  )}
                </div>

                {/* ACTION */}

                <div className="modal-actions-row">
                  <button
                    type="button"
                    className="modal-add-cart-btn"
                    onClick={() =>
                      handleAddToCart(
                        quickViewItem,
                        quantity
                      )
                    }
                    disabled={
                      String(
                        addingProductId
                      ) ===
                        String(
                          getProductId(
                            quickViewItem
                          )
                        ) ||
                      Number(
                        quickViewItem?.stockQuantity
                      ) <= 0
                    }
                    aria-label="Confirm add to cart"
                  >
                    <span>
                      {String(
                        addingProductId
                      ) ===
                      String(
                        getProductId(
                          quickViewItem
                        )
                      )
                        ? "Adding..."
                        : Number(
                            quickViewItem?.stockQuantity
                          ) <= 0
                        ? "Out of Stock"
                        : "Add to Cart"}
                    </span>

                    <FaShoppingBag
                      aria-hidden="true"
                    />
                  </button>

                  {/* QUANTITY */}

                  <div className="modal-qty-counter">
                    <button
                      type="button"
                      onClick={
                        decreaseQuantity
                      }
                      aria-label="Decrease quantity"
                    >
                      <FaMinus
                        aria-hidden="true"
                      />
                    </button>

                    <span
                      aria-label={`Current quantity: ${quantity}`}
                    >
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={
                        increaseQuantity
                      }
                      aria-label="Increase quantity"
                    >
                      <FaPlus
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </div>

                {/* VIEW DETAILS */}

                <button
                  type="button"
                  className="OurBestsellers-modal-view-more"
                  onClick={async () => {
                    const item =
                      quickViewItem;

                    handleCloseQuickView();

                    await handleViewMore(
                      item
                    );
                  }}
                >
                  View Full Product Details
                  <FaChevronRight />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default OurBestsellers;