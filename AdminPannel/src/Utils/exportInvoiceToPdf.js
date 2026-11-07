import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

/**
 * Cleanly download invoice as high-resolution A4 PDF (210mm x 297mm) without triggering window.print()
 * @param {HTMLElement} element - The invoice sheet DOM element
 * @param {string} fileName - Destination PDF file name
 */
export const exportInvoiceToPdf = async (element, fileName = "Invoice.pdf") => {
  if (!element) return;

  try {
    const canvas = await html2canvas(element, {
      scale: 2.5, // Crisp retina clarity
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const imgData = canvas.toDataURL("image/png");

    // Standard A4 portrait: 210mm x 297mm
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    pdf.addImage(imgData, "PNG", 0, 0, 210, 297, undefined, "FAST");
    pdf.save(fileName);
    return true;
  } catch (error) {
    console.error("Failed to generate invoice PDF:", error);
    throw error;
  }
};
