import { Locale } from "@hebcal/leyning/dist/esm/locale";
import { LeiningInfo } from "./get-leinings";
import { Aliyah, AliyotMap } from "@hebcal/leyning";
import { getSefer, toHebrewDisplay } from "../names";

export type LeiningTableRow = ReturnType<typeof generateRows>[number];

export function generateRows(
  leinings: LeiningInfo[],
  { sephardic }: { sephardic: boolean }
) {
  return leinings.map((o) => {
    let title = Locale.hebrewStripNikkud(o.name.he ?? "TODO: unknown");
    if (o.parsha) title = `פרשת ${title}`;

    const haftara = [(sephardic && o.seph) || o.haft].flat();

    return {
      date: o.date.greg().toLocaleDateString(),
      hebrewDate: o.date.render("he-x-nonikud"),

      title,

      ...mainInfo(),
      ...haftaraInfo(),
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
