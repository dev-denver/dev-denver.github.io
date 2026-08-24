import { format } from "date-fns";
import { ko } from "date-fns/locale";

// The site is Korean throughout, so dates default to a Korean pattern rather
// than "dd MMM, yyyy". Callers can still pass their own pattern.
const dateFormat = (
  date: Date | string,
  pattern: string = "yyyy년 M월 d일",
): string => {
  const dateObj = new Date(date);
  return format(dateObj, pattern, { locale: ko });
};

export default dateFormat;
