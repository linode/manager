import fs from "fs";
import path from "path";
import { logger } from "./logger.mjs";
import { promisify } from "util";
import { changesetDirectory } from "./constants.mjs";
import simpleGit from "simple-git";

const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);

const git = simpleGit();

/**
 * Sanitize the file name to remove potentially dangerous characters
 * @param {string} fileName - The file name to sanitize
 * @returns {string} - Sanitized file name
 */
const sanitizeFileName = (fileName) => {
  return fileName.replace(/[^a-zA-Z0-9-_\.]/g, ""); // Only allow alphanumeric, dashes, underscores, and dots
};

/**
 * Safe path join function to prevent path traversal
 * @param {string} dir - The base directory
 * @param {string} file - The file name
 * @returns {string} - Safe file path
 */
const safeJoinPath = (dir, file) => {
  const sanitizedFile = sanitizeFileName(file);
  const safeFile = path.basename(sanitizedFile); // Ensure the file is not traversing directories
  return path.join(dir, safeFile); // Join the directory and file safely
};

/**
 * Populates the changelog content with the provided entries.
 * @returns {void} Deletes the changeset files and tracks the deletions in Git.
 */
export const deleteChangesets = async (linodePackage) => {
  const changesetDir = changesetDirectory(linodePackage);
  try {
    const files = await readdir(changesetDir);

    for (const file of files) {
      if (file !== "README.md") {
        const filePath = safeJoinPath(changesetDir, file); // Use safe path join
        try {
          await unlink(filePath);
          console.warn(`Deleted: ${filePath}`);
          await git.rm(filePath);
        } catch (error) {
          console.error(`Error occurred while deleting ${filePath}:`, error);
        }
      }
    }

    logger.success({
      message: `Deleted all changesets for @linode/${linodePackage}`,
    });
  } catch (error) {
    logger.error({
      message: `Error occurred while deleting changesets for @linode/${linodePackage}`,
      info: error,
    });
  }
};
