
import React, { useEffect, useRef, useState } from "react";
import "./Pageloader.css";
import defaultLogo from "../../assets/grocery.png";

const SPARKS = Array.from({ length: 12 }, (_, i) => i);
const TICKS = Array.from({ length: 60 }, (_, i) => i);

const FADE_OUT_MS = 800;

const Pageloader = ({
  duration = 1500,
  onComplete,
  logo = defaultLogo,
}) => {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const displayDuration = Math.max(
      Number(duration) || 1500,
      1500
    );

    const exitTimer = setTimeout(() => {
      setExiting(true);
    }, displayDuration);

    const removeTimer = setTimeout(() => {
      setVisible(false);
      document.body.style.overflow = previousOverflow;

      onCompleteRef.current?.();
    }, displayDuration + FADE_OUT_MS);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
      document.body.style.overflow = previousOverflow;
    };
  }, [duration]);

  if (!visible) return null;

  return (
    <div
      className={`pl ${exiting ? "pl--exit" : ""}`}
      style={{
        "--pl-duration": `${Math.max(
          Number(duration) || 1500,
          1500
        )}ms`,
      }}
      role="status"
      aria-live="polite"
      aria-label="Loading Grocery Sathi"
    >
      {/* Floating Sparks */}
      <div className="pl-sparks" aria-hidden="true">
        {SPARKS.map((i) => (
          <span
            key={i}
            style={{
              left: `${(i * 37 + 8) % 100}%`,
              animationDelay: `${(i % 5) * -1.3}s`,
              animationDuration: `${6 + (i % 4)}s`,
              width: `${3 + (i % 3) * 2}px`,
              height: `${3 + (i % 3) * 2}px`,
            }}
          />
        ))}
      </div>

      {/* Main Stage */}
      <div className="pl-stage">
        <div className="pl-glow" />

        <span className="pl-pulse" />
        <span className="pl-pulse pl-pulse--2" />

        {/* Dotted Ring */}
        <svg
          className="pl-ring pl-ring--dots"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          <circle
            cx="50"
            cy="50"
            r="49"
            fill="none"
            stroke="rgba(243,227,160,0.45)"
            strokeWidth="0.7"
            strokeDasharray="0.6 2.6"
            strokeLinecap="round"
          />
        </svg>

        {/* Tick Ring */}
        <svg
          className="pl-ring pl-ring--ticks"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          {TICKS.map((i) => (
            <line
              key={i}
              x1="50"
              y1="2.2"
              x2="50"
              y2={i % 5 === 0 ? "5.2" : "3.8"}
              stroke={
                i % 5 === 0
                  ? "#fbbb21"
                  : "rgba(243,227,160,0.5)"
              }
              strokeWidth={i % 5 === 0 ? 0.55 : 0.3}
              strokeLinecap="round"
              transform={`rotate(${i * 6} 50 50)`}
            />
          ))}
        </svg>

        {/* Main Gradient Ring */}
        <svg
          className="pl-ring pl-ring--main"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id="plRingGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#1f6b3a" stopOpacity="0" />
              <stop offset="35%" stopColor="#1f6b3a" />
              <stop offset="70%" stopColor="#9ccc3b" />
              <stop offset="100%" stopColor="#fbbb21" />
            </linearGradient>
          </defs>

          <circle
            cx="50"
            cy="50"
            r="44.5"
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="1.6"
          />

          <circle
            cx="50"
            cy="50"
            r="44.5"
            fill="none"
            stroke="url(#plRingGrad)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeDasharray="170 110"
          />
        </svg>

        {/* Accent Ring */}
        <svg
          className="pl-ring pl-ring--accent"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id="plAccentGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#fff2b8" />
              <stop
                offset="100%"
                stopColor="#d9890c"
                stopOpacity="0"
              />
            </linearGradient>
          </defs>

          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="url(#plAccentGrad)"
            strokeWidth="0.9"
            strokeLinecap="round"
            strokeDasharray="70 182"
          />
        </svg>

        {/* Inner Ring */}
        <span className="pl-hairline" />

        {/* Orbit Dots */}
        <div className="pl-orbit">
          <span className="pl-orbit-dot" />
        </div>

        <div className="pl-orbit pl-orbit--2">
          <span className="pl-orbit-dot pl-orbit-dot--green" />
        </div>

        {/* Logo */}
        <div className="pl-logo">
          <img
            src={logo}
            alt="Grocery Sathi"
            draggable="false"
          />
          <span className="pl-logo-shine" />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="pl-progress" aria-hidden="true">
        <span className="pl-progress-fill" />
      </div>
    </div>
  );
};

export default Pageloader;
