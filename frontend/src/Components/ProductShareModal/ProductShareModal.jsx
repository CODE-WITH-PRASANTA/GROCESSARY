import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Copy,
  Check,
  Share2,
  Download,
  ExternalLink,
  MessageCircle,
  Mail,
  Smartphone,
  Star,
  Sparkles,
} from "lucide-react";
import "./ProductShareModal.css";

// SVG Icons for authentic Flipkart-style social share buttons
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
    <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.276-.101-.477-.15-.678.151-.2.301-.778.979-.954 1.18-.175.201-.351.226-.652.076-.301-.151-1.27-.468-2.42-1.493-.895-.798-1.5-1.784-1.676-2.085-.175-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.175.201-.301.301-.502.101-.2.05-.376-.025-.526-.075-.151-.678-1.634-.929-2.237-.245-.588-.494-.508-.678-.518-.176-.009-.377-.01-.578-.01-.201 0-.527.075-.803.376s-1.054 1.03-1.054 2.511 1.079 2.912 1.23 3.113c.15.201 2.122 3.24 5.141 4.544.718.31 1.279.496 1.716.634.721.23 1.377.197 1.895.12.577-.087 1.78-.727 2.031-1.43.251-.703.251-1.306.176-1.43-.076-.125-.276-.201-.577-.351zM12.042 2C6.536 2 2.06 6.476 2.06 11.982c0 1.968.57 3.87 1.651 5.505L2 22l4.675-1.657a9.923 9.923 0 005.367 1.639h.004c5.505 0 9.981-4.477 9.981-9.982A9.957 9.957 0 0012.042 2zm0 18.274h-.003a8.275 8.275 0 01-4.218-1.157l-.302-.18-3.136 1.111 1.134-3.056-.197-.314a8.254 8.254 0 01-1.267-4.396c0-4.568 3.717-8.285 8.288-8.285a8.237 8.237 0 015.864 2.428 8.236 8.236 0 012.424 5.861c0 4.57-3.717 8.288-8.289 8.288z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
  </svg>
);

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
  </svg>
);

const ProductShareModal = ({
  isOpen,
  onClose,
  product,
  activeImageUrl,
  productName,
  effectivePrice,
  originalPrice,
  discountPercent,
  formattedUnit,
}) => {
  const [copied, setCopied] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const canvasRef = useRef(null);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const displayTitle = productName || product?.name || "Grocery Item";
  const finalPrice = effectivePrice || product?.discountPrice || product?.price || 0;
  const mrp = originalPrice || product?.writtenPrice || product?.price || 0;
  const discount = discountPercent || Math.round(((mrp - finalPrice) / mrp) * 100) || 0;
  const rating = Number(product?.rating || 4.8).toFixed(1);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Pre-formatted Flipkart-style share message
  const shareText = `🛒 Hey, check out ${displayTitle} on GrocerySathi!\n💰 Price: ₹${finalPrice}${
    discount > 0 ? ` (MRP ₹${mrp}, ${discount}% OFF)` : ""
  }\n⚡ Delivered fresh in 10 minutes.\n👉 Buy now: ${shareUrl}`;

  // Copy link handler
  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const tempInput = document.createElement("input");
        tempInput.value = shareUrl;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  // WhatsApp share
  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Telegram share
  const handleTelegramShare = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(
      shareUrl
    )}&text=${encodeURIComponent(
      `🛒 Check out ${displayTitle} on GrocerySathi (₹${finalPrice})`
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Facebook share
  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      shareUrl
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Twitter/X share
  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      `Check out ${displayTitle} on GrocerySathi for ₹${finalPrice}! ⚡ Delivered in 10 minutes`
    )}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Email share
  const handleEmailShare = () => {
    const subject = `Check out ${displayTitle} on GrocerySathi`;
    const body = `Hi,\n\nI found this on GrocerySathi:\n\n${displayTitle}\nPrice: ₹${finalPrice} ${
      discount > 0 ? `(${discount}% OFF)` : ""
    }\n\nOrder here: ${shareUrl}\n\nGrocerySathi - Delivered in 10 minutes!`;
    window.location.href = `mailto:?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  // Native Web Share API (mobile devices / supported browsers)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: displayTitle,
          text: `Check out ${displayTitle} on GrocerySathi for ₹${finalPrice}!`,
          url: shareUrl,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Native share error:", err);
        }
      }
    } else {
      handleCopyLink();
    }
  };

  // Generate a Flipkart-style downloadable / shareable product card image
  const handleDownloadImageCard = () => {
    setIsGeneratingImage(true);
    const canvas = canvasRef.current;
    if (!canvas) {
      setIsGeneratingImage(false);
      return;
    }

    const ctx = canvas.getContext("2d");
    const width = 800;
    const height = 900;
    canvas.width = width;
    canvas.height = height;

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Top Header Banner (Brand Green)
    const headerGrad = ctx.createLinearGradient(0, 0, width, 0);
    headerGrad.addColorStop(0, "#054820");
    headerGrad.addColorStop(1, "#059669");
    ctx.fillStyle = headerGrad;
    ctx.fillRect(0, 0, width, 110);

    // Header Text: Brand & Tagline
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 34px system-ui, sans-serif";
    ctx.fillText("GrocerySathi", 40, 68);

    ctx.fillStyle = "#fef08a";
    ctx.font = "bold 20px system-ui, sans-serif";
    ctx.fillText("⚡ 10 MINS DELIVERY", width - 260, 68);

    // Load Product Image
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = activeImageUrl || product?.image || "/placeholder.png";

    img.onload = () => {
      // Draw image in a rounded rectangular container
      const imgBoxX = 50;
      const imgBoxY = 140;
      const imgBoxW = width - 100;
      const imgBoxH = 440;

      ctx.fillStyle = "#f8fafc";
      ctx.beginPath();
      ctx.roundRect(imgBoxX, imgBoxY, imgBoxW, imgBoxH, 20);
      ctx.fill();
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw product image contained inside box
      const scale = Math.min((imgBoxW - 40) / img.width, (imgBoxH - 40) / img.height);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const drawX = imgBoxX + (imgBoxW - drawW) / 2;
      const drawY = imgBoxY + (imgBoxH - drawH) / 2;

      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      // Discount badge on image (Flipkart style)
      if (discount > 0) {
        ctx.fillStyle = "#dc2626";
        ctx.beginPath();
        ctx.roundRect(imgBoxX + 20, imgBoxY + 20, 140, 42, 10);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 20px system-ui, sans-serif";
        ctx.fillText(`${discount}% OFF`, imgBoxX + 38, imgBoxY + 48);
      }

      // Product Title
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 32px system-ui, sans-serif";
      const truncatedTitle =
        displayTitle.length > 38 ? displayTitle.substring(0, 36) + "..." : displayTitle;
      ctx.fillText(truncatedTitle, 50, 630);

      // Unit
      if (formattedUnit) {
        ctx.fillStyle = "#64748b";
        ctx.font = "500 22px system-ui, sans-serif";
        ctx.fillText(`Pack: ${formattedUnit}`, 50, 670);
      }

      // Price Row
      ctx.fillStyle = "#059669";
      ctx.font = "bold 44px system-ui, sans-serif";
      ctx.fillText(`₹${finalPrice}`, 50, 735);

      if (mrp > finalPrice) {
        ctx.fillStyle = "#94a3b8";
        ctx.font = "500 28px system-ui, sans-serif";
        const priceWidth = ctx.measureText(`₹${finalPrice}`).width;
        const mrpX = 60 + priceWidth;
        ctx.fillText(`₹${mrp}`, mrpX, 735);

        // Strikethrough
        const mrpWidth = ctx.measureText(`₹${mrp}`).width;
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(mrpX - 2, 725);
        ctx.lineTo(mrpX + mrpWidth + 2, 725);
        ctx.stroke();
      }

      // Rating Pill
      ctx.fillStyle = "#15803d";
      ctx.beginPath();
      ctx.roundRect(width - 170, 695, 120, 44, 22);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 22px system-ui, sans-serif";
      ctx.fillText(`★ ${rating}`, width - 146, 726);

      // Bottom Call-to-Action Bar
      const footerY = 780;
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.roundRect(50, footerY, width - 100, 75, 16);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px system-ui, sans-serif";
      ctx.fillText("Order Now on grocerysathi.com", 80, footerY + 46);

      ctx.fillStyle = "#facc15";
      ctx.font = "bold 20px system-ui, sans-serif";
      ctx.fillText("Free Delivery ➔", width - 250, footerY + 46);

      // Export canvas to PNG download
      try {
        const dataUrl = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.download = `${displayTitle.replace(/[^a-zA-Z0-9]/g, "_")}_GrocerySathi.png`;
        a.href = dataUrl;
        a.click();
      } catch (err) {
        console.error("Canvas export failed", err);
      } finally {
        setIsGeneratingImage(false);
      }
    };

    img.onerror = () => {
      setIsGeneratingImage(false);
      // Fallback: copy link
      handleCopyLink();
    };
  };

  return (
    <div className="pd-share-modal-backdrop" onClick={onClose}>
      <div
        className="pd-share-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
      >
        {/* MODAL HEADER (FLIPKART STYLE) */}
        <div className="pd-share-modal-header">
          <div className="pd-share-header-title-wrap">
            <Share2 size={20} className="pd-share-header-icon" />
            <h2 id="share-modal-title" className="pd-share-modal-title">
              Share this product
            </h2>
          </div>
          <button
            type="button"
            className="pd-share-close-btn"
            onClick={onClose}
            aria-label="Close share dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* FLIPKART-STYLE PRODUCT PREVIEW CARD */}
        <div className="pd-share-product-card">
          <div className="pd-share-card-img-wrap">
            <img
              src={activeImageUrl || product?.image || "/placeholder.png"}
              alt={displayTitle}
              className="pd-share-card-img"
              onError={(e) => {
                e.target.src =
                  "https://placehold.co/120x120/f1f5f9/059669?text=Grocery";
              }}
            />
            {discount > 0 && (
              <span className="pd-share-card-discount-badge">
                {discount}% OFF
              </span>
            )}
          </div>

          <div className="pd-share-card-details">
            <span className="pd-share-delivery-tag">
              ⚡ 10 Mins Delivery • GrocerySathi
            </span>
            <h3 className="pd-share-card-title">{displayTitle}</h3>
            {formattedUnit && (
              <span className="pd-share-card-unit">{formattedUnit}</span>
            )}

            <div className="pd-share-card-pricing">
              <span className="pd-share-final-price">₹{finalPrice}</span>
              {mrp > finalPrice && (
                <span className="pd-share-mrp-price">₹{mrp}</span>
              )}
              {rating && (
                <span className="pd-share-rating-pill">
                  <Star size={12} fill="#ffffff" color="#ffffff" />
                  <span>{rating}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ONE-CLICK LINK COPY BAR */}
        <div className="pd-share-link-section">
          <label className="pd-share-section-label">Product Link</label>
          <div className="pd-share-link-box">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="pd-share-link-input"
              onClick={(e) => e.target.select()}
            />
            <button
              type="button"
              className={`pd-share-copy-btn ${copied ? "copied" : ""}`}
              onClick={handleCopyLink}
            >
              {copied ? (
                <>
                  <Check size={16} />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* SOCIAL SHARE OPTIONS GRID (FLIPKART STYLE) */}
        <div className="pd-share-channels-section">
          <label className="pd-share-section-label">Share via</label>
          <div className="pd-share-channels-grid">
            {/* WhatsApp */}
            <button
              type="button"
              className="pd-share-channel-btn whatsapp"
              onClick={handleWhatsAppShare}
              title="Share on WhatsApp"
            >
              <div className="pd-channel-icon-circle whatsapp">
                <WhatsAppIcon />
              </div>
              <span className="pd-channel-name">WhatsApp</span>
            </button>

            {/* Telegram */}
            <button
              type="button"
              className="pd-share-channel-btn telegram"
              onClick={handleTelegramShare}
              title="Share on Telegram"
            >
              <div className="pd-channel-icon-circle telegram">
                <TelegramIcon />
              </div>
              <span className="pd-channel-name">Telegram</span>
            </button>

            {/* Facebook */}
            <button
              type="button"
              className="pd-share-channel-btn facebook"
              onClick={handleFacebookShare}
              title="Share on Facebook"
            >
              <div className="pd-channel-icon-circle facebook">
                <FacebookIcon />
              </div>
              <span className="pd-channel-name">Facebook</span>
            </button>

            {/* Twitter / X */}
            <button
              type="button"
              className="pd-share-channel-btn twitter"
              onClick={handleTwitterShare}
              title="Share on X"
            >
              <div className="pd-channel-icon-circle twitter">
                <TwitterIcon />
              </div>
              <span className="pd-channel-name">X (Twitter)</span>
            </button>

            {/* Email */}
            <button
              type="button"
              className="pd-share-channel-btn email"
              onClick={handleEmailShare}
              title="Share via Email"
            >
              <div className="pd-channel-icon-circle email">
                <Mail size={20} />
              </div>
              <span className="pd-channel-name">Email</span>
            </button>

            {/* More / Native Apps */}
            <button
              type="button"
              className="pd-share-channel-btn more"
              onClick={handleNativeShare}
              title="More Sharing Options"
            >
              <div className="pd-channel-icon-circle more">
                <Smartphone size={20} />
              </div>
              <span className="pd-channel-name">More</span>
            </button>
          </div>
        </div>

        {/* FLIPKART SPECIAL: DOWNLOAD / SHARE IMAGE CARD */}
        <div className="pd-share-image-card-footer">
          <button
            type="button"
            className="pd-share-image-btn"
            onClick={handleDownloadImageCard}
            disabled={isGeneratingImage}
          >
            <Download size={17} />
            <span>
              {isGeneratingImage
                ? "Preparing Card..."
                : "Download Product Image Card"}
            </span>
          </button>
          <span className="pd-share-footer-hint">
            Creates a Flipkart-style card image with product photo, price &amp;
            link!
          </span>
        </div>

        {/* HIDDEN CANVAS FOR CARD RENDERING */}
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>
  );
};

export default ProductShareModal;
