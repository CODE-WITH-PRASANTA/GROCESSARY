
import React, { useEffect, useState } from "react";
import "./InventoryOne.css";

const InventoryOne = () => {
  const [counts, setCounts] = useState({
    products: 0,
    stock: 0,
    lowStock: 0,
    outStock: 0,
    value: 0,
  });

  useEffect(() => {
    const targets = {
      products: 1248,
      stock: 1086,
      lowStock: 38,
      outStock: 12,
      value: 842650,
    };

    const duration = 1800;
    let startTime = null;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;

      const progress = Math.min(
        (timestamp - startTime) / duration,
        1
      );

      // Smooth ease-out animation
      const easeOut = 1 - Math.pow(1 - progress, 4);

      setCounts({
        products: Math.floor(targets.products * easeOut),
        stock: Math.floor(targets.stock * easeOut),
        lowStock: Math.floor(targets.lowStock * easeOut),
        outStock: Math.floor(targets.outStock * easeOut),
        value: Math.floor(targets.value * easeOut),
      });

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const inventoryCards = [
    {
      title: "Total Products",
      value: counts.products.toLocaleString("en-IN"),
      change: "+2%",
      description: "from last week",
      status: "positive",
      icon: "box",
      color: "green",
    },
    {
      title: "In Stock",
      value: counts.stock.toLocaleString("en-IN"),
      change: "+1%",
      description: "from last week",
      status: "positive",
      icon: "check",
      color: "mint",
    },
    {
      title: "Low Stock",
      value: counts.lowStock.toLocaleString("en-IN"),
      change: "-3%",
      description: "from last week",
      status: "negative",
      icon: "warning",
      color: "orange",
    },
    {
      title: "Out of Stock",
      value: counts.outStock.toLocaleString("en-IN"),
      change: "No change",
      description: "",
      status: "neutral",
      icon: "close",
      color: "red",
    },
    {
      title: "Inventory Value",
      value: `₹${counts.value.toLocaleString("en-IN")}`,
      change: "+5%",
      description: "from last week",
      status: "positive",
      icon: "rupee",
      color: "darkgreen",
    },
  ];

  const renderIcon = (icon) => {
    switch (icon) {
      case "box":
        return (
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 2.8L21 7.5V17L12 21.7L3 17V7.5L12 2.8Z" />
            <path d="M3.5 7.7L12 12.2L20.5 7.7M12 12.2V21" />
            <path d="M7.5 5.2L16.5 10" />
          </svg>
        );

      case "check":
        return (
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M5 12.5L10 17L20 7" />
          </svg>
        );

      case "warning":
        return (
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 3L22 20H2L12 3Z" />
            <path d="M12 9V13.5M12 17V17.1" />
          </svg>
        );

      case "close":
        return (
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M6 6L18 18M18 6L6 18" />
          </svg>
        );

      case "rupee":
        return (
          <span className="InventoryOneRupeeIcon">₹</span>
        );

      default:
        return null;
    }
  };

  return (
    <section className="InventoryOne">

      {/* Header */}
      <div className="InventoryOneHeader">
        <div className="InventoryOneHeaderIcon">
          <svg viewBox="0 0 48 48" fill="none">
            <path d="M24 3L42 12.5V35.5L24 45L6 35.5V12.5L24 3Z" />
            <path d="M6.5 12.8L24 22L41.5 12.8" />
            <path d="M24 22V44" />
            <path d="M15 8L33 17.5" />
            <path d="M24 22L33 17.5V28L24 33L15 28V17.5" />
          </svg>
        </div>

        <div className="InventoryOneHeaderContent">
          <h1>Inventory Management</h1>
          <p>
            Monitor stock levels, track product availability and
            manage replenishment.
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="InventoryOneGrid">
        {inventoryCards.map((card, index) => (
          <div
            className={`InventoryOneCard InventoryOne${card.color}`}
            key={card.title}
            style={{ "--card-index": index }}
          >
            <div className="InventoryOneIcon">
              {renderIcon(card.icon)}
            </div>

            <div className="InventoryOneCardContent">
              <h3>{card.title}</h3>

              <div className="InventoryOneValue">
                {card.value}
              </div>

              <div className={`InventoryOneChange ${card.status}`}>
                {card.status === "positive" && (
                  <span className="InventoryOneArrow">↑</span>
                )}

                {card.status === "negative" && (
                  <span className="InventoryOneArrow">↓</span>
                )}

                {card.status === "neutral" && (
                  <span className="InventoryOneArrow">➜</span>
                )}

                {card.change}

                {card.description && (
                  <span className="InventoryOneDescription">
                    {card.description}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
};

export default InventoryOne;
