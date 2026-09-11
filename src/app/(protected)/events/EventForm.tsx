"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FamilyEvent } from "@/types/database";

export default function EventForm({ event }: { event?: FamilyEvent }) {
  const router = useRouter();
  const supabase = createClient();
  const isEdit = Boolean(event);

  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [startDate, setStartDate] = useState(event?.start_date ?? "");
  const [endDate, setEndDate] = useState(event?.end_date ?? "");
  const [repeatYearly, setRepeatYearly] = useState(event?.repeat_yearly ?? false);
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
      title,
      description: description || null,
      start_date: startDate,
      end_date: endDate || null,
      repeat_yearly: repeatYearly,
      all_day: true,
    };

    const { error } = isEdit
      ? await supabase.from("events").update(payload).eq("id", event!.id)
      : await supabase.from("events").insert({ ...payload, created_by: user?.id });

    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/events");
    router.refresh();
  }

  async function handleDelete() {
    if (!event) return;
    if (!confirm("이 일정을 삭제할까요?")) return;
    await supabase.from("events").delete().eq("id", event.id);
    router.push("/events");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">제목 *</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          placeholder="예: 엄마 생신"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">시작일 *</label>
          <input
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">종료일</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-700">
        <input
          type="checkbox"
          checked={repeatYearly}
          onChange={(e) => setRepeatYearly(e.target.checked)}
        />
        매년 반복 (생일 · 기념일)
      </label>

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">메모</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          placeholder="준비물, 장소 등"
        />
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
