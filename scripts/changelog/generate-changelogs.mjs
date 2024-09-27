import fs from "fs";
import inquirer from "inquirer";
import chalk from "chalk";
import path from "path";
import { deleteChangesets } from "./utils/deleteChangesets.mjs";
import { incrementSemver } from "./utils/incrementSemver.mjs";
import { initiateChangelogEntry } from "./utils/initiateChangelogEntry.mjs";
import { logger } from "./utils/logger.mjs";
import { populateChangelogEntry } from "./utils/populateChangelogEntry.mjs";
import { readFile } from "fs/promises";
import {
  changesetDirectory,
  PACKAGES,
  packageJsonPath,
  changelogPath,
} from "./utils/constants.mjs";

// Sanitize the file name to prevent path traversal
const sanitizeFileName = (fileName) => {
  return fileName.replace(/[^a-zA-Z0-9-_\.]/g, ""); // Allow only alphanumeric, dashes, underscores, and dots
};

// Safe path join function with path traversal validation
const safeJoinPath = (dir, file) => {
  const sanitizedFile = sanitizeFileName(file);
  const safeFile = path.basename(sanitizedFile); // Ensure we only get the file name

  // Convert base directory to an absolute path
  const absoluteDir = path.resolve(dir);

  // Join the directory and sanitized file name
  const resolvedPath = path.join(absoluteDir, safeFile);

  // Verify the resolved path starts with the absolute base directory
  if (!resolvedPath.startsWith(absoluteDir)) {
    throw new Error("Path traversal attempt detected");
  }

  return resolvedPath;
};

try {
  for (const pkg in PACKAGES) {
    const changesetEntries = {};
    const linodePackage = PACKAGES[pkg];
    const packageJsonFile = await readFile(
      packageJsonPath(linodePackage),
      "utf-8"
    );
    const parsedPackageJsonFile = JSON.parse(packageJsonFile);
    const currentSemver = parsedPackageJsonFile.version;

    try {
      const files = await new Promise((resolve, reject) => {
        fs.readdir(changesetDirectory(linodePackage), (err, files) => {
          if (err) {
            reject(err);
          } else {
            resolve(files);
          }
        });
      });

      if (files.length === 1) {
        logger.success({
          message: `No Changeset file(s) found for @linode/${linodePackage}. Skipping...`,
        });
      } else {
        const { releaseDate } = await inquirer.prompt([
          {
            type: "input",
            prefix: `📅 Release Date for ${chalk.red(
              `@linode/${linodePackage}`
            )}`,
            name: "releaseDate",
            message:
              "\nEnter the release date (YYYY-MM-DD), press enter to select today's date:",
            validate: (input) => {
              if (!input.match(/^\d{4}-\d{2}-\d{2}$/)) {
                return "Please enter a valid date in the format YYYY-MM-DD.";
              }
              return true;
            },
            default: today,
          },
        ]);

        try {
          files.forEach((file) => {
            if (file === "README.md") {
              return;
            }

            // Use the safeJoinPath function to prevent path traversal
            const filePath = safeJoinPath(
              changesetDirectory(linodePackage),
              file
            );
            const content = fs.readFileSync(filePath, "utf-8");
            const matches = content.match(
              new RegExp(`"@linode/${linodePackage}": ([^\n]+)`)
            );
            const changesetType = matches ? matches[1].trim() : "";

            if (!changesetEntries[changesetType]) {
              changesetEntries[changesetType] = [];
            }

            changesetEntries[changesetType].push({
              content,
              filePath,
            });
          });
        } catch (error) {
          logger.error({
            message: "Error occurred while parsing changeset files:",
            info: error,
          });
        }

        const changelogContent = initiateChangelogEntry(
          releaseDate,
          currentSemver
        );
        populateChangelogEntry(changesetEntries, changelogContent);

        try {
          const existingChangelogContent = fs.readFileSync(
            changelogPath(linodePackage),
            "utf-8"
          );

          const firstEntryIndex = existingChangelogContent.indexOf("## [");

          const updatedChangelogContent =
            firstEntryIndex === -1
              ? `${changelogContent.join("\n")}\n\n${existingChangelogContent}`
              : `${existingChangelogContent.slice(
                  0,
                  firstEntryIndex
                )}${changelogContent.join(
                  "\n"
                )}\n\n${existingChangelogContent.slice(firstEntryIndex)}`;

          fs.writeFileSync(
            changelogPath(linodePackage),
            updatedChangelogContent
          );

          logger.success({
            message: `🚀 Changelog for @linode/${linodePackage} generated successfully!`,
          });
        } catch (error) {
          logger.error({
            message: `Error occurred while generating the changelog for @linode/${linodePackage}.`,
            info: error,
          });
        }

        await deleteChangesets(linodePackage);
      }
    } catch (error) {
      logger.error({
        message: "Error reading one or more changeset directories",
        info: error,
      });
    }
  }
} catch (error) {
  logger.error({
    message: "Error: Could not read one or more of the package.json file!",
    info: error,
  });
}
