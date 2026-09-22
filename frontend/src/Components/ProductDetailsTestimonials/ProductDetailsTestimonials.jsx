import React, { useEffect, useState } from "react";
import "./ProductDetailsTestimonials.css";

import {
  FaStar,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

import API from "../../api/axios"; // Update this import according to your API file

const ProductDetailsTestimonials = ({ productId }) => {
  const [testimonialsData, setTestimonialsData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCardsPerView(1);
      } else if (window.innerWidth < 1200) {
        setCardsPerView(2);
      } else {
        setCardsPerView(3);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const fetchProductReviews = async () => {
      if (!productId) {
        setTestimonialsData([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const response = await API.get(
          `/reviews/product/${productId}`
        );

        const reviews = response.data?.reviews || [];

        // Backend already returns published reviews sorted by latest.
        // Take only the latest four reviews.
        const latestReviews = reviews.slice(0, 4);

        const formattedReviews = latestReviews.map((review) => {
          const customerName =
            review.reviewerName ||
            review.user?.name ||
            "Anonymous Customer";

          const customerImage =
            review.user?.profileImage ||
            review.user?.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              customerName
            )}&background=d1fae5&color=047857`;

          return {
            id: review._id,
            score: `${review.rating}.0 / 5.0`,
            rating: Number(review.rating) || 0,
            title: review.title || "Customer Review",
            text: review.comment || "",
            customerName,
            role: review.user ? "Verified Customer" : "Customer",
            productName:
              review.product?.productName || "this product",
            customerImage,
          };
        });

        setTestimonialsData(formattedReviews);
        setCurrentIndex(0);
      } catch (error) {
        console.error("Error fetching product reviews:", error);
        setTestimonialsData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductReviews();
  }, [productId]);

  const maxIndex = Math.max(
    0,
    testimonialsData.length - cardsPerView
  );

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev > 0 ? prev - 1 : maxIndex
    );
  };

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev < maxIndex ? prev + 1 : 0
    );
  };

  if (loading) {
    return (
      <section className="product-details-testimonials">
        <div className="product-details-testimonials__container">
          <p>Loading reviews...</p>
        </div>
      </section>
    );
  }

  if (!testimonialsData.length) {
    return null;
  }

  return (
    <section className="product-details-testimonials">
      <div className="product-details-testimonials__container">
        {/* Left Side Info */}
        <div className="product-details-testimonials__intro">
          <h2 className="product-details-testimonials__title">
            Customer Reviews
          </h2>

          <p className="product-details-testimonials__description">
            See what customers are saying about this product.
            These reviews are published by our admin team.
          </p>
        </div>

        {/* Right Side Carousel */}
        <div className="product-details-testimonials__carousel-wrapper">
          {testimonialsData.length > cardsPerView && (
            <button
              type="button"
              className="product-details-testimonials__arrow product-details-testimonials__arrow--prev"
              onClick={prevSlide}
              aria-label="Previous testimonial"
            >
              <FaChevronLeft />
            </button>
          )}

          <div className="product-details-testimonials__slider-viewport">
            <div
              className="product-details-testimonials__track"
              style={{
                transform: `translateX(-${
                  currentIndex * (100 / cardsPerView)
                }%)`,
              }}
            >
              {testimonialsData.map((item) => (
                <div
                  className="product-details-testimonials__card-item"
                  key={item.id}
                >
                  <div className="product-details-testimonials__card">
                    {/* Rating Header */}
                    <div className="product-details-testimonials__rating-header">
                      <div className="product-details-testimonials__stars">
                        {[...Array(item.rating)].map((_, index) => (
                          <FaStar key={index} />
                        ))}
                      </div>

                      <span className="product-details-testimonials__score">
                        {item.score}
                      </span>
                    </div>

                    {/* Review Title */}
                    <h3 className="product-details-testimonials__review-title">
                      {item.title}
                    </h3>

                    {/* Review Comment */}
                    <p className="product-details-testimonials__review-text">
                      {item.text}
                    </p>

                    {/* Customer Information */}
                    <div className="product-details-testimonials__customer">
                      <img
                        src={item.customerImage}
                        alt={item.customerName}
                        className="product-details-testimonials__avatar"
                        onError={(event) => {
                          event.currentTarget.src =
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              item.customerName
                            )}&background=d1fae5&color=047857`;
                        }}
                      />

                      <div className="product-details-testimonials__meta">
                        <p className="product-details-testimonials__name-role">
                          <strong>{item.customerName}</strong>,{" "}
                          {item.role}
                        </p>

                        <p className="product-details-testimonials__product-ref">
                          about {item.productName}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {testimonialsData.length > cardsPerView && (
            <button
              type="button"
              className="product-details-testimonials__arrow product-details-testimonials__arrow--next"
              onClick={nextSlide}
              aria-label="Next testimonial"
            >
              <FaChevronRight />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductDetailsTestimonials;