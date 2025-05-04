import { For, Show, type Component } from "solid-js";

import styles from "./KlafIndex.module.css";
import { getAllHaftaros, getHaftaraTitle } from "./logic/haftaros";
import { formatHebrewRange, getSefer, toSortableIndex } from "./names";
import { createAsync, useParams } from "@solidjs/router";
import { byNumber, byValue } from "sort-es";
import { Aliyah } from "@hebcal/leyning";

const allHaftaros = getAllHaftaros();

const bySefer = Object.groupBy(allHaftaros, (h) => getSefer(h.k));

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
  const preview = createAsync(() => getHaftaraTitle(props.h));

  return (
    <div class={styles.ListEntry}>
      <span class={styles.Location}>
        {formatHebrewRange(props.h)}:{"\t"}
      </span>
      <span class={styles.Pasuk}> {preview()}</span>
    </div>
  );
};

export default KlafIndex;
