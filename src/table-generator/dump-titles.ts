import { stdout } from "process";
import { getLeinings } from "./get-leinings";
import { generateRows } from "./table-data";
import { getYearTypes } from "../logic/year-types";

// Run with [Console]::OutputEncoding = [Text.UTF8Encoding]::UTF8
stdout.setEncoding("utf8");

stdout.write(
  JSON.stringify(
    [
      ...new Set(
        generateRows(
          getLeinings([...getYearTypes().values()], {
            includeParshiyos: true,
            includeYomTov: true,
            includeCholHamoed: true,
            includeFastDays: true,
            israeli: false,
          }),
          { sephardic: false }
        ).map((o) => o.title)
      ),
    ],
    null,
    2
  )
);
