import type { Component } from "solid-js";

import logo from "./logo.svg";
import styles from "./App.module.css";

const Main: Component = () => {
  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <img src={logo} class={styles.logo} alt="logo" />
        <a class={styles.link} href="/klaf-index">
          Klaf Index
        </a>
        <a class={styles.link} href="/generate-table">
          Klaf Index
        </a>
      </header>
    </div>
  );
};

export default Main;
