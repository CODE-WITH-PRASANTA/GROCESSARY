import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { FiX, FiCamera, FiRefreshCw } from "react-icons/fi";
import "./BarcodeScanner.css";

const SCANNER_ELEMENT_ID = "barcode-scanner-region";

const BarcodeScanner = ({ open, onClose, onDetected }) => {
  const scannerRef = useRef(null);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);
  const [manualCode, setManualCode] = useState("");

  // =====================================================
  // START / STOP SCANNER
  // =====================================================
  useEffect(() => {
    if (!open) return undefined;

    let mounted = true;
    setError("");
    setStarting(true);

    const startScanner = async () => {
      try {
        const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.ITF,
            Html5QrcodeSupportedFormats.CODABAR,
          ],
          verbose: false,
        });

        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" }, // rear camera
          {
            fps: 12,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              // Barcode-shaped scan box: wide and short
              const width = Math.floor(viewfinderWidth * 0.85);
              const height = Math.floor(width * 0.35);
              return {
                width,
                height: Math.min(height, viewfinderHeight * 0.6),
              };
            },
            aspectRatio: 1.777,
            disableFlip: false,
          },
          (decodedText) => {
            if (!mounted) return;
            // Vibrate if supported (nicer UX on mobile)
            if (navigator.vibrate) navigator.vibrate(80);
            onDetected?.(decodedText);
            stopScanner();
          },
          () => {
            // Per-frame decode failure — silently ignore
          },
        );

        if (mounted) setStarting(false);
      } catch (err) {
        console.error("Scanner start error:", err);
        if (!mounted) return;
        setStarting(false);

        const msg = String(err?.message || err);
        if (msg.toLowerCase().includes("permission")) {
          setError(
            "Camera permission denied. Please allow camera access and try again.",
          );
        } else if (msg.toLowerCase().includes("notfound")) {
          setError("No camera found on this device.");
        } else {
          setError("Unable to start the camera. Please try again.");
        }
      }
    };

    // Small delay so the container is mounted in the DOM first
    const timer = setTimeout(startScanner, 60);

    return () => {
      mounted = false;
      clearTimeout(timer);
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const stopScanner = async () => {
    const scanner = scannerRef.current;
    if (!scanner) return;
    try {
      const state = scanner.getState?.();
      // 2 = SCANNING, 3 = PAUSED
      if (state === 2 || state === 3) {
        await scanner.stop();
      }
      await scanner.clear();
    } catch (err) {
      // ignore stop errors
      console.warn("Scanner stop warning:", err);
    } finally {
      scannerRef.current = null;
    }
  };

  const handleClose = async () => {
    await stopScanner();
    onClose?.();
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const value = manualCode.trim();
    if (!value) return;
    if (navigator.vibrate) navigator.vibrate(80);
    onDetected?.(value);
    handleClose();
  };

  if (!open) return null;

  return (
    <div className="barcode-scanner-overlay" role="dialog" aria-modal="true">
      <div className="barcode-scanner-modal">
        <header className="barcode-scanner-header">
          <h3>
            <FiCamera /> Scan Product Barcode
          </h3>
          <button
            type="button"
            className="barcode-scanner-close"
            onClick={handleClose}
            aria-label="Close scanner"
          >
            <FiX />
          </button>
        </header>

        <div className="barcode-scanner-body">
          {error ? (
            <div className="barcode-scanner-error">
              <p>{error}</p>
              <button
                type="button"
                onClick={() => {
                  setError("");
                  // Force re-mount by toggling open state in parent
                  handleClose();
                }}
              >
                <FiRefreshCw /> Try Again
              </button>
            </div>
          ) : (
            <>
              <div
                id={SCANNER_ELEMENT_ID}
                className="barcode-scanner-region"
              />
              {starting && (
                <div className="barcode-scanner-starting">
                  Starting camera…
                </div>
              )}

              <div className="barcode-scanner-frame" aria-hidden="true">
                <span className="barcode-scanner-line" />
              </div>

              <p className="barcode-scanner-hint">
                Point your camera at the product's barcode. Hold steady.
              </p>
            </>
          )}
        </div>

        <form
          className="barcode-scanner-manual"
          onSubmit={handleManualSubmit}
        >
          <label>
            Or enter barcode manually:
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="e.g. 8901234567890"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
            />
          </label>
          <button type="submit" disabled={!manualCode.trim()}>
            Use Code
          </button>
        </form>
      </div>
    </div>
  );
};

export default BarcodeScanner;