import fs from "fs";
import { logger } from "../changelog/utils/logger.mjs";

/**
 * Path to the LCOV report and the coverage threshold
 */
const LCOV_REPORT_PATH = "packages/manager/coverage/lcov-report/index.html";

/**
 * Read the LCOV report HTML content
 */
const reportContents = fs.readFileSync(LCOV_REPORT_PATH, "utf8");

/**
 * Function to extract the coverage percentage
 */
function extractCoveragePercentage(html) {
  // Search for the span element with class "strong" which contains the coverage percentage
  const spanOpeningTag = html.indexOf('<span class="strong">');
  if (spanOpeningTag === -1) {
    return "N/A"; // If the element is not found
  }

  // Find the closing tag of the span element
  const spanClosingTag = html.indexOf("</span>", spanOpeningTag);
  if (spanClosingTag === -1) {
    return "N/A"; // If the closing tag is not found
  }

  return html.slice(spanOpeningTag + 21, spanClosingTag).trim();
}

/**
 * Extract the coverage percentage and assess the badge color
 * Generate the Markdown for the badge
 * Read the README.md file and replace the existing badge with the updated one
 */
export function readCoverage() {
  try {
    const coveragePercentage = extractCoveragePercentage(reportContents);
    const coveragePercentageNumber = parseFloat(coveragePercentage);

    return coveragePercentageNumber;
  } catch (error) {
    logger.error({
      message: "Something went wrong while getting the branch coverage.",
      info: error,
    });
  }
}
