import { gematriya } from "@hebcal/core";
import { Locale } from "@hebcal/leyning/dist/esm/locale";
import { Aliyah } from "@hebcal/leyning/dist/esm/types";

export const treiAsar = [
  "הוֹשֵׁעַ",
  "יוֹאֵל",
  "עָמוּס",
  "עוֹבַדְיָה",
  "יוֹנָה",
  "מִיכָה",
  "נַחוּם",
  "חֲבַקּוּק",
  "צְפַנְיָה",
  "חַגַּי",
  "זְכַרְיָה",
  "מַלְאָכִי",
].map(Locale.hebrewStripNikkud);

const chumash: Record<string, string> = {
  Genesis: "בראשית",
  Exodus: "שמות",
  Leviticus: "ויקרא",
  Numbers: "במדבר",
  Deuteronomy: "דברים",
};

export const toHebrew = (s: string) =>
  chumash[s] || Locale.gettext(s, "he-x-nonikud");

export function getSefer(name: string) {
  name = toHebrew(name);
  if (treiAsar.includes(name)) return "תרי עשר";
  return name.replace(/ראשון|שני/, "").trim();
}
export function getSeferSortIndex(name: string) {
  name = toHebrew(name);
  const treiAsarIndex = treiAsar.indexOf(name);
  if (treiAsarIndex >= 0) return treiAsarIndex;
  if (name in chumash) return Object.keys(chumash).indexOf(name);
  if (name.includes("שני")) return 2;
  return 1;
}

export function fixSeferSuffix(name: string) {
  return name.replace("ראשון", "א׳").replace("שני", "ב׳");
}

export function toHebrewDisplay(h: Aliyah) {
  return fixSeferSuffix(toHebrew(h.k)) + " " + formatHebrewLocation(h);
}
export function formatHebrewLocation(h: Aliyah) {
  return h.b.split(":").map(gematriya).join(" ");
}

export function toSefariaUrl(h: Aliyah) {
  const verse = h.b.replace(/:/g, ".");
  return `https://www.sefaria.org/${h.k.replace(/ /g, "_")}.${verse}?lang=he`;
}

export function toSortableIndex(h: Aliyah) {
  const [sefer, verse] = h.b.split(":");
  return +sefer * 1000 + +verse;
}
