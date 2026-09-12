# 从梯田到鼓楼 · 黔东南旅行 PWA

这是 2026 国庆黔东南五天四夜自驾旅行的第一版手机 PWA 原型。

## 当前能力

- 总览：出发倒计时、酒店/车辆/高铁进度、硬节点提醒
- 行程：五天时间轴、路线段、地点和地图跳转
- 准备：三段高铁抢票任务、待办清单、租车信息
- 费用：本地记录支出，自动计算人均
- 共享：分享当前状态链接，三个人可以同步票务、待办和费用快照
- 离线：Service Worker 缓存核心页面
- AI：当前不接入，核心流程完全不依赖 AI

## 数据维护

旅行内容集中在 `trip-data.js`。买好高铁票后，优先更新：

- `ticketSales` 中的车次和实际时间
- 10 月 3 日到达从江后的取车衔接
- 10 月 6 日返程车次和酒店到车站的时间线

用户在页面上的勾选、票务状态和费用记录保存在当前设备的 `localStorage` 中。
点击右上角“分享行程”会生成带状态快照的链接；同行打开后会把这份快照写入自己的设备。它是“无账号、短期使用”的同步方案，不承诺多人实时同时编辑。

## 本地预览

在项目目录运行一个静态服务器，例如：

```powershell
python -m http.server 4173
```

然后打开 `http://localhost:4173/`。PWA 的离线缓存需要通过 `http://localhost` 或 HTTPS 访问，直接双击 HTML 文件不会注册 Service Worker。

## 开源借鉴记录

- [Koyingtw/Travel-App](https://github.com/Koyingtw/Travel-App)：参考行程时间轴、票券/住宿、预算、PWA 和多人使用思路；README 标示 MIT，但它的 FastAPI、MongoDB、Google Maps 后端对本次短期旅行过重，因此没有直接复制。
- [kohsin520/TravelApp](https://github.com/kohsin520/TravelApp)：参考“不需登录的分享行程”、PWA、天气和票券识别等产品想法；未发现明确许可证文件，不直接复制代码。
- [Roadbook Format](https://roadbookformat.org/)：参考“一个结构化旅行文件承载行程、交通、住宿、票券、旅客和 Plan B”的数据思想；其规范、Schema、验证器和示例页面标示 MIT，本项目仍使用自己的数据模型。

## 设计底线

AI 是可选的解释层。没有 AI、没有 API Key、没有网络时，核心旅行流程仍应完整可用。
