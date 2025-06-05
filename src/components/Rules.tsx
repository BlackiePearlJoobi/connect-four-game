import { useState } from "react";
import { useGameContext } from "../GameContext";
import "./Rules.css";

const Rules = () => {
  const { setIsInMainMenu } = useGameContext();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="rules-background">
      <section className="rules-container">
        <h1 className="main-header">RULES </h1>
        <h2 className="sub-header">OBJECTIVE</h2>
        <p className="objective-description">
          Be the first player to connect 4 of the same colored discs in a row
          (either vertically, horizontally, or diagonally).
        </p>
        <h2 className="sub-header">HOW TO PLAY</h2>
        <ol className="rule-set">
          <li className="rule-description">
            Red goes first in the first game.
          </li>
          <li className="rule-description">
            Players must alternate turns, and only one disc can be dropped in
            each turn.
          </li>
          <li className="rule-description">
            The game ends when there is a 4-in-a-row or a stalemate.
          </li>
          <li className="rule-description">
            The starter of the previous game goes second on the next game.
          </li>
        </ol>
        <button className="check-button">
          <img
            src={`${import.meta.env.BASE_URL}/assets/images/${
              isHovered ? "icon-check-hover.svg" : "icon-check.svg"
            }`}
            alt="check icon"
            className="check-icon"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => setIsInMainMenu(true)}
          ></img>
        </button>
      </section>
    </div>
  );
};

export default Rules;
