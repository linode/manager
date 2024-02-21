import { readdirSync } from "fs";
import { join } from "path";
import { DOCS_SRC_DIR } from "../config";

type LinkItem = { text: string; link: string };

type SidebarItem =
  | {
      text: string;
      collapsed?: boolean;
      items: SidebarItem[] | LinkItem[];
    }
  | LinkItem;

const exclude = [
  "cache",
  "public",
  "PULL_REQUEST_TEMPLATE.md",
  ".vitepress",
  "index.md",
];

const replacements = [
  ["-", " "],
  ["_", " "],
  [".md", ""],
];

function isPathIgnored(path: string) {
  for (const item of exclude) {
    if (path.includes(item)) {
      return true;
    }
  }
  return false;
}

function capitalize(s: string) {
  return (
    s.substring(0, 1).toUpperCase() + s.substring(1, s.length).toLowerCase()
  );
}

function formatSidebarItemText(fileName: string) {
  // removes -, _, and .md from files names to generate the title
  for (const [from, to] of replacements) {
    fileName = fileName.replaceAll(from, to);
  }
  // Removes any number prefix. This allows us to order things by putting numbers in file names.
  fileName = fileName.replace(/^[0-9]*/, "");
  // Capitalizes each word in the file name
  fileName = fileName.split(" ").map(capitalize).join(" ");
  return fileName;
}

export function generateSidebar(dir: string) {
  const files = readdirSync(dir, { withFileTypes: true });

  const sidebar: SidebarItem[] = [];

  for (const file of files) {
    const filepath = join(dir, file.name);

    if (isPathIgnored(filepath)) {
      continue;
    }

    if (file.isDirectory()) {
      sidebar.push({
        text: formatSidebarItemText(file.name),
        collapsed: false,
        items: generateSidebar(filepath),
      });
    } else {
      sidebar.push({
        text: formatSidebarItemText(file.name),
        link: filepath.split(DOCS_SRC_DIR)[1],
      });
    }
  }

  return sidebar;
}
