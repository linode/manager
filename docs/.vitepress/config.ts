import { guides } from "./plugins/sidebar";

export default {
  title: "Cloud Manager Docs",
  description: "Akamai Cloud Manger Documentation",
  srcDir: "./",
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
    sidebar: [
      {
        text: "Development Guide",
        items: guides,
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/linode/manager" },
    ],
  },
  head: [["link", { rel: "icon", href: "/manager/favicon.ico" }]],
};
