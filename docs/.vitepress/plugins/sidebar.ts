import * as fs from "fs";
import * as path from "path";

const DEVELOPMENT_GUIDE_PATH = "./docs/development-guide";

interface MarkdownInfo {
  text: string;
  link: string;
}

/**
 * Aggregates the pages in the development-guide and populates the left sidebar.
 */
const scanDirectory = (directoryPath: string): MarkdownInfo[] => {
  const markdownFiles = fs
    .readdirSync(directoryPath)
    .filter((file) => file.endsWith(".md"));
  const markdownInfoArray: MarkdownInfo[] = [];

  markdownFiles.forEach((file) => {
    const filePath = path.join(directoryPath, file);
    const fileContent = fs.readFileSync(filePath, "utf-8");

    const titleMatch = fileContent.match(/^#\s+(.*)/m);
    const title = titleMatch ? titleMatch[1] : "Untitled";

    const markdownInfo: MarkdownInfo = {
      text: title,
      link: `/development-guide/${file}`,
    };

    markdownInfoArray.push(markdownInfo);
  });

  return markdownInfoArray;
};

export const guides = scanDirectory(DEVELOPMENT_GUIDE_PATH);
