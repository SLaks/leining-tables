import { Aliyah } from "@hebcal/leyning/dist/esm/types";
import parshaJson from "@hebcal/leyning/dist/esm/aliyot.json";
import yomTovJson from "@hebcal/leyning/dist/esm/holiday-readings.json";
import {
  JsonFestivalAliyah,
  JsonFestivalLeyning,
} from "@hebcal/leyning/dist/esm/internalTypes";
import { cloneHaftara } from "@hebcal/leyning/dist/esm/clone";

type WithHaftara = Pick<JsonFestivalLeyning, "haft" | "seph">;

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
