import * as fs from "fs";
import * as path from "path";

interface MarkdownInfo {
  text: string;
  link: string;
}

function scanDirectory(directoryPath: string): MarkdownInfo[] {
  const markdownFiles = fs
    .readdirSync(directoryPath)
    .filter((file) => file.endsWith(".md"));
  const markdownInfoArray: MarkdownInfo[] = [];

  markdownFiles.forEach((file) => {
    const filePath = path.join(directoryPath, file);
    const fileContent = fs.readFileSync(filePath, "utf-8");

    // Extract title from the Markdown file (assuming titles are specified with '#')
    const titleMatch = fileContent.match(/^#\s+(.*)/m);
    const title = titleMatch ? titleMatch[1] : "Untitled";

    // Create object with "text" and "link" properties
    const markdownInfo: MarkdownInfo = {
      text: title,
      link: `/development-guide/${file}`, // You can customize the link format as needed
    };

    markdownInfoArray.push(markdownInfo);
  });

  return markdownInfoArray;
}

// Example usage
const directoryPath = "./docs/development-guide";

export const guides = scanDirectory(directoryPath);
