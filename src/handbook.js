export const travelHandbook = {
  cover: {
    src: "./assets/handbook/route-overview.png",
    alt: "黔东南五天四夜行程路线总览图",
    title: "五天四夜路线总览",
    caption: "把三江、加榜、黎平、岜沙和从江串成一条可执行的路线。"
  },
  days: {
    "day-1": {
      src: "./assets/handbook/day-1.png",
      alt: "Day 1 程阳八寨行程手册",
      title: "侗寨初见 · 程阳八寨",
      caption: "从高铁到木楼群，先把抵达后的步行节奏放慢。"
    },
    "day-2": {
      src: "./assets/handbook/day-2.png",
      alt: "Day 2 加榜梯田行程手册",
      title: "梯田初见 · 从江 → 加榜",
      caption: "取车是硬节点，下午和日落留给梯田。"
    },
    "day-3": {
      src: "./assets/handbook/day-3.png",
      alt: "Day 3 加榜到黎平行程手册",
      title: "梯田深度 · 加榜 → 黎平",
      caption: "早起看晨雾，下午把时间交给翘街和古城。"
    },
    "day-4": {
      src: "./assets/handbook/day-4.png",
      alt: "Day 4 黄岗岜沙行程手册",
      title: "侗苗风情 · 黎平 → 从江",
      caption: "黄岗不要停太短，岜沙安排白天，晚上给还车留缓冲。"
    },
    "day-5": {
      src: "./assets/handbook/day-5.png",
      alt: "Day 5 从江返程行程手册",
      title: "江城烟火 · 从江 → 广州",
      caption: "上午慢逛、买特产，下午从容回到广州。"
    }
  }
};

export function handbookForDay(dayId) {
  return travelHandbook.days[dayId] || null;
}
