import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "昼お茶的个人小站",
  description: "A VitePress Site",
  lastUpdated: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '主页', link: '/' },
      { text: '标签', link: '/tags' }
    ],

    sidebar: [
      {
        text: 'Arch Linux',
        items: [
          { text: 'Arch Linux 全盘加密安装', link: '/2025/07/04/arch-install' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/hiruocha' },
      { icon: 'bilibili', link: 'https://space.bilibili.com/687234999' }
    ],
    footer: {
      copyright: 'Copyright © 2025-现在 昼お茶 采用 <a href="https://creativecommons.org/licenses/by/4.0/deed.zh-hans" target="_blank">CC BY 4.0</a> 许可<br>文中代码块部分采用 <a href= "https://github.com/hiruocha/hiruocha.github.io/blob/main/LICENSE" target="_blank">MIT</a> 许可'
    }
  }
})
