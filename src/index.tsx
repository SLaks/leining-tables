/* @refresh reload */
import { render } from "solid-js/web";

import "./index.css";
import Main from "./Main";
import { Route, Router } from "@solidjs/router";
import KlafIndex from "./KlafIndex";
import { TableGenerator } from "./TableGenerator";
import { Locale } from "@hebcal/core";
import { green, purple } from "@suid/material/colors";
import { createTheme, ThemeProvider } from "@suid/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: purple[500] },
    secondary: { main: green[500] },
  },
});

const root = document.getElementById("root");

if (!root) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?"
  );
}

Locale.useLocale("he-x-nonikud");

render(
  () => (
    <ThemeProvider theme={theme}>
      <Router>
        <Route path="/" component={Main} />
        <Route path="/klaf-index/:sefer?" component={KlafIndex} />
        <Route path="/generate-table" component={TableGenerator} />
      </Router>
    </ThemeProvider>
  ),
  root
);
