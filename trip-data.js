export const trip = {
  id: "qdn-2026-national-day",
  title: "从梯田到鼓楼",
  subtitle: "五天四夜 · 梯田、侗寨与苗寨",
  start: "2026-10-02",
  end: "2026-10-06",
  travelers: 3,
  drivers: 2,
  currentUserDrives: false,
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
    note: "两位司机轮换；用户本人不驾驶。"
  },
  stays: [
    { date: "10/2", city: "三江", name: "三江农情酒店", room: "五楼观景家庭房", nights: 1, price: 174, status: "已确认" },
    { date: "10/3", city: "加榜", name: "加榜梯田农家客栈", room: "牛耕·传统吊脚楼阳台观景三床房", nights: 1, price: 153, status: "已确认" },
    { date: "10/4", city: "黎平", name: "黎平星辰电竞酒店", room: "5060-32G 四人开黑房", nights: 1, price: 173, status: "已确认" },
    { date: "10/5", city: "从江", name: "神瑶天域大酒店（从江县政府店）", room: "瑶韵·江景双床房", nights: 1, price: 187, status: "已确认" }
  ],
  places: {
    chengyang: { name: "程阳八寨", city: "三江", query: "程阳八寨游客中心", tag: "侗寨" },
    jiabang: { name: "加榜梯田", city: "从江", query: "加榜梯田观景台", tag: "晨景 / 日落" },
    qiaojie: { name: "黎平翘街", city: "黎平", query: "黎平翘街", tag: "古城" },
    huanggang: { name: "黄岗侗寨", city: "黎平", query: "黄岗侗寨村口停车点", tag: "原生态侗寨" },
    basha: { name: "岜沙苗寨", city: "从江", query: "岜沙苗寨游客中心", tag: "苗族文化" },
    returnPoint: { name: "租车还车点", city: "从江", query: "从江大道与242国道交叉口", tag: "20:00 前" },
    hotelCongjiang: { name: "神瑶天域大酒店", city: "从江", query: "神瑶天域大酒店 从江县政府店", tag: "住宿" }
  },
  days: [
    {
      id: "day-1", date: "10/2", weekday: "周五", city: "三江", title: "第一次进入侗乡", mood: "从高铁到木楼群",
      risk: "中", items: [
        { time: "上午", type: "train", title: "广州 → 三江南", detail: "高铁待抢 · 广州南优先", ticketId: "train-outbound" },
        { time: "到站后", type: "transfer", title: "三江南 → 程阳八寨", detail: "约 20 公里 · 约 30 分钟 · 无车接驳", placeId: "chengyang" },
        { time: "下午", type: "spot", title: "程阳八寨", detail: "永济桥、鼓楼、木楼群", placeId: "chengyang" },
        { time: "晚上", type: "culture", title: "侗歌 / 多耶舞 / 篝火", detail: "活动情况出发前再次确认" },
        { time: "住宿", type: "hotel", title: "三江农情酒店", detail: "五楼观景家庭房 · 1 晚" }
      ]
    },
    {
      id: "day-2", date: "10/3", weekday: "周六", city: "从江", title: "去赶一场梯田日落", mood: "今天有一个硬时间点",
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
      risk: "高", items: [
        { time: "上午", type: "drive", title: "黎平 → 黄岗侗寨", detail: "约 70 公里 · 今天的主要时间风险", placeId: "huanggang" },
        { time: "上午 / 中午", type: "culture", title: "黄岗侗寨", detail: "鼓楼、原生态生活、侗歌；不要停留太短", placeId: "huanggang" },
        { time: "下午", type: "drive", title: "黄岗 → 岜沙苗寨", detail: "约 50 公里 · 安排白天体验", placeId: "basha" },
        { time: "傍晚", type: "spot", title: "岜沙苗寨", detail: "苗族服饰、镰刀剃头、古树文化", placeId: "basha" },
        { time: "20:00 前", type: "deadline", title: "岜沙 → 还车点", detail: "约 10 公里以内 · 约 15—20 分钟", placeId: "returnPoint" },
        { time: "晚上", type: "hotel", title: "神瑶天域大酒店", detail: "从江县政府店 · 1 晚", placeId: "hotelCongjiang" }
      ]
    },
    {
      id: "day-5", date: "10/6", weekday: "周二", city: "从江 → 广州", title: "在鼓楼边慢下来", mood: "上午留给从江，下午返程",
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
    { id: "task-9", label: "准备现金/移动支付备用方案", done: false, group: "行李" }
  ],
  initialExpenses: [
    { id: "expense-hotel", title: "4 晚酒店", amount: 687, category: "住宿", paidBy: "未分配" },
    { id: "expense-car", title: "租车", amount: 615, category: "交通", paidBy: "未分配" }
  ],
  sources: [
    { label: "从江县人民政府 · 岜沙资料", url: "https://www.congjiang.gov.cn/zjcj/cjly/cjjd/202203/t20220329_80455165.html" },
    { label: "铁路 12306 · 购票与起售时间", url: "https://www.12306.cn/index/" }
  ]
};


