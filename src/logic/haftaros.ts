import { Aliyah } from "@hebcal/leyning/dist/esm/types";
import parshaJson from "@hebcal/leyning/dist/esm/aliyot.json";
import yomTovJson from "@hebcal/leyning/dist/esm/holiday-readings.json";
import { JsonFestivalLeyning } from "@hebcal/leyning/dist/esm/internalTypes";
import { cloneHaftara } from "@hebcal/leyning/dist/esm/clone";
import { noGeniza } from "./no-geniza";
import { LRUCache } from "lru-cache";
import { getFirstPasuk } from "./sefaria";

const fewWords = /^(.*?[\s־]){5}/;
// At least 2 words, then a target Trup, then until the end of the word.
const untilPause = /^(.*?[\s־]){2}.*?[֑֒֔֕֗֜׀׃].*?[\s־]/;
function pasukToTitle(pasuk: string) {
  pasuk = untilPause.exec(pasuk)?.[0] ?? pasuk;
  return noGeniza(fewWords.exec(pasuk)?.[0] ?? pasuk).replace(/[\s־]+$/, "");
}

const firstPasukCache = new LRUCache({
  max: 1000,
  fetchMethod: getFirstPasuk,
});

export async function getHaftaraTitle(a: Aliyah): Promise<string> {
  return pasukToTitle(await firstPasukCache.forceFetch(`${a.k} ${a.b}`));
}

type WithHaftara = Pick<JsonFestivalLeyning, "haft" | "seph">;
/** Returns an array of every possible הפטרה reading. */
export function getAllHaftaros(sephardic = false) {
  const haftaros: Aliyah[] = [];
  const found = new Set<string>();

  function addHaftara(json: WithHaftara) {
    const rawHaftara = (sephardic && json.seph) || json.haft;
    if (!rawHaftara) return;

    let haftara = cloneHaftara(rawHaftara);
    if (!Array.isArray(haftara)) haftara = [haftara];

    // Deduplicate by beginning only.
    const summary = haftara[0].k + haftara[0].b;
    if (found.has(summary)) return;
    found.add(summary);
    haftaros.push(haftara[0]);
  }
  for (const key in parshaJson) {
    addHaftara(parshaJson[key]);
  }
  for (const key in yomTovJson) {
    addHaftara(yomTovJson[key]);
  }
  return haftaros;
}
