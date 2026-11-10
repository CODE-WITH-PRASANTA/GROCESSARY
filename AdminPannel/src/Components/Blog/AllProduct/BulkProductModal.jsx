import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Check,
} from "lucide-react";
import API from "../../../api/axios";
import "./BulkProductModal.css";

// =========================================================
// 1. GENERATE & DOWNLOAD SAMPLE EXCEL TEMPLATE (Exported)
// =========================================================
export const downloadSampleExcelTemplate = () => {
  const templateHeaders = [
    "Product Name",
    "SKU",
    "Category",
    "Brand",
    "Unit",
    "Unit No",
    "Selling Price",
    "MRP / Written Price",
    "Purchase Price",
    "Stock Quantity",
    "Barcode",
    "Image Name",
    "Short Description",
    "Full Description",
  ];

  const sampleRows = [
    [
      "Fortune Sunlite Refined Sunflower Oil",
      "OIL-FOR-01",
      "Cooking Oils",
      "Fortune",
      "L",
      1,
      145,
      175,
      130,
      50,
      "8906007281012",
      "sunflower_oil.webp",
      "Light & healthy sunflower oil for everyday cooking.",
      "Fortune Sunlite Refined Sunflower Oil is enriched with vitamins A and D.",
    ],
    [
      "Aashirvaad Superior MP Sharbati Atta",
      "ATT-AAS-05",
      "Atta & Flours",
      "Aashirvaad",
      "kg",
      5,
      265,
      310,
      240,
      40,
      "8901030384728",
      "aashirvaad_atta.webp",
      "100% pure MP whole wheat atta with natural dietary fiber.",
      "Made from the king of wheat - Sharbati grains sourced from Madhya Pradesh.",
    ],
    [
      "Tata Salt Vacuum Evaporated Iodized",
      "SLT-TAT-01",
      "Spices & Seasonings",
      "Tata",
      "kg",
      1,
      28,
      30,
      24,
      100,
      "8904004400115",
      "tata_salt.webp",
      "India's trusted vacuum evaporated iodized salt.",
      "Contains the right amount of iodine vital for proper mental development.",
    ],
  ];

  const worksheetData = [templateHeaders, ...sampleRows];
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set column widths for readability
  ws["!cols"] = [
    { wch: 38 }, // Product Name
    { wch: 16 }, // SKU
    { wch: 18 }, // Category
    { wch: 16 }, // Brand
    { wch: 10 }, // Unit
    { wch: 10 }, // Unit No
    { wch: 14 }, // Selling Price
    { wch: 18 }, // MRP
    { wch: 14 }, // Purchase Price
    { wch: 14 }, // Stock
    { wch: 16 }, // Barcode
    { wch: 20 }, // Image Name
    { wch: 45 }, // Short Description
    { wch: 60 }, // Full Description
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Products Template");
  XLSX.writeFile(wb, "GrocerySathi_Bulk_Products_Template.xlsx");
};

const BulkProductModal = ({ isOpen, onClose, onSuccess }) => {
  const fileInputRef = useRef(null);
  const imagesInputRef = useRef(null);

  const [excelFile, setExcelFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [parsedRows, setParsedRows] = useState([]);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");

  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = downloadSampleExcelTemplate;

  // =========================================================
  // 2. HANDLE EXCEL / CSV FILE SELECTION & CLIENT PREVIEW
  // =========================================================
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParseError("");
    setImportResult(null);
    setExcelFile(file);
    setParsing(true);

    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary", cellDates: true });
        const sheetName = wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        const rawJson = XLSX.utils.sheet_to_json(ws, { defval: "" });

        if (!rawJson || rawJson.length === 0) {
          setParseError("The selected spreadsheet appears to be empty.");
          setParsedRows([]);
          setParsing(false);
          return;
        }

        // Normalize column keys flexibly
        const normalized = rawJson.map((row, idx) => {
          const findVal = (...keys) => {
            for (const k of keys) {
              const matchedKey = Object.keys(row).find(
                (rk) => rk.trim().toLowerCase() === k.trim().toLowerCase()
              );
              if (matchedKey && row[matchedKey] !== "") {
                return row[matchedKey];
              }
            }
            return "";
          };

          return {
            id: idx + 1,
            productName: findVal("Product Name", "productName", "Name", "Title"),
            sku: String(findVal("SKU", "sku", "Product Code", "Code") || "")
              .toUpperCase()
              .trim(),
            category: findVal("Category", "category", "Category Name"),
            brand: findVal("Brand", "brand", "Brand Name"),
            unit: String(findVal("Unit", "unit", "UOM") || "kg"),
            unitNo: Number(findVal("Unit No", "unitNo", "Unit Number") || 1),
            price: Number(findVal("Selling Price", "Price", "sellingPrice", "Rate") || 0),
            writtenPrice: Number(
              findVal("MRP / Written Price", "MRP", "writtenPrice", "Original Price") || 0
            ),
            purchasePrice: Number(
              findVal("Purchase Price", "purchasePrice", "Cost Price", "costPrice") || 0
            ),
            stockQuantity: Number(findVal("Stock Quantity", "Stock", "stockQuantity", "Qty") || 0),
            barcode: String(findVal("Barcode", "barcode", "UPC", "EAN") || "").trim(),
            image: String(findVal("Image Name", "Image", "image", "Photo") || "").trim(),
            shortDescription: String(
              findVal("Short Description", "shortDescription", "Summary") || ""
            ).trim(),
            fullDescription: String(
              findVal("Full Description", "fullDescription", "Description") || ""
            ).trim(),
          };
        });

        // Filter out empty rows without a product name
        const validRows = normalized.filter((r) => r.productName);

        if (validRows.length === 0) {
          setParseError(
            "No valid product rows found. Ensure each row has at least a 'Product Name'."
          );
        }

        setParsedRows(validRows);
      } catch (err) {
        console.error("Error parsing spreadsheet:", err);
        setParseError(`Failed to parse file: ${err.message || "Invalid spreadsheet format"}`);
        setParsedRows([]);
      } finally {
        setParsing(false);
      }
    };

    reader.onerror = () => {
      setParseError("Could not read file.");
      setParsing(false);
    };

    reader.readAsBinaryString(file);
  };

  // =========================================================
  // 3. HANDLE IMAGE ATTACHMENTS (OPTIONAL)
  // =========================================================
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(files);
  };

  // =========================================================
  // 4. SUBMIT BULK IMPORT TO BACKEND
  // =========================================================
  const handleImportSubmit = async () => {
    if (parsedRows.length === 0) {
      setParseError("Please select an Excel or CSV file containing valid products.");
      return;
    }

    try {
      setUploading(true);
      setParseError("");

      const formData = new FormData();
      formData.append("products", JSON.stringify(parsedRows));

      // Append optional image files
      if (imageFiles.length > 0) {
        imageFiles.forEach((img) => {
          formData.append("images", img);
        });
      }

      const response = await API.post("/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const result = response.data;
      setImportResult({
        success: true,
        message: result.message || "Bulk import process completed.",
        total: result.total || parsedRows.length,
        importedCount: result.importedCount ?? result.imported?.length ?? 0,
        skippedCount: result.skippedCount ?? result.skipped?.length ?? 0,
        failedCount: result.failedCount ?? result.failed?.length ?? 0,
        failedDetails: result.failed || [],
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Bulk Import Request Error:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "An unexpected error occurred during bulk product import.";
      setParseError(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setExcelFile(null);
    setImageFiles([]);
    setParsedRows([]);
    setParseError("");
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (imagesInputRef.current) imagesInputRef.current.value = "";
  };

  return (
    <div className="bpm-overlay" onClick={onClose}>
      <div className="bpm-modal" onClick={(e) => e.stopPropagation()}>
        {/* MODAL HEADER */}
        <div className="bpm-header">
          <div className="bpm-header-title-box">
            <div className="bpm-icon-badge">
              <FileSpreadsheet size={24} color="#059669" />
            </div>
            <div>
              <h2 className="bpm-title">Bulk Product Import</h2>
              <p className="bpm-subtitle">
                Upload multiple products simultaneously via Excel (.xlsx, .xls) or CSV
              </p>
            </div>
          </div>
          <button className="bpm-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* MODAL CONTENT */}
        <div className="bpm-body">
          {/* STEP 1: UPLOAD SHEET ZONE */}
          <div className="bpm-section">
            <div className="bpm-section-header">
              <span className="bpm-step-tag">Step 1</span>
              <span className="bpm-section-title">Upload Excel / CSV File</span>
            </div>

            {!excelFile ? (
              <div
                className="bpm-dropzone"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <div className="bpm-dropzone-icon">
                  <Upload size={32} />
                </div>
                <p className="bpm-dropzone-main">
                  <strong>Click to browse</strong> or drag & drop your spreadsheet here
                </p>
                <p className="bpm-dropzone-sub">Supports Excel (.xlsx, .xls) and CSV files</p>
              </div>
            ) : (
              <div className="bpm-selected-file">
                <div className="bpm-file-details">
                  <FileSpreadsheet size={28} color="#059669" />
                  <div>
                    <strong>{excelFile.name}</strong>
                    <span>({(excelFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="bpm-remove-file-btn"
                  onClick={handleReset}
                  title="Remove file"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          {/* STEP 3: OPTIONAL IMAGES ATTACHMENT */}
          <div className="bpm-section">
            <div className="bpm-section-header">
              <span className="bpm-step-tag optional">Optional</span>
              <span className="bpm-section-title">Attach Product Images</span>
            </div>
            <p className="bpm-section-desc">
              If your sheet includes an <code>Image Name</code> column (e.g. <code>rice.webp</code>), select matching images here to auto-associate.
            </p>
            <div className="bpm-images-input-row">
              <button
                type="button"
                className="bpm-btn-outline-images"
                onClick={() => imagesInputRef.current?.click()}
              >
                <ImageIcon size={16} />
                <span>
                  {imageFiles.length > 0
                    ? `${imageFiles.length} Image(s) Attached`
                    : "Select Matching Product Images"}
                </span>
              </button>
              <input
                type="file"
                ref={imagesInputRef}
                multiple
                accept="image/*"
                onChange={handleImagesChange}
                style={{ display: "none" }}
              />
              {imageFiles.length > 0 && (
                <button
                  type="button"
                  className="bpm-clear-images-link"
                  onClick={() => {
                    setImageFiles([]);
                    if (imagesInputRef.current) imagesInputRef.current.value = "";
                  }}
                >
                  Clear images
                </button>
              )}
            </div>
          </div>

          {/* PARSING INDICATOR */}
          {parsing && (
            <div className="bpm-parsing-state">
              <Loader2 size={24} className="bpm-spin" />
              <span>Parsing spreadsheet data and checking fields...</span>
            </div>
          )}

          {/* ERROR ALERT */}
          {parseError && (
            <div className="bpm-alert-error" role="alert">
              <AlertCircle size={20} />
              <span>{parseError}</span>
            </div>
          )}

          {/* LIVE DATA PREVIEW TABLE */}
          {parsedRows.length > 0 && !importResult && (
            <div className="bpm-preview-section">
              <div className="bpm-preview-header">
                <div>
                  <strong>Data Preview</strong>
                  <span> — {parsedRows.length} valid product(s) detected</span>
                </div>
                <span className="bpm-badge-ready">Ready to Import</span>
              </div>

              <div className="bpm-table-wrapper">
                <table className="bpm-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Product Name</th>
                      <th>SKU</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Barcode</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.slice(0, 6).map((item, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td className="bpm-td-name">{item.productName}</td>
                        <td>
                          <code>{item.sku || "AUTO"}</code>
                        </td>
                        <td>{item.category || "General"}</td>
                        <td>₹{item.price}</td>
                        <td>{item.stockQuantity}</td>
                        <td>{item.barcode || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedRows.length > 6 && (
                <p className="bpm-table-more-hint">
                  + {parsedRows.length - 6} more products will be imported...
                </p>
              )}
            </div>
          )}

          {/* IMPORT RESULT STATS SCREEN */}
          {importResult && (
            <div className="bpm-results-card">
              <div className="bpm-results-header">
                <CheckCircle2 size={32} color="#059669" />
                <div>
                  <h3>Import Complete</h3>
                  <p>{importResult.message}</p>
                </div>
              </div>

              <div className="bpm-stats-grid">
                <div className="bpm-stat-box green">
                  <span className="bpm-stat-val">{importResult.importedCount}</span>
                  <span className="bpm-stat-lbl">Successfully Added</span>
                </div>
                <div className="bpm-stat-box yellow">
                  <span className="bpm-stat-val">{importResult.skippedCount}</span>
                  <span className="bpm-stat-lbl">Skipped</span>
                </div>
                <div className="bpm-stat-box red">
                  <span className="bpm-stat-val">{importResult.failedCount}</span>
                  <span className="bpm-stat-lbl">Failed</span>
                </div>
              </div>

              {/* FAILED DETAILS LIST IF ANY */}
              {importResult.failedDetails && importResult.failedDetails.length > 0 && (
                <div className="bpm-failures-list">
                  <h4>Failed Rows Details:</h4>
                  <ul>
                    {importResult.failedDetails.slice(0, 5).map((f, i) => (
                      <li key={i}>
                        Row {f.row || f.id || i + 1} ({f.productName || f.sku || "Unknown"}):{" "}
                        {f.reason || f.error || "Validation error"}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="bpm-footer">
          <button
            type="button"
            className="bpm-btn-cancel"
            onClick={onClose}
            disabled={uploading}
          >
            {importResult ? "Close" : "Cancel"}
          </button>

          {!importResult ? (
            <button
              type="button"
              className="bpm-btn-submit"
              onClick={handleImportSubmit}
              disabled={uploading || parsedRows.length === 0 || parsing}
            >
              {uploading ? (
                <>
                  <Loader2 size={18} className="bpm-spin" />
                  <span>Importing {parsedRows.length} Products...</span>
                </>
              ) : (
                <>
                  <Check size={18} />
                  <span>Import {parsedRows.length > 0 ? `${parsedRows.length} Products` : "Products"}</span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              className="bpm-btn-submit"
              onClick={() => {
                onClose();
              }}
            >
              Done & View Catalog
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkProductModal;

