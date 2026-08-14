import React, { useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import "./Import.css";

const steps = [
  { number: 1, title: "Upload File", description: "Upload your XLS file" },
  { number: 2, title: "Map Columns", description: "Map columns with database" },
  { number: 3, title: "Preview Data", description: "Preview & verify data" },
  { number: 4, title: "Import & Finish", description: "Import data to system" }
];

const Import = () => {
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imported, setImported] = useState(false);

  // File Upload Logic
  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const formattedData = jsonData.map((item, index) => {
          const isValid = Boolean(
            item["Product Name"] &&
            item["Category"] &&
            item["Purchase Price"] !== undefined &&
            item["Selling Price"] !== undefined &&
            item["Stock"] !== undefined &&
            item["Unit"]
          );

          return {
            id: index + 1,
            productName: item["Product Name"] || "Unknown Product",
            category: item["Category"] || "-",
            brand: item["Brand"] || "-",
            sku: item["SKU"] || "-",
            purchasePrice: item["Purchase Price"] ?? "-",
            sellingPrice: item["Selling Price"] ?? "-",
            stock: item["Stock"] ?? "-",
            unit: item["Unit"] || "-",
            valid: isValid
          };
        });

        setRows(formattedData);

        // Pre-select only valid rows
        setSelectedRows(
          formattedData.filter((item) => item.valid).map((item) => item.id)
        );

        setImported(true);
      } catch (err) {
        console.error("Error reading file:", err);
        alert("Failed to parse XLS file. Please verify the format.");
      }
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  // Download Sample Excel Template
  const handleDownloadSample = () => {
    const sampleData = [
      {
        "Product Name": "Aashirvaad Atta 5kg",
        "Category": "Foodgrains",
        "Brand": "Aashirvaad",
        "SKU": "ATT5001",
        "Purchase Price": 210.00,
        "Selling Price": 245.00,
        "Stock": 120,
        "Unit": "Pcs"
      },
      {
        "Product Name": "Fortune Sunflower Oil 1L",
        "Category": "Oil & Ghee",
        "Brand": "Fortune",
        "SKU": "OIL1001",
        "Purchase Price": 140.00,
        "Selling Price": 165.00,
        "Stock": 80,
        "Unit": "Pcs"
      },
      {
        "Product Name": "Tata Tea 250g",
        "Category": "Beverages",
        "Brand": "Tata",
        "SKU": "TEA2501",
        "Purchase Price": 95.00,
        "Selling Price": 120.00,
        "Stock": 60,
        "Unit": "Pcs"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "grocery_products_sample.xlsx");
  };

  // Selection Logic
  const validRows = rows.filter((row) => row.valid);
  const allSelected = validRows.length > 0 && selectedRows.length === validRows.length;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedRows([]);
    } else {
      setSelectedRows(validRows.map((row) => row.id));
    }
  };

  const handleRowSelect = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleCancel = () => {
    setFile(null);
    setRows([]);
    setSelectedRows([]);
    setImported(false);
  };

  // Backend Import
  const handleImport = async () => {
    if (selectedRows.length === 0) {
      alert("Please select at least one valid row to import.");
      return;
    }

    const selectedData = rows.filter((row) => selectedRows.includes(row.id));

    try {
      setLoading(true);
      await axios.post("http://localhost:5000/api/products/import", {
        products: selectedData
      });
      alert(`Successfully imported ${selectedData.length} products!`);
      handleCancel();
    } catch (error) {
      console.error("Import API Error:", error);
      alert(error.response?.data?.message || "Import failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Statistics
  const totalRows = rows.length;
  const validRowsCount = validRows.length;
  const invalidRowsCount = totalRows - validRowsCount;

  return (
    <div className="importXls">
      {/* 1. Page Header */}
      <div className="importXls-header">
        <h1 className="importXls-title">Import Data from XLS</h1>
        <div className="importXls-breadcrumb">
          <span>Home</span> &gt; <span>Import / Export</span> &gt; <span className="importXls-breadcrumbActive">Import XLS</span>
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
                  className={`importXls-stepItem ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
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
                  accept=".xls,.xlsx"
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
                    <p className="importXls-fileName">File Name: {file?.name}</p>
                    <div className="importXls-fileStats">
                      <span>Total Rows: <strong>{totalRows}</strong></span>
                      <span className="importXls-statDivider">|</span>
                      <span>Valid Rows: <strong>{validRowsCount}</strong></span>
                      <span className="importXls-statDivider">|</span>
                      <span>Invalid Rows: <strong>{invalidRowsCount}</strong></span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="importXls-sampleButton"
                  onClick={handleDownloadSample}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Download Sample File
                </button>
              </div>

              {/* Preview Section Header */}
              <div className="importXls-previewHeader">
                <h3 className="importXls-previewTitle">Preview Data ({rows.length} Rows)</h3>
                <label className="importXls-selectAll">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    disabled={validRows.length === 0}
                  />
                  <span>Select All ({selectedRows.length}/{validRowsCount} valid rows)</span>
                </label>
              </div>

              {/* Data Table */}
              <div className="importXls-tableWrapper">
                <table className="importXls-table">
                  <thead>
                    <tr>
                      <th style={{ width: "42px" }}></th>
                      <th>S.No</th>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Brand</th>
                      <th>SKU</th>
                      <th>Purchase Price</th>
                      <th>Selling Price</th>
                      <th>Stock</th>
                      <th>Unit</th>
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
                        <td className="importXls-cellName">{row.productName}</td>
                        <td>{row.category}</td>
                        <td>{row.brand}</td>
                        <td>{row.sku}</td>
                        <td>{row.purchasePrice !== "-" ? `₹${row.purchasePrice}` : "-"}</td>
                        <td>{row.sellingPrice !== "-" ? `₹${row.sellingPrice}` : "-"}</td>
                        <td>{row.stock}</td>
                        <td>{row.unit}</td>
                        <td>
                          {row.valid ? (
                            <span className="importXls-badgeValid">Valid</span>
                          ) : (
                            <span className="importXls-badgeInvalid">Invalid</span>
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
                  <p>Note: {invalidRowsCount} rows contain invalid data and will not be imported.</p>
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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    {loading ? "Importing..." : `Import Valid Data (${selectedRows.length})`}
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
              <p className="importXls-colItem check"><span>✓</span> Product Name</p>
              <p className="importXls-colItem check"><span>✓</span> Category</p>
              <p className="importXls-colItem check"><span>✓</span> Purchase Price</p>
              <p className="importXls-colItem check"><span>✓</span> Selling Price</p>
              <p className="importXls-colItem check"><span>✓</span> Stock</p>
              <p className="importXls-colItem check"><span>✓</span> Unit</p>
            </div>
          </div>

          {/* Optional Columns Card */}
          <div className="importXls-infoCard">
            <h3>Optional Columns</h3>
            <div className="importXls-columnList">
              <p className="importXls-colItem info"><span>ⓘ</span> Brand</p>
              <p className="importXls-colItem info"><span>ⓘ</span> SKU</p>
              <p className="importXls-colItem info"><span>ⓘ</span> Description</p>
              <p className="importXls-colItem info"><span>ⓘ</span> Status</p>
            </div>
          </div>

          {/* Need Help Card */}
          <div className="importXls-infoCard importXls-helpCard">
            <div className="importXls-helpHeader">
              <div className="importXls-helpIcon">!</div>
              <h3>Need Help?</h3>
            </div>
            <p>Download the sample file and follow the format to import data correctly.</p>
            <button
              type="button"
              className="importXls-sampleButton fullWidth"
              onClick={handleDownloadSample}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
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