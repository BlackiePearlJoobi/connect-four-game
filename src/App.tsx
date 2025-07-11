import { useState } from "react";
import { useGameContext } from "./GameContext";
import "./components/MainMenu.css";
import InGame from "./components/InGame";
import Rules from "./components/Rules";

function App() {
  const { setOpponent, isInMainMenu, setIsInMainMenu } = useGameContext();

  const [isRuleClicked, setIsRuleClicked] = useState(false);

  const basePath = import.meta.env.BASE_URL;

  return (
    <div>
      {isInMainMenu && (
        <div className="main-menu-background">
          <section className="main-menu-container">
            <div className="logo-container">
              <img
                src={`${basePath}/assets/images/logo.svg`}
                alt="Game logo"
                className="main-menu-logo"
              />
            </div>
            <div className="button-container">
              <button
                className="menu-button vsEasyButton"
                onClick={() => {
                  setOpponent("CPU_easy");
                  setIsInMainMenu(false);
                  setIsRuleClicked(false);
                }}
              >
                <span className="button-label">PLAY VS CPU &#40;EASY&#41;</span>
                <img
                  src={`${basePath}/assets/images/player-vs-cpu-orange.svg`}
                  alt="player and cpu"
                  className="button-icon"
                ></img>
              </button>
              <button
                className="menu-button vsMediumButton"
                onClick={() => {
                  setOpponent("CPU_medium");
                  setIsInMainMenu(false);
                  setIsRuleClicked(false);
                }}
              >
                <span className="button-label">
                  PLAY VS CPU &#40;MEDIUM&#41;
                </span>
                <img
                  src={`${basePath}/assets/images/player-vs-cpu.svg`}
                  alt="player and cpu"
                  className="button-icon"
                ></img>
              </button>
              <button
                className="menu-button vsPlayerButton"
                onClick={() => {
                  setOpponent("human");
                  setIsInMainMenu(false);
                  setIsRuleClicked(false);
                }}
              >
                <span className="button-label">PLAY VS PLAYER</span>
                <img
                  src={`${basePath}/assets/images/player-vs-player.svg`}
                  alt="player and player"
                  className="button-icon"
                ></img>
              </button>
              <button
                className="menu-button"
                onClick={() => {
                  setIsInMainMenu(false);
                  setIsRuleClicked(true);
                }}
              >
                <span className="button-label">GAME RULES</span>
              </button>
            </div>
          </section>
          <footer>
            <div className="attribution">
              Challenge by&nbsp;
              <a
                href="https://www.frontendmentor.io?ref=challenge"
                target="_blank"
                aria-label="Learn more about challenges on frontendmentor.io"
              >
                Frontend Mentor
              </a>
              . Coded by&nbsp;
              <a
                href="https://www.frontendmentor.io/profile/BlackiePearlJoobi"
                target="_blank"
                aria-label="Visit BlackiePearlJoobi's developer profile on frontendmentor.io"
              >
                Kohta Kumazaki
              </a>
              .
            </div>
          </footer>
        </div>
      )}
      {!isInMainMenu && <InGame></InGame>}
      {!isInMainMenu && isRuleClicked && <Rules></Rules>}
    </div>
  );
}

export default App;
