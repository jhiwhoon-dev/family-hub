"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Place, PLACE_CATEGORY_LABEL, PlaceCategory } from "@/types/database";

const CATEGORIES = Object.keys(PLACE_CATEGORY_LABEL) as PlaceCategory[];

export default function PlaceForm({ place }: { place?: Place }) {
  const router = useRouter();
  const supabase = createClient();
  const isEdit = Boolean(place);

  const [name, setName] = useState(place?.name ?? "");
  const [category, setCategory] = useState<PlaceCategory>(place?.category ?? "restaurant");
  const [address, setAddress] = useState(place?.address ?? "");
  const [naverMapUrl, setNaverMapUrl] = useState(place?.naver_map_url ?? "");
  const [lat, setLat] = useState(place?.lat?.toString() ?? "");
  const [lng, setLng] = useState(place?.lng?.toString() ?? "");
  const [memo, setMemo] = useState(place?.memo ?? "");
  const [status, setStatus] = useState(place?.status ?? "want_to_go");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const payload = {
      name,
      category,
      address: address || null,
      naver_map_url: naverMapUrl || null,
      lat: lat ? Number(lat) : null,
      lng: lng ? Number(lng) : null,
      memo: memo || null,
      status,
    };

    const { error } = isEdit
      ? await supabase.from("places").update(payload).eq("id", place!.id)
      : await supabase.from("places").insert({ ...payload, created_by: user?.id });

    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/places");
    router.refresh();
  }

  async function handleDelete() {
    if (!place) return;
    if (!confirm("이 장소를 삭제할까요?")) return;
    await supabase.from("places").delete().eq("id", place.id);
    router.push("/places");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">이름 *</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          placeholder="예: 을지로 커피집"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">카테고리</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full border px-3 py-1 text-sm ${
                category === c
                  ? "border-brand-600 bg-brand-50 text-brand-700"
                  : "border-neutral-300 text-neutral-600"
              }`}
            >
              {PLACE_CATEGORY_LABEL[c]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">주소</label>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          placeholder="도로명 주소"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">
          네이버 지도 링크
        </label>
        <input
          value={naverMapUrl}
          onChange={(e) => setNaverMapUrl(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          placeholder="https://naver.me/... (네이버 지도 앱에서 공유 > 링크 복사)"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">위도 (lat)</label>
          <input
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            placeholder="37.5665"
            inputMode="decimal"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">경도 (lng)</label>
          <input
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            placeholder="126.9780"
            inputMode="decimal"
          />
        </div>
      </div>
      <p className="-mt-2 text-xs text-neutral-400">
        위도/경도를 입력하면 지도에 핀으로 표시됩니다. 네이버 지도 링크를 공유하면 주소창 URL에서 좌표를 확인할 수 있습니다.
      </p>

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">메모</label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          placeholder="추천 메뉴, 방문 팁 등"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">상태</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as "want_to_go" | "visited")}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        >
          <option value="want_to_go">가보고 싶어요</option>
          <option value="visited">다녀왔어요</option>
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {saving ? "저장 중..." : isEdit ? "수정 저장" : "등록하기"}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            삭제
          </button>
        )}
      </div>
    </form>
  );
}
