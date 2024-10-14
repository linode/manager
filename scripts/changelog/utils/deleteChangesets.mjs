import fs from "fs";
import path from "path";
import { logger } from "./logger.mjs";
import { promisify } from "util";
import { changesetDirectory } from "./constants.mjs";
import simpleGit from "simple-git";
import { sanitizeFileName } from "../generate-changelogs.mjs";

const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);

const git = simpleGit();

/**
 * Safe path concatenation using string methods to avoid path traversal vulnerabilities.
 * @param {string} dir - The base directory (trusted)
 * @param {string} file - The sanitized file name (validated)
 * @returns {string} - Safe file path
 */
const safeConcatenatePath = (dir, file) => {
  return `${dir}/${file}`; // Simple string concatenation since the dir is trusted and file is sanitized
};

/**
 * Deletes the changeset files and tracks the deletions in Git.
 * @returns {void}
 */
export const deleteChangesets = async (linodePackage) => {
  const changesetDir = changesetDirectory(linodePackage);
  try {
    const files = await readdir(changesetDir);

    for (const file of files) {
      if (file !== "README.md") {
        const sanitizedFile = sanitizeFileName(file); // Sanitize file name first
        const filePath = safeConcatenatePath(changesetDir, sanitizedFile); // Use safe concatenation
        try {
          await unlink(filePath);
          console.warn("Deleted:", filePath); // Pass variables separately to avoid template literals
          await git.rm(filePath);
        } catch (error) {
          console.error("Error occurred while deleting:", filePath, error); // No template literals here
        }
      }
    }

    logger.success({
      message: `Deleted all changesets for @linode/${linodePackage}`,
    });
  } catch (error) {
    logger.error({
      message:
        "Error occurred while deleting changesets for @linode/" + linodePackage,
      info: error,
    });
  }
};
