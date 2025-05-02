import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@suid/material";
import { createSignal, For } from "solid-js";
import { ColumnValue } from "../utils";

export default function DataTable<
  T extends Record<string, ColumnValue>
>(props: { rows: T[]; titles: { [K in keyof T]?: string } }) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <For each={Object.values(props.titles as Record<string, string>)}>
              {(key) => (
                <TableCell sx={{ fontWeight: "bold" }} component="th">
                  {key}
                </TableCell>
              )}
            </For>
          </TableRow>
        </TableHead>
        <TableBody>
          <For each={props.rows}>
            {(row) => (
              <TableRow
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <For each={Object.keys(props.titles) as (keyof T)[]}>
                  {(key) => <TableCell>{renderCell(row[key])}</TableCell>}
                </For>
              </TableRow>
            )}
          </For>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function renderCell(value: ColumnValue) {
  if (!value) return "";
  if (typeof value === "function") value = value();

  if (value instanceof Promise) {
    const [result, setResult] = createSignal<string | undefined>("");
    value.then(setResult);
    return <>{result()}</>;
  }
  return value;
}