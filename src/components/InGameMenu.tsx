import { useGameContext } from "../GameContext";
import "./InGameMenu.css";

interface InGameMenuProps {
  onClickContinue: () => void;
  onClickRestart: () => void;
}

const InGameMenu = ({ onClickContinue, onClickRestart }: InGameMenuProps) => {
  const { setIsInMainMenu } = useGameContext();

  return (
    <div className="modal">
      <div className="modal-content">
        <h1 className="title">PAUSE</h1>
        <button className="ingame-menu-button" onClick={onClickContinue}>
          CONTINUE GAME
        </button>
        <button className="ingame-menu-button" onClick={onClickRestart}>
          RESTART
        </button>
        <button
          className="ingame-menu-button quit-button"
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
