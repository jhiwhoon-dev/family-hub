import { createClient } from "@/lib/supabase/server";
import EventsClient from "./EventsClient";
import { FamilyEvent } from "@/types/database";

export default async function EventsPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .order("start_date", { ascending: true });

  return <EventsClient events={(data as FamilyEvent[]) ?? []} />;
}
