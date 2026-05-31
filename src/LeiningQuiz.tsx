import { type Component, createSignal, Show, onMount } from "solid-js";
import {
  createTheme,
  ThemeProvider,
  Button,
  Checkbox,
  FormControlLabel,
  Switch,
  CircularProgress,
  Card,
  CardContent,
  Typography,
  Stack,
} from "@suid/material";
import { PronunciationToggle } from "./ui/PronunciationToggle";
import { usePersistentState } from "./ui/usePersistentState";
import { gematriya, Locale } from "@hebcal/core";
import { toHebrew, toSefariaUrl } from "./names";
import styles from "./LeiningQuiz.module.css";
import { purple } from "@suid/material/colors";
import { getAllHaftaros } from "./logic/haftaros";
import { fetchRefVerses, type Pasuk } from "./logic/sefaria";
import parshaJson from "@hebcal/leyning/dist/esm/aliyot.json";
import yomTovJson from "@hebcal/leyning/dist/esm/holiday-readings.json";
import { Aliyah } from "@hebcal/leyning";

interface Portion {
  type: "parsha" | "haftara";
  englishKey: string;
  hebrewName: string;
  ref: string;
}

const ChumashBooks = [
  "",
  "Genesis",
  "Exodus",
  "Leviticus",
  "Numbers",
  "Deuteronomy",
];

const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: purple[700] },
  },
});

function getHaftaraContext(h: Aliyah, isSeph: boolean): string {
  for (const key in parshaJson) {
    const p = parshaJson[key];
    if (p.combined) continue;
    const rawHaft = (isSeph && p.seph) || p.haft;
    if (rawHaft) {
      const parts = Array.isArray(rawHaft) ? rawHaft : [rawHaft];
      if (parts[0].k === h.k && parts[0].b === h.b) {
        return `הפטרת ${p.hebrew}`;
      }
    }
  }

  for (const key in yomTovJson) {
    const y = yomTovJson[key];
    const rawHaft = (isSeph && y.seph) || y.haft;
    if (rawHaft) {
      const parts = Array.isArray(rawHaft) ? rawHaft : [rawHaft];
      if (parts[0].k === h.k && parts[0].b === h.b) {
        const title = Locale.gettext(key, "he-x-nonikud");
        return `הפטרת ${title}`;
      }
    }
  }

  return `הפטרת ${toHebrew(h.k)}`;
}

const LeiningQuiz: Component = () => {
  const [isSephardic, setSephardic] = usePersistentState(
    "TableGenerator/isSephardic",
    false
  );
  const [includeParshiyos, setIncludeParshiyos] = usePersistentState(
    "LeiningQuiz/includeParshiyos",
    true
  );
  const [includeHaftaros, setIncludeHaftaros] = usePersistentState(
    "LeiningQuiz/includeHaftaros",
    true
  );
  const [showNikud, setShowNikud] = usePersistentState(
    "LeiningQuiz/showNikud",
    true
  );

  const [selectedPasuk, setSelectedPasuk] = createSignal<Pasuk | null>(null);
  const [showAnswer, setShowAnswer] = createSignal(false);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal("");

  const getPortionsList = (): Portion[] => {
    const portions: Portion[] = [];
    const isSeph = isSephardic();

    if (includeParshiyos()) {
      for (const englishKey in parshaJson) {
        const p = parshaJson[englishKey];
        if (p.combined) continue;
        portions.push({
          type: "parsha",
          englishKey,
          hebrewName: `פרשת ${p.hebrew}`,
          ref: `${ChumashBooks[p.book]} ${p.fullkriyah["1"][0]}-${p.fullkriyah["7"][1]}`,
        });
      }
    }

    if (includeHaftaros()) {
      const allHaftaros = getAllHaftaros(isSeph);
      allHaftaros.forEach((h) => {
        portions.push({
          type: "haftara",
          englishKey: h.k,
          hebrewName: getHaftaraContext(h, isSeph),
          ref: `${h.k} ${h.b}-${h.e}`,
        });
      });
    }

    return portions;
  };

  const pickNewPasuk = async () => {
    const portions = getPortionsList();
    if (portions.length === 0) {
      setError("אנא בחר לפחות קטגוריה אחת (פרשיות או הפטרות)");
      setSelectedPasuk(null);
      return;
    }
    setError("");
    setLoading(true);
    setShowAnswer(false);

    try {
      const randomPortion = portions[Math.floor(Math.random() * portions.length)];
      const verses = await fetchRefVerses(randomPortion.ref, randomPortion.hebrewName);
      if (verses.length === 0) {
        throw new Error("לא נמצאו פסוקים בקטע שנבחר.");
      }
      const randomVerse = verses[Math.floor(Math.random() * verses.length)];
      setSelectedPasuk(randomVerse);
    } catch (err) {
      setError("שגיאה בטעינת הפסוק: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  onMount(() => {
    pickNewPasuk();
  });

  const cleanText = (txt: string) => {
    return showNikud() ? txt : Locale.hebrewStripNikkud(txt);
  };

  const formattedLocation = (v: Pasuk) => {
    return `${toHebrew(v.book)} ${gematriya(v.chapter)}:${gematriya(v.verse)}`;
  };

  const sefariaUrl = (v: Pasuk) => {
    return toSefariaUrl({ k: v.book, b: `${v.chapter}:${v.verse}`, e: "" } as Aliyah);
  };

  return (
    <div class={styles.Root}>
      <header class={styles.Header}>
        <h1>Leining Quiz</h1>
        <a class={styles.link} href="/">
          Home
        </a>
      </header>

      <div class={styles.ContentWrapper}>
        <aside class={styles.SettingsSidebar}>
          <ThemeProvider theme={lightTheme}>

            <PronunciationToggle
              value={isSephardic()}
              onChange={(v) => {
                setSephardic(v);
                pickNewPasuk();
              }}
            />

            <Stack  sx={{ mt: 2 }} dir="rtl">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeParshiyos()}
                    onChange={(e, checked) => {
                      setIncludeParshiyos(checked);
                      pickNewPasuk();
                    }}
                  />
                }
                label="פרשיות"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeHaftaros()}
                    onChange={(e, checked) => {
                      setIncludeHaftaros(checked);
                      pickNewPasuk();
                    }}
                  />
                }
                label="הפטרות"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={showNikud()}
                    onChange={(e, checked) => setShowNikud(checked)}
                  />
                }
                label="נקודות"
              />
            </Stack>
          </ThemeProvider>
        </aside>

      <main class={styles.QuizArea}>
        <Show when={loading()}>
          <div class={styles.Center}>
            <CircularProgress size={60} color="secondary" />
            <Typography sx={{ mt: 2 }}>טוען פסוק אקראי...</Typography>
          </div>
        </Show>

        <Show when={error()}>
          <div class={styles.Center}>
            <Typography color="error" variant="h6">
              {error()}
            </Typography>
            <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={pickNewPasuk}>
              נסה שוב
            </Button>
          </div>
        </Show>

        <Show when={!loading() && !error() && selectedPasuk()}>
          {(pasuk) => (
            <div class={styles.QuizContent}>
              <Card
                class={styles.PasukCard}
                onClick={() => setShowAnswer(true)}
                style={{ cursor: showAnswer() ? "default" : "pointer" }}
              >
                <CardContent>
                  <div class={styles.PasukText} dir="rtl">
                    {cleanText(pasuk().text)}
                  </div>
                  <Show when={!showAnswer()}>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: "center" }}>
                      (לחץ על הפסוק כדי לגלות את המקור)
                    </Typography>
                  </Show>
                </CardContent>
              </Card>

              <Show when={showAnswer()}>
                <div class={styles.AnswerArea}>
                  <Typography variant="h4" component="div" sx={{ fontWeight: "bold" }}>
                    {pasuk().portionName}
                  </Typography>
                  <Typography variant="h5" sx={{ color: "text.secondary", mt: 1 }}>
                    {formattedLocation(pasuk())}
                  </Typography>

                  <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
                    <Button variant="contained" color="secondary" size="large" onClick={pickNewPasuk}>
                      פסוק הבא
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      component="a"
                      href={sefariaUrl(pasuk())}
                      target="_blank"
                    >
                      צפה בספאריה
                    </Button>
                  </Stack>
                </div>
              </Show>
            </div>
          )}
        </Show>
      </main>
    </div>
  </div>
);
};

export default LeiningQuiz;
