export type Mood =
  | "快乐"
  | "放松"
  | "怀旧"
  | "激动"
  | "孤独"
  | "开心"
  | "宁静"
  | "兴奋"
  | "伤感"
  | "沉思"
  | "惊喜"
  | "治愈"
  | "疲惫";

export type DiaryFormValues = {
  location: string;
  mood: Mood;
  startDate: string; // yyyy-mm-dd
  endDate: string; // yyyy-mm-dd
  text: string;
};

export type Track = {
  id: string;
  title: string;
  artist: string;
  duration: number; // seconds
};

export type Diary = {
  id: string;
  date: string; // ISO string
  // 可选：支持行程区间
  startDate?: string; // ISO string
  endDate?: string; // ISO string
  location: string;
  mood: Mood;
  text: string;
  photos: string[]; // public/ 相对路径或远程 URL
  tracks?: Track[];
  isFavorite?: boolean; // from DB
};
