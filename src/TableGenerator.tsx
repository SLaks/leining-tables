import { HDate } from "@hebcal/core";
import { Component, createSignal, Show } from "solid-js";
import {
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Theme,
  ToggleButton,
  ToggleButtonGroup,
} from "@suid/material";
import { generateRows, LeiningTableRow } from "./table-generator/table-data";
import { getYearTypes } from "./logic/year-types";
import { getLeinings, LeiningsFilter } from "./table-generator/get-leinings";
import DataTable from "./ui/DataTable";
import CheckableOptions from "./ui/CheckableOptions";
import { filterObject, toTsv } from "./utils";
import { SxProps } from "@suid/system";
import { AsyncButton } from "./ui/AsyncButton";

const columnTitles: Record<keyof LeiningTableRow, string> = {
  date: "Date",
  hebrewDate: "Hebrew Date",
  title: "Title",
  baalKoreh: "בעל קורא",
  sefer: "ספר",
  length: "# פסוקים",
  haftaraTitle: "שם הפטרה",
  haftara: "הפטרה",
  haftaraBaalKoreh: "הפטרה: בעל קורא",
  haftaraLength: "הפטרה: # פסוקים",
  haftaraSefer: "הפטרה: ספר",
};

export const TableGenerator: Component = () => {
  const [isSephardic, setSephardic] = usePersistentState(
    "TableGenerator/isSephardic",
    false
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
  const [selectedColumns, setSelectedColumns] = usePersistentState(
    "TableGenerator/selectedColumns",
    Object.fromEntries(
      Object.keys(columnTitles).map((key) => [key, true] as const)
    ) as Record<keyof LeiningTableRow, boolean>
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

  const selectedColumnTitles = () =>
    filterObject(
      columnTitles,
      (v, key) => selectedColumns()[key as keyof LeiningTableRow]
    );

  const [table, setTable] = createSignal<LeiningTableRow[]>([]);

  const cardStyles: SxProps<Theme> = {
    maxHeight: 350,
    flexGrow: 1,
  };

  return (
    <Stack spacing={2} direction="column" sx={{ padding: 2 }}>
      <Stack direction="row" flexWrap="wrap" gap={2}>
        <Card sx={cardStyles}>
          <CardContent>
            <Stack spacing={2} direction="column">
              <FormControl>
                <FormLabel id="year-options">What to generate</FormLabel>
                <RadioGroup
                  aria-labelledby="year-options"
                  value={showYearSamples()}
                  onChange={(e) =>
                    setShowYearSamples(e.target.value === "true")
                  }
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
                    inputProps={{ min: 5000, max: 6000 }}
                    value={startYear()}
                    onChange={(event, value) =>
                      setStartYear(parseInt(value, 10))
                    }
                  />
                  <TextField
                    label="Number of years"
                    type="number"
                    variant="standard"
                    inputProps={{ min: 1, max: 30 }}
                    value={yearCount()}
                    onChange={(event, value) =>
                      setYearCount(parseInt(value, 10))
                    }
                  />
                </Stack>
              </Show>
              <Divider flexItem />

              <ToggleButtonGroup
                color="primary"
                value={isSephardic()}
                exclusive
                onChange={(event, value) => setSephardic(value)}
                fullWidth
              >
                <ToggleButton value={false}>אשכנזי</ToggleButton>
                <ToggleButton value={true}>ספרדי</ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </CardContent>
        </Card>
        <Card sx={cardStyles}>
          <CardContent sx={{ paddingBottom: 0 }}>
            <FormLabel id="demo-controlled-radio-buttons-group">
              Include
            </FormLabel>
          </CardContent>
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
        <Card sx={{ overflowY: "auto", ...cardStyles }}>
          <CardContent sx={{ paddingBottom: 0 }}>
            <FormLabel id="demo-controlled-radio-buttons-group">
              Columns
            </FormLabel>
          </CardContent>
          <CheckableOptions
            options={selectedColumns()}
            setOptions={setSelectedColumns}
            titles={columnTitles}
          />
        </Card>
      </Stack>
      <Stack spacing={2} direction="row">
        <Button variant="contained" onclick={populateTable}>
          Render Table
        </Button>
        <AsyncButton
          disabled={!table().length}
          action={() => copyTable({ includeTitles: true })}
        >
          Copy with headers
        </AsyncButton>
        <AsyncButton
          disabled={!table().length}
          action={() => copyTable({ includeTitles: false })}
        >
          Copy without headers
        </AsyncButton>
      </Stack>
      {table().length && (
        <DataTable rows={table()} titles={selectedColumnTitles()} />
      )}
    </Stack>
  );

  async function copyTable(opts: { includeTitles: boolean }) {
    navigator.clipboard.writeText(
      await toTsv(selectedColumnTitles(), table(), opts)
    );
  }

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
