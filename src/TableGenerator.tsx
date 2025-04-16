import { flags, getHolidaysOnDate, HDate } from "@hebcal/core";
import { getLeyningOnDate, Leyning } from "@hebcal/leyning";
import { Component, createSignal } from "solid-js";
import { Button, Stack } from "@suid/material";

export const TableGenerator: Component = () => {
  const [isSephardic, setSephardic] = usePersistentState(
    "TableGenerator/isSephardic",
    false
  );
  const [israeli, setIsraeli] = usePersistentState(
    "TableGenerator/israeli",
    false
  );
  const [includeHaftaros, setIncludeHaftaros] = usePersistentState(
    "TableGenerator/includeHaftaros",
    true
  );

  const [includeParshiyos, setIncludeParshiyos] = usePersistentState(
    "TableGenerator/includeParshiyos",
    true
  );
  const [includeYomTov, setIncludeYomTov] = usePersistentState(
    "TableGenerator/includeYomTov",
    true
  );
  const [includeFastDays, setIncludeFastDays] = usePersistentState(
    "TableGenerator/includeFastDays",
    false
  );
  const [includeCholHamoed, setIncludeCholHamoed] = usePersistentState(
    "TableGenerator/includeCholHamoed",
    false
  );

  const [showYearSamples, setShowYearSamples] = usePersistentState(
    "TableGenerator/showYearSamples",
    true
  );
  const [startDate, setStartDate] = usePersistentState(
    "TableGenerator/startDate",
    new Date().toISOString().split("T")[0]
  );
  const [yearCount, setYearCount] = usePersistentState(
    "TableGenerator/yearCount",
    1
  );

  return (
    <Stack spacing={2} direction="row">
      <Button variant="contained">Render Table</Button>
      <Button variant="contained">Copy with headers</Button>
      <Button variant="contained">Copy without headers</Button>
    </Stack>
  );

  function getLeinings(years: number[]) {
    const results: Leyning[] = [];
    for (const year of years) {
      for (
        let date = new HDate(year, 1, 1);
        date.getFullYear();
        date = date.add(1, "day")
      ) {
        const holidays = getHolidaysOnDate(date, israeli());
        if (!holidays?.length && (date.getDay() !== 6 || !includeParshiyos()))
          continue;

        if (
          !holidays?.some((h) => {
            if (h.mask & flags.CHAG) return includeYomTov();
            if (h.mask & flags.CHOL_HAMOED)
              return date.getDate() === 6
                ? includeYomTov()
                : includeCholHamoed();
            if (h.mask & flags.MAJOR_FAST) return includeFastDays();
            if (h.mask & flags.MINOR_FAST) return includeFastDays();
          })
        )
          continue;

        results.push(
          ...getLeyningOnDate(date, israeli(), true).filter(
            (o): o is Leyning => {
              // if (o.weekday) return false;
              // if (o.parsha && includeParshiyos()) return true;
              return true; // TODO: Delete
            }
          )
        );
      }
    }
  }
};

function usePersistentState<T>(name: string, initialValue: T) {
  const storedValue = localStorage.getItem(name);
  const [state, setState] = createSignal<T>(
    storedValue ? (JSON.parse(storedValue) as T) : initialValue,
    { name }
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  const setPersistentState = (value: Exclude<T, Function>) => {
    localStorage.setItem(name, JSON.stringify(value));
    setState(value);
  };

  return [state, setPersistentState] as const;
}
