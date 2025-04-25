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
                  Generate Leining Tables
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  <p>Generate a table of leinings for one or more years.</p>
                  <p>
                    Use this to set up a leining tracker spreadsheet, or to
                    analyze leinings in pivot tables.
                  </p>
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
                <p>
                  All data comes from{" "}
                  <a target="_blank" href="https://www.hebcal.com/home/about">
                    Hebcal
                  </a>
                  .
                </p>
                <p dir="rtl">
                  לעילוי נשמת{" "}
                  <a target="_blank" href="https://www.drleff.org/">
                    נתן חיים בן אריה
                  </a>
                </p>
              </Typography>
            </CardContent>
          </Card>
        </div>
      </header>
    </div>
  );
};

export default Main;
