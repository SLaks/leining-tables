export function filterObject<T extends Record<string, unknown>>(
  obj: T,
  predicate: (value: T[keyof T], key: string) => boolean
) {
  return Object.fromEntries(
    Object.entries(obj).filter(([key, value]) =>
      predicate(value as T[keyof T], key)
    )
  ) as { [K in keyof T]?: T[K] };
}

export function toTsv<T extends object>(
  titles: { [K in keyof T]?: string },
  rows: T[],
  { includeTitles = true }
) {
  const results = includeTitles ? [Object.values(titles).join("\t")] : [];
  results.push(
    ...rows.map((row) =>
      Object.keys(titles)
        .map((key) => String(row[key as keyof T] ?? ""))
        .join("\t")
    )
  );
  return results.join("\n");
}
