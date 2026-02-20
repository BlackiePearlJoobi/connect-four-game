import { useState } from "react";
import { useGameContext } from "./GameContext";
import styles from "./components/MainMenu.module.css";
import InGame from "./components/InGame";
import Rules from "./components/Rules";

function App() {
  const { setOpponent, isInMainMenu, setIsInMainMenu } = useGameContext();

  const [isRuleClicked, setIsRuleClicked] = useState(false);

  const basePath = import.meta.env.BASE_URL;

  return (
    <div>
      {isInMainMenu && (
        <div className={styles.background}>
          <section className={styles.menuContainer}>
            <div className={styles.logoContainer}>
              <img
                src={`${basePath}/assets/images/logo.svg`}
                alt="Game logo"
                className={styles.logo}
              />
            </div>
            <div className={styles.buttonContainer}>
              <button
                className={`${styles.menuButton} ${styles.vsEasyButton}`}
                onClick={() => {
                  setOpponent("CPU_easy");
                  setIsInMainMenu(false);
                  setIsRuleClicked(false);
                }}
              >
                <span className={styles.buttonLabel}>
                  PLAY VS CPU &#40;EASY&#41;
                </span>
                <img
                  src={`${basePath}/assets/images/player-vs-cpu-orange.svg`}
                  alt="player and cpu"
                  className={styles.buttonIcon}
                ></img>
              </button>
              <button
                className={`${styles.menuButton} ${styles.vsMediumButton}`}
                onClick={() => {
                  setOpponent("CPU_medium");
                  setIsInMainMenu(false);
                  setIsRuleClicked(false);
                }}
              >
                <span className={styles.buttonLabel}>
                  PLAY VS CPU &#40;MEDIUM&#41;
                </span>
                <img
                  src={`${basePath}/assets/images/player-vs-cpu.svg`}
                  alt="player and cpu"
                  className={styles.buttonIcon}
                ></img>
              </button>
              <button
                className={`${styles.menuButton} ${styles.vsPlayerButton}`}
                onClick={() => {
                  setOpponent("human");
                  setIsInMainMenu(false);
                  setIsRuleClicked(false);
                }}
              >
                <span className={styles.buttonLabel}>PLAY VS PLAYER</span>
                <img
                  src={`${basePath}/assets/images/player-vs-player.svg`}
                  alt="player and player"
                  className={styles.buttonIcon}
                ></img>
              </button>
              <button
                className={styles.menuButton}
                onClick={() => {
                  setIsInMainMenu(false);
                  setIsRuleClicked(true);
                }}
              >
                <span className={styles.buttonLabel}>GAME RULES</span>
              </button>
            </div>
          </section>
          <footer>
            <p className={styles.attribution}>
              Coded by&nbsp;
              <a
                href="https://github.com/BlackiePearlJoobi"
                target="_blank"
                aria-label="Visit Kohta Kumazaki's GitHub profile"
              >
                Kohta Kumazaki
              </a>
            </p>
          </footer>
        </div>
      )}
      {!isInMainMenu && <InGame></InGame>}
      {!isInMainMenu && isRuleClicked && <Rules></Rules>}
    </div>
  );
}

export default App;
