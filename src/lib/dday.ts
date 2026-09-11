import { differenceInCalendarDays, parseISO, setYear } from "date-fns";

/**
 * 오늘 기준 D-day 계산.
 * repeatYearly 이면 올해 날짜가 지났을 경우 내년 날짜로 계산합니다.
 */
export function calcDday(startDate: string, repeatYearly: boolean): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let target = parseISO(startDate);

  if (repeatYearly) {
    target = setYear(target, today.getFullYear());
    if (differenceInCalendarDays(target, today) < 0) {
      target = setYear(target, today.getFullYear() + 1);
    }
  }

  return differenceInCalendarDays(target, today);
}

export function formatDday(diff: number): string {
  if (diff === 0) return "D-DAY";
  if (diff > 0) return `D-${diff}`;
  return `D+${Math.abs(diff)}`;
}
