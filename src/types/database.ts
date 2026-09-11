export type PlaceCategory = "cafe" | "restaurant" | "travel" | "activity" | "etc";
export type PlaceStatus = "want_to_go" | "visited";

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Place {
  id: string;
  created_by: string;
  name: string;
  category: PlaceCategory;
  address: string | null;
  lat: number | null;
  lng: number | null;
  naver_map_url: string | null;
  memo: string | null;
  status: PlaceStatus;
  rating: number | null;
  created_at: string;
}

export interface FamilyEvent {
  id: string;
  created_by: string;
  title: string;
  description: string | null;
  start_date: string; // YYYY-MM-DD
  end_date: string | null;
  all_day: boolean;
  repeat_yearly: boolean;
  created_at: string;
}

export interface NewsFeed {
  id: string;
  created_by: string;
  title: string;
  feed_url: string;
  created_at: string;
}

export interface NewsArticle {
  id: string;
  feed_id: string;
  title: string;
  link: string;
  published_at: string | null;
  summary: string | null;
  created_at: string;
}

export const PLACE_CATEGORY_LABEL: Record<PlaceCategory, string> = {
  cafe: "카페",
  restaurant: "맛집",
  travel: "여행지",
  activity: "액티비티",
  etc: "기타",
};

export const PLACE_CATEGORY_COLOR: Record<PlaceCategory, string> = {
  cafe: "#c2410c",
  restaurant: "#dc2626",
  travel: "#2563eb",
  activity: "#16a34a",
  etc: "#6b7280",
};
