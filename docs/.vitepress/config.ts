import { generateSidebar } from "./plugins/sidebar";

const DOCS_SRC_DIR = new URL('./../', import.meta.url).pathname;

export default {
  title: "Cloud Manager Docs",
  description: "Akamai Cloud Manger Documentation",
  srcDir: DOCS_SRC_DIR,
  base: "/manager/",
  themeConfig: {
    logo: "/akamai-wave.svg",
    nav: [
      { text: "Home", link: "/" },
      { text: "Getting Started", link: "/GETTING_STARTED" },
      { text: "Contributing", link: "/CONTRIBUTING" },
    ],
    search: {
      provider: "local",
    },
    sidebar: generateSidebar(DOCS_SRC_DIR),
    socialLinks: [
      { icon: "github", link: "https://github.com/linode/manager" },
    ],
  },
  head: [["link", { rel: "icon", href: "/manager/favicon.ico" }]],
};
