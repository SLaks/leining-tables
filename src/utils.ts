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

type ColumnData = string | number;
export type ColumnValue =
  | undefined
  | ColumnData
  | Promise<ColumnData>
  | (() => ColumnData | Promise<ColumnData>);

export async function toTsv<T extends Record<string, ColumnValue>>(
  titles: { [K in keyof T]?: string },
  rows: T[],
  { includeTitles = true }
) {
  const results = includeTitles ? [Object.values(titles).join("\t")] : [];
  results.push(...(await Promise.all(rows.map(renderRow))));
  return results.join("\n");

  async function renderRow(row: T): Promise<string> {
    return (
      await Promise.all(
        Object.keys(titles).map((key) => renderCell(row[key as keyof T]))
      )
    ).join("\t");
  }
}

async function renderCell(
  value: ColumnValue
): Promise<string | Promise<string>> {
  if (!value) return "";
  if (typeof value === "function") value = value();
  return String(await value);
}
