import { PlaceCategory, PLACE_CATEGORY_COLOR, PLACE_CATEGORY_LABEL } from "@/types/database";

export default function CategoryBadge({ category }: { category: PlaceCategory }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
      style={{ backgroundColor: PLACE_CATEGORY_COLOR[category] }}
    >
      {PLACE_CATEGORY_LABEL[category]}
    </span>
  );
}
