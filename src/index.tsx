/* @refresh reload */
import { render } from "solid-js/web";

import "./index.css";
import Main from "./Main";
import { Route, Router } from "@solidjs/router";
import KlafIndex from "./KlafIndex";
import { TableGenerator } from "./TableGenerator";
import { Locale } from "@hebcal/core";

const root = document.getElementById("root");

if (!root) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?"
  );
}

Locale.useLocale("he-x-nonikud");

render(
  () => (
    <Router>
      <Route path="/" component={Main} />
      <Route path="/klaf-index/:sefer?" component={KlafIndex} />
      <Route path="/generate-table" component={TableGenerator} />
    </Router>
  ),
  root
);
