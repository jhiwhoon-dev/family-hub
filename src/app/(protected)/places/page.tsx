import { createClient } from "@/lib/supabase/server";
import PlacesClient from "./PlacesClient";
import { Place } from "@/types/database";

export default async function PlacesPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("places")
    .select("*")
    .order("created_at", { ascending: false });

  return <PlacesClient places={(data as Place[]) ?? []} />;
}
