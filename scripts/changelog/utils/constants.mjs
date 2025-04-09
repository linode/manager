import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const BOT = 'linode-gh-bot';

export const PACKAGES = ["api-v4", "manager", "validation", "ui", "utilities"];
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

export const changelogPath = (linodePackage) =>
  path.join(__dirname, `../../../packages/${linodePackage}/CHANGELOG.md`);
export const changesetDirectory = (linodePackage) =>
  path.join(__dirname, `../../../packages/${linodePackage}/.changeset`);
export const packageJsonPath = (linodePackage) =>
  path.join(__dirname, `../../../packages/${linodePackage}/package.json`);


