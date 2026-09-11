"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// 구글 뉴스 검색 RSS 예시 (검색어만 바꿔서 바로 추가할 수 있습니다)
// 네이버는 더 이상 공개 뉴스 검색 RSS를 제공하지 않아, 대신 구글 뉴스 검색 RSS를 기본값으로 둡니다.
const PRESETS = [
  { label: "IT/과학 뉴스", url: "https://news.google.com/rss/search?q=IT+과학&hl=ko&gl=KR&ceid=KR:ko" },
  { label: "경제 뉴스", url: "https://news.google.com/rss/search?q=경제&hl=ko&gl=KR&ceid=KR:ko" },
];

export default function FeedForm() {
  const router = useRouter();
  const supabase = createClient();
  const [title, setTitle] = useState("");
  const [feedUrl, setFeedUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("news_feeds")
      .insert({ title, feed_url: feedUrl, created_by: user?.id });

    setSaving(false);
    if (error) {
      setError("추가하지 못했습니다. 이미 등록된 주소이거나 형식이 올바르지 않습니다.");
      return;
    }
    setTitle("");
    setFeedUrl("");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
      >
        + 관심 키워드/피드 추가
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4"
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">
          이름 (구분용)
        </label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          placeholder="예: 우리 동네 소식"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">RSS 주소</label>
        <input
          required
          value={feedUrl}
          onChange={(e) => setFeedUrl(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          placeholder="https://news.google.com/rss/search?q=키워드&hl=ko&gl=KR&ceid=KR:ko"
        />
        <p className="mt-1 text-xs text-neutral-400">
          구글 뉴스 검색 RSS 형식(위 예시)에 원하는 키워드만 바꿔 넣으면 손쉽게 관심
          주제 뉴스를 모을 수 있습니다. 언론사가 자체 RSS 주소를 제공하면 그 주소를
          넣어도 됩니다.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              type="button"
              key={p.url}
              onClick={() => {
                setTitle(p.label);
                setFeedUrl(p.url);
              }}
              className="rounded-full border border-neutral-300 px-2.5 py-1 text-xs text-neutral-600 hover:bg-neutral-50"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {saving ? "추가 중..." : "추가"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg px-3 py-2 text-sm text-neutral-500 hover:bg-neutral-100"
        >
          취소
        </button>
      </div>
    </form>
  );
}
