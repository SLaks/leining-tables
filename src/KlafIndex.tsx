import { createSignal, Show, type Component } from "solid-js";

import styles from "./App.module.css";
import { getAllHaftaros } from "./logic/haftaros";
import { getSefer, toHebrewDisplay, toSortableIndex } from "./names";
import { useParams } from "@solidjs/router";
import { byNumber, byValue } from "sort-es";

const haftaros = getAllHaftaros();

const bySefer = Object.groupBy(haftaros, (h) => getSefer(h.k));

const KlafIndex: Component = () => {
  console.log(haftaros);
  const params = useParams();

  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <h1>Klaf Index</h1>
        <p>Click on a klaf to see the haftaros for that klaf.</p>
        <ul>
          {Object.keys(bySefer).map((k) => {
            return (
              <li>
                <a class={styles.link} href={`/klaf-index/${k}`}>
                  {k}
                </a>
              </li>
            );
          })}
        </ul>
      </header>
      <Show when={params.sefer} keyed>
        <ul>
          {bySefer[decodeURIComponent(params.sefer)]
            ?.sort(byValue(toSortableIndex, byNumber()))
            .map((h) => {
              const summary = toHebrewDisplay(h);
              return <li>{summary}</li>;
            })}
        </ul>
      </Show>
    </div>
  );
};

export default KlafIndex;
