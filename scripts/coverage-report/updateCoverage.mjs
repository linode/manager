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

  const badgeMarkdown = `[![Coverage](https://img.shields.io/badge/@linode/manager_coverage-${coveragePercentage}%-${badgeColor})](packages/manager/coverage/lcov-report/index.html)`;

  let readmeContents = fs.readFileSync("README.md", "utf8");
  readmeContents = readmeContents
    .replace(/\[!\[Coverage\]\([^)]*\)]\([^)]*\)/i, badgeMarkdown)
    .slice(0, -1);

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
