import { gematriya, HDate, months } from "@hebcal/core";

const GERESH = "׳";

export function getYearType(year: number): string {
  let length = "כ";
  if (HDate.longCheshvan(year) && !HDate.shortKislev(year)) {
    length = "ש";
  }
  if (!HDate.longCheshvan(year) && HDate.shortKislev(year)) {
    length = "ח";
  }
  return [
    gematriya(new HDate(1, months.TISHREI, year).getDay() + 1),
    length,
    gematriya(new HDate(15, months.NISAN, year).getDay() + 1),
  ]
    .join("")
    .replaceAll(GERESH, "");
}

/** Returns a map of year type to the first upcoming year of that type. */
export function getYearTypes() {
  const results = new Map<string, number>();
  for (let date = new HDate(); results.size < 14; date = date.add(1, "year")) {
    const yearType = getYearType(date.getFullYear());
    if (!results.has(yearType)) {
      results.set(yearType, date.getFullYear());
    }
  }
  return results;
}
