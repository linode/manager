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

// Validate the linodePackage before using it
const validatePackage = (linodePackage) => {
  if (!PACKAGES.includes(linodePackage)) {
    throw new Error(`Invalid package name: ${linodePackage}`);
  }
};

export const changelogPath = (linodePackage) => {
  validatePackage(linodePackage);
  return path.join(
    __dirname,
    `../../../packages/${linodePackage}/CHANGELOG.md`
  );
};
export const changesetDirectory = (linodePackage) => {
  validatePackage(linodePackage);
  return path.join(__dirname, `../../../packages/${linodePackage}/.changeset`);
};
export const packageJsonPath = (linodePackage) => {
  validatePackage(linodePackage);
  return path.join(
    __dirname,
    `../../../packages/${linodePackage}/package.json`
  );
};
