import { HDate } from "@hebcal/core";
import { Component, createSignal, Show } from "solid-js";
import {
  Button,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
} from "@suid/material";
import { generateRows, LeiningTableRow } from "./table-generator/table-data";
import { getYearTypes } from "./logic/year-types";
import { getLeinings, LeiningsFilter } from "./table-generator/get-leinings";
import DataTable from "./ui/DataTable";
import CheckableOptions from "./ui/CheckableOptions";

export const TableGenerator: Component = () => {
  const [isSephardic, setSephardic] = usePersistentState(
    "TableGenerator/isSephardic",
    false
  );
  const [includeHaftaros, setIncludeHaftaros] = usePersistentState(
    "TableGenerator/includeHaftaros",
    true
  );
  const [filter, setFilter] = usePersistentState<LeiningsFilter>(
    "TableGenerator/filter",
    {
      includeParshiyos: true,
      includeYomTov: true,
      includeCholHamoed: false,
      includeFastDays: false,
      israeli: false,
    }
  );

  const [showYearSamples, setShowYearSamples] = usePersistentState(
    "TableGenerator/showYearSamples",
    false
  );
  const [startYear, setStartYear] = usePersistentState(
    "TableGenerator/startDate",
    new HDate().getFullYear()
  );
  const [yearCount, setYearCount] = usePersistentState(
    "TableGenerator/yearCount",
    1
  );

  const [table, setTable] = createSignal<LeiningTableRow[]>([]);

  return (
    <Stack spacing={2} direction="column" sx={{ padding: 2 }}>
      <Stack spacing={2} direction="row">
        <Card>
          <CardContent>
            <FormControl>
              <FormLabel id="demo-controlled-radio-buttons-group">
                What to generate
              </FormLabel>
              <RadioGroup
                aria-labelledby="demo-controlled-radio-buttons-group"
                name="controlled-radio-buttons-group"
                value={showYearSamples()}
                onChange={(e) => setShowYearSamples(e.target.value === "true")}
              >
                <FormControlLabel
                  value={true}
                  control={<Radio />}
                  label="One year of each configuration"
                />
                <FormControlLabel
                  value={false}
                  control={<Radio />}
                  label="The following years"
                />
              </RadioGroup>
            </FormControl>
            <Show when={!showYearSamples()}>
              <Stack spacing={2} direction="column">
                <TextField
                  label="Start year"
                  type="number"
                  variant="standard"
                  value={startYear()}
                  onChange={(event, value) => setStartYear(parseInt(value, 10))}
                />
                <TextField
                  label="Number of years"
                  type="number"
                  variant="standard"
                  value={yearCount()}
                  onChange={(event, value) => setYearCount(parseInt(value, 10))}
                />
              </Stack>
            </Show>
          </CardContent>
        </Card>
        <Card>
          <CheckableOptions
            options={filter()}
            setOptions={setFilter}
            titles={{
              israeli: "ארץ ישראל",
              includeParshiyos: "פרשיות",
              includeYomTov: "ימים טובים",
              includeCholHamoed: "חול המועד",
              includeFastDays: "תעניות",
            }}
          />
        </Card>
      </Stack>
      <Stack spacing={2} direction="row">
        <Button variant="contained" onclick={populateTable}>
          Render Table
        </Button>
        <Button variant="contained">Copy with headers</Button>
        <Button variant="contained">Copy without headers</Button>
      </Stack>
      {table().length && <DataTable rows={table()} />}
    </Stack>
  );

  function getSelectedLeinings() {
    let years: number[];
    if (showYearSamples()) years = [...getYearTypes().values()];
    else {
      years = Array.from({ length: yearCount() }, (_, i) => startYear() + i);
    }
    return getLeinings(years, filter());
  }

  function populateTable() {
    setTable(generateRows(getSelectedLeinings(), { sephardic: isSephardic() }));
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
