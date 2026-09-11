import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PlaceForm from "../../PlaceForm";
import { Place } from "@/types/database";

export default async function EditPlacePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data } = await supabase
    .from("places")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!data) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">장소 수정</h1>
      <PlaceForm place={data as Place} />
    </div>
  );
}
