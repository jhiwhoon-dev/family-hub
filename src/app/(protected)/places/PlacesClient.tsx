"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import NaverMap from "@/components/NaverMap";
import CategoryBadge from "@/components/CategoryBadge";
import { Place, PLACE_CATEGORY_LABEL, PlaceCategory } from "@/types/database";

type Filter = "all" | PlaceCategory;

export default function PlacesClient({ places }: { places: Place[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [showVisited, setShowVisited] = useState(true);

  const filtered = useMemo(() => {
    return places.filter((p) => {
      if (filter !== "all" && p.category !== filter) return false;
      if (!showVisited && p.status === "visited") return false;
      return true;
    });
  }, [places, filter, showVisited]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">가보고 싶은 곳</h1>
        <Link
          href="/places/new"
          className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          + 장소 등록
        </Link>
      </div>

      <NaverMap places={filtered} />

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full border px-3 py-1 text-sm ${
            filter === "all"
              ? "border-brand-600 bg-brand-50 text-brand-700"
              : "border-neutral-300 text-neutral-600"
          }`}
        >
          전체
        </button>
        {(Object.keys(PLACE_CATEGORY_LABEL) as PlaceCategory[]).map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`rounded-full border px-3 py-1 text-sm ${
              filter === c
                ? "border-brand-600 bg-brand-50 text-brand-700"
                : "border-neutral-300 text-neutral-600"
            }`}
          >
            {PLACE_CATEGORY_LABEL[c]}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-1.5 text-sm text-neutral-600">
          <input
            type="checkbox"
            checked={showVisited}
            onChange={(e) => setShowVisited(e.target.checked)}
          />
          다녀온 곳 포함
        </label>
      </div>

      <ul className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
        {filtered.length === 0 && (
          <li className="p-6 text-center text-sm text-neutral-400">
            등록된 장소가 없습니다.
          </li>
        )}
        {filtered.map((place) => (
          <li key={place.id}>
            <Link
              href={`/places/${place.id}/edit`}
              className="flex items-center justify-between gap-3 p-4 hover:bg-neutral-50"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{place.name}</span>
                  <CategoryBadge category={place.category} />
                  {place.status === "visited" && (
                    <span className="text-xs text-neutral-400">✅ 다녀옴</span>
                  )}
                </div>
                {place.address && (
                  <p className="mt-0.5 text-sm text-neutral-500">{place.address}</p>
                )}
              </div>
              <span className="text-neutral-300">›</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
