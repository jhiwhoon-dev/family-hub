import { NextResponse } from "next/server";
import Parser from "rss-parser";
import { createClient } from "@/lib/supabase/server";

// 등록된 모든 RSS 피드를 순회하며 최신 기사를 가져와 news_articles 테이블에 저장합니다.
// 가족 홈 화면 또는 뉴스 페이지에서 "새로고침" 버튼을 누르면 호출됩니다.
// (선택) Vercel Cron으로 이 라우트를 주기적으로 호출하도록 설정할 수도 있습니다.
export async function POST() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { data: feeds, error: feedsError } = await supabase
    .from("news_feeds")
    .select("*");

  if (feedsError) {
    return NextResponse.json({ error: feedsError.message }, { status: 500 });
  }

  const parser = new Parser();
  let inserted = 0;
  const errors: string[] = [];

  for (const feed of feeds ?? []) {
    try {
      const parsed = await parser.parseURL(feed.feed_url);
      const articles = (parsed.items ?? []).slice(0, 20).map((item) => ({
        feed_id: feed.id,
        title: item.title ?? "(제목 없음)",
        link: item.link ?? "",
        published_at: item.isoDate ?? item.pubDate ?? null,
        summary: item.contentSnippet?.slice(0, 300) ?? null,
      }));

      if (articles.length > 0) {
        // (feed_id, link) unique 제약으로 중복은 자동 무시됩니다.
        const { error: upsertError } = await supabase
          .from("news_articles")
          .upsert(articles, { onConflict: "feed_id,link", ignoreDuplicates: true });

        if (upsertError) {
          errors.push(`${feed.title}: ${upsertError.message}`);
        } else {
          inserted += articles.length;
        }
      }
    } catch (e) {
      errors.push(`${feed.title}: RSS를 불러오지 못했습니다.`);
    }
  }

  return NextResponse.json({ inserted, errors });
}
