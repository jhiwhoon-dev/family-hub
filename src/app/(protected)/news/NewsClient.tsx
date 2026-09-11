"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { NewsArticle, NewsFeed } from "@/types/database";
import FeedForm from "./FeedForm";

export default function NewsClient({
  feeds,
  articles,
}: {
  feeds: NewsFeed[];
  articles: (NewsArticle & { news_feeds: { title: string } | null })[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function handleRefresh() {
    setRefreshing(true);
    setMessage(null);
    const res = await fetch("/api/news/refresh", { method: "POST" });
    const json = await res.json();
    setRefreshing(false);
    if (res.ok) {
      setMessage(`새 기사 ${json.inserted}건을 확인했어요.`);
      startTransition(() => router.refresh());
    } else {
      setMessage(json.error ?? "새로고침에 실패했습니다.");
    }
  }

  async function handleRemoveFeed(id: string) {
    if (!confirm("이 피드를 삭제할까요? (수집된 기사도 함께 삭제됩니다)")) return;
    await supabase.from("news_feeds").delete().eq("id", id);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-bold">관심 뉴스</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50 disabled:opacity-50"
          >
            {refreshing ? "가져오는 중..." : "↻ 새로고침"}
          </button>
          <FeedForm />
        </div>
      </div>

      {message && <p className="text-sm text-neutral-500">{message}</p>}

      {feeds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {feeds.map((f) => (
            <span
              key={f.id}
              className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600"
            >
              {f.title}
              <button
                onClick={() => handleRemoveFeed(f.id)}
                className="text-neutral-400 hover:text-red-500"
                aria-label="피드 삭제"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      <ul className="space-y-3">
        {articles.length === 0 && (
          <li className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center text-sm text-neutral-400">
            {feeds.length === 0
              ? "먼저 관심 키워드/피드를 추가해보세요."
              : "아직 수집된 기사가 없습니다. 새로고침을 눌러보세요."}
          </li>
        )}
        {articles.map((article) => (
          <li
            key={article.id}
            className="rounded-xl border border-neutral-200 bg-white p-4"
          >
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-neutral-900 hover:text-brand-600"
            >
              {article.title}
            </a>
            <div className="mt-1 flex items-center gap-2 text-xs text-neutral-400">
              <span>{article.news_feeds?.title ?? "뉴스"}</span>
              {article.published_at && (
                <>
                  <span>·</span>
                  <span>{new Date(article.published_at).toLocaleDateString("ko-KR")}</span>
                </>
              )}
            </div>
            {article.summary && (
              <p className="mt-2 line-clamp-2 text-sm text-neutral-600">
                {article.summary}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
