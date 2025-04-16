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

export default function DataTable(props: { rows: object[] }) {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <For each={Object.keys(props.rows[0])}>
              {(key) => <TableCell component="th">{key}</TableCell>}
            </For>
          </TableRow>
        </TableHead>
        <TableBody>
          <For each={props.rows}>
            {(row) => (
              <TableRow
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <For each={Object.values(row)}>
                  {(value) => <TableCell>{value}</TableCell>}
                </For>
              </TableRow>
            )}
          </For>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
