import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: "docs",
  
  title: "昼お茶的个人小站",
  description: "A VitePress Site",
  lastUpdated: true,
  lang: 'zh_CN',
  cleanUrls: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    i18nRouting: false,

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    nav: [
      { text: '主页', link: '/' },
      { text: 'Linux', link: '/linux/arch-linux-安装' }
    ],

    sidebar: {
      '/linux/': [
        {
          text: 'Linux',
          items: [
            { text: 'Arch Linux 安装', link: '/linux/arch-linux-安装' },
            { text: '为 Arch Linux 启用安全启动', link: '/linux/为-arch-linux-启用安全启动' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'codeberg', link: 'https://codeberg.org/hiruocha'},
      { icon: 'github', link: 'https://github.com/hiruocha' },
      { icon: 'bilibili', link: 'https://space.bilibili.com/687234999' }
    ],

    footer: {
      copyright: 'Copyright © 2025-现在 昼お茶 除特别说明外 均采用 <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.zh-hans" target="_blank">CC BY-SA 4.0</a> 许可<br>文中代码块部分采用 <a href= "https://github.com/hiruocha/hiruocha.github.io/blob/main/LICENSE" target="_blank">MIT</a> 许可'
    },

    outline: "deep",

    lastUpdatedText: "最后更新",

    lightModeSwitchTitle: "浅色模式",

    darkModeSwitchTitle: "深色模式",

    outlineTitle: "此页面"
  }
})
