import { For, Show, type Component } from "solid-js";

import styles from "./KlafIndex.module.css";
import { getAllHaftaros, getHaftaraTitle } from "./logic/haftaros";
import {
  fixSeferSuffix,
  formatHebrewLocation,
  getSefer,
  toHebrew,
  toSortableIndex,
} from "./names";
import { createAsync, useParams } from "@solidjs/router";
import { byNumber, byValue } from "sort-es";
import { Aliyah } from "@hebcal/leyning";
import { usePersistentState } from "./ui/usePersistentState";
import {
  ToggleButtonGroup,
  ToggleButton,
  createTheme,
  ThemeProvider,
} from "@suid/material";
import { purple } from "@suid/material/colors";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: purple[50] },
  },
});

const KlafIndex: Component = () => {
  const params = useParams();
  const sefer = () => params.sefer && decodeURIComponent(params.sefer);

  // Shares the key with TableGenerator.
  const [isSephardic, setSephardic] = usePersistentState(
    "TableGenerator/isSephardic",
    false
  );
  const allHaftaros = () => getAllHaftaros(isSephardic());

  const bySefer = () => Object.groupBy(allHaftaros(), (h) => getSefer(h.k));

  const haftaros = () =>
    bySefer()[sefer()]?.sort(byValue(toSortableIndex, byNumber()));
  return (
    <div class={styles.Root}>
      <header class={styles.Header}>
        <ThemeProvider theme={darkTheme}>
          <h1>Klaf Index</h1>
          <p>Click on a klaf to see the haftaros for that klaf.</p>
          <ul>
            <For each={Object.keys(bySefer())}>
              {(k) => {
                return (
                  <li>
                    <a
                      class={styles.link}
                      href={`/klaf-index/${k}`}
                      style={{
                        "font-weight": k === sefer() ? "bold" : "normal",
                      }}
                    >
                      {k}
                    </a>
                  </li>
                );
              }}
            </For>
          </ul>
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
          <Show when={sefer()}>
            <h2>Sefer: {sefer()}</h2>
          </Show>
        </ThemeProvider>
      </header>
      <ol class={styles.List} dir="rtl">
        {
          <For each={haftaros()}>
            {(h) => (
              <li>
                <HaftaraDisplay h={h} />
              </li>
            )}
          </For>
        }
      </ol>
    </div>
  );
};

const HaftaraDisplay: Component<{ h: Aliyah }> = (props) => {
  const preview = createAsync(() => getHaftaraTitle(props.h));

  const prefix = () => {
    const fullSefer = toHebrew(props.h.k);
    const shortSefer = getSefer(props.h.k);
    if (shortSefer == fullSefer) return "";
    return fixSeferSuffix(fullSefer).replace(shortSefer, "").trim();
  };

  return (
    <div class={styles.ListEntry}>
      <span class={styles.Location}>
        {prefix()} {formatHebrewLocation(props.h)}:{"\t"}
      </span>
      <span class={styles.Pasuk}> {preview()}</span>
    </div>
  );
};

export default KlafIndex;
