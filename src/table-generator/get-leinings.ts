import {
  HDate,
  getHolidaysOnDate,
  flags,
  HolidayEvent,
  months,
} from "@hebcal/core";
import { Leyning, getLeyningOnDate } from "@hebcal/leyning";

export interface LeiningsFilter {
  includeParshiyos: boolean;
  includeYomTov: boolean;
  includeCholHamoed: boolean;
  includeFastDays: boolean;
  israeli: boolean;
}

export interface LeiningInfo extends Leyning {
  date: HDate;
  holidays?: HolidayEvent[];
}

export function getLeinings(
  years: number[],
  opts: LeiningsFilter
): LeiningInfo[] {
  const results: LeiningInfo[] = [];
  for (const year of years) {
    for (
      let date = new HDate(1, months.TISHREI, year);
      year === date.getFullYear();
      date = date.add(1, "day")
    ) {
      const holidays = getHolidaysOnDate(date, opts.israeli);
      if (!holidays?.length) {
        // For plain days, only include שבת if desired.
        if (date.getDay() !== 6 || !opts.includeParshiyos) continue;
      } else if (
        !holidays?.some((h) => {
          if (h.mask & flags.CHAG) return opts.includeYomTov;
          if (h.mask & flags.CHOL_HAMOED)
            return date.getDate() === 6
              ? opts.includeYomTov
              : opts.includeCholHamoed;
          if (h.mask & flags.MAJOR_FAST) return opts.includeFastDays;
          if (h.mask & flags.MINOR_FAST) return opts.includeFastDays;
        })
      )
        continue;

      results.push(
        ...getLeyningOnDate(date, opts.israeli, true)
          .filter((o): o is Leyning => !o.weekday)
          .map((o) => ({ ...o, date, holidays }))
      );
    }
  }
  return results;
}
