import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@suid/material";
import { For } from "solid-js";

export default function DataTable<T extends object>(props: {
  rows: T[];
  titles: Record<string & keyof T, string>;
}) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <For each={Object.values<string>(props.titles)}>
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
                  {(key) => <TableCell>{String(row[key])}</TableCell>}
                </For>
              </TableRow>
            )}
          </For>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
