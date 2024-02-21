import { readdirSync } from "fs";
import { join, resolve } from "path";

type LinkItem = { text: string; link: string }

type SidebarItem = {
  text: string;
  collapsed?: boolean;
  items: SidebarItem[] | LinkItem[]
} | LinkItem;

const DOCS_PATH = resolve(__dirname + '/../../');

const exclude = ["cache", "public", "PULL_REQUEST_TEMPLATE.md", ".vitepress", "index.md"];

const replacements = [
  ['-', ' '],
  ['_', ' '],
  ['.md', ''],
];

function isPathIgnored(path: string) {
  for (const item of exclude) {
    if (path.includes(item)) {
      return true;
    }
  }
  return false;
}

function formatSidebarItemText(fileName: string) {
  for (const [from, to] of replacements) {
    fileName = fileName.replaceAll(from, to);
  }
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
      sidebar.push({ text: formatSidebarItemText(file.name), collapsed: false, items: generateSidebar(filepath) });
    } else {
      sidebar.push({ text: formatSidebarItemText(file.name), link: filepath.split(DOCS_PATH)[1] });
    }
  }

  return sidebar;
}
