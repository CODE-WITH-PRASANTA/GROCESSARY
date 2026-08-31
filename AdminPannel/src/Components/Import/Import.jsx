import { useState } from "react";
import * as XLSX from "xlsx";
import API from "../../api/axios";
import "./Import.css";

const steps = [
  {
    number: 1,
    title: "Upload File",
    description: "Upload your XLS file",
  },
  {
    number: 2,
    title: "Map Columns",
    description: "Map columns with database",
  },
  {
    number: 3,
    title: "Preview Data",
    description: "Preview & verify data",
  },
  {
    number: 4,
    title: "Import & Finish",
    description: "Import data to system",
  },
];

const Import = () => {
  const [file, setFile] = useState(null);

  const [imageFiles, setImageFiles] = useState([]);

  const [rows, setRows] = useState([]);

  const [selectedRows, setSelectedRows] = useState([]);

  const [loading, setLoading] = useState(false);

  const [imported, setImported] = useState(false);

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (value) => {
    if (value === undefined || value === null || value === "") {
      return "-";
    }

    // Excel serial date
    if (typeof value === "number") {
      const parsed = XLSX.SSF.parse_date_code(value);

      if (parsed) {
        const day = String(parsed.d).padStart(2, "0");

        const month = String(parsed.m).padStart(2, "0");

        return `${parsed.y}-${month}-${day}`;
      }
    }

    // JS Date
    if (value instanceof Date) {
      if (isNaN(value.getTime())) {
        return "-";
      }

      const year = value.getFullYear();

      const month = String(value.getMonth() + 1).padStart(2, "0");

      const day = String(value.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    }

    return String(value);
  };

  // =====================================================
  // FILE UPLOAD
  // =====================================================

  const handleFileUpload = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (selectedFiles.length === 0) {
      return;
    }

    // ===================================================
    // FIND EXCEL FILE
    // ===================================================

    const excelFile = selectedFiles.find((item) => {
      const name = item.name.toLowerCase();

      return name.endsWith(".xls") || name.endsWith(".xlsx");
    });

    if (!excelFile) {
      alert("Please select an XLS or XLSX file.");

      return;
    }

    // ===================================================
    // CHECK EXCEL SIZE
    // ===================================================

    if (excelFile.size > 5 * 1024 * 1024) {
      alert("Maximum file size is 5MB.");

      return;
    }

    // ===================================================
    // FIND IMAGE FILES
    // ===================================================

    const selectedImages = selectedFiles.filter((item) =>
      item.type.startsWith("image/"),
    );

    // ===================================================
    // IMAGE SIZE CHECK
    // ===================================================

    const invalidImage = selectedImages.find(
      (image) => image.size > 5 * 1024 * 1024,
    );

    if (invalidImage) {
      alert(`Image "${invalidImage.name}" exceeds the 5MB limit.`);

      return;
    }

    setFile(excelFile);

    setImageFiles(selectedImages);

    // ===================================================
    // READ EXCEL
    // ===================================================

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);

        const workbook = XLSX.read(data, {
          type: "array",
          cellDates: true,
        });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          alert("The Excel file does not contain any worksheet.");

          return;
        }

        const sheetName = workbook.SheetNames[0];

        const worksheet = workbook.Sheets[sheetName];

        const rawData = XLSX.utils.sheet_to_json(worksheet, {
          defval: "",
        });

        const jsonData = rawData.map((row) => {
          console.log("RAW EXCEL DATA:", rawData);
          console.log("EXCEL HEADERS:", Object.keys(rawData[0] || {}));
          const normalizedRow = {};

          Object.keys(row).forEach((key) => {
            const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, " ");

            normalizedRow[normalizedKey] = row[key];
          });

          return normalizedRow;
        });

        if (jsonData.length === 0) {
          alert("The Excel file does not contain any product data.");

          return;
        }

        // =================================================
        // FORMAT DATA
        // =================================================

        const formattedData = jsonData.map((item, index) => {
          console.log("NORMALIZED ROW:", item);
          console.log("UNIT NO VALUE:", item["unit no"]);
          const productName = item["product name"];
          const category = item["category"];
          const brand = item["brand"];
          const sku = item["sku"];
          const purchasePrice = item["purchase price"];
          const sellingPrice = item["selling price"];
          const writtenPrice = item["written price"];
          const manufactureDate = item["manufacture date"];
          const expiryDate = item["expiry date"];
          const stock = item["stock"];
          const unit = item["unit"];

          const unitNo =
            item["unit no"] !== undefined &&
            item["unit no"] !== null &&
            item["unit no"] !== ""
              ? Number(item["unit no"])
              : 1;

          const isValid = Boolean(
            productName &&
            sku &&
            category &&
            purchasePrice !== undefined &&
            purchasePrice !== null &&
            purchasePrice !== "" &&
            sellingPrice !== undefined &&
            sellingPrice !== null &&
            sellingPrice !== "" &&
            stock !== undefined &&
            stock !== null &&
            stock !== "" &&
            unit &&
            Number(unitNo) > 0,
          );

          return {
            id: index + 1,

            productName: productName || "Unknown Product",

            category: category || "-",

            brand: brand || "-",

            sku: sku || "-",

            purchasePrice:
              purchasePrice !== undefined &&
              purchasePrice !== null &&
              purchasePrice !== ""
                ? purchasePrice
                : "-",

            sellingPrice:
              sellingPrice !== undefined &&
              sellingPrice !== null &&
              sellingPrice !== ""
                ? sellingPrice
                : "-",

            writtenPrice:
              writtenPrice !== undefined &&
              writtenPrice !== null &&
              writtenPrice !== ""
                ? writtenPrice
                : "-",

            manufactureDate: formatDate(manufactureDate),

            expiryDate: formatDate(expiryDate),

            stock:
              stock !== undefined && stock !== null && stock !== ""
                ? stock
                : "-",

            unit: unit || "-",

            unitNo:
              unitNo !== undefined && unitNo !== null && unitNo !== ""
                ? Number(unitNo)
                : "-",

            valid: isValid,
          };
        });

        setRows(formattedData);

        // Automatically select valid rows
        setSelectedRows(
          formattedData.filter((item) => item.valid).map((item) => item.id),
        );

        setImported(true);
      } catch (err) {
        console.error("Error reading file:", err);

        alert("Failed to parse XLS file. Please verify the format.");
      }
    };

    reader.readAsArrayBuffer(excelFile);
  };

  // =====================================================
  // DOWNLOAD SAMPLE
  // =====================================================

  const handleDownloadSample = () => {
    const sampleData = [
      {
        "Product Name": "Aashirvaad Atta 5kg",
        Category: "Foodgrains",
        Brand: "Aashirvaad",
        SKU: "ATT5001",
        "Purchase Price": 210,
        "Selling Price": 245,
        "Written Price": 280,
        "Manufacture Date": "2026-08-01",
        "Expiry Date": "2027-08-01",
        Stock: 120,
        Unit: "Pcs",
        "Unit No": 1,
      },

      {
        "Product Name": "Fortune Sunflower Oil 1L",
        Category: "Oil & Ghee",
        Brand: "Fortune",
        SKU: "OIL1001",
        "Purchase Price": 140,
        "Selling Price": 165,
        "Written Price": 190,
        "Manufacture Date": "2026-08-05",
        "Expiry Date": "2027-08-05",
        Stock: 80,
        Unit: "Pcs",
        "Unit No": 1,
      },

      {
        "Product Name": "Tata Tea 250g",
        Category: "Beverages",
        Brand: "Tata",
        SKU: "TEA2501",
        "Purchase Price": 95,
        "Selling Price": 120,
        "Written Price": 140,
        "Manufacture Date": "2026-08-10",
        "Expiry Date": "2027-08-10",
        Stock: 60,
        Unit: "Pcs",
        "Unit No": 1,
      },
    ];

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(sampleData);

    // Force exact column order and widths
    worksheet["!cols"] = [
      { wch: 28 }, // Product Name
      { wch: 18 }, // Category
      { wch: 18 }, // Brand
      { wch: 14 }, // SKU
      { wch: 16 }, // Purchase Price
      { wch: 16 }, // Selling Price
      { wch: 16 }, // Written Price
      { wch: 20 }, // Manufacture Date
      { wch: 18 }, // Expiry Date
      { wch: 12 }, // Stock
      { wch: 12 }, // Unit
      { wch: 12 }, // Unit No
    ];

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Add worksheet
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

    // Download Excel
    XLSX.writeFile(workbook, "grocery_products_sample.xlsx");
  };
  // =====================================================
  // SELECTION
  // =====================================================

  const validRows = rows.filter((row) => row.valid);

  const allSelected =
    validRows.length > 0 && selectedRows.length === validRows.length;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedRows([]);
    } else {
      setSelectedRows(validRows.map((row) => row.id));
    }
  };

  const handleRowSelect = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id],
    );
  };

  // =====================================================
  // CANCEL
  // =====================================================

  const handleCancel = () => {
    setFile(null);

    setImageFiles([]);

    setRows([]);

    setSelectedRows([]);

    setImported(false);
  };

  // =====================================================
  // IMPORT TO BACKEND
  // =====================================================

  const handleImport = async () => {
    if (selectedRows.length === 0) {
      alert("Please select at least one valid row to import.");
      return;
    }

    const selectedData = rows
      .filter((row) => selectedRows.includes(row.id))
      .map((row) => ({
        id: row.id,

        productName:
          row.productName === "-" ? "" : String(row.productName).trim(),

        category: row.category === "-" ? "" : String(row.category).trim(),

        brand: row.brand === "-" ? "" : String(row.brand).trim(),

        sku: row.sku === "-" ? "" : String(row.sku).trim().toUpperCase(),

        purchasePrice:
          row.purchasePrice === "-" ? null : Number(row.purchasePrice),

        sellingPrice:
          row.sellingPrice === "-" ? null : Number(row.sellingPrice),

        writtenPrice:
          row.writtenPrice === "-" ? null : Number(row.writtenPrice),

        manufactureDate:
          row.manufactureDate === "-" ? null : row.manufactureDate,

        expiryDate: row.expiryDate === "-" ? null : row.expiryDate,

        stock: row.stock === "-" ? null : Number(row.stock),

        unit: row.unit === "-" ? "" : String(row.unit).trim(),

        unitNo: row.unitNo === "-" ? null : Number(row.unitNo),
      }));

    if (selectedData.length === 0) {
      alert("No valid data selected.");
      return;
    }

    const formData = new FormData();

    formData.append("products", JSON.stringify(selectedData));

    /*
     * Add images
     */
    const selectedSkus = new Set(
      selectedData.map((product) => product.sku).filter(Boolean),
    );

    const unmatchedImages = [];

    imageFiles.forEach((image) => {
      const originalName = image.name;

      const fileName = originalName
        .substring(0, originalName.lastIndexOf("."))
        .trim()
        .toUpperCase();

      let matchedSku = null;

      for (const sku of selectedSkus) {
        if (fileName === sku) {
          matchedSku = sku;
          break;
        }

        if (
          fileName.startsWith(`${sku}_`) ||
          fileName.startsWith(`${sku}-`) ||
          fileName.startsWith(`${sku} (`)
        ) {
          matchedSku = sku;
          break;
        }
      }

      if (matchedSku) {
        formData.append(`images_${matchedSku}`, image);
      } else {
        unmatchedImages.push(originalName);
      }
    });

    /*
     * DEBUG FormData
     */

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
      } else {
      }
    }

    try {
      setLoading(true);

      const response = await API.post("/import", formData);

      const result = response.data;

      if (result.success) {
        const importedCount = result.summary?.imported || 0;

        const skippedCount = result.summary?.skipped || 0;

        const failedCount = result.summary?.failed || 0;

        alert(
          `Successfully imported ${importedCount} products!` +
            (skippedCount > 0
              ? ` ${skippedCount} duplicate product(s) skipped.`
              : "") +
            (failedCount > 0
              ? ` ${failedCount} product(s) failed. Check console for details.`
              : "") +
            (unmatchedImages.length > 0
              ? ` ${unmatchedImages.length} image(s) could not be matched with a selected SKU.`
              : ""),
        );

        if (importedCount > 0) {
          handleCancel();
        }
      } else {
        alert(result.message || "Import failed. Please try again.");
      }
    } catch (error) {
      console.error("Import API Error:", error);

      console.error("Backend Error:", error.response?.data);

      console.error("Backend Status:", error.response?.status);

      alert(
        error.response?.data?.message || "Import failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalRows = rows.length;

  const validRowsCount = validRows.length;

  const invalidRowsCount = totalRows - validRowsCount;

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="importXls">
      {/* 1. Page Header */}

      <div className="importXls-header">
        <h1 className="importXls-title">Import Data from XLS</h1>

        <div className="importXls-breadcrumb">
          <span>Home</span>

          {" > "}

          <span>Import / Export</span>

          {" > "}

          <span className="importXls-breadcrumbActive">Import XLS</span>
        </div>
      </div>

      {/* 2. Main Two-Column Layout */}

      <div className="importXls-layout">
        {/* Left Main Section */}

        <main className="importXls-main">
          {/* Stepper */}

          <div className="importXls-steps">
            {steps.map((step) => {
              const isActive = imported ? step.number === 3 : step.number === 1;

              const isCompleted = imported && step.number < 3;

              return (
                <div
                  key={step.number}
                  className={`importXls-stepItem ${isActive ? "active" : ""} ${
                    isCompleted ? "completed" : ""
                  }`}
                >
                  <div className="importXls-stepCircle">
                    {isCompleted ? "✓" : step.number}
                  </div>

                  <div className="importXls-stepText">
                    <h4>{step.title}</h4>

                    <p>{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {!imported ? (
            /* Upload Box State */

            <div className="importXls-uploadBox">
              <div className="importXls-uploadIcon">📊</div>

              <h3>Upload XLS File</h3>

              <p>Upload your .xls or .xlsx spreadsheet file</p>

              <label className="importXls-uploadButton">
                Choose XLS File
                <input
                  type="file"
                  accept=".xls,.xlsx,image/*"
                  multiple
                  onChange={handleFileUpload}
                  hidden
                />
              </label>

              <small>Maximum file size: 5MB</small>
            </div>
          ) : (
            /* Upload Success & Preview State */

            <>
              {/* File Uploaded Success Box */}

              <div className="importXls-successCard">
                <div className="importXls-successCardLeft">
                  <div className="importXls-successIcon">✓</div>

                  <div className="importXls-fileMeta">
                    <h3>File Uploaded Successfully!</h3>

                    <p className="importXls-fileName">
                      File Name: {file?.name}
                    </p>

                    <div className="importXls-fileStats">
                      <span>
                        Total Rows: <strong>{totalRows}</strong>
                      </span>

                      <span className="importXls-statDivider">|</span>

                      <span>
                        Valid Rows: <strong>{validRowsCount}</strong>
                      </span>

                      <span className="importXls-statDivider">|</span>

                      <span>
                        Invalid Rows: <strong>{invalidRowsCount}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="importXls-sampleButton"
                  onClick={handleDownloadSample}
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />

                    <polyline points="7 10 12 15 17 10" />

                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download Sample File
                </button>
              </div>

              {/* Preview Section Header */}

              <div className="importXls-previewHeader">
                <h3 className="importXls-previewTitle">
                  Preview Data ({rows.length} Rows)
                </h3>

                <label className="importXls-selectAll">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    disabled={validRows.length === 0}
                  />

                  <span>
                    Select All ({selectedRows.length}/{validRowsCount} valid
                    rows)
                  </span>
                </label>
              </div>

              {/* Data Table */}

              <div className="importXls-tableWrapper">
                <table className="importXls-table">
                  <thead>
                    <tr>
                      <th
                        style={{
                          width: "42px",
                        }}
                      />

                      <th>S.No</th>

                      <th>Product Name</th>

                      <th>Category</th>

                      <th>Brand</th>

                      <th>SKU</th>

                      <th>Purchase Price</th>

                      <th>Selling Price</th>

                      <th>Written Price</th>

                      <th>Manufacture Date</th>

                      <th>Expiry Date</th>

                      <th>Stock</th>

                      <th>Unit</th>
                      <th>Unit No</th>

                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {rows.map((row) => (
                      <tr
                        key={row.id}
                        className={!row.valid ? "importXls-invalidRow" : ""}
                      >
                        <td>
                          <input
                            type="checkbox"
                            disabled={!row.valid}
                            checked={selectedRows.includes(row.id)}
                            onChange={() => handleRowSelect(row.id)}
                          />
                        </td>

                        <td>{row.id}</td>

                        <td className="importXls-cellName">
                          {row.productName}
                        </td>

                        <td>{row.category}</td>

                        <td>{row.brand}</td>

                        <td>{row.sku}</td>

                        <td>
                          {row.purchasePrice !== "-"
                            ? `₹${row.purchasePrice}`
                            : "-"}
                        </td>

                        <td>
                          {row.sellingPrice !== "-"
                            ? `₹${row.sellingPrice}`
                            : "-"}
                        </td>

                        <td>
                          {row.writtenPrice !== undefined &&
                          row.writtenPrice !== null &&
                          row.writtenPrice !== "" &&
                          row.writtenPrice !== "-"
                            ? `₹${row.writtenPrice}`
                            : "-"}
                        </td>

                        <td>{row.manufactureDate}</td>

                        <td>{row.expiryDate}</td>

                        <td>{row.stock}</td>

                        <td>{row.unit}</td>
                        <td>{row.unitNo}</td>

                        <td>
                          {row.valid ? (
                            <span className="importXls-badgeValid">Valid</span>
                          ) : (
                            <span className="importXls-badgeInvalid">
                              Invalid
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Warning Box */}

              {invalidRowsCount > 0 && (
                <div className="importXls-warningBox">
                  <span className="importXls-warningIcon">!</span>

                  <p>
                    Note: {invalidRowsCount} rows contain invalid data and will
                    not be imported.
                  </p>
                </div>
              )}

              {/* Bottom Actions */}

              <div className="importXls-bottomActions">
                <button
                  type="button"
                  className="importXls-btnSecondary"
                  onClick={handleCancel}
                >
                  &lt; Back
                </button>

                <div className="importXls-actionGroup">
                  <button
                    type="button"
                    className="importXls-btnOutline"
                    onClick={handleCancel}
                  >
                    Cancel Import
                  </button>

                  <button
                    type="button"
                    className="importXls-btnPrimary"
                    disabled={loading || selectedRows.length === 0}
                    onClick={handleImport}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />

                      <polyline points="17 8 12 3 7 8" />

                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>

                    {loading
                      ? "Importing..."
                      : `Import Valid Data (${selectedRows.length})`}
                  </button>
                </div>
              </div>
            </>
          )}
        </main>

        {/* Right Instructions Sidebar */}

        <aside className="importXls-sidebar">
          {/* Instructions Card */}

          <div className="importXls-infoCard">
            <h3>Import Instructions</h3>

            <ul>
              <li>Upload only .xls or .xlsx files</li>

              <li>Maximum file size: 5MB</li>

              <li>First row should contain column headers</li>

              <li>Duplicate SKU will be skipped</li>

              <li>Only valid rows will be imported</li>
            </ul>
          </div>

          {/* Required Columns Card */}

          <div className="importXls-infoCard">
            <h3>Required Columns</h3>

            <div className="importXls-columnList">
              <p className="importXls-colItem check">
                <span>✓</span>
                Product Name
              </p>

              <p className="importXls-colItem check">
                <span>✓</span>
                SKU
              </p>

              <p className="importXls-colItem check">
                <span>✓</span>
                Category
              </p>

              <p className="importXls-colItem check">
                <span>✓</span>
                Purchase Price
              </p>

              <p className="importXls-colItem check">
                <span>✓</span>
                Selling Price
              </p>

              <p className="importXls-colItem check">
                <span>✓</span>
                Stock
              </p>

              <p className="importXls-colItem check">
                <span>✓</span>
                Unit
              </p>
              <p className="importXls-colItem check">
                <span>✓</span>
                Unit No
              </p>
            </div>
          </div>

          {/* Optional Columns Card */}

          <div className="importXls-infoCard">
            <h3>Optional Columns</h3>

            <div className="importXls-columnList">
              <p className="importXls-colItem info">
                <span>ⓘ</span>
                Brand
              </p>

              <p className="importXls-colItem info">
                <span>ⓘ</span>
                Written Price
              </p>

              <p className="importXls-colItem info">
                <span>ⓘ</span>
                Manufacture Date
              </p>

              <p className="importXls-colItem info">
                <span>ⓘ</span>
                Expiry Date
              </p>

              <p className="importXls-colItem info">
                <span>ⓘ</span>
                Description
              </p>

              <p className="importXls-colItem info">
                <span>ⓘ</span>
                Status
              </p>
            </div>
          </div>

          {/* Need Help Card */}

          <div className="importXls-infoCard importXls-helpCard">
            <div className="importXls-helpHeader">
              <div className="importXls-helpIcon">!</div>

              <h3>Need Help?</h3>
            </div>

            <p>
              Download the sample file and follow the format to import data
              correctly.
            </p>

            <button
              type="button"
              className="importXls-sampleButton fullWidth"
              onClick={handleDownloadSample}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />

                <polyline points="7 10 12 15 17 10" />

                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download Sample File
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Import;
