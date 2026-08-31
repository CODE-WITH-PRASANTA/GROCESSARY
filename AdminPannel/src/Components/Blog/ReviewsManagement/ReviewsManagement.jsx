import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
} from "react";

import ReactDOM from "react-dom";
import Swal from "sweetalert2";

import API, {
  BASE_URL,
} from "../../../api/axios";

import "./ReviewsManagement.css";

// ======================================================
// CUSTOM PORTAL DROPDOWN
// ======================================================

const CustomDropdown = ({
  label,
  value,
  options,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const [coords, setCoords] = useState({
    top: 0,
    left: 0,
    width: 0,
    openUpward: false,
  });

  const buttonRef = useRef(null);

  const updatePosition = () => {
    if (!buttonRef.current) return;

    const rect =
      buttonRef.current.getBoundingClientRect();

    const spaceBelow =
      window.innerHeight - rect.bottom;

    const openUpward =
      spaceBelow < 200;

    setCoords({
      top: openUpward
        ? rect.top +
          window.scrollY -
          6
        : rect.bottom +
          window.scrollY +
          6,

      left: Math.max(
        12,
        Math.min(
          rect.left +
            window.scrollX,
          window.innerWidth -
            rect.width -
            12
        )
      ),

      width: rect.width,

      openUpward,
    });
  };

  const toggleDropdown = () => {
    if (!isOpen) {
      updatePosition();
    }

    setIsOpen(
      (prev) => !prev
    );
  };

  useEffect(() => {
    const handleScrollOrResize = () => {
      if (isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener(
      "scroll",
      handleScrollOrResize,
      true
    );

    window.addEventListener(
      "resize",
      handleScrollOrResize
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScrollOrResize,
        true
      );

      window.removeEventListener(
        "resize",
        handleScrollOrResize
      );
    };
  }, [isOpen]);

  const selectedOption =
    options.find(
      (option) =>
        option.value === value
    );

  return (
    <div className="ReviewsManagement-dropdownWrapper">
      <button
        ref={buttonRef}
        type="button"
        className={`ReviewsManagement-dropdownBtn ${
          isOpen
            ? "is-active"
            : ""
        }`}
        onClick={toggleDropdown}
      >
        <span>
          {selectedOption
            ? selectedOption.label
            : label}
        </span>

        <svg
          className={`ReviewsManagement-dropdownChevron ${
            isOpen
              ? "is-flipped"
              : ""
          }`}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen &&
        ReactDOM.createPortal(
          <div
            className="ReviewsManagement-portalBackdrop"
            onClick={() =>
              setIsOpen(false)
            }
          >
            <ul
              className="ReviewsManagement-portalMenu"
              style={{
                top: coords.openUpward
                  ? "auto"
                  : `${coords.top}px`,

                bottom: coords.openUpward
                  ? `${
                      window.innerHeight -
                      coords.top
                    }px`
                  : "auto",

                left: `${coords.left}px`,

                minWidth: `${Math.max(
                  coords.width,
                  160
                )}px`,
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              {options.map(
                (option) => (
                  <li
                    key={
                      option.value
                    }
                    className={`ReviewsManagement-portalItem ${
                      option.value ===
                      value
                        ? "is-selected"
                        : ""
                    }`}
                    onClick={() => {
                      onChange(
                        option.value
                      );

                      setIsOpen(false);
                    }}
                  >
                    {option.label}
                  </li>
                )
              )}
            </ul>
          </div>,
          document.body
        )}
    </div>
  );
};

// ======================================================
// FILTER OPTIONS
// ======================================================

const ratingOptions = [
  {
    label: "All Ratings",
    value: "all",
  },
  {
    label: "5 Stars",
    value: "5",
  },
  {
    label: "4 Stars",
    value: "4",
  },
  {
    label: "3 Stars",
    value: "3",
  },
  {
    label: "2 Stars",
    value: "2",
  },
  {
    label: "1 Star",
    value: "1",
  },
];

const statusOptions = [
  {
    label: "All Statuses",
    value: "all",
  },
  {
    label: "Published",
    value: "published",
  },
  {
    label: "Pending",
    value: "pending",
  },
  {
    label: "Rejected",
    value: "rejected",
  },
];

// ======================================================
// STATUS DISPLAY
// ======================================================

const getStatusLabel = (status) => {
  if (!status) {
    return "Pending";
  }

  const value =
    String(status).toLowerCase();

  if (value === "published") {
    return "Published";
  }

  if (value === "rejected") {
    return "Rejected";
  }

  return "Pending";
};

// ======================================================
// REVIEW FORMATTER
// ======================================================

const formatReview = (review) => {
  const customerName =
    review?.reviewerName ||
    review?.user?.name ||
    review?.user?.fullName ||
    review?.user?.username ||
    review?.user?.email?.split(
      "@"
    )[0] ||
    "Customer";

  const customerEmail =
    review?.reviewerEmail ||
    review?.user?.email ||
    "Guest customer";

  const productName =
    review?.product?.productName ||
    "Product";

  const productSku =
    review?.product?.sku ||
    "SKU: N/A";

  const initials =
    customerName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (word) =>
          word.charAt(0)
      )
      .join("")
      .toUpperCase() || "CU";

  const createdDate =
    review?.createdAt
      ? new Date(
          review.createdAt
        )
      : new Date();

  return {
    ...review,

    id: review?._id,

    customer: {
      name: customerName,
      email: customerEmail,
      initials,
      bg: "#d1fae5",
      color: "#047857",
    },

    product: {
      name: productName,

      sku: `SKU: ${productSku}`,

      img:
        review?.product
          ?.images?.[0] || "",
    },

    rating: Number(
      review?.rating || 0
    ),

    review:
      review?.comment || "",

    title:
      review?.title || "",

    date:
      createdDate.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      ),

    time:
      createdDate.toLocaleTimeString(
        "en-IN",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      ),

    status:
      getStatusLabel(
        review?.status
      ),
  };
};

// ======================================================
// MAIN COMPONENT
// ======================================================

const ReviewsManagement = () => {
  const [
    reviews,
    setReviews,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    ratingFilter,
    setRatingFilter,
  ] = useState("all");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const reviewsPerPage = 10;

  // ======================================================
  // TOKEN
  // ======================================================

  const getToken = () => {
    return localStorage.getItem(
      "token"
    );
  };

  // ======================================================
  // AXIOS ERROR MESSAGE
  // ======================================================

  const getApiErrorMessage = (
    error,
    fallback
  ) => {
    return (
      error?.response?.data
        ?.message ||
      error?.response?.data
        ?.error ||
      error?.message ||
      fallback
    );
  };

  // ======================================================
  // FETCH REVIEWS
  // ======================================================

  const fetchReviews = async () => {
    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        await Swal.fire({
          icon: "warning",
          title: "Login Required",
          text:
            "Please login as admin.",
        });

        return;
      }

      // Axios automatically adds:
      // Authorization: Bearer TOKEN

      const response =
        await API.get(
          "/reviews/admin/all"
        );

      const result =
        response.data;

      const formattedReviews =
        Array.isArray(
          result?.reviews
        )
          ? result.reviews.map(
              formatReview
            )
          : [];

      setReviews(
        formattedReviews
      );
    } catch (error) {
      console.error(
        "Fetch reviews error:",
        error
      );

      const message =
        getApiErrorMessage(
          error,
          "Failed to fetch reviews."
        );

      await Swal.fire({
        icon: "error",
        title:
          "Unable to Load Reviews",
        text: message,
      });
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // INITIAL FETCH
  // ======================================================

  useEffect(() => {
    fetchReviews();
  }, []);

  // ======================================================
  // FILTER REVIEWS
  // ======================================================

  const filteredReviews =
    useMemo(() => {
      const term =
        searchTerm
          .toLowerCase()
          .trim();

      return reviews.filter(
        (item) => {
          const customerName =
            item?.customer
              ?.name
              ?.toLowerCase() ||
            "";

          const customerEmail =
            item?.customer
              ?.email
              ?.toLowerCase() ||
            "";

          const productName =
            item?.product
              ?.name
              ?.toLowerCase() ||
            "";

          const reviewText =
            item?.review
              ?.toLowerCase() ||
            "";

          const reviewTitle =
            item?.title
              ?.toLowerCase() ||
            "";

          const matchesSearch =
            !term ||
            customerName.includes(
              term
            ) ||
            customerEmail.includes(
              term
            ) ||
            productName.includes(
              term
            ) ||
            reviewText.includes(
              term
            ) ||
            reviewTitle.includes(
              term
            );

          const matchesRating =
            ratingFilter ===
              "all" ||
            item.rating.toString() ===
              ratingFilter;

          const matchesStatus =
            statusFilter ===
              "all" ||
            item.status
              .toLowerCase() ===
              statusFilter.toLowerCase();

          return (
            matchesSearch &&
            matchesRating &&
            matchesStatus
          );
        }
      );
    }, [
      reviews,
      searchTerm,
      ratingFilter,
      statusFilter,
    ]);

  // ======================================================
  // PAGINATION
  // ======================================================

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredReviews.length /
          reviewsPerPage
      )
    );

  const paginatedReviews =
    useMemo(() => {
      const start =
        (currentPage - 1) *
        reviewsPerPage;

      return filteredReviews.slice(
        start,
        start + reviewsPerPage
      );
    }, [
      filteredReviews,
      currentPage,
    ]);

  useEffect(() => {
    if (
      currentPage >
      totalPages
    ) {
      setCurrentPage(
        totalPages
      );
    }
  }, [
    currentPage,
    totalPages,
  ]);

  // ======================================================
  // METRICS
  // ======================================================

  const metrics = useMemo(() => {
    const total =
      reviews.length;

    const published =
      reviews.filter(
        (review) =>
          review.status ===
          "Published"
      ).length;

    const pending =
      reviews.filter(
        (review) =>
          review.status ===
          "Pending"
      ).length;

    const rejected =
      reviews.filter(
        (review) =>
          review.status ===
          "Rejected"
      ).length;

    const totalRating =
      reviews.reduce(
        (sum, review) =>
          sum +
          Number(
            review.rating || 0
          ),
        0
      );

    const average =
      total > 0
        ? (
            totalRating /
            total
          ).toFixed(1)
        : "0.0";

    return {
      total,
      published,
      pending,
      rejected,
      average,
    };
  }, [reviews]);

  // ======================================================
  // EXPORT
  // ======================================================

  const handleExport = () => {
    if (reviews.length === 0) {
      Swal.fire({
        icon: "info",
        title: "No Reviews",
        text:
          "There are no reviews to export.",
      });

      return;
    }

    const headers = [
      "Customer",
      "Email",
      "Product",
      "Rating",
      "Title",
      "Review",
      "Status",
      "Date",
    ];

    const rows =
      reviews.map(
        (review) => [
          review.customer.name,
          review.customer.email,
          review.product.name,
          review.rating,
          review.title,
          review.review,
          review.status,
          review.date,
        ]
      );

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(
                value ?? ""
              ).replace(
                /"/g,
                '""'
              )}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csv],
      {
        type:
          "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      `reviews-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    URL.revokeObjectURL(
      url
    );

    Swal.fire({
      icon: "success",
      title: "Export Complete",
      text:
        "Reviews exported successfully.",
      timer: 1800,
      showConfirmButton: false,
    });
  };

  // ======================================================
  // VIEW REVIEW
  // ======================================================

  const handleView = async (
    row
  ) => {
    await Swal.fire({
      title:
        row.title ||
        "Customer Review",

      html: `
        <div class="ReviewsManagement-viewReview">
          <div class="ReviewsManagement-viewRow">
            <span>Customer</span>
            <strong>
              ${escapeHtml(
                row.customer.name
              )}
            </strong>
          </div>

          <div class="ReviewsManagement-viewRow">
            <span>Email</span>
            <strong>
              ${escapeHtml(
                row.customer.email
              )}
            </strong>
          </div>

          <div class="ReviewsManagement-viewRow">
            <span>Product</span>
            <strong>
              ${escapeHtml(
                row.product.name
              )}
            </strong>
          </div>

          <div class="ReviewsManagement-viewRow">
            <span>Rating</span>
            <strong class="ReviewsManagement-viewStars">
              ${"★".repeat(
                row.rating
              )}
              ${"☆".repeat(
                Math.max(
                  0,
                  5 - row.rating
                )
              )}
            </strong>
          </div>

          <div class="ReviewsManagement-viewRow">
            <span>Status</span>
            <strong>
              ${escapeHtml(
                row.status
              )}
            </strong>
          </div>

          <div class="ReviewsManagement-viewComment">
            <span>Review</span>
            <p>
              ${escapeHtml(
                row.review
              )}
            </p>
          </div>
        </div>
      `,

      confirmButtonText: "Close",

      width: 620,

      customClass: {
        popup:
          "ReviewsManagement-swalPopup",
        confirmButton:
          "ReviewsManagement-swalConfirm",
      },
    });
  };

  // ======================================================
  // PUBLISH REVIEW
  // ======================================================

  const handlePublish = async (
    id
  ) => {
    const confirm =
      await Swal.fire({
        icon: "question",

        title:
          "Publish Review?",

        text:
          "This review will become visible on the product page.",

        showCancelButton: true,

        confirmButtonText:
          "Yes, Publish",

        cancelButtonText:
          "Cancel",

        confirmButtonColor:
          "#16a34a",

        cancelButtonColor:
          "#64748b",
      });

    if (
      !confirm.isConfirmed
    ) {
      return;
    }

    try {
      setActionLoading(true);

      const token = getToken();

      if (!token) {
        await Swal.fire({
          icon: "warning",
          title: "Login Required",
          text:
            "Please login as admin.",
        });

        return;
      }

      // ==================================================
      // PATCH REQUEST
      // ==================================================

      await API.put(
        `/reviews/admin/${id}/publish`
      );

      // ==================================================
      // UPDATE LOCAL STATE
      // ==================================================

      setReviews(
        (prev) =>
          prev.map(
            (review) =>
              review.id === id
                ? {
                    ...review,
                    status:
                      "Published",
                  }
                : review
          )
      );

      await Swal.fire({
        icon: "success",
        title:
          "Review Published",
        text:
          "The review is now visible on the product page.",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(
        "Publish review error:",
        error
      );

      await Swal.fire({
        icon: "error",
        title:
          "Publish Failed",
        text:
          getApiErrorMessage(
            error,
            "Unable to publish review."
          ),
      });
    } finally {
      setActionLoading(false);
    }
  };

  // ======================================================
  // REJECT REVIEW
  // ======================================================

  const handleReject = async (
    id
  ) => {
    const confirm =
      await Swal.fire({
        icon: "warning",

        title:
          "Reject Review?",

        text:
          "This review will not be visible on the product page.",

        showCancelButton: true,

        confirmButtonText:
          "Yes, Reject",

        cancelButtonText:
          "Cancel",

        confirmButtonColor:
          "#dc2626",

        cancelButtonColor:
          "#64748b",
      });

    if (
      !confirm.isConfirmed
    ) {
      return;
    }

    try {
      setActionLoading(true);

      const token = getToken();

      if (!token) {
        await Swal.fire({
          icon: "warning",
          title: "Login Required",
          text:
            "Please login as admin.",
        });

        return;
      }

      // ==================================================
      // PATCH REQUEST
      // ==================================================

      await API.put(
        `/reviews/admin/${id}/reject`
      );

      // ==================================================
      // UPDATE LOCAL STATE
      // ==================================================

      setReviews(
        (prev) =>
          prev.map(
            (review) =>
              review.id === id
                ? {
                    ...review,
                    status:
                      "Rejected",
                  }
                : review
          )
      );

      await Swal.fire({
        icon: "success",
        title:
          "Review Rejected",
        text:
          "The review has been rejected.",
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(
        "Reject review error:",
        error
      );

      await Swal.fire({
        icon: "error",
        title:
          "Reject Failed",
        text:
          getApiErrorMessage(
            error,
            "Unable to reject review."
          ),
      });
    } finally {
      setActionLoading(false);
    }
  };

  // ======================================================
  // UNPUBLISH REVIEW
  // ======================================================

  const handleUnpublish =
    async (id) => {
      const confirm =
        await Swal.fire({
          icon: "warning",

          title:
            "Unpublish Review?",

          text:
            "This review will be removed from the public product page.",

          showCancelButton: true,

          confirmButtonText:
            "Yes, Unpublish",

          cancelButtonText:
            "Cancel",

          confirmButtonColor:
            "#d97706",

          cancelButtonColor:
            "#64748b",
        });

      if (
        !confirm.isConfirmed
      ) {
        return;
      }

      try {
        setActionLoading(true);

        const token = getToken();

        if (!token) {
          await Swal.fire({
            icon: "warning",
            title:
              "Login Required",
            text:
              "Please login as admin.",
          });

          return;
        }

        // ==================================================
        // PATCH REQUEST
        // ==================================================

        await API.put(
          `/reviews/admin/${id}/unpublish`
        );

        // ==================================================
        // UPDATE LOCAL STATE
        // ==================================================

        setReviews(
          (prev) =>
            prev.map(
              (review) =>
                review.id === id
                  ? {
                      ...review,
                      status:
                        "Pending",
                    }
                  : review
            )
        );

        await Swal.fire({
          icon: "success",
          title:
            "Review Unpublished",
          text:
            "The review is now pending again.",
          timer: 1600,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error(
          "Unpublish review error:",
          error
        );

        await Swal.fire({
          icon: "error",
          title:
            "Action Failed",
          text:
            getApiErrorMessage(
              error,
              "Unable to unpublish review."
            ),
        });
      } finally {
        setActionLoading(false);
      }
    };

  // ======================================================
  // DELETE REVIEW
  // ======================================================

  const handleDelete = async (
    id
  ) => {
    const confirm =
      await Swal.fire({
        icon: "warning",

        title:
          "Delete Review?",

        text:
          "This action cannot be undone.",

        showCancelButton: true,

        confirmButtonText:
          "Yes, Delete",

        cancelButtonText:
          "Cancel",

        confirmButtonColor:
          "#dc2626",

        cancelButtonColor:
          "#64748b",
      });

    if (
      !confirm.isConfirmed
    ) {
      return;
    }

    try {
      setActionLoading(true);

      const token = getToken();

      if (!token) {
        await Swal.fire({
          icon: "warning",
          title:
            "Login Required",
          text:
            "Please login as admin.",
        });

        return;
      }

      // ==================================================
      // DELETE REQUEST
      // ==================================================

      await API.delete(
        `/reviews/${id}`
      );

      // ==================================================
      // REMOVE FROM LOCAL STATE
      // ==================================================

      setReviews(
        (prev) =>
          prev.filter(
            (review) =>
              review.id !== id
          )
      );

      await Swal.fire({
        icon: "success",
        title:
          "Review Deleted",
        text:
          "The review was deleted successfully.",
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(
        "Delete review error:",
        error
      );

      await Swal.fire({
        icon: "error",
        title:
          "Delete Failed",
        text:
          getApiErrorMessage(
            error,
            "Unable to delete review."
          ),
      });
    } finally {
      setActionLoading(false);
    }
  };

  // ======================================================
  // EDIT / STATUS ACTION
  // ======================================================

  const handleEdit = async (
    row
  ) => {
    if (
      row.status ===
      "Pending"
    ) {
      await handlePublish(
        row.id
      );

      return;
    }

    if (
      row.status ===
      "Published"
    ) {
      await handleUnpublish(
        row.id
      );

      return;
    }

    if (
      row.status ===
      "Rejected"
    ) {
      await handlePublish(
        row.id
      );
    }
  };

  // ======================================================
  // FILTER CHANGE
  // ======================================================

  const handleFilterChange = (
    setter,
    value
  ) => {
    setter(value);

    setCurrentPage(1);
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="ReviewsManagement-container">
        <div className="ReviewsManagement-loading">
          <div className="ReviewsManagement-spinner" />

          <span>
            Loading reviews...
          </span>
        </div>
      </div>
    );
  }

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="ReviewsManagement-container">

      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="ReviewsManagement-header">
        <div>
          <h1 className="ReviewsManagement-title">
            Reviews Management
          </h1>

          <nav className="ReviewsManagement-breadcrumb">
            Dashboard &gt; Reviews &gt;{" "}
            <span>
              All Reviews
            </span>
          </nav>
        </div>

        <button
          type="button"
          className="ReviewsManagement-btnExport"
          onClick={
            handleExport
          }
          disabled={
            actionLoading
          }
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />

            <polyline points="7 10 12 15 17 10" />

            <line
              x1="12"
              y1="15"
              x2="12"
              y2="3"
            />
          </svg>

          Export Reviews
        </button>
      </header>

      {/* ==================================================
          METRICS
      ================================================== */}

      <section className="ReviewsManagement-metrics">

        <article className="ReviewsManagement-metricCard">
          <div className="ReviewsManagement-metricIcon total">
            ★
          </div>

          <div className="ReviewsManagement-metricInfo">
            <span className="ReviewsManagement-metricTitle">
              Total Reviews
            </span>

            <span className="ReviewsManagement-metricCount">
              {metrics.total}
            </span>

            <span className="ReviewsManagement-metricSub is-positive">
              All reviews
            </span>
          </div>
        </article>

        <article className="ReviewsManagement-metricCard">
          <div className="ReviewsManagement-metricIcon average">
            ★
          </div>

          <div className="ReviewsManagement-metricInfo">
            <span className="ReviewsManagement-metricTitle">
              Average Rating
            </span>

            <span className="ReviewsManagement-metricCount">
              {metrics.average} / 5
            </span>

            <span className="ReviewsManagement-metricSub is-positive">
              Current average
            </span>
          </div>
        </article>

        <article className="ReviewsManagement-metricCard">
          <div className="ReviewsManagement-metricIcon published">
            ✓
          </div>

          <div className="ReviewsManagement-metricInfo">
            <span className="ReviewsManagement-metricTitle">
              Published Reviews
            </span>

            <span className="ReviewsManagement-metricCount">
              {metrics.published}
            </span>

            <span className="ReviewsManagement-metricSub is-positive">
              Visible to customers
            </span>
          </div>
        </article>

        <article className="ReviewsManagement-metricCard">
          <div className="ReviewsManagement-metricIcon pending">
            !
          </div>

          <div className="ReviewsManagement-metricInfo">
            <span className="ReviewsManagement-metricTitle">
              Pending Reviews
            </span>

            <span className="ReviewsManagement-metricCount">
              {metrics.pending}
            </span>

            <span className="ReviewsManagement-metricSub is-negative">
              Waiting for approval
            </span>
          </div>
        </article>

      </section>

      {/* ==================================================
          TOOLBAR
      ================================================== */}

      <section className="ReviewsManagement-toolbar">

        <div className="ReviewsManagement-search">
          <span className="ReviewsManagement-searchIcon">
            🔍
          </span>

          <input
            type="text"
            placeholder="Search reviews, customers..."
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
          />
        </div>

        <div className="ReviewsManagement-filters">

          <CustomDropdown
            label="All Ratings"
            value={
              ratingFilter
            }
            options={
              ratingOptions
            }
            onChange={(value) =>
              handleFilterChange(
                setRatingFilter,
                value
              )
            }
          />

          <CustomDropdown
            label="All Statuses"
            value={
              statusFilter
            }
            options={
              statusOptions
            }
            onChange={(value) =>
              handleFilterChange(
                setStatusFilter,
                value
              )
            }
          />

        </div>
      </section>

      {/* ==================================================
          TABLE
      ================================================== */}

      <div className="ReviewsManagement-tableContainer">

        <table className="ReviewsManagement-table">

          <thead>
            <tr>
              <th>
                Customer
              </th>

              <th>
                Product
              </th>

              <th>
                Rating
              </th>

              <th>
                Review
              </th>

              <th>
                Date
              </th>

              <th>
                Status
              </th>

              <th className="u-text-center">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {paginatedReviews.length >
            0 ? (
              paginatedReviews.map(
                (row) => (
                  <tr
                    key={
                      row.id
                    }
                  >

                    {/* CUSTOMER */}

                    <td>
                      <div className="ReviewsManagement-customer">

                        <div
                          className="ReviewsManagement-avatar"
                          style={{
                            backgroundColor:
                              row.customer
                                .bg,

                            color:
                              row.customer
                                .color,
                          }}
                        >
                          {
                            row.customer
                              .initials
                          }
                        </div>

                        <div className="ReviewsManagement-meta">
                          <strong className="ReviewsManagement-name">
                            {
                              row.customer
                                .name
                            }
                          </strong>

                          <span className="ReviewsManagement-subtext">
                            {
                              row.customer
                                .email
                            }
                          </span>
                        </div>

                      </div>
                    </td>

                    {/* PRODUCT */}

                    <td>
                      <div className="ReviewsManagement-product">

                        {row.product.img ? (
                          <img
                            src={
                              row.product.img.startsWith(
                                "http"
                              )
                                ? row
                                    .product
                                    .img
                                : `${BASE_URL}${row.product.img}`
                            }
                            alt={
                              row.product
                                .name
                            }
                            className="ReviewsManagement-productImg"
                          />
                        ) : (
                          <div className="ReviewsManagement-productImg ReviewsManagement-productPlaceholder">
                            📦
                          </div>
                        )}

                        <div className="ReviewsManagement-meta">
                          <strong className="ReviewsManagement-name">
                            {
                              row.product
                                .name
                            }
                          </strong>

                          <span className="ReviewsManagement-subtext">
                            {
                              row.product
                                .sku
                            }
                          </span>
                        </div>

                      </div>
                    </td>

                    {/* RATING */}

                    <td>
                      <div className="ReviewsManagement-stars">
                        {[1, 2, 3, 4, 5].map(
                          (star) => (
                            <span
                              key={
                                star
                              }
                              className={`ReviewsManagement-star ${
                                star <=
                                row.rating
                                  ? "is-filled"
                                  : ""
                              }`}
                            >
                              ★
                            </span>
                          )
                        )}
                      </div>
                    </td>

                    {/* REVIEW */}

                    <td>
                      <div className="ReviewsManagement-reviewCell">

                        {row.title && (
                          <strong className="ReviewsManagement-reviewTitle">
                            {
                              row.title
                            }
                          </strong>
                        )}

                        <p className="ReviewsManagement-reviewText">
                          {
                            row.review
                          }
                        </p>

                      </div>
                    </td>

                    {/* DATE */}

                    <td>
                      <div className="ReviewsManagement-meta">
                        <span className="ReviewsManagement-date">
                          {
                            row.date
                          }
                        </span>

                        <span className="ReviewsManagement-subtext">
                          {
                            row.time
                          }
                        </span>
                      </div>
                    </td>

                    {/* STATUS */}

                    <td>
                      <span
                        className={`ReviewsManagement-badge is-${row.status.toLowerCase()}`}
                      >
                        {
                          row.status
                        }
                      </span>
                    </td>

                    {/* ACTIONS */}

                    <td>
                      <div className="ReviewsManagement-actions">

                        {/* VIEW */}

                        <button
                          type="button"
                          className="ReviewsManagement-actionBtn"
                          title="View"
                          onClick={() =>
                            handleView(
                              row
                            )
                          }
                          disabled={
                            actionLoading
                          }
                        >
                          👁️
                        </button>

                        {/* PUBLISH */}

                        {row.status !==
                          "Published" && (
                          <button
                            type="button"
                            className="ReviewsManagement-actionBtn publish"
                            title="Publish"
                            onClick={() =>
                              handlePublish(
                                row.id
                              )
                            }
                            disabled={
                              actionLoading
                            }
                          >
                            ✓
                          </button>
                        )}

                        {/* UNPUBLISH */}

                        {row.status ===
                          "Published" && (
                          <button
                            type="button"
                            className="ReviewsManagement-actionBtn unpublish"
                            title="Unpublish"
                            onClick={() =>
                              handleUnpublish(
                                row.id
                              )
                            }
                            disabled={
                              actionLoading
                            }
                          >
                            ↩
                          </button>
                        )}

                        {/* REJECT */}

                        {row.status !==
                          "Rejected" && (
                          <button
                            type="button"
                            className="ReviewsManagement-actionBtn reject"
                            title="Reject"
                            onClick={() =>
                              handleReject(
                                row.id
                              )
                            }
                            disabled={
                              actionLoading
                            }
                          >
                            ✕
                          </button>
                        )}

                        {/* DELETE */}

                        <button
                          type="button"
                          className="ReviewsManagement-actionBtn is-delete"
                          title="Delete"
                          onClick={() =>
                            handleDelete(
                              row.id
                            )
                          }
                          disabled={
                            actionLoading
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
                  className="ReviewsManagement-empty"
                >
                  <div className="ReviewsManagement-emptyIcon">
                    ⭐
                  </div>

                  <strong>
                    {searchTerm ||
                    ratingFilter !==
                      "all" ||
                    statusFilter !==
                      "all"
                      ? "No matching reviews found."
                      : "No reviews found."}
                  </strong>

                  <span>
                    Try changing your search or filters.
                  </span>
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

      {/* ==================================================
          PAGINATION
      ================================================== */}

      <footer className="ReviewsManagement-pagination">

        <span>
          Showing{" "}
          {filteredReviews.length ===
          0
            ? 0
            : (currentPage - 1) *
                reviewsPerPage +
              1}
          {" - "}
          {Math.min(
            currentPage *
              reviewsPerPage,
            filteredReviews.length
          )}{" "}
          of{" "}
          {filteredReviews.length}{" "}
          reviews
        </span>

        <div className="ReviewsManagement-paginationControls">

          <button
            type="button"
            className="ReviewsManagement-pgBtn"
            disabled={
              currentPage ===
                1 ||
              actionLoading
            }
            onClick={() =>
              setCurrentPage(
                (page) =>
                  Math.max(
                    1,
                    page - 1
                  )
              )
            }
          >
            ‹
          </button>

          {Array.from(
            {
              length:
                totalPages,
            },
            (_, index) =>
              index + 1
          )
            .slice(
              Math.max(
                0,
                currentPage - 3
              ),
              Math.min(
                totalPages,
                currentPage + 2
              )
            )
            .map((page) => (
              <button
                key={page}
                type="button"
                className={`ReviewsManagement-pgBtn ${
                  currentPage ===
                  page
                    ? "is-active"
                    : ""
                }`}
                onClick={() =>
                  setCurrentPage(
                    page
                  )
                }
              >
                {page}
              </button>
            ))}

          <button
            type="button"
            className="ReviewsManagement-pgBtn"
            disabled={
              currentPage ===
                totalPages ||
              actionLoading
            }
            onClick={() =>
              setCurrentPage(
                (page) =>
                  Math.min(
                    totalPages,
                    page + 1
                  )
              )
            }
          >
            ›
          </button>

        </div>
      </footer>

    </div>
  );
};

// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHtml(value) {
  return String(
    value || ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
}

export default ReviewsManagement;