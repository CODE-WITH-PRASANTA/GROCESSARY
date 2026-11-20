
import React, { useState } from "react";
import "./InventoryTwo.css";

const InventoryTwo = () => {
  const [activeRange, setActiveRange] = useState("7D");
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Stock movement data
  const chartData = {
    "7D": [
      { label: "Mon", value: 620 },
      { label: "Tue", value: 780 },
      { label: "Wed", value: 930 },
      { label: "Thu", value: 820 },
      { label: "Fri", value: 750 },
      { label: "Sat", value: 930 },
      { label: "Sun", value: 1110 },
    ],
    "30D": [
      { label: "W1", value: 520 },
      { label: "W2", value: 760 },
      { label: "W3", value: 680 },
      { label: "W4", value: 1050 },
      { label: "W5", value: 920 },
      { label: "W6", value: 1180 },
      { label: "W7", value: 1320 },
    ],
    "90D": [
      { label: "Jan", value: 450 },
      { label: "Feb", value: 690 },
      { label: "Mar", value: 610 },
      { label: "Apr", value: 880 },
      { label: "May", value: 790 },
      { label: "Jun", value: 1120 },
      { label: "Jul", value: 1280 },
    ],
    "1Y": [
      { label: "Jan", value: 380 },
      { label: "Feb", value: 520 },
      { label: "Mar", value: 680 },
      { label: "Apr", value: 610 },
      { label: "May", value: 850 },
      { label: "Jun", value: 980 },
      { label: "Jul", value: 1250 },
    ],
  };

  const stockItems = [
    { name: "In Stock", percentage: 87.1, color: "green" },
    { name: "Low Stock", percentage: 3.0, color: "orange" },
    { name: "Out of Stock", percentage: 1.0, color: "red" },
  ];

  // Chart dimensions
  const chartWidth = 700;
  const chartHeight = 265;

  const chartLeft = 65;
  const chartRight = 685;
  const chartTop = 22;
  const chartBottom = 215;

  const maxValue = 1500;

  const data = chartData[activeRange];

  const getX = (index) =>
    chartLeft +
    (index / (data.length - 1)) * (chartRight - chartLeft);

  const getY = (value) =>
    chartBottom -
    (value / maxValue) * (chartBottom - chartTop);

  const points = data.map((item, index) => ({
    ...item,
    x: getX(index),
    y: getY(item.value),
  }));

  // Smooth curved SVG graph
  const createSmoothPath = (chartPoints) => {
    if (chartPoints.length < 2) return "";

    let path = `M ${chartPoints[0].x} ${chartPoints[0].y}`;

    for (let i = 0; i < chartPoints.length - 1; i++) {
      const current = chartPoints[i];
      const next = chartPoints[i + 1];

      const middleX = (current.x + next.x) / 2;

      path += ` C ${middleX} ${current.y},
        ${middleX} ${next.y},
        ${next.x} ${next.y}`;
    }

    return path;
  };

  const linePath = createSmoothPath(points);

  const areaPath = `
    ${linePath}
    L ${chartRight} ${chartBottom}
    L ${chartLeft} ${chartBottom}
    Z
  `;

  const yAxisValues = [0, 500, 1000, 1500];

  const formatNumber = (value) =>
    value.toLocaleString("en-IN");

  return (
    <section className="InventoryTwo">

      {/* LEFT: STOCK OVERVIEW */}
      <div className="InventoryTwoOverview">

        <div className="InventoryTwoCardHeader">
          <div className="InventoryTwoHeadingIcon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M4 19V10" />
              <path d="M10 19V5" />
              <path d="M16 19V13" />
              <path d="M3 19.5H21" />
            </svg>
          </div>

          <h2>Stock Overview</h2>
        </div>

        <div className="InventoryTwoStockList">
          {stockItems.map((item, index) => (
            <div
              className="InventoryTwoStockItem"
              key={item.name}
            >
              <div className="InventoryTwoStockName">
                {item.name}
              </div>

              <div className="InventoryTwoProgressTrack">
                <div
                  className={`InventoryTwoProgressFill ${item.color}`}
                  style={{
                    "--progress-width": `${item.percentage}%`,
                    animationDelay: `${index * 180}ms`,
                  }}
                />
              </div>

              <div className="InventoryTwoPercentage">
                {item.percentage.toFixed(1)}%
              </div>
            </div>
          ))}
        </div>

        {/* Additional stock information */}
        <div className="InventoryTwoOverviewFooter">
          <div className="InventoryTwoFooterDot" />
          <span>Live inventory status</span>
          <span className="InventoryTwoFooterStatus">
            Updated today
          </span>
        </div>

      </div>

      {/* RIGHT: STOCK MOVEMENT */}
      <div className="InventoryTwoMovement">

        <div className="InventoryTwoMovementHeader">

          <div className="InventoryTwoCardHeader">
            <div className="InventoryTwoHeadingIcon">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M3 19V5" />
                <path d="M3 19H21" />
                <path d="M6 14L10 10L14 12L20 5" />
                <path d="M16 5H20V9" />
              </svg>
            </div>

            <h2>Stock Movement</h2>
          </div>

          <div className="InventoryTwoFilter">
            {["7D", "30D", "90D", "1Y"].map((range) => (
              <button
                key={range}
                type="button"
                className={
                  activeRange === range
                    ? "InventoryTwoFilterButton active"
                    : "InventoryTwoFilterButton"
                }
                onClick={() => {
                  setActiveRange(range);
                  setHoveredPoint(null);
                }}
              >
                {range}
              </button>
            ))}
          </div>

        </div>

        <div className="InventoryTwoChartContainer">

          {/* Interactive tooltip */}
          {hoveredPoint !== null && (
            <div
              className="InventoryTwoTooltip"
              style={{
                left: `${(points[hoveredPoint].x / chartWidth) * 100}%`,
                top: `${(points[hoveredPoint].y / chartHeight) * 100}%`,
              }}
            >
              <span>{points[hoveredPoint].label}</span>
              <strong>
                {formatNumber(points[hoveredPoint].value)}
              </strong>
              <small>Stock movement</small>
            </div>
          )}

          <svg
            key={activeRange}
            className="InventoryTwoChart"
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            preserveAspectRatio="none"
            role="img"
            aria-label={`Stock movement for ${activeRange}`}
          >

            <defs>
              {/* Area gradient */}
              <linearGradient
                id="InventoryTwoAreaGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#16a34a"
                  stopOpacity="0.24"
                />
                <stop
                  offset="55%"
                  stopColor="#16a34a"
                  stopOpacity="0.10"
                />
                <stop
                  offset="100%"
                  stopColor="#16a34a"
                  stopOpacity="0.015"
                />
              </linearGradient>

              {/* Line gradient */}
              <linearGradient
                id="InventoryTwoLineGradient"
                x1="0"
                y1="0"
                x2="1"
                y2="0"
              >
                <stop offset="0%" stopColor="#078536" />
                <stop offset="100%" stopColor="#20b85b" />
              </linearGradient>

              {/* Point glow */}
              <filter
                id="InventoryTwoPointShadow"
                x="-100%"
                y="-100%"
                width="300%"
                height="300%"
              >
                <feDropShadow
                  dx="0"
                  dy="2"
                  stdDeviation="3"
                  floodColor="#078b3c"
                  floodOpacity="0.28"
                />
              </filter>
            </defs>

            {/* Horizontal grid lines */}
            {yAxisValues.map((value) => {
              const y = getY(value);

              return (
                <g key={value}>
                  <line
                    x1={chartLeft}
                    y1={y}
                    x2={chartRight}
                    y2={y}
                    className="InventoryTwoGridLine"
                  />

                  <text
                    x="49"
                    y={y + 5}
                    textAnchor="end"
                    className="InventoryTwoAxisLabel"
                  >
                    {formatNumber(value)}
                  </text>
                </g>
              );
            })}

            {/* Vertical grid lines */}
            {points.map((point, index) => (
              <line
                key={`grid-${index}`}
                x1={point.x}
                y1={chartTop}
                x2={point.x}
                y2={chartBottom}
                className="InventoryTwoGridLine"
              />
            ))}

            {/* Gradient area */}
            <path
              d={areaPath}
              fill="url(#InventoryTwoAreaGradient)"
              className="InventoryTwoArea"
            />

            {/* Smooth graph line */}
            <path
              d={linePath}
              fill="none"
              stroke="url(#InventoryTwoLineGradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="InventoryTwoLine"
            />

            {/* Interactive points */}
            {points.map((point, index) => (
              <g
                key={`point-${index}`}
                className="InventoryTwoChartPoint"
                onMouseEnter={() => setHoveredPoint(index)}
                onMouseLeave={() => setHoveredPoint(null)}
                onFocus={() => setHoveredPoint(index)}
                onBlur={() => setHoveredPoint(null)}
                onClick={() =>
                  setHoveredPoint(
                    hoveredPoint === index ? null : index
                  )
                }
                onTouchStart={() => setHoveredPoint(index)}
                tabIndex={0}
                role="button"
                aria-label={`${point.label}: ${formatNumber(point.value)}`}
              >
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="15"
                  fill="transparent"
                />

                {hoveredPoint === index && (
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="12"
                    className="InventoryTwoPointGlow"
                  />
                )}

                <circle
                  cx={point.x}
                  cy={point.y}
                  r={hoveredPoint === index ? 7 : 6}
                  className="InventoryTwoPoint"
                  filter="url(#InventoryTwoPointShadow)"
                />
              </g>
            ))}

            {/* X-axis labels */}
            {points.map((point, index) => (
              <text
                key={`label-${index}`}
                x={point.x}
                y="243"
                textAnchor="middle"
                className="InventoryTwoXAxisLabel"
              >
                {point.label}
              </text>
            ))}

            {/* Baseline */}
            <line
              x1={chartLeft}
              y1={chartBottom}
              x2={chartRight}
              y2={chartBottom}
              className="InventoryTwoAxisLine"
            />

          </svg>
        </div>

        <div className="InventoryTwoChartFooter">
          <div className="InventoryTwoChartLegend">
            <span className="InventoryTwoLegendDot" />
            <span>Stock movement</span>
          </div>

          <span className="InventoryTwoChartPeriod">
            Showing {activeRange} data
          </span>
        </div>

      </div>

    </section>
  );
};

export default InventoryTwo;
