export async function getFirstPasuk(ref: string): Promise<string> {
  ref = encodeURIComponent(ref);
  const version = encodeURIComponent("hebrew|Tanach with Ta'amei Hamikra");
  const response = await fetch(
    `https://www.sefaria.org/api/v3/texts/${ref}?version=${version}`
  );
  const data = await response.json();
  return data.versions[0].text;
}
