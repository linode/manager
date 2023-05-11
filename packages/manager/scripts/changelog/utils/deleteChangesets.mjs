import fs from 'fs';
import path from 'path';
import { logger } from './logger.mjs';
import { promisify } from 'util';
import { CHANGESET_DIRECTORY } from './constants.mjs';

const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);

/**
 * Populates the changelog content with the provided entries.
 * @returns {void} Deletes the changeset files.
 */
export const deleteChangesets = async () => {
  try {
    const files = await readdir(CHANGESET_DIRECTORY);

    for (const file of files) {
      if (file !== 'README.md') {
        const filePath = path.join(CHANGESET_DIRECTORY, file);
        (async () => {
          try {
            await unlink(filePath);
            console.warn(`Deleted: ${filePath}`);
          } catch (error) {
            console.error(`Error occurred while deleting ${filePath}:`, error);
          }
        })();
      }
    }

    logger.success({ message: 'Deleted all changesets!' });
  } catch (error) {
    logger.error({
      message: 'Error occurred while deleting changesets:',
      info: error,
    });
  }
};
