import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CategoryBadge from "@/components/CategoryBadge";
import { FamilyEvent, NewsArticle, Place } from "@/types/database";
import { calcDday, formatDday } from "@/lib/dday";

export default async function DashboardPage() {
  const supabase = createClient();

  const [{ data: events }, { data: places }, { data: articles }] = await Promise.all([
    supabase.from("events").select("*"),
    supabase
      .from("places")
      .select("*")
      .eq("status", "want_to_go")
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("news_articles")
      .select("*, news_feeds(title)")
      .order("published_at", { ascending: false })
      .limit(3),
  ]);

  const upcomingEvents = ((events as FamilyEvent[]) ?? [])
    .map((e) => ({ ...e, diff: calcDday(e.start_date, e.repeat_yearly) }))
    .filter((e) => e.diff >= 0)
    .sort((a, b) => a.diff - b.diff)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">우리 가족 홈에 오신 걸 환영해요 👋</h1>

      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">다가오는 일정</h2>
          <Link href="/events" className="text-sm text-brand-600">
            전체 보기
          </Link>
        </div>
        {upcomingEvents.length === 0 ? (
          <p className="text-sm text-neutral-400">다가오는 일정이 없어요.</p>
        ) : (
          <ul className="space-y-2">
            {upcomingEvents.map((e) => (
              <li key={e.id} className="flex items-center justify-between text-sm">
                <span>{e.title}</span>
                <span className="font-semibold text-brand-600">{formatDday(e.diff)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">가보고 싶은 곳</h2>
          <Link href="/places" className="text-sm text-brand-600">
            전체 보기
          </Link>
        </div>
        {(places as Place[] | null)?.length ? (
          <ul className="space-y-2">
            {(places as Place[]).map((p) => (
              <li key={p.id} className="flex items-center gap-2 text-sm">
                <CategoryBadge category={p.category} />
                <span>{p.name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-neutral-400">아직 등록된 장소가 없어요.</p>
        )}
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">최근 관심 뉴스</h2>
          <Link href="/news" className="text-sm text-brand-600">
            전체 보기
          </Link>
        </div>
        {(articles as (NewsArticle & { news_feeds: { title: string } | null })[] | null)
          ?.length ? (
          <ul className="space-y-2">
            {(articles as (NewsArticle & { news_feeds: { title: string } | null })[]).map(
              (a) => (
                <li key={a.id} className="text-sm">
                  <a
                    href={a.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-brand-600"
                  >
                    {a.title}
                  </a>
                </li>
              )
            )}
          </ul>
        ) : (
          <p className="text-sm text-neutral-400">
            관심 뉴스를 추가하고 새로고침 해보세요.
          </p>
        )}
      </section>
    </div>
  );
}
