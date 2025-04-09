import fs from "fs";
import inquirer from "inquirer";
import chalk from "chalk";
import path from "path";
import { deleteChangesets } from "./utils/deleteChangesets.mjs";
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

const today = new Date().toISOString().slice(0, 10);

try {
  for (const pkg in PACKAGES) {
    const changesetEntries = {};
    const linodePackage = PACKAGES[pkg];
    const packageJsonFile = await readFile(
      packageJsonPath(linodePackage),
      "utf-8"
    );
    // Parse the package.json file
    const parsedPackageJsonFile = JSON.parse(packageJsonFile);
    // Get the current version from package.json
    const currentSemver = parsedPackageJsonFile.version;

    try {
      // Check if there are any changeset files in the .changeset directories
      const files = await new Promise((resolve, reject) => {
        fs.readdir(changesetDirectory(linodePackage), (err, files) => {
          if (err) {
            reject(err);
          } else {
            resolve(files);
          }
        });
      });

      // If only README.md in there, no changeset(s)
      if (files.length === 1) {
        logger.success({
          message: `No Changeset file(s) found for @linode/${linodePackage}. Skipping...`,
        });
      } else {
        /**
         * Prompt the user for the release date and the type of version bump.
         */
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
            // Skipping the README file
            if (file === "README.md") {
              return;
            }

            // Logic to parse the changeset file and generate the changelog content
            const filePath = path.join(changesetDirectory(linodePackage), file);
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

        const changelogContent = initiateChangelogEntry(releaseDate, currentSemver);
        // Generate the final changelog content
        populateChangelogEntry(changesetEntries, changelogContent);

        try {
          // Read the existing changelog content
          const existingChangelogContent = fs.readFileSync(
            changelogPath(linodePackage),
            "utf-8"
          );

          // Find the index of the first entry
          const firstEntryIndex = existingChangelogContent.indexOf("## [");

          // Prepare the updated changelog content
          const updatedChangelogContent =
            firstEntryIndex === -1
              ? `${changelogContent.join("\n")}\n\n${existingChangelogContent}`
              : `${existingChangelogContent.slice(
                  0,
                  firstEntryIndex
                )}${changelogContent.join(
                  "\n"
                )}\n\n${existingChangelogContent.slice(firstEntryIndex)}`;

          // Write the updated changelog content
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

        // Delete the changeset files for each package
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
