import { createClient } from "@/lib/supabase/server";
import NewsClient from "./NewsClient";
import { NewsArticle, NewsFeed } from "@/types/database";

export default async function NewsPage() {
  const supabase = createClient();

  const { data: feeds } = await supabase
    .from("news_feeds")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: articles } = await supabase
    .from("news_articles")
    .select("*, news_feeds(title)")
    .order("published_at", { ascending: false })
    .limit(50);

  return (
    <NewsClient
      feeds={(feeds as NewsFeed[]) ?? []}
      articles={(articles as any) ?? []}
    />
  );
}
