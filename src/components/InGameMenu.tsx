import { useGameContext } from "../GameContext";
import styles from "./InGameMenu.module.css";

interface InGameMenuProps {
  onClickContinue: () => void;
  onClickRestart: () => void;
}

const InGameMenu = ({ onClickContinue, onClickRestart }: InGameMenuProps) => {
  const { setIsInMainMenu } = useGameContext();

  return (
    <div className={styles.modal}>
      <div className={styles.content}>
        <h1 className={styles.title}>PAUSE</h1>
        <button className={styles.button} onClick={onClickContinue}>
          CONTINUE GAME
        </button>
        <button className={styles.button} onClick={onClickRestart}>
          RESTART
        </button>
        <button
          className={`${styles.button} ${styles.quit}`}
          onClick={() => {
            setIsInMainMenu(true);
          }}
        >
          QUIT GAME
        </button>
      </div>
    </div>
  );
};

export default InGameMenu;
