# 从梯田到鼓楼 · 黔东南旅行 PWA

这是 2026 国庆黔东南五天四夜自驾旅行的短期手机 PWA 控制台。

## Android APK

项目同时提供 Capacitor Android 打包配置。提交到 GitHub 后，Actions 会自动构建一个可直接安装到小米等 Android 手机的 debug APK；打开仓库的 Actions，进入 `Build Android APK`，在运行记录底部下载 `qdn-trip-android-debug` artifact。

## 当前能力

- 总览：出发倒计时、当前阶段/下一步、旅行中自动跟随当天未完成节点、紧凑准备概览、硬节点提醒
- 行程：五天时间轴、按天切换、路线摘要、路线地图、分段导航、同行打卡和当天记录
- 准备：三段高铁抢票任务、12306 拉起/网页回退、实际车次录入、待办清单、酒店地图和租车信息
- 费用：本地记录支出、逐笔设置垫付人、自动计算人均和建议结算
- 工具箱：12306、高德地图、天气查询、同行状态分享、地点与订单资料
- 共享：分享当前状态链接，三个人可以同步票务、待办、打卡和费用快照
- 记录：每天可保存最多 3 张压缩照片、一个心情和一段备注；照片只保存在当前设备，不进入分享链接
- 离线：Service Worker 缓存核心页面
- AI：当前不接入，核心流程完全不依赖 AI；后续只作为可选解释层

## 数据维护

旅行内容集中在根目录 `trip-data.js`。买好高铁票后，优先更新：

- 页面“准备”中的实际车次、出发和到达时间
- `ticketSales` 中的开票时间、购票条件和备注
- 10 月 3 日到达从江后的取车衔接
- 10 月 6 日返程车次和酒店到车站的时间线

用户在页面上的勾选、票务状态、实际车次、打卡和费用记录保存在当前设备的 `localStorage` 中。
点击右上角“分享行程”会生成带状态快照的链接；同行打开后会把这份快照写入自己的设备。它是“无账号、短期使用”的同步方案，不承诺多人实时同时编辑。

## 代码架构

项目采用不依赖构建工具的标准 ES Module 分层，保证 GitHub Pages、静态服务器和离线缓存都能直接工作：

```text
app.js                 应用启动、路由编排、全局动作
trip-data.js           固定旅行事实与可维护内容
trip-guide.js          真实资料提炼后的执行手册数据
src/state.js           本地状态、分享快照、持久化
src/selectors.js       日期阶段、票务统计、费用结算等业务查询
src/format.js          HTML 转义、金额、日期、状态徽章
src/weather.js         天气 API 适配与请求结果标准化
src/map.js             路线地图加载、点位和连线
src/events.js          全局事件代理，只绑定一次
src/views/             页面视图
  overview.js          总览
  route.js             行程
  prep.js              准备
  expenses.js          费用
  tools.js             工具
```

新增功能时遵循：固定内容放 `trip-data.js` / `trip-guide.js`，业务判断放 `selectors.js`，外部 API 放 `src/` 服务模块，页面 HTML 放对应 `src/views/`，用户操作统一接入 `events.js`。页面模块不直接读写 `localStorage`，也不直接发起天气请求。

真实资料的呈现方式：总览页只显示当天的“关键判断”；行程页选择某一天后，显示该日的主题、执行节奏、重点、吃什么、可以买什么、资料事实、不要这样排和出发前核验项。天气、活动场次、路况、餐馆、营业时间等变化信息保持“待核验”语义，不写成确定承诺。

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
