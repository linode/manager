import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const BOT = "linode-gh-bot";

export const PACKAGES = ["api-v4", "manager", "validation"];
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

// Base directory for all packages
const baseDir = path.resolve(__dirname, "../../../packages");

// Validate the linodePackage before using it
const validatePackage = (linodePackage) => {
  if (!PACKAGES.includes(linodePackage)) {
    throw new Error(`Invalid package name: ${linodePackage}`);
  }
};

// Safe path join with base directory enforcement
const safePathJoin = (linodePackage, fileName) => {
  validatePackage(linodePackage);

  // Resolve the path to ensure it's absolute
  const resolvedPath = path.resolve(baseDir, linodePackage, fileName);

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
