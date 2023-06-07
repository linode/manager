import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const BOT = 'linode-gh-bot';
export const CHANGELOG_PATH = path.join(__dirname, '../../../CHANGELOG.md');
export const changeSetDirectory = (linodePackage) =>
  path.join(__dirname, `../../../packages/${linodePackage}/.changeset`);
export const PACKAGES = ["api-v4", "manager", "validation"];
export const CHANGESET_TYPES = [
  'Added',
  'Fixed',
  'Changed',
  'Removed',
  'Tech Stories',
];
export const OWNER = 'linode';
export const PACKAGE_JSON_PATH = path.join(__dirname, '../../../package.json');
export const REPO = 'manager';
