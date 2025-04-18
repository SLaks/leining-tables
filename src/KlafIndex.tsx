import { For, Show, type Component } from "solid-js";

import styles from "./KlafIndex.module.css";
import { getAllHaftaros } from "./logic/haftaros";
import { formatHebrewRange, getSefer, toSortableIndex } from "./names";
import { createAsync, query, useParams } from "@solidjs/router";
import { byNumber, byValue } from "sort-es";
import { getFirstPasuk } from "./logic/sefaria";
import { Aliyah } from "@hebcal/leyning";
import { noGeniza } from "./logic/no-geniza";

const allHaftaros = getAllHaftaros();

const bySefer = Object.groupBy(allHaftaros, (h) => getSefer(h.k));

const firstPasuk = query(getFirstPasuk, "firstPasuk");

const KlafIndex: Component = () => {
  const params = useParams();
  const sefer = () => params.sefer && decodeURIComponent(params.sefer);

  const haftaros = () =>
    bySefer[sefer()]?.sort(byValue(toSortableIndex, byNumber()));
  return (
    <div class={styles.Root}>
      <header class={styles.Header}>
        <h1>Klaf Index</h1>
        <p>Click on a klaf to see the haftaros for that klaf.</p>
        <ul>
          <For each={Object.keys(bySefer)}>
            {(k) => {
              return (
                <li>
                  <a
                    class={styles.link}
                    href={`/klaf-index/${k}`}
                    style={{ "font-weight": k === sefer() ? "bold" : "normal" }}
                  >
                    {k}
                  </a>
                </li>
              );
            }}
          </For>
        </ul>
        <Show when={sefer()}>
          <h2>Sefer: {sefer()}</h2>
        </Show>
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
  const preview = createAsync(() => firstPasuk(props.h));

  return (
    <>
      <span class={styles.Location}>
        {formatHebrewRange(props.h)}:{"\t"}
      </span>
      <span class={styles.Pasuk}> {summarize(preview())}</span>
    </>
  );
};

const fewWords = /^(.*?[\s־]){5}/;
// At least 2 words, then a target Trup, then until the end of the word.
const untilPause = /^(.*?[\s־]){2}.*?[֑֒֔֕֗֜׀׃].*?[\s־]/;
function summarize(s: string | undefined) {
  if (!s) return s;
  s = untilPause.exec(s)?.[0] ?? s;
  return noGeniza(fewWords.exec(s)?.[0] ?? s).replace(/[\s־]+$/, "");
}

export default KlafIndex;
