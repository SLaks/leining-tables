import { Aliyah } from "@hebcal/leyning/dist/esm/types";

export async function getFirstPasuk(a: Aliyah): Promise<string> {
  const ref = encodeURIComponent(`${a.k} ${a.b}`);
  const version = encodeURIComponent("hebrew|Tanach with Ta'amei Hamikra");
  const response = await fetch(
    `https://www.sefaria.org/api/v3/texts/${ref}?version=${version}`
  );
  const data = await response.json();
  return data.versions[0].text;
}
