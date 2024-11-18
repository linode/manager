import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const BOT = "linode-gh-bot";

export const PACKAGES = ["api-v4", "manager", "validation", "ui"];
export const VALID_FILENAMES = ["CHANGELOG.md", ".changeset", "package.json"];
export const CHANGESET_TYPES = [
  "Added",
  "Fixed",
  "Changed",
  "Removed",
  "Tech Stories",
  "Tests",
  "Upcoming Features",
];
export const OWNER = "linode";
export const REPO = "manager";

// Base directory for all packages - ensure it's absolute
const baseDir = path.resolve(__dirname, "../../../packages");

// Sanitize input to allow only alphanumeric, dashes, and underscores
export const sanitizeInput = (input) => {
  return input.replace(/[^a-zA-Z0-9-_]/g, "");
};

// Validate the linodePackage before using it
const validatePackage = (linodePackage) => {
  if (!PACKAGES.includes(linodePackage)) {
    throw new Error(`Invalid package name: ${linodePackage}`);
  }
};

// Validate the fileName before using it (whitelist approach)
const validateFileName = (fileName) => {
  if (!VALID_FILENAMES.includes(fileName)) {
    throw new Error(`Invalid file name: ${fileName}`);
  }
};

// Safe path join with base directory enforcement
const safePathJoin = (linodePackage, fileName) => {
  const sanitizedPackage = sanitizeInput(linodePackage); // Sanitize input

  validatePackage(sanitizedPackage); // Validate sanitized input
  validateFileName(fileName); // Validate file name from a whitelist

  // Normalize and resolve the path to ensure it's absolute and safe
  const resolvedPath = path.resolve(
    baseDir,
    path.normalize(path.join(sanitizedPackage, fileName))
  );

  // Ensure the resolved path starts with the baseDir to prevent traversal
  if (!resolvedPath.startsWith(baseDir)) {
    throw new Error("Path traversal attempt detected");
  }

  return resolvedPath;
};

export const changelogPath = (linodePackage) =>
  safePathJoin(linodePackage, "CHANGELOG.md");
export const changesetDirectory = (linodePackage) =>
  safePathJoin(linodePackage, ".changeset");
export const packageJsonPath = (linodePackage) =>
  safePathJoin(linodePackage, "package.json");
