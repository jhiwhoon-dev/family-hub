"use client";

import Link from "next/link";
import { FamilyEvent } from "@/types/database";
import { calcDday, formatDday } from "@/lib/dday";

export default function EventsClient({ events }: { events: FamilyEvent[] }) {
  const sorted = [...events].sort(
    (a, b) => calcDday(a.start_date, a.repeat_yearly) - calcDday(b.start_date, b.repeat_yearly)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">가족 일정</h1>
        <Link
          href="/events/new"
          className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          + 일정 등록
        </Link>
      </div>

      <ul className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
        {sorted.length === 0 && (
          <li className="p-6 text-center text-sm text-neutral-400">
            등록된 일정이 없습니다.
          </li>
        )}
        {sorted.map((event) => {
          const diff = calcDday(event.start_date, event.repeat_yearly);
          return (
            <li key={event.id}>
              <Link
                href={`/events/${event.id}/edit`}
                className="flex items-center justify-between gap-3 p-4 hover:bg-neutral-50"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{event.title}</span>
                    {event.repeat_yearly && (
                      <span className="text-xs text-neutral-400">🔁 매년</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-neutral-500">{event.start_date}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    diff <= 0
                      ? "bg-brand-100 text-brand-700"
                      : diff <= 7
                      ? "bg-amber-100 text-amber-700"
                      : "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {formatDday(diff)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
