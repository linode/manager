import { readdir } from "fs/promises";
import { join, resolve } from "path";

type Item = { text: string; link: string }

type Sidebar = {
  text: string;
  items: Sidebar[] | Item[]
} | Item;

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

const walk = async (dir: string, sidebar: Sidebar[] = []) => {
  const files = await readdir(dir, { withFileTypes: true });

  for (const file of files) {
    const filepath = join(dir, file.name);

    if (isPathIgnored(filepath)) {
      continue;
    }

    if (file.isDirectory()) {
      const items = await walk(filepath, sidebar)
      sidebar.push({ text: file.name, items });
    } else {
      sidebar = [...sidebar, { text: file.name, link: filepath.split(DOCS_PATH)[1] }];
    }
  }

  return sidebar;
}

export async function getSidebar(): Promise<Sidebar[]> {
  const files = await walk(DOCS_PATH)
  console.log(files)
  return files;
}
