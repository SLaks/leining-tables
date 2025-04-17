import { Locale } from "@hebcal/leyning/dist/esm/locale";
import { LeiningInfo } from "./get-leinings";
import { Aliyah, AliyotMap } from "@hebcal/leyning";
import { getSefer, toHebrewDisplay } from "../names";
import { flags } from "@hebcal/core/dist/esm/event";

export type LeiningTableRow = ReturnType<typeof generateRows>[number];

export function generateRows(
  leinings: LeiningInfo[],
  { sephardic }: { sephardic: boolean }
) {
  return leinings.map((o) => {
    let title = Locale.hebrewStripNikkud(o.name.he ?? "TODO: unknown");
    if (o.parsha) {
      title = `פרשת ${title}`;
      // There is no HolidayEvent for מחר חודש, so we add it manually.
      // It does appear in .reason strings, but those are too verbose.
      const extraSpecial = [];
      if (o.date.getDate() === 29) extraSpecial.push("מחר חודש");
      const special =
        o.holidays
          ?.filter(
            (h) =>
              h.mask &
              (flags.SPECIAL_SHABBAT |
                flags.ROSH_CHODESH |
                flags.CHANUKAH_CANDLES)
          )
          // Strip the day of חנוכה.
          .map((h) =>
            h.renderBrief("he-x-nonikud").replace(/חנוכה.*/, "שבת חנוכה")
          )
          .concat(extraSpecial)
          .join(", ") ?? "";
      if (special) title += ` (${special})`;
    }
    const haftara = [(sephardic && o.seph) || o.haft].flat();

    return {
      date: o.date.greg().toLocaleDateString(),
      hebrewDate: o.date.renderGematriya(true),

      title,

      ...mainInfo(),
      ...haftaraInfo(),
      // TODO: מגילה
    };

    function mainInfo() {
      if (!o.fullkriyah) return {};
      return {
        sefer: getSefer(o.fullkriyah[1].k),
        length: leiningLength(o.fullkriyah),
      };
    }
    function haftaraInfo() {
      if (!haftara[0]) return {};
      return {
        haftara: toHebrewDisplay(haftara[0]),
        haftaraSefer: getSefer(haftara[0].k),
        haftaraLength: leiningLength(haftara),
      };
    }
  });
}

function leiningLength(aliyos: AliyotMap | Aliyah[]): number {
  return Object.values(aliyos).reduce((count, h) => count + (h.v ?? 0), 0);
}
