import { readdir } from "fs/promises";
import { join, resolve } from "path";

type LinkItem = { text: string; link: string }

type SidebarItem = {
  text: string;
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

const walk = async (dir: string) => {
  const files = await readdir(dir, { withFileTypes: true });

  const sidebar: SidebarItem[] = [];

  for (const file of files) {
    const filepath = join(dir, file.name);

    if (isPathIgnored(filepath)) {
      continue;
    }

    if (file.isDirectory()) {
      sidebar.push({ text: file.name, items: await walk(filepath) });
    } else {
      sidebar.push({ text: file.name, link: filepath.split(DOCS_PATH)[1] });
    }
  }

  return sidebar;
}

export async function getSidebar(): Promise<SidebarItem[]> {
  const files = await walk(DOCS_PATH)
  console.log(files)
  return files;
}
