import { defineConfig } from 'vitepress'
import { generateSidebar } from 'vitepress-sidebar';

export default defineConfig({
  title: "Cloud Manager Docs",
  description: "Linode Cloud Manger Documentation",
  srcDir: '../../docs',
  base: '/manager/',
  themeConfig: {
    logo: 'akamai-wave.svg',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting_started' }
    ],
    search: {
      provider: 'local'
    },
    sidebar: generateSidebar({
      documentRootPath: '../../docs',
      hyphenToSpace: true,
      underscoreToSpace: true,
      capitalizeEachWords: true,
      excludeFiles: ['PULL_REQUEST_TEMPLATE.md'],
    }),
    socialLinks: [
      { icon: 'github', link: 'https://github.com/linode/manager' }
    ]
  }
})
