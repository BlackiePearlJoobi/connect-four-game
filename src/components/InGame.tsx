import { useState, useEffect } from "react";
import { useGameContext } from "../GameContext";
import styles from "./InGame.module.css";
import InGameMenu from "./InGameMenu";

const InGame = () => {
  // game states
  const { opponent } = useGameContext();
  const [starter, setStarter] = useState("left");
  const [isLeftTurn, setIsLeftTurn] = useState(true);
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
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // piece components
  type PieceProps = {
    id: string;
    color: Color;
  };

  const Piece = ({ id, color }: PieceProps) => {
    return color === "blank" ? null : (
      <div
        className={[
          styles.piece,
          id === lastPlacedId && !hasAppeared[id] ? styles.dropAnimation : "",
        ].join(" ")}
        color={color}
      >
        <img
          src={`${basePath}/assets/images/counter-${color}-small.svg`}
          className={styles.pieceImage}
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

  // check for consecutive four pieces
  useEffect(() => {
    if (!lastPlacedId) return;
    const column = parseInt(lastPlacedId.charAt(1));
    checkSequence(column);
  }, [columnLevels, pieceColors, lastPlacedId]);

  const checkSequence = (col: number): void => {
    if (hasLeftWon || hasRightWon || isDraw) return;

    // check for endgame
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
        setIsTimerRunning(false);
      } else {
        setHasRightWon(true);
        setRightScore((prev) => prev + 1);
        setIsTimerRunning(false);
      }
      return;
    }

    // check for a stalemate
    const occupiedSquares = Object.values(columnLevels).reduce(
      (sum, level) => sum + level,
      0,
    );
    if (occupiedSquares === 42) {
      setIsDraw(true);
      setIsTimerRunning(false);
    }

    // otherwise, switch turn
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

      currentRow++;
      currentColumn--;
    }

    return false;
  };

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
    if (opponent !== "human" && !isLeftTurn) {
      setTimeout(cpuMove, 500);
    }
  }, [isLeftTurn, starter]);

  const cpuMove = (): void => {
    let targetCol: number | null = null;

    // if center bottom is available, take it
    if (columnLevels[4] === 0) {
      targetCol = 4;
    } else {
      // check for potential consecutive four pieces
      for (let i = 1; i <= 7; i++) {
        // first, check if CPU can win immediately
        if (columnLevels[i] === 6) continue;
        const targetSquareId = ((columnLevels[i] + 1) * 10 + i).toString();

        if (
          simulateRow(targetSquareId, "yellow") >= 4 ||
          simulateColumn(targetSquareId, "yellow") >= 4 ||
          simulateRightDiagonal(targetSquareId, "yellow") >= 4 ||
          simulateLeftDiagonal(targetSquareId, "yellow") >= 4
        ) {
          targetCol = i;
          break;
        }

        // second, block player if they can win next turn
        if (
          simulateRow(targetSquareId, "red") >= 4 ||
          simulateColumn(targetSquareId, "red") >= 4 ||
          simulateRightDiagonal(targetSquareId, "red") >= 4 ||
          simulateLeftDiagonal(targetSquareId, "red") >= 4
        ) {
          targetCol = i;
          break;
        }
      }

      // (Medium) check for potential consecutive three pieces
      if (opponent === "CPU_medium" && !targetCol) {
        for (let i = 1; i <= 7; i++) {
          if (columnLevels[i] === 6) continue;
          const targetSquareId = ((columnLevels[i] + 1) * 10 + i).toString();

          if (
            simulateRow(targetSquareId, "yellow") === 3 ||
            simulateColumn(targetSquareId, "yellow") === 3 ||
            simulateRightDiagonal(targetSquareId, "yellow") === 3 ||
            simulateLeftDiagonal(targetSquareId, "yellow") === 3
          ) {
            targetCol = i;
            break;
          }

          if (
            simulateRow(targetSquareId, "red") === 3 ||
            simulateColumn(targetSquareId, "red") === 3 ||
            simulateRightDiagonal(targetSquareId, "red") === 3 ||
            simulateLeftDiagonal(targetSquareId, "red") === 3
          ) {
            targetCol = i;
            break;
          }
        }
      }

      // (Medium) default: pick a random column but prefer center
      if (opponent === "CPU_medium" && !targetCol) {
        const centerdArr = [
          1, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 6, 6, 7,
        ];
        do {
          const index = getRandomInt(0, centerdArr.length - 1);
          targetCol = centerdArr[index];
        } while (columnLevels[targetCol] === 6);
      }

      // (Easy) default: pick a completely random column
      if (!targetCol) {
        do {
          targetCol = getRandomInt(1, 7);
        } while (columnLevels[targetCol] === 6);
      }
    }

    updatePieceColors(targetCol);
    updateLastPlacedId(targetCol);
    updateColumnLevels(targetCol);
    updateHasAppeared(targetCol);
  };

  const getRandomInt = (min: number, max: number): number =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const simulateRow = (id: string, color: Color): number => {
    const row = parseInt(id.charAt(0));
    let currentColumn = 1;
    let series = 0;
    let seriesTemp = 0;

    const pieceColorsTemp: { [key: string]: Color } = { ...pieceColors };
    pieceColorsTemp[id] = color;

    while (currentColumn <= 7) {
      const currentSquareId = `${row}${currentColumn}`;

      if (pieceColorsTemp[currentSquareId] === color) {
        seriesTemp++;
        if (seriesTemp > series) series = seriesTemp;
      } else {
        seriesTemp = 0;
      }

      currentColumn++;
    }

    return series;
  };

  const simulateColumn = (id: string, color: Color): number => {
    const column = parseInt(id.charAt(1));
    let currentRow = 1;
    let series = 0;
    let seriesTemp = 0;

    const pieceColorsTemp: { [key: string]: Color } = { ...pieceColors };
    pieceColorsTemp[id] = color;

    while (currentRow <= 6) {
      const currentSquareId = `${currentRow}${column}`;

      if (pieceColorsTemp[currentSquareId] === color) {
        seriesTemp++;
        if (seriesTemp > series) series = seriesTemp;
      } else {
        seriesTemp = 0;
      }

      currentRow++;
    }

    return series;
  };

  const simulateRightDiagonal = (id: string, color: Color): number => {
    const row = parseInt(id.charAt(0));
    const column = parseInt(id.charAt(1));
    if (row - column >= 3 || row - column <= -4) return 0;
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
    let seriesTemp = 0;

    const pieceColorsTemp: { [key: string]: Color } = { ...pieceColors };
    pieceColorsTemp[id] = color;

    while (currentRow <= 6 && currentColumn <= 7) {
      const currentSquareId = `${currentRow}${currentColumn}`;

      if (pieceColorsTemp[currentSquareId] === color) {
        seriesTemp++;
        if (seriesTemp > series) series = seriesTemp;
      } else {
        seriesTemp = 0;
      }

      currentRow++;
      currentColumn++;
    }

    return series;
  };

  const simulateLeftDiagonal = (id: string, color: Color): number => {
    const row = parseInt(id.charAt(0));
    const column = parseInt(id.charAt(1));
    if (row + column >= 11 || row + column <= 4) return 0;
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
    let seriesTemp = 0;

    const pieceColorsTemp: { [key: string]: Color } = { ...pieceColors };
    pieceColorsTemp[id] = color;

    while (currentRow <= 6 && currentColumn >= 1) {
      const currentSquareId = `${currentRow}${currentColumn}`;

      if (pieceColorsTemp[currentSquareId] === color) {
        seriesTemp++;
        if (seriesTemp > series) series = seriesTemp;
      } else {
        seriesTemp = 0;
      }

      currentRow++;
      currentColumn--;
    }

    return series;
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
    <div className={styles.background}>
      <section className={styles.ingameContainer}>
        <nav className={styles.navContainer}>
          <button
            className={`${styles.navButton} ${styles.navButtonMenu}`}
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
            className={styles.logo}
          />
          <button className={styles.navButton} onClick={restartGame}>
            RESTART
          </button>
        </nav>
        <div className={styles.scoreboardsContainer}>
          <div
            className={`${styles.scoreContainer} ${styles.leftScoreContainer}`}
          >
            <img
              src={`${basePath}/assets/images/${opponent !== "human" ? "you.svg" : "player-one.svg"}`}
              alt={`${opponent !== "human" ? "your icon" : "player 1 icon"}`}
              className={`${styles.playerIcon} ${styles.iconLeft}`}
            />
            <div className={styles.nameScoreContainer}>
              <span className={styles.playerName}>
                {opponent !== "human" ? "YOU" : "PLAYER 1"}
              </span>
              <span className={styles.score}>{leftScore}</span>
            </div>
          </div>
          <div
            className={`${styles.scoreContainer} ${styles.rightScoreContainer}`}
          >
            <div className={styles.nameScoreContainer}>
              <span className={styles.playerName}>
                {opponent !== "human" ? "CPU" : "PLAYER 2"}
              </span>
              <span className={styles.score}>{rightScore}</span>
            </div>
            <img
              src={`${basePath}/assets/images/${opponent !== "human" ? "cpu.svg" : "player-two.svg"}`}
              alt={`${opponent !== "human" ? "CPU icon" : "player 2 icon"}`}
              className={`${styles.playerIcon} ${styles.iconRight}`}
            />
          </div>
        </div>
        <div className={styles.gameBoardContainer}>
          <div className={styles.gameBoardBack}></div>
          <div className={styles.gameBoardMiddle}>
            {[...Array(42)].map((_, i) => {
              const row: number = 6 - Math.floor(i / 7);
              const col: number = (i % 7) + 1;
              const id: string = (row * 10 + col).toString();

              return (
                <div id={id} className={styles.square} key={id}>
                  <Piece color={pieceColors[id] || "blank"} id={id}></Piece>
                  {connectedPieces.includes(id) && (
                    <div className={styles.circle}></div>
                  )}
                </div>
              );
            })}
          </div>
          <div className={styles.gameBoardFront}></div>
          <div className={styles.gameBoardSurface}>
            {[...Array(7)].map((_, i) => {
              const col = i + 1;
              return (
                <div
                  className={styles.column}
                  id={col.toString()}
                  key={col.toString()}
                  tabIndex={0}
                  onClick={() => {
                    updatePieceColors(col);
                    updateLastPlacedId(col);
                    updateColumnLevels(col);
                    updateHasAppeared(col);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      updatePieceColors(col);
                      updateLastPlacedId(col);
                      updateColumnLevels(col);
                      updateHasAppeared(col);
                    }
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
                      className={styles.marker}
                    ></img>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {!isDraw && !hasLeftWon && !hasRightWon ? (
          <div
            className={`${styles.playerTurn} ${isLeftTurn ? styles.leftTurn : styles.rightTurn}`}
          >
            <span className={styles.currentPlayer}>
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
              className={`${styles.timer} ${timer <= 5 && styles.yellow} ${timer <= 3 && styles.red} `}
            >
              {timer}s
            </span>
          </div>
        ) : (
          <div className={styles.resultContainer}>
            <span className={styles.playerName}>
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
            <span className={styles.result}>
              {isDraw
                ? "DRAW"
                : opponent !== "human" && hasLeftWon
                  ? "WIN"
                  : "WINS"}
            </span>
            <button
              className={styles.restartButtonResult}
              onClick={playNextGame}
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </section>
      <div
        className={`${styles.underlay} ${hasLeftWon && styles.leftWins} ${hasRightWon && styles.rightWins}`}
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
