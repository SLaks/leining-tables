export interface Pasuk {
  text: string;
  book: string;
  chapter: number;
  verse: number;
  portionName: string;
}

function parseRef(ref: string, textArray: string | string[]): Omit<Pasuk, "portionName">[] {
  const lastSpaceIndex = ref.lastIndexOf(" ");
  const book = ref.slice(0, lastSpaceIndex);
  const rest = ref.slice(lastSpaceIndex + 1);

  if (!rest.includes(":")) {
    const chapter = parseInt(rest, 10);
    const verses = Array.isArray(textArray) ? textArray : [textArray];
    return verses.map((text, idx) => ({
      text,
      book,
      chapter,
      verse: idx + 1,
    }));
  }

  const parts = rest.split("-");
  if (parts.length === 1) {
    const [chapStr, verseStr] = parts[0].split(":");
    return [
      {
        text: Array.isArray(textArray) ? textArray[0] : textArray,
        book,
        chapter: parseInt(chapStr, 10),
        verse: parseInt(verseStr, 10),
      },
    ];
  }

  const [startChapStr, startVerseStr] = parts[0].split(":");
  const startChap = parseInt(startChapStr, 10);
  const startVerse = parseInt(startVerseStr, 10);

  const verses = Array.isArray(textArray) ? textArray : [textArray];
  return verses.map((text, idx) => ({
    text,
    book,
    chapter: startChap,
    verse: startVerse + idx,
  }));
}

export async function fetchRefVerses(ref: string, portionName: string): Promise<Pasuk[]> {
  const version = encodeURIComponent("hebrew|Tanach with Ta'amei Hamikra");
  const url = `https://www.sefaria.org/api/v3/texts/${encodeURIComponent(ref)}?version=${version}`;
  const response = await fetch(url);
  const data = await response.json();

  const text = data.versions?.[0]?.text;
  if (!text) {
    throw new Error("No Hebrew text found on Sefaria.");
  }

  const rawVerses: Omit<Pasuk, "portionName">[] = [];
  if (data.spanningRefs) {
    data.spanningRefs.forEach((spanRef: string, idx: number) => {
      rawVerses.push(...parseRef(spanRef, text[idx]));
    });
  } else {
    rawVerses.push(...parseRef(data.ref, text));
  }
  return rawVerses.map((v) => ({ ...v, portionName }));
}

export async function getFirstPasuk(ref: string): Promise<string> {
  ref = encodeURIComponent(ref);
  const version = encodeURIComponent("hebrew|Tanach with Ta'amei Hamikra");
  const response = await fetch(
    `https://www.sefaria.org/api/v3/texts/${ref}?version=${version}`
  );
  const data = await response.json();
  return data.versions[0].text;
}
