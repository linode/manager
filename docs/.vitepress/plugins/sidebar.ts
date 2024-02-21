import { readdirSync } from "fs";
import { join, resolve } from "path";

type LinkItem = { text: string; link: string }

type SidebarItem = {
  text: string;
  collapsed?: boolean;
  items: SidebarItem[] | LinkItem[]
} | LinkItem;

const DOCS_PATH = resolve(__dirname + '/../../');

const exclude = ["cache", "public", "PULL_REQUEST_TEMPLATE.md", ".vitepress"];

function isPathIgnored(path: string) {
  for (const item of exclude) {
    if (path.includes(item)) {
      return true;
    }
  }
  return false;
}

const walk = (dir: string) => {
  const files = readdirSync(dir, { withFileTypes: true });

  const sidebar: SidebarItem[] = [];

  for (const file of files) {
    const filepath = join(dir, file.name);

    if (isPathIgnored(filepath)) {
      continue;
    }

    if (file.isDirectory()) {
      sidebar.push({ text: file.name, collapsed: false, items: walk(filepath) });
    } else {
      sidebar.push({ text: file.name, link: filepath.split(DOCS_PATH)[1] });
    }
  }

  return sidebar;
}

export function getSidebar() {
  const files = walk(DOCS_PATH)
  console.log(files)
  return files;
}
