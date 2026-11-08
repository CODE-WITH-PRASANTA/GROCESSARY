import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

/**
 * Cleanly download invoice as high-resolution PDF without triggering window.print()
 * @param {HTMLElement} element - The invoice sheet DOM element
 * @param {string} fileName - Destination PDF file name
 */
export const exportInvoiceToPdf = async (element, fileName = "Invoice.pdf") => {
  if (!element) return false;

  try {
    const canvas = await html2canvas(element, {
      scale: 2.5,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // Standard A4 portrait: 210mm x 297mm
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Scale down to fit neatly within A4 with small margins
    const margin = 10;
    const printableWidth = pdfWidth - margin * 2;
    const computedHeight = (imgHeight * printableWidth) / imgWidth;

    let targetHeight = computedHeight;
    let targetWidth = printableWidth;

    // If height exceeds single A4 page, scale proportionally
    if (targetHeight > pdfHeight - margin * 2) {
      targetHeight = pdfHeight - margin * 2;
      targetWidth = (imgWidth * targetHeight) / imgHeight;
    }

    const xPos = margin + (printableWidth - targetWidth) / 2;
    const yPos = margin;

    pdf.addImage(imgData, "PNG", xPos, yPos, targetWidth, targetHeight, undefined, "FAST");
    pdf.save(fileName);
    return true;
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    throw error;
  }
};
