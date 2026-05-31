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

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#dfb15b" },
    secondary: { main: "#ffd700" },
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
    false,
  );
  const [includeParshiyos, setIncludeParshiyos] = usePersistentState(
    "LeiningQuiz/includeParshiyos",
    true,
  );
  const [includeHaftaros, setIncludeHaftaros] = usePersistentState(
    "LeiningQuiz/includeHaftaros",
    true,
  );
  const [showNikud, setShowNikud] = usePersistentState(
    "LeiningQuiz/showNikud",
    true,
  );

  const [selectedPasuk, setSelectedPasuk] = createSignal<Pasuk | null>(null);
  const [showAnswer, setShowAnswer] = createSignal(false);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal("");

  // History stack navigation
  const [history, setHistory] = createSignal<Pasuk[]>([]);
  const [historyIndex, setHistoryIndex] = createSignal(-1);

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
      const randomPortion =
        portions[Math.floor(Math.random() * portions.length)];
      const verses = await fetchRefVerses(
        randomPortion.ref,
        randomPortion.hebrewName,
      );
      if (verses.length === 0) {
        throw new Error("לא נמצאו פסוקים בקטע שנבחר.");
      }
      const randomVerse = verses[Math.floor(Math.random() * verses.length)];

      // Add to history stack
      const currentHistory = history();
      const nextIndex = historyIndex() + 1;
      const newHistory = [...currentHistory.slice(0, nextIndex), randomVerse];
      setHistory(newHistory);
      setHistoryIndex(nextIndex);

      setSelectedPasuk(randomVerse);
    } catch (err) {
      setError(
        "שגיאה בטעינת הפסוק: " +
          (err instanceof Error ? err.message : String(err)),
      );
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (historyIndex() > 0) {
      const nextIndex = historyIndex() - 1;
      setHistoryIndex(nextIndex);
      setSelectedPasuk(history()[nextIndex]);
      setShowAnswer(false);
    }
  };

  const goForward = async () => {
    if (historyIndex() < history().length - 1) {
      const nextIndex = historyIndex() + 1;
      setHistoryIndex(nextIndex);
      setSelectedPasuk(history()[nextIndex]);
      setShowAnswer(false);
    } else {
      await pickNewPasuk();
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
    return toSefariaUrl({
      k: v.book,
      b: `${v.chapter}:${v.verse}`,
      e: "",
    } as Aliyah);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <div class={styles.Root}>
        {/* Main Header */}
        <header class={styles.Header}>
          <h1 class={styles.MainTitle}>LEINING QUIZ</h1>

          {/* Home Link */}
          <a class={styles.HomeLink} href="/">
            ← Home
          </a>
        </header>

        {/* Minimalist settings row */}
        <div class={styles.OptionsRow}>
          <FormControlLabel
            control={
              <Checkbox
                checked={includeParshiyos()}
                onChange={(e, checked) => {
                  setIncludeParshiyos(checked);
                  pickNewPasuk();
                }}
                sx={{ color: "#dfb15b", "&.Mui-checked": { color: "#dfb15b" } }}
              />
            }
            label={<span class={styles.GoldLabel}>פרשיות</span>}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={includeHaftaros()}
                onChange={(e, checked) => {
                  setIncludeHaftaros(checked);
                  pickNewPasuk();
                }}
                sx={{ color: "#dfb15b", "&.Mui-checked": { color: "#dfb15b" } }}
              />
            }
            label={<span class={styles.GoldLabel}>הפטרות</span>}
          />

          <PronunciationToggle
            value={isSephardic()}
            onChange={(v) => {
              setSephardic(v);
              pickNewPasuk();
            }}
          />
        </div>

        {/* Interactive Main Quiz Area */}
        <main class={styles.QuizArea}>
          <Show when={loading()}>
            <div class={styles.Center}>
              <CircularProgress size={60} sx={{ color: "#dfb15b" }} />
              <Typography sx={{ mt: 2, color: "#dfb15b" }}>
                טוען פסוק אקראי...
              </Typography>
            </div>
          </Show>

          <Show when={error()}>
            <div class={styles.Center}>
              <Typography color="error" variant="h6">
                {error()}
              </Typography>
              <Button
                variant="contained"
                sx={{
                  mt: 2,
                  bgcolor: "#dfb15b",
                  color: "#1a0221",
                  "&:hover": { bgcolor: "#ffe49e" },
                }}
                onClick={pickNewPasuk}
              >
                נסה שוב
              </Button>
            </div>
          </Show>

          <Show when={!loading() && !error() && selectedPasuk()}>
            {(pasuk) => (
              <div class={styles.QuizContent}>
                {/* Parchment styled card */}
                <Card
                  class={styles.PasukCard}
                  onClick={() => setShowAnswer(!showAnswer())}
                  style={{ cursor: "pointer" }}
                >
                  <CardContent>
                    <div class={styles.PasukText} dir="rtl">
                      {cleanText(pasuk().text)}
                    </div>
                  </CardContent>
                </Card>

                {/* Gold Navigation Links */}
                <div class={styles.NavigationFooter}>
                  <Button
                    class={styles.NavButton}
                    disabled={historyIndex() <= 0}
                    onClick={goBack}
                  >
                    〈 PREVIOUS
                  </Button>

                  <div class={styles.TogglePanel}>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <div class={styles.StylizedHebrewLetter}>תִּ</div>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={showNikud()}
                            onChange={(e, checked) => setShowNikud(checked)}
                            sx={{
                              "& .MuiSwitch-switchBase.Mui-checked": {
                                color: "#dfb15b",
                              },
                              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                                { backgroundColor: "#dfb15b" },
                            }}
                          />
                        }
                        label={
                          <span
                            style={{
                              color: "#ffffff",
                              "font-size": "14px",
                              "font-weight": "bold",
                            }}
                          >
                            נקודות
                          </span>
                        }
                        labelPlacement="start"
                      />
                    </Stack>
                  </div>
                  <Button class={styles.NavButton} onClick={goForward}>
                    NEXT 〉
                  </Button>
                </div>

                {/* Collapsible Gold Bordered Reveal Source Button */}
                <Button
                  variant="contained"
                  class={styles.RevealButton}
                  onClick={() => setShowAnswer(!showAnswer())}
                >
                  {showAnswer() ? "HIDE SOURCE ∧" : "REVEAL SOURCE ∨"}
                </Button>

                {/* Answer Reveal Box */}
                <Show when={showAnswer()}>
                  <div class={styles.AnswerArea}>
                    <Typography
                      variant="h4"
                      component="div"
                      sx={{ fontWeight: "bold", color: "#dfb15b" }}
                    >
                      {pasuk().portionName}
                    </Typography>
                    <Typography variant="h5" sx={{ color: "#ffe49e", mt: 1 }}>
                      {formattedLocation(pasuk())}
                    </Typography>

                    <Button
                      variant="outlined"
                      sx={{
                        mt: 2,
                        color: "#dfb15b",
                        borderColor: "#dfb15b",
                        "&:hover": { borderColor: "#ffe49e", color: "#ffe49e" },
                      }}
                      component="a"
                      href={sefariaUrl(pasuk())}
                      target="_blank"
                    >
                      צפה בספריא
                    </Button>
                  </div>
                </Show>
              </div>
            )}
          </Show>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default LeiningQuiz;
