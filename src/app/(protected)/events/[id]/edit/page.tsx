import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EventForm from "../../EventForm";
import { FamilyEvent } from "@/types/database";

export default async function EditEventPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!data) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">일정 수정</h1>
      <EventForm event={data as FamilyEvent} />
    </div>
  );
}
