import { stdout } from "process";
import { getLeinings } from "./get-leinings";
import { generateRows } from "./table-data";

stdout.setEncoding("utf8");

stdout.write(
  JSON.stringify(
    generateRows(
      getLeinings([5785], {
        includeParshiyos: true,
        includeYomTov: true,
        includeCholHamoed: false,
        includeFastDays: false,
        israeli: false,
      }),
      { sephardic: false }
    )
      .filter((o) => o.title.includes("("))
      .map((o) => o.title),
    null,
    2
  )
);
