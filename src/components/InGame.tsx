import { useState, useEffect } from "react";
import { useGameContext } from "../GameContext";
import "./InGame.css";
import InGameMenu from "./InGameMenu";

const InGame = () => {
  // game states
  const { opponent } = useGameContext();
  const [starter, setStarter] = useState("left");
  const [isLeftTurn, setIsLeftTurn] = useState(true);
  // const [isCPUTurn, setIsCPUTurn] = useState(false);
  const [hasLeftWon, setHasLeftWon] = useState(false);
  const [hasRightWon, setHasRightWon] = useState(false);
  const [isDraw, setIsDraw] = useState(false);
  const [leftScore, setLeftScore] = useState(0);
  const [rightScore, setRightScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const [isHovered, setIsHovered] = useState<{ [key: number]: boolean }>({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
  }); // for showing the column marker

  const [hasAppeared, setHasAppeared] = useState<{ [key: string]: boolean }>(
    {},
  ); // for preventing drop animation from repeating on the same piece

  const updateHasAppeared = (col: number) => {
    const targetSquareId = ((columnLevels[col] + 1) * 10 + col).toString();

    // wait for drop animation to end (200ms)
    setTimeout(() => {
      setHasAppeared((prev) => ({
        ...prev,
        [targetSquareId]: true,
      }));
    }, 200);
  };

  type Color = "red" | "yellow" | "blank";

  const [pieceColors, setPieceColors] = useState<{ [key: string]: Color }>({}); // each piece's color

  const [columnLevels, setColumnLevels] = useState<{ [key: number]: number }>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
  }); // each column's current "height"

  const [lastPlacedId, setLastPlacedId] = useState<string | null>(null);

  const [connectedPieces, setConnectedPieces] = useState<string[]>([]); // for showing white circles

  const [timer, setTimer] = useState(15);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    console.log("Updated columnLevels:", columnLevels);
  }, [columnLevels]);

  useEffect(() => {
    console.log("Updated pieceColors:", pieceColors);
  }, [pieceColors]);

  /*
  useEffect(() => {
    console.log("lastPlacedId:", lastPlacedId);
  }, [lastPlacedId]);

  useEffect(() => {
    console.log("Updated isLeftTurn:", isLeftTurn);
  }, [isLeftTurn]);

  useEffect(() => {
    console.log("Updated hasLeftWon:", hasLeftWon);
  }, [hasLeftWon]);

  useEffect(() => {
    console.log("starter:", starter);
  }, [starter]);

  useEffect(() => {
    console.log("ConnectedPieces:", connectedPieces);
  }, [connectedPieces]);
  */

  // piece components
  type PieceProps = {
    id: string;
    color: Color;
  };

  const Piece = ({ id, color }: PieceProps) => {
    return color === "blank" ? null : (
      <div
        className={`piece ${id === lastPlacedId && !hasAppeared[id] && "drop-animation"}`}
        color={color}
      >
        <img
          src={`${basePath}/assets/images/counter-${color}-small.svg`}
          className="piece-image"
        />
      </div>
    );
  };

  // click events
  const updatePieceColors = (col: number): void => {
    if (columnLevels[col] === 6 || hasLeftWon || hasRightWon || isDraw) return;

    const targetSquareId = ((columnLevels[col] + 1) * 10 + col).toString();

    setPieceColors((prevColors) => ({
      ...prevColors,
      [targetSquareId]: isLeftTurn ? "red" : "yellow",
    }));
  };

  const updateLastPlacedId = (col: number): void => {
    if (columnLevels[col] === 6 || hasLeftWon || hasRightWon || isDraw) return;

    const targetSquareId = ((columnLevels[col] + 1) * 10 + col).toString();

    setLastPlacedId(targetSquareId);
  };

  const updateColumnLevels = (col: number): void => {
    if (columnLevels[col] === 6 || hasLeftWon || hasRightWon || isDraw) return;

    setColumnLevels((prevLevels) => ({
      ...prevLevels,
      [col]: prevLevels[col] + 1,
    }));
  };

  // check for four consecutive pieces
  useEffect(() => {
    if (!lastPlacedId) return;
    const column = parseInt(lastPlacedId.charAt(1));
    checkSequence(column);
  }, [columnLevels, pieceColors, lastPlacedId]);

  const checkSequence = (col: number): void => {
    if (hasLeftWon || hasRightWon || isDraw) return;

    const targetSquareId = (columnLevels[col] * 10 + col).toString();

    if (
      checkRow(targetSquareId) ||
      checkColumn(targetSquareId) ||
      checkRightDiagonal(targetSquareId) ||
      checkLeftDiagonal(targetSquareId)
    ) {
      if (isLeftTurn) {
        setHasLeftWon(true);
        setLeftScore((prev) => prev + 1);
      } else {
        setHasRightWon(true);
        setRightScore((prev) => prev + 1);
      }
      return;
    }

    // this condition check prevents unnecessary turn changes; a change in columLevels may trigger checkSequence (e.g., restartGame)
    if (Object.values(pieceColors).length !== 0) {
      setIsLeftTurn((prev) => !prev);
      setTimer(15);
    }
  };

  const checkRow = (id: string): boolean => {
    const row = parseInt(id.charAt(0));
    let currentColumn = 1;
    const targetColor: Color = isLeftTurn ? "red" : "yellow";
    let series = 0;
    const connectedGroup: string[] = [];

    while (currentColumn <= 7) {
      const currentSquareId = `${row}${currentColumn}`;

      if (pieceColors[currentSquareId] === targetColor) {
        series++;
        connectedGroup.push(currentSquareId);
        if (series >= 4) {
          setConnectedPieces((prev) => [...prev, ...connectedGroup]);
          return true;
        }
      } else {
        series = 0;
        connectedGroup.length = 0;
      }
      //   console.log("Row series:", series);
      //   console.log("ConnectedGroup:", connectedGroup);

      currentColumn++;
    }

    return false;
  };

  const checkColumn = (id: string): boolean => {
    const column = parseInt(id.charAt(1));
    let currentRow = parseInt(id.charAt(0));
    const endRow = currentRow - 3;
    const targetColor: Color = isLeftTurn ? "red" : "yellow";
    let series = 0;
    const connectedGroup: string[] = [];

    while (currentRow >= endRow) {
      const currentSquareId = `${currentRow}${column}`;

      if (pieceColors[currentSquareId] === targetColor) {
        series++;
        connectedGroup.push(currentSquareId);
        if (series === 4) {
          setConnectedPieces((prev) => [...prev, ...connectedGroup]);
          return true;
        }
      } else {
        series = 0;
        connectedGroup.length = 0;
      }
      //   console.log("Column series:", series);

      currentRow--;
    }

    return false;
  };

  const checkRightDiagonal = (id: string): boolean => {
    const row = parseInt(id.charAt(0));
    const column = parseInt(id.charAt(1));
    if (row - column >= 3 || row - column <= -4) return false;
    let currentRow = row - column === 2 ? 3 : row - column === 1 ? 2 : 1;
    let currentColumn =
      row - column >= 0
        ? 1
        : row - column === -1
          ? 2
          : row - column === -2
            ? 3
            : 4;
    const targetColor: Color = isLeftTurn ? "red" : "yellow";
    let series = 0;
    const connectedGroup: string[] = [];

    while (currentRow <= 6 && currentColumn <= 7) {
      const currentSquareId = `${currentRow}${currentColumn}`;

      if (pieceColors[currentSquareId] === targetColor) {
        series++;
        connectedGroup.push(currentSquareId);
        if (series >= 4) {
          setConnectedPieces((prev) => [...prev, ...connectedGroup]);
          return true;
        }
      } else {
        series = 0;
        connectedGroup.length = 0;
      }
      //   console.log("RightDiagonal series:", series);

      currentRow++;
      currentColumn++;
    }

    return false;
  };

  const checkLeftDiagonal = (id: string): boolean => {
    const row = parseInt(id.charAt(0));
    const column = parseInt(id.charAt(1));
    if (row + column >= 11 || row + column <= 4) return false;
    let currentRow = row + column === 10 ? 3 : row + column === 9 ? 2 : 1;
    let currentColumn =
      row + column === 5
        ? 4
        : row + column === 6
          ? 5
          : row + column === 7
            ? 6
            : 7;
    const targetColor: Color = isLeftTurn ? "red" : "yellow";
    let series = 0;
    const connectedGroup: string[] = [];

    while (currentRow <= 6 && currentColumn >= 1) {
      const currentSquareId = `${currentRow}${currentColumn}`;

      if (pieceColors[currentSquareId] === targetColor) {
        series++;
        connectedGroup.push(currentSquareId);
        if (series >= 4) {
          setConnectedPieces((prev) => [...prev, ...connectedGroup]);
          return true;
        }
      } else {
        series = 0;
        connectedGroup.length = 0;
      }
      //   console.log("LeftDiagonal series:", series);

      currentRow++;
      currentColumn--;
    }

    return false;
  };

  // check for a stalemate
  useEffect(() => {
    const occupiedSquares = Object.values(columnLevels).reduce(
      (sum, level) => sum + level,
      0,
    );

    if (occupiedSquares === 42) {
      setIsDraw(true);
    }
  }, [columnLevels]);

  // countdown timer
  useEffect(() => {
    if (isTimerRunning && timer > 0) {
      const clock = setInterval(
        () => setTimer((prevTimer) => prevTimer - 1),
        1000,
      );
      return () => clearInterval(clock);
    }

    if (timer === 0) {
      if (!isLeftTurn) {
        setHasLeftWon(true);
        setLeftScore((prev) => prev + 1);
      } else {
        setHasRightWon(true);
        setRightScore((prev) => prev + 1);
      }
    }
  }, [timer, isTimerRunning]);

  // CPU movement
  useEffect(() => {
    if (opponent === "CPU_easy" && !isLeftTurn) {
      setTimeout(cpuEasyMove, 500);
    }
  }, [isLeftTurn, starter]);

  const cpuEasyMove = (): void => {
    let targetCol: number | null = null;

    if (lastPlacedId === null) {
      // if it's the initial move of the game, select the middle column
      targetCol = 4;
    } else {
      for (let i = 1; i <= 7; i++) {
        if (columnLevels[i] === 6) continue;
        const targetSquareId = ((columnLevels[i] + 1) * 10 + i).toString();

        if (
          // check if it can connect four pieces
          simulateRow(targetSquareId, "yellow") ||
          simulateColumn(targetSquareId, "yellow") ||
          simulateRightDiagonal(targetSquareId, "yellow") ||
          simulateLeftDiagonal(targetSquareId, "yellow") ||
          // check if the opponent (human) will connect four next turn
          simulateRow(targetSquareId, "red") ||
          simulateColumn(targetSquareId, "red") ||
          simulateRightDiagonal(targetSquareId, "red") ||
          simulateLeftDiagonal(targetSquareId, "red")
        ) {
          targetCol = i;
          break;
        }
      }
    }
    // console.log("targetCol:", targetCol);

    // default: select a random column
    if (!targetCol) {
      do {
        targetCol = getRandomInt(1, 7);
      } while (columnLevels[targetCol] === 6);
    }

    updatePieceColors(targetCol);
    updateLastPlacedId(targetCol);
    updateColumnLevels(targetCol);
    updateHasAppeared(targetCol);
  };

  const getRandomInt = (min: number, max: number): number =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const simulateRow = (id: string, color: Color): boolean => {
    const row = parseInt(id.charAt(0));
    let currentColumn = 1;
    let series = 0;

    const pieceColorsTemp: { [key: string]: Color } = { ...pieceColors };
    pieceColorsTemp[id] = color;

    while (currentColumn <= 7) {
      const currentSquareId = `${row}${currentColumn}`;

      if (pieceColorsTemp[currentSquareId] === color) {
        series++;
        if (series === 4) {
          return true;
        }
      } else {
        series = 0;
      }

      currentColumn++;
    }

    return false;
  };

  const simulateColumn = (id: string, color: Color): boolean => {
    const column = parseInt(id.charAt(1));
    let currentRow = parseInt(id.charAt(0));
    const endRow = currentRow - 3;
    let series = 0;

    const pieceColorsTemp: { [key: string]: Color } = { ...pieceColors };
    pieceColorsTemp[id] = color;

    while (currentRow >= endRow) {
      const currentSquareId = `${currentRow}${column}`;

      if (pieceColorsTemp[currentSquareId] === color) {
        series++;
        if (series === 4) {
          return true;
        }
      } else {
        series = 0;
      }

      currentRow--;
    }

    return false;
  };

  const simulateRightDiagonal = (id: string, color: Color): boolean => {
    const row = parseInt(id.charAt(0));
    const column = parseInt(id.charAt(1));
    if (row - column >= 3 || row - column <= -4) return false;
    let currentRow = row - column === 2 ? 3 : row - column === 1 ? 2 : 1;
    let currentColumn =
      row - column >= 0
        ? 1
        : row - column === -1
          ? 2
          : row - column === -2
            ? 3
            : 4;
    let series = 0;

    const pieceColorsTemp: { [key: string]: Color } = { ...pieceColors };
    pieceColorsTemp[id] = color;

    while (currentRow <= 6 && currentColumn <= 7) {
      const currentSquareId = `${currentRow}${currentColumn}`;

      if (pieceColorsTemp[currentSquareId] === color) {
        series++;
        if (series === 4) {
          return true;
        }
      } else {
        series = 0;
      }

      currentRow++;
      currentColumn++;
    }

    return false;
  };

  const simulateLeftDiagonal = (id: string, color: Color): boolean => {
    const row = parseInt(id.charAt(0));
    const column = parseInt(id.charAt(1));
    if (row + column >= 11 || row + column <= 4) return false;
    let currentRow = row + column === 10 ? 3 : row + column === 9 ? 2 : 1;
    let currentColumn =
      row + column === 5
        ? 4
        : row + column === 6
          ? 5
          : row + column === 7
            ? 6
            : 7;
    let series = 0;

    const pieceColorsTemp: { [key: string]: Color } = { ...pieceColors };
    pieceColorsTemp[id] = color;

    while (currentRow <= 6 && currentColumn >= 1) {
      const currentSquareId = `${currentRow}${currentColumn}`;

      if (pieceColorsTemp[currentSquareId] === color) {
        series++;
        if (series === 4) {
          return true;
        }
      } else {
        series = 0;
      }

      currentRow++;
      currentColumn--;
    }

    return false;
  };

  // events for nav buttons
  const continueGame = () => {
    setIsPaused(false);
    setIsTimerRunning(true);
  };

  const callRestartGame = () => {
    setIsPaused(false);
    restartGame();
  };

  // move on to the next game
  const playNextGame = (): void => {
    setColumnLevels({
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
    });
    setPieceColors({});
    setLastPlacedId(null);
    setConnectedPieces([]);
    setHasAppeared({});
    if (starter === "left") {
      setStarter("right");
      setIsLeftTurn(false);
    } else {
      setStarter("left");
      setIsLeftTurn(true);
    }
    setHasLeftWon(false);
    setHasRightWon(false);
    setIsDraw(false);
    setTimer(15);
    setIsTimerRunning(true);
  };

  // restart a game
  const restartGame = (): void => {
    setColumnLevels({
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
    });
    setPieceColors({});
    setLastPlacedId(null);
    setConnectedPieces([]);
    setHasAppeared({});
    setStarter("left");
    setIsLeftTurn(true);
    setHasLeftWon(false);
    setHasRightWon(false);
    setIsDraw(false);
    setLeftScore(0);
    setRightScore(0);
    setTimer(15);
    setIsTimerRunning(true);
  };

  // base path for the images
  const basePath = import.meta.env.BASE_URL;

  return (
    <div className="ingame-background">
      <section className="ingame-container">
        <nav className="nav-container">
          <button
            className="nav-button nav-button-menu"
            onClick={() => {
              setIsPaused(true);
              setIsTimerRunning(false);
            }}
          >
            MENU
          </button>
          <img
            src={`${basePath}/assets/images/logo.svg`}
            alt="Game logo"
            className="ingame-logo"
          />
          <button className="nav-button" onClick={restartGame}>
            RESTART
          </button>
        </nav>
        <div className="scoreboards-container">
          <div className="score-container left-score-container">
            <img
              src={`${basePath}/assets/images/${opponent !== "human" ? "you.svg" : "player-one.svg"}`}
              alt={`${opponent !== "human" ? "your icon" : "player 1 icon"}`}
              className="player-icon icon-left"
            />
            <div className="name-score-container">
              <span className="player-name">
                {opponent !== "human" ? "YOU" : "PLAYER 1"}
              </span>
              <span className="score">{leftScore}</span>
            </div>
          </div>
          <div className="score-container right-score-container">
            <div className="name-score-container">
              <span className="player-name">
                {opponent !== "human" ? "CPU" : "PLAYER 2"}
              </span>
              <span className="score">{rightScore}</span>
            </div>
            <img
              src={`${basePath}/assets/images/${opponent !== "human" ? "cpu.svg" : "player-two.svg"}`}
              alt={`${opponent !== "human" ? "CPU icon" : "player 2 icon"}`}
              className="player-icon icon-right"
            />
          </div>
        </div>
        <div className="game-board-container">
          <div className="game-board-back"></div>
          <div className="game-board-middle">
            {[...Array(42)].map((_, i) => {
              const row: number = 6 - Math.floor(i / 7);
              const col: number = (i % 7) + 1;
              const id: string = (row * 10 + col).toString();

              return (
                <div id={id} className="square" key={id}>
                  <Piece color={pieceColors[id] || "blank"} id={id}></Piece>
                  {connectedPieces.includes(id) && (
                    <div className="circle"></div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="game-board-front"></div>
          <div className="game-board-surface">
            {[...Array(7)].map((_, i) => {
              const col = i + 1;
              return (
                <div
                  className="column"
                  id={col.toString()}
                  key={col.toString()}
                  onClick={() => {
                    updatePieceColors(col);
                    updateLastPlacedId(col);
                    updateColumnLevels(col);
                    updateHasAppeared(col);
                  }}
                  onMouseEnter={() =>
                    setIsHovered((prev) => ({
                      ...prev,
                      [col]: true,
                    }))
                  }
                  onMouseLeave={() =>
                    setIsHovered((prev) => ({
                      ...prev,
                      [col]: false,
                    }))
                  }
                >
                  {isHovered[col] && !hasLeftWon && !hasRightWon && !isDraw && (
                    <img
                      src={`${basePath}/assets/images/marker-${isLeftTurn ? "red" : "yellow"}.svg`}
                      className="marker"
                    ></img>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {!isDraw && !hasLeftWon && !hasRightWon ? (
          <div
            className={`player-turn ${isLeftTurn ? "left-turn" : "right-turn"}`}
          >
            <span className="current-player">
              {opponent !== "human" && isLeftTurn
                ? "YOUR"
                : opponent !== "human" && !isLeftTurn
                  ? "CPU'S"
                  : opponent === "human" && isLeftTurn
                    ? "PLAYER 1'S"
                    : "PLAYER 2'S"}{" "}
              TURN
            </span>
            <span
              className={`timer ${timer <= 5 && "yellow"} ${timer <= 3 && "red"} `}
            >
              {timer}s
            </span>
          </div>
        ) : (
          <div className="result-container">
            <span className="player-name">
              {isDraw
                ? ""
                : opponent !== "human" && hasLeftWon
                  ? "YOU"
                  : opponent !== "human" && hasRightWon
                    ? "CPU"
                    : opponent === "human" && hasLeftWon
                      ? "PLAYER 1"
                      : "PLAYER 2"}
            </span>
            <span className="result">
              {isDraw
                ? "DRAW"
                : opponent !== "human" && hasLeftWon
                  ? "WIN"
                  : "WINS"}
            </span>
            <button className="restart-button-result" onClick={playNextGame}>
              PLAY AGAIN
            </button>
          </div>
        )}
      </section>
      <div
        className={`underlay ${hasLeftWon && "left-wins"} ${hasRightWon && "right-wins"}`}
      ></div>
      {isPaused && (
        <InGameMenu
          onClickContinue={continueGame}
          onClickRestart={callRestartGame}
        ></InGameMenu>
      )}
    </div>
  );
};

export default InGame;
