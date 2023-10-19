import fs from "fs";
import { logger } from "../changelog/utils/logger.mjs";
import { readCoverage } from "./readCoverage.mjs";

/**
 * Coverage threshold
 */
const COVERAGE_THRESHOLD = 80;

/**
 * Extract the coverage percentage and assess the badge color
 * Generate the Markdown for the badge
 * Read the README.md file and replace the existing badge with the updated one
 */
try {
  const coveragePercentage = readCoverage();

  const badgeColor =
    coveragePercentage >= COVERAGE_THRESHOLD ? "green" : "yellow";

  const badgeMarkdown = `<img alt="Linode/Manager Coverage" src="https://img.shields.io/badge/%40linode%2Fmanager_coverage-${coveragePercentage}%25-${badgeColor}" />`;

  let readmeContents = fs.readFileSync("README.md", "utf8");
  const coverageBadgeRegex = /<img alt="Linode\/Manager Coverage" src="[^"]+" \/>/;

  readmeContents = readmeContents.replace(coverageBadgeRegex, badgeMarkdown);

  fs.writeFileSync("README.md", readmeContents);

  logger.success({
    message: "Successfully updated the coverage badge!",
    info: `Coverage: ${coveragePercentage}%`,
  });
} catch (error) {
  logger.error({
    message: "Something went wrong while updating the coverage badge.",
    info: error,
  });
}
