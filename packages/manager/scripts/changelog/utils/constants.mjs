import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const CHANGESET_DIRECTORY = path.join(__dirname, '../../../.changeset');
export const PACKAGE_JSON_PATH = path.join(__dirname, '../../../package.json');
export const CHANGELOG_PATH = path.join(__dirname, '../../../CHANGELOG.md');
export const CHANGESET_TYPES = [
  'Added',
  'Fixed',
  'Changed',
  'Removed',
  'Tech Stories',
];
