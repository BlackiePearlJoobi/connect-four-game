import { useState } from "react";
import { useGameContext } from "../GameContext";
import styles from "./Rules.module.css";

const Rules = () => {
  const { setIsInMainMenu } = useGameContext();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className={styles.background}>
      <section className={styles.container}>
        <h1 className={styles.mainHeader}>RULES </h1>
        <h2 className={styles.subHeader}>OBJECTIVE</h2>
        <p className={styles.objective}>
          Be the first player to connect 4 of the same colored discs in a row
          (either vertically, horizontally, or diagonally).
        </p>
        <h2 className={styles.subHeader}>HOW TO PLAY</h2>
        <ol className={styles.ruleSet}>
          <li className={styles.description}>
            Red goes first in the first game.
          </li>
          <li className={styles.description}>
            Players must alternate turns, and only one disc can be dropped in
            each turn.
          </li>
          <li className={styles.description}>
            The game ends when there is a 4-in-a-row or a stalemate.
          </li>
          <li className={styles.description}>
            The starter of the previous game goes second on the next game.
          </li>
        </ol>
        <button
          className={styles.button}
          tabIndex={0}
          onClick={() => setIsInMainMenu(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              setIsInMainMenu(true);
            }
          }}
        >
          <img
            src={`${import.meta.env.BASE_URL}/assets/images/${
              isHovered ? "icon-check-hover.svg" : "icon-check.svg"
            }`}
            alt="check icon"
            className={styles.icon}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          ></img>
        </button>
      </section>
    </div>
  );
};

export default Rules;
