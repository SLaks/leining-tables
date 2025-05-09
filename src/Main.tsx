import type { Component } from "solid-js";

import torah from "./assets/torah-column.jpg";
import klaf from "./assets/klaf.webp";
import styles from "./App.module.css";
import { Card, CardActionArea, CardContent, Typography } from "@suid/material";

const Main: Component = () => {
  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <div class={styles.CardList}>
          <Card>
            <CardActionArea
              component="a"
              href="/generate-table"
              sx={{ display: "flex" }}
            >
              <div
                class={styles.CardImage}
                style={{ "background-image": `url(${torah})` }}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  Generate spreadsheet of leinings
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  <p>
                    Generate a table listing every leining for one or more
                    years.
                  </p>
                  <ul>
                    <li>
                      Use this to set up a spreadsheet to track who is leining.
                    </li>
                    <li>
                      You can also paste into a spreadsheet to analyze leinings
                      using advanced spreadsheet features.
                    </li>
                  </ul>
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
          <Card>
            <CardActionArea
              component="a"
              href="/klaf-index"
              sx={{ display: "flex" }}
            >
              <div
                class={styles.CardImage}
                style={{ "background-image": `url(${klaf})` }}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  Klaf Index
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  <p>List all הפטרות in each Klaf.</p>
                  <p>
                    Print this on an index card to help locate a הפטרה while
                    scrolling through a Klaf.
                  </p>
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
          <Card>
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                About
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                <ul>
                  <li>
                    All data comes from{" "}
                    <a target="_blank" href="https://www.hebcal.com/home/about">
                      Hebcal
                    </a>
                    .
                  </li>
                  <li>
                    See{" "}
                    <a
                      target="_blank"
                      href="https://github.com/SLaks/leining-tables"
                    >
                      source on GitHub
                    </a>
                    .
                  </li>
                </ul>
                <div dir="rtl" style={{ "text-align": "center" }}>
                  לעילוי נשמת{" "}
                  <a target="_blank" href="https://www.drleff.org/">
                    נתן חיים בן אריה ז״ל
                  </a>
                </div>
              </Typography>
            </CardContent>
          </Card>
        </div>
      </header>
    </div>
  );
};

export default Main;
