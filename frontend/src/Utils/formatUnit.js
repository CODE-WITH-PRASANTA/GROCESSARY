/**
 * Formats grocery unit strings according to store display guidelines:
 * - Kilogram / kilogram -> Kg
 * - Gram / gram / grams -> gm
 * Examples:
 *   formatUnit({ name: "Kilogram" }) => "1 Kg"
 *   formatUnit({ name: "Gram" }, 500) => "500 gm"
 *   formatUnit("1 Kilogram") => "1 Kg"
 *   formatUnit("500 Gram") => "500 gm"
 *   formatUnit("500g") => "500 gm"
 */
export const formatUnit = (unit, unitNo = "") => {
  if (!unit && !unitNo) return "1 pc";

  let raw = "";
  if (typeof unit === "object" && unit !== null) {
    raw = unit.name || unit.symbol || "";
  } else if (typeof unit === "string") {
    raw = unit;
  } else if (unit) {
    raw = String(unit);
  }

  const prefix =
    unitNo !== null && unitNo !== undefined && String(unitNo).trim() !== ""
      ? `${String(unitNo).trim()} `
      : "";

  let combined = (prefix + raw).trim();
  if (!combined) return "1 pc";

  // Case-insensitive replacements
  let formatted = combined
    .replace(/\bkilograms?\b/gi, "Kg")
    .replace(/\bgrams?\b/gi, "gm")
    .replace(/\bkg\b/gi, "Kg")
    .replace(/(\d+)\s*kg\b/gi, "$1 Kg")
    .replace(/(\d+)\s*g\b/gi, "$1 gm")
    .trim();

  // If just "Kg" without a leading number, display "1 Kg"
  if (/^kg$/i.test(formatted)) {
    return "1 Kg";
  }
  // If just "gm" without a leading number, display "1 gm"
  if (/^gm$/i.test(formatted)) {
    return "1 gm";
  }

  return formatted;
};

export default formatUnit;
