import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const BOT = 'linode-gh-bot';

export const PACKAGES = [
  "api-v4",
  "manager",
  "queries",
  "shared",
  "ui",
  "utilities",
  "validation",
];

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


const CHANGELOG_PATHS = {
  "api-v4": path.join(__dirname, "../../../packages/api-v4/CHANGELOG.md"),
  "manager": path.join(__dirname, "../../../packages/manager/CHANGELOG.md"),
  "queries": path.join(__dirname, "../../../packages/queries/CHANGELOG.md"),
  "ui": path.join(__dirname, "../../../packages/ui/CHANGELOG.md"),
  "shared": path.join(__dirname, "../../../packages/shared/CHANGELOG.md"),
  "utilities": path.join(__dirname, "../../../packages/utilities/CHANGELOG.md"),
  "validation": path.join(__dirname, "../../../packages/validation/CHANGELOG.md"),
};

const CHANGESET_DIRECTORIES = {
  "api-v4": path.join(__dirname, "../../../packages/api-v4/.changeset"),
  "manager": path.join(__dirname, "../../../packages/manager/.changeset"),
  "queries": path.join(__dirname, "../../../packages/queries/.changeset"),
  "ui": path.join(__dirname, "../../../packages/ui/.changeset"),
  "shared": path.join(__dirname, "../../../packages/shared/.changeset"),
  "utilities": path.join(__dirname, "../../../packages/utilities/.changeset"),
  "validation": path.join(__dirname, "../../../packages/validation/.changeset"),
};

const PACKAGE_JSON_PATHS = {
  "api-v4": path.join(__dirname, "../../../packages/api-v4/package.json"),
  "manager": path.join(__dirname, "../../../packages/manager/package.json"),
  "queries": path.join(__dirname, "../../../packages/queries/package.json"),
  "ui": path.join(__dirname, "../../../packages/ui/package.json"),
  "shared": path.join(__dirname, "../../../packages/shared/package.json"),
  "utilities": path.join(__dirname, "../../../packages/utilities/package.json"),
  "validation": path.join(__dirname, "../../../packages/validation/package.json"),
};

export const changelogPath = (linodePackage) => {
  if (!CHANGELOG_PATHS[linodePackage]) {
    throw new Error(`Invalid package: ${linodePackage}`);
  }
  return CHANGELOG_PATHS[linodePackage];
};

export const changesetDirectory = (linodePackage) => {
  if (!CHANGESET_DIRECTORIES[linodePackage]) {
    throw new Error(`Invalid package: ${linodePackage}`);
  }
  return CHANGESET_DIRECTORIES[linodePackage];
};

export const packageJsonPath = (linodePackage) => {
  if (!PACKAGE_JSON_PATHS[linodePackage]) {
    throw new Error(`Invalid package: ${linodePackage}`);
  }
  return PACKAGE_JSON_PATHS[linodePackage];
};