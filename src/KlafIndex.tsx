import { type Component } from "solid-js";

import styles from "./KlafIndex.module.css";
import { getAllHaftaros } from "./logic/haftaros";
import { formatHebrewRange, getSefer, toSortableIndex } from "./names";
import { createAsync, query, useParams } from "@solidjs/router";
import { byNumber, byValue } from "sort-es";
import { getFirstPasuk } from "./logic/sefaria";
import { Aliyah } from "@hebcal/leyning";
import { noGeniza } from "./logic/no-geniza";

const haftaros = getAllHaftaros();

const bySefer = Object.groupBy(haftaros, (h) => getSefer(h.k));

const firstPasuk = query(getFirstPasuk, "firstPasuk");

const KlafIndex: Component = () => {
  console.log(haftaros);
  const params = useParams();
  const sefer = () => decodeURIComponent(params.sefer);

  return (
    <div class={styles.Root}>
      <header class={styles.Header}>
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
        <h2>Sefer: {sefer()}</h2>
      </header>
      <ol class={styles.List} dir="rtl">
        {bySefer[sefer()]
          ?.sort(byValue(toSortableIndex, byNumber()))
          .map((h) => {
            return (
              <li>
                <HaftaraDisplay h={h} />
              </li>
            );
          })}
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
