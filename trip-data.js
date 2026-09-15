import { tripGuide } from "./trip-guide.js?v=42";

export const trip = {
  id: "qdn-2026-national-day",
  title: "从梯田到鼓楼",
  subtitle: "五天四夜 · 梯田、侗寨与苗寨",
  start: "2026-10-02",
  end: "2026-10-06",
  travelers: 3,
  drivers: 2,
  currentUserDrives: false,
  members: [
    { id: "driver-a", label: "司机 A", role: "主驾" },
    { id: "driver-b", label: "司机 B", role: "副驾" },
    { id: "member-c", label: "同行 C", role: "领队 / 乘客" }
  ],
  preferences: {
    outboundStation: "广州南优先，附近车站可备选",
    seat: "三人优先连座；二等座、无座均可接受",
    returnWindow: "10/6 16:00—17:00 左右",
    appUsage: "三人共同使用"
  },
  dataSources: [
    { type: "已确认", title: "酒店与租车订单", detail: "来自你提供的订单截图、租车截图和文字确认；四晚酒店、车型、价格和取还车时间以此为准。" },
    { type: "已整理", title: "路线执行资料", detail: "来自你提供的《新建 文本文档.txt》，已拆成每日主题、节奏、重点、食物、特产和地点角色。" },
    { type: "已整理", title: "路线地图点位", detail: "用于路线总览的点位来自 OpenStreetMap 与高德地图搜索结果；它们不是实时道路轨迹，实际入口和耗时仍以当天导航为准。" },
    { type: "待核验", title: "临时变化信息", detail: "车次、天气、路况、活动场次、餐馆营业、停车和酒店当天安排，出发前及当天再次确认。" }
  ],
  status: {
    hotels: { done: 4, total: 4, label: "酒店" },
    vehicle: { done: 1, total: 1, label: "车辆" },
    trains: { done: 0, total: 3, label: "高铁" }
  },
  ticketSales: [
    { id: "train-outbound", date: "2026-10-02", saleDate: "2026-09-18", from: "广州（广州南优先）", to: "三江南", window: "上午出发", priority: "高", status: "待抢票", note: "三人优先连座；二等座、无座均可接受" },
    { id: "train-transfer", date: "2026-10-03", saleDate: "2026-09-19", from: "三江南", to: "从江", window: "上午出发，建议 09:30 前到达", priority: "最高", status: "待抢票", note: "10:30 到店取车，必须保留出站和接驳缓冲" },
    { id: "train-return", date: "2026-10-06", saleDate: "2026-09-22", from: "从江", to: "广州（附近车站可备选）", window: "16:00—17:00 左右", priority: "高", status: "待抢票", note: "上午逛鼓楼、买特产后返程" }
  ],
  vehicle: {
    status: "已下单确认",
    store: "从江高铁站店",
    pickup: "2026-10-03T10:30:00+08:00",
    dropoff: "2026-10-05T20:00:00+08:00",
    location: "贵州省黔东南苗族侗族自治州从江县，从江大道与 242 国道交叉口东北约 420 米",
    model: "Jeep 指南者 2017 款",
    specs: "SUV · 1.4T · 5 座 · 自动 · 汽油 · 92 号 · 两驱",
    price: 615,
    coverage: "基础保障：车损自付约 ¥1500；三者险 ¥100 万；¥40/天已含",
    note: "两位司机轮换；用户本人不驾驶。",
    mapQuery: "从江县从江大道与242国道交叉口"
  },
  stays: [
    { date: "10/2", city: "三江", name: "三江农情酒店", room: "五楼观景家庭房", nights: 1, price: 174, status: "已确认", query: "三江农情酒店", document: "已确认", note: "入住 10/2，退房 10/3；3 人可住" },
    { date: "10/3", city: "加榜", name: "加榜梯田农家客栈", room: "牛耕·传统吊脚楼阳台观景三床房", nights: 1, price: 153, status: "已确认", query: "加榜梯田农家客栈", document: "已确认", note: "入住 10/3，退房 10/4；提前确认进村和停车" },
    { date: "10/4", city: "黎平", name: "黎平星辰电竞酒店", room: "5060-32G 四人开黑房", nights: 1, price: 173, status: "已确认", query: "黎平星辰电竞酒店", document: "已确认", note: "入住 10/4，退房 10/5；停车情况出发前确认" },
    { date: "10/5", city: "从江", name: "神瑶天域大酒店（从江县政府店）", room: "瑶韵·江景双床房", nights: 1, price: 187, status: "已确认", query: "神瑶天域大酒店 从江县政府店", document: "已确认", note: "入住 10/5，退房 10/6；还车后入住" }
  ],
  places: {
    chengyang: { name: "程阳八寨", city: "三江", query: "程阳八寨游客中心", tag: "侗寨", access: "永济桥、岩寨、马鞍寨和平寨适合按体力步行", tip: "侗歌、多耶、篝火属于动态活动，出发前核验" },
    chengyangHotel: { name: "三江农情酒店", city: "三江", query: "三江农情酒店", tag: "岩寨住宿", access: "酒店在岩寨中心；三江南站约 18.4 公里，约 29—30 分钟", tip: "先到酒店放行李，再步行进入程阳，不必折返县城" },
    jiabang: { name: "加榜梯田", city: "从江", query: "加榜梯田观景台", tag: "晨景 / 日落", access: "加车村、党扭村和观景台分散，山路预留缓冲", tip: "重点安排清晨和傍晚；客栈进村及停车方式提前确认" },
    jiabangHotel: { name: "加榜梯田农家客栈", city: "从江", query: "加榜梯田农家客栈", tag: "住宿", access: "党扭村七组；靠近 1 号观景台约 200 米量级", tip: "进村、停车和晚餐方式出发前确认" },
    qiaojie: { name: "黎平翘街", city: "黎平", query: "黎平翘街", tag: "古城", access: "翘街附近停车后步行慢逛", tip: "黎平会议旧址作为可选项目" },
    lipingHotel: { name: "黎平星辰电竞酒店", city: "黎平", query: "黎平星辰电竞酒店", tag: "住宿", access: "翘街游玩后入住；酒店订单已确认", tip: "停车情况出发前确认" },
    huanggang: { name: "黄岗侗寨", city: "黎平", query: "黄岗侗寨村口停车点", tag: "原生态侗寨", access: "导航至村口停车点，再步行进入", tip: "不要停留太短，侗歌和村寨状态以现场为准" },
    basha: { name: "岜沙苗寨", city: "从江", query: "岜沙苗寨游客中心", tag: "苗族文化", access: "游客中心作为进入点，安排白天体验", tip: "镰刀剃头等体验项目以现场安排为准" },
    returnPoint: { name: "租车还车点", city: "从江", query: "从江大道与242国道交叉口", tag: "20:00 前", access: "从岜沙约 10 公里以内，约 15—20 分钟", tip: "目标 19:30 前到店，留出验车和手续时间" },
    hotelCongjiang: { name: "神瑶天域大酒店", city: "从江", query: "神瑶天域大酒店 从江县政府店", tag: "住宿", access: "还车后回从江县城入住", tip: "酒店订单和停车情况出发前保存到手机" }
  },
  alternatives: {
    "day-2": [
      { condition: "高铁晚点或出站耗时较长", title: "先保住取车，再压缩加榜", detail: "10:30 取车优先；午餐简化，直接前往加榜，取消不必要的村寨绕行。", keep: "取车 · 加榜日落", drop: "低优先级停留" },
      { condition: "无法在 10:30 前到从江", title: "不要冒险赶租车", detail: "先联系租车门店确认保留订单，再根据实际到达时间决定是否改为县城短停。", keep: "订单沟通 · 安全到达", drop: "强行赶山路" }
    ],
    "day-4": [
      { condition: "10:00 后才从黎平出发", title: "保留黄岗，缩短岜沙", detail: "黄岗是今天的人文重点；控制黄岗停留和午餐时间，岜沙只安排核心体验，预留还车缓冲。", keep: "黄岗 · 20:00 还车", drop: "岜沙非核心项目" },
      { condition: "15:30 后仍未离开黄岗", title: "直接前往岜沙或放弃岜沙", detail: "根据高德实时路况决定；如果无法留出至少 30 分钟还车缓冲，优先安全回从江县城。", keep: "还车安全", drop: "赶景点"
      }
    ]
  },
  days: [
    {
      id: "day-1", date: "10/2", weekday: "周五", city: "三江", title: "第一次进入侗乡", mood: "从高铁到木楼群",
      routeInfo: { distance: "高铁 + 约 20 公里接驳", travel: "约 30 分钟", buffer: "到站后预留接驳缓冲", focus: "下午进入程阳八寨" },
      mapPoints: [
        { label: "广州南站", lat: 22.99141, lon: 113.26404, detail: "出发 · 高铁", source: "OpenStreetMap" },
        { label: "三江南站", lat: 25.7287, lon: 109.57157, detail: "到站 · 接驳", source: "OpenStreetMap" },
        { label: "程阳八寨", lat: 25.887106, lon: 109.630724, detail: "下午游玩", source: "OpenStreetMap" },
        { label: "程阳八寨内部", lat: 25.8866, lon: 109.6322, detail: "步行 · 永济桥 / 鼓楼 / 木楼群", source: "路线执行资料", approximate: true }
      ],
      segmentModes: [
        { mode: "rail", label: "高铁", detail: "三人优先连座；二等座、无座均可接受" },
        { mode: "drive", label: "接驳 / 打车", detail: "三江南站 → 三江农情酒店 / 程阳八寨" },
        { mode: "walk", label: "景区步行", detail: "进入程阳后按永济桥、鼓楼、木楼群顺序走" }
      ],
      risk: "中", items: [
        { time: "上午", type: "train", title: "广州 → 三江南", detail: "高铁待抢 · 广州南优先", ticketId: "train-outbound" },
         { time: "到站后", type: "transfer", title: "三江南 → 三江农情酒店", detail: "约 18.4 公里 · 约 29—30 分钟 · 无车接驳", placeId: "chengyangHotel" },
        { time: "下午", type: "spot", title: "程阳八寨", detail: "永济桥、鼓楼、木楼群", placeId: "chengyang" },
        { time: "晚上", type: "culture", title: "侗歌 / 多耶舞 / 篝火", detail: "活动情况出发前再次确认" },
        { time: "住宿", type: "hotel", title: "三江农情酒店", detail: "五楼观景家庭房 · 1 晚" }
      ]
    },
    {
      id: "day-2", date: "10/3", weekday: "周六", city: "从江", title: "去赶一场梯田日落", mood: "今天有一个硬时间点",
      routeInfo: { distance: "约 80 公里山路", travel: "取车后按山路节奏", buffer: "10:30 取车不能迟", focus: "下午和日落看加榜" },
      mapPoints: [
        { label: "三江南站", lat: 25.7287, lon: 109.57157, detail: "上午 · 高铁换乘", source: "OpenStreetMap" },
        { label: "从江站", lat: 25.912155, lon: 109.110283, detail: "10:30 · 取车", source: "OpenStreetMap" },
        { label: "加榜梯田", lat: 25.60004, lon: 108.58683, detail: "下午 / 日落", source: "OpenStreetMap" }
      ],
      segmentModes: [
        { mode: "rail", label: "高铁", detail: "上午到达从江，给出站和取车留缓冲" },
        { mode: "drive", label: "驾车", detail: "取车后前往加榜，山路按实时导航行驶" }
      ],
      risk: "高", items: [
        { time: "上午", type: "train", title: "三江南 → 从江", detail: "高铁待抢 · 目标 09:30 前到达", ticketId: "train-transfer" },
        { time: "10:30", type: "car", title: "从江高铁站店取车", detail: "Jeep 指南者 · 自动挡 · 两位司机" },
        { time: "取车后", type: "drive", title: "从江 → 加榜梯田", detail: "约 80 公里 · 山路预留缓冲", placeId: "jiabang" },
        { time: "下午 / 傍晚", type: "spot", title: "加车村、党扭村、观景台", detail: "把重点放在下午光线和日落", placeId: "jiabang" },
        { time: "住宿", type: "hotel", title: "加榜梯田农家客栈", detail: "牛耕·传统吊脚楼阳台观景三床房 · 1 晚" }
      ]
    },
    {
      id: "day-3", date: "10/4", weekday: "周日", city: "黎平", title: "从晨雾走到古城", mood: "早起是今天的主菜",
       routeInfo: { distance: "约 3 小时山路 + 国庆缓冲", travel: "13:30 出发，16:30—17:00 抵达黎平", buffer: "晨景结束后直接出发", focus: "下午慢逛翘街" },
      mapPoints: [
        { label: "加榜梯田", lat: 25.60004, lon: 108.58683, detail: "清晨 · 晨景", source: "OpenStreetMap" },
        { label: "黎平翘街", lat: 26.235524, lon: 109.130757, detail: "下午 · 古城慢逛", source: "OpenStreetMap" }
      ],
      segmentModes: [
        { mode: "drive", label: "驾车", detail: "加榜 → 黎平，约 140 公里，按山路节奏行驶" }
      ],
      risk: "中高", items: [
        { time: "06:30—09:30", type: "spot", title: "加榜梯田晨景", detail: "晨雾、梯田和村寨层次", placeId: "jiabang" },
        { time: "上午", type: "drive", title: "加榜 → 黎平", detail: "约 140 公里 · 途中按山路节奏行驶", placeId: "qiaojie" },
        { time: "下午", type: "spot", title: "黎平翘街", detail: "古街慢逛；会议旧址作为可选项", placeId: "qiaojie" },
        { time: "晚上", type: "food", title: "黎平腌鱼 / 酸汤", detail: "晚餐候选" },
        { time: "住宿", type: "hotel", title: "黎平星辰电竞酒店", detail: "5060-32G 四人开黑房 · 1 晚" }
      ]
    },
    {
      id: "day-4", date: "10/5", weekday: "周一", city: "从江", title: "深入黄岗，傍晚回到县城", mood: "前半段控制节奏，后半段从容收尾",
       routeInfo: { distance: "两段山路 + 国庆机动", travel: "黄岗→岜沙约 1.5—2 小时机动", buffer: "20:00 还车前留出至少 30 分钟", focus: "黄岗不要停太短，岜沙安排白天" },
      mapPoints: [
        { label: "黎平", lat: 26.235524, lon: 109.130757, detail: "早晨 · 出发", source: "OpenStreetMap" },
        { label: "黄岗侗寨", lat: 25.917033, lon: 108.97755, detail: "上午 / 中午 · 人文重点", source: "高德地图搜索结果", approximate: true },
        { label: "岜沙苗寨", lat: 25.722874, lon: 108.865698, detail: "下午 · 白天体验", source: "OpenStreetMap", approximate: true },
        { label: "从江县城 / 还车点", lat: 25.77525, lon: 108.92331, detail: "20:00 前 · 还车后入住", source: "OpenStreetMap", approximate: true }
      ],
      segmentModes: [
        { mode: "drive", label: "驾车", detail: "黎平 → 黄岗，早出发并按实时路况调整" },
        { mode: "drive", label: "驾车", detail: "黄岗 → 岜沙，保留至少 30 分钟还车缓冲" },
        { mode: "drive", label: "驾车", detail: "岜沙 → 从江县城 / 还车点，目标 19:30 前到店" }
      ],
      risk: "高", items: [
        { time: "上午", type: "drive", title: "黎平 → 黄岗侗寨", detail: "按实时导航估算 · 早出发，今天的主要时间风险", placeId: "huanggang" },
        { time: "上午 / 中午", type: "culture", title: "黄岗侗寨", detail: "鼓楼、原生态生活、侗歌；不要停留太短", placeId: "huanggang" },
        { time: "下午", type: "drive", title: "黄岗 → 岜沙苗寨", detail: "约 1.5—2 小时机动 · 安排白天体验", placeId: "basha" },
        { time: "傍晚", type: "spot", title: "岜沙苗寨", detail: "苗族服饰、镰刀剃头、古树文化", placeId: "basha" },
        { time: "20:00 前", type: "deadline", title: "岜沙 → 还车点", detail: "约 10 公里以内 · 约 15—20 分钟", placeId: "returnPoint" },
        { time: "晚上", type: "hotel", title: "神瑶天域大酒店", detail: "从江县政府店 · 1 晚", placeId: "hotelCongjiang" }
      ]
    },
    {
      id: "day-5", date: "10/6", weekday: "周二", city: "从江 → 广州", title: "在鼓楼边慢下来", mood: "上午留给从江，下午返程",
      routeInfo: { distance: "县城短距离", travel: "上午慢逛", buffer: "下午提前到站", focus: "鼓楼、特产、返程" },
      mapPoints: [
        { label: "从江县城", lat: 25.77525, lon: 108.92331, detail: "上午 · 鼓楼 / 特产", source: "OpenStreetMap", approximate: true },
        { label: "从江站", lat: 25.912155, lon: 109.110283, detail: "下午 · 返程高铁", source: "OpenStreetMap" },
        { label: "广州南站", lat: 22.99141, lon: 113.26404, detail: "抵达 · 广州", source: "OpenStreetMap" }
      ],
      segmentModes: [
        { mode: "drive", label: "驾车 / 接驳", detail: "从江县城 → 从江站，提前到站" },
        { mode: "rail", label: "高铁", detail: "目标 16:00—17:00 左右返程" }
      ],
      risk: "中", items: [
        { time: "上午", type: "spot", title: "从江鼓楼 / 买特产", detail: "不再安排远距离景点" },
        { time: "下午", type: "train", title: "从江 → 广州", detail: "目标 16:00—17:00 左右 · 高铁待抢", ticketId: "train-return" }
      ]
    }
  ],
  initialTasks: [
    { id: "task-1", label: "设置 10/2 广州 → 三江南开票提醒（9/18）", done: false, group: "票务" },
    { id: "task-2", label: "设置 10/3 三江南 → 从江开票提醒（9/19）", done: false, group: "票务" },
    { id: "task-3", label: "设置 10/6 从江 → 广州开票提醒（9/22）", done: false, group: "票务" },
    { id: "task-4", label: "准备三人乘车人信息和候补方案", done: false, group: "票务" },
    { id: "task-5", label: "出发前确认程阳八寨侗歌、多耶、篝火活动", done: false, group: "行程" },
    { id: "task-6", label: "出发前确认加榜客栈进村和停车方式", done: false, group: "行程" },
    { id: "task-7", label: "确认租车订单、基础保障和取还车凭证", done: true, group: "车辆" },
    { id: "task-8", label: "准备充电宝、雨具、薄外套和防滑鞋", done: false, group: "行李" },
    { id: "task-9", label: "准备现金/移动支付备用方案", done: false, group: "行李" },
    { id: "task-10", label: "给两位司机排好轮换顺序", done: false, group: "车辆" },
    { id: "task-11", label: "把酒店和租车订单截图保存到手机", done: false, group: "资料" },
    { id: "task-12", label: "出发前保存关键地点离线截图", done: false, group: "资料" }
  ],
  initialExpenses: [
    { id: "expense-hotel", title: "4 晚酒店", amount: 687, category: "住宿", paidBy: "未分配" },
    { id: "expense-car", title: "租车", amount: 615, category: "交通", paidBy: "未分配" }
  ],
  sources: [
    { label: "从江县人民政府 · 岜沙资料", url: "https://www.congjiang.gov.cn/zjcj/cjly/cjjd/202203/t20220329_80455165.html" },
    { label: "铁路 12306 · 购票与起售时间", url: "https://www.12306.cn/index/" },
    { label: "OpenStreetMap · 路线点位与底图", url: "https://www.openstreetmap.org/" }
  ],
  guide: tripGuide
};
