declare module "@hebcal/leyning/dist/esm/aliyot.json" {
  const parshaJson: { [key: string]: JsonParsha };
  export default parshaJson;

  // All of these types are copied from leyning.ts.
  // This duplicates JsonFestivalAliyah.
  type JsonAliyah = {
    k: number | string;
    b: string;
    e: string;
    v?: number;
    p?: number;
  };

  type JsonParshaMap = {
    [key: string]: string[];
  };

  type JsonParsha = {
    num: number | number[];
    hebrew?: string;
    book: number;
    haft?: JsonAliyah | JsonAliyah[];
    seph?: JsonAliyah | JsonAliyah[];
    fullkriyah: JsonParshaMap;
    weekday?: JsonParshaMap;
    combined?: boolean;
    p1?: string;
    p2?: string;
    num1?: number;
    num2?: number;
  };
}

declare module "@hebcal/leyning/dist/esm/holiday-readings.json" {
  import type { JsonFestivalLeyning } from "@hebcal/leyning/dist/esm/internalTypes";
  const yomTovJson: { [key: string]: JsonFestivalLeyning };
  export default yomTovJson;
}
