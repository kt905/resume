# July — 前端开发工程师

一个单页作品集：开屏动画、3D 像素小人、滚动驱动的作品巡览。全部是原生 HTML / CSS / JS，没有构建步骤。

## 页面结构

| 区块 | 内容 |
| --- | --- |
| 开屏 | 多语问候语逐词切换，幕布上收，Hero 延迟升起（参考 dennissnellenberg.com） |
| 01 Hero | 姓名、简介、CTA，像素小人站在右下 |
| 02 About | 自我介绍、经历、技能标签，角落小人 |
| 03 Services | 能力卡片，角落小人 |
| 04 Work | 四个项目滚动巡览，每屏背景取该项目官网主色 |
| 05 Contact | 邮箱一键复制、社交链接，小人在场 |

## 细节

- **3D 像素小人**：Three.js 打包模块（`js/seb/`），在 5 个区块之间切换位置与动作，带 11 个互动动作按钮、眼镜与服装系统，支持拖拽。
- **作品巡览**：`.tour` 是 sticky 舞台 + 滚动进度切换；背景色由项目官网主色按比例混入纸色得到浅底，文字与次级文字颜色按对比度自动推导。
- **开屏锁滚动**：`history.scrollRestoration = 'manual'` + 滚动锁定，避免幕布拉起时页面自己滑走。
- **响应式**：桌面 12 栅格，移动端（< 48rem）4 栅格。

## 本地预览

页面用了 ES Module，需要静态服务器：

```bash
npx serve .
# 或
python -m http.server 8000
```

然后打开终端里提示的地址。

## 目录

```
index.html            页面结构与文案
css/style.css         设计系统与全部版式
css/seb-mascot.css    像素小人的气泡、徽章等外壳样式
js/main.js            开屏时间线、滚动揭示、导航、作品巡览、时钟
js/seb-boot.js        加载器收尾与 ScrollTrigger 刷新
js/seb/               GSAP、ScrollTrigger、像素小人的打包产物
assets/work/          四个项目的截图
assets/favicon.svg    站点图标
```

## 配色

| 变量 | 值 | 用途 |
| --- | --- | --- |
| `--accent` | `#2C9678` | 主色：按钮、标签、强调 |
| `--accent-strong` | `#1F6B56` | 浅底上的强调文字（对比度 6.1:1） |
| `--ink` | `#0b0c0b` | 墨色 |
| `--paper` | `#fbfbf8` | 纸色 |

第三屏的四个项目底色：

| 项目 | 品牌色 | 底色 |
| --- | --- | --- |
| 沃特塞恩 Wattsine | `#fe8401` | `#fcd5a9` |
| 跨越集团 KYC | `#db0507` | `#f1acab` |
| 普巴智能 Dorje | `#172a88` | `#b2b8d4` |
| 汉速科技 Hansu | `#19498d` | `#b3c2d6` |

底色由 `js/main.js` 里的 `BRAND_SHARE`（默认 `0.32`）控制，改小会更浅。

## 字体

Funnel Display、Space Grotesk、Noto Sans SC，通过 Google Fonts 引入。
