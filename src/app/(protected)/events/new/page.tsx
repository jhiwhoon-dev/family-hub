import EventForm from "../EventForm";

export default function NewEventPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">일정 등록</h1>
      <EventForm />
    </div>
  );
}
