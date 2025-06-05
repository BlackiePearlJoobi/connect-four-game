import { createContext, useState, useContext } from "react";

type OpponentType = "CPU_easy" | "CPU_medium" | "human" | null;

interface GameContextType {
  opponent: OpponentType;
  setOpponent: (x: OpponentType) => void;
  isInMainMenu: boolean;
  setIsInMainMenu: (x: boolean) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const [opponent, setOpponent] = useState<OpponentType>(null);

  const [isInMainMenu, setIsInMainMenu] = useState(true);

  return (
    <GameContext.Provider
      value={{
        opponent,
        setOpponent,
        isInMainMenu,
        setIsInMainMenu,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within GameProvider");
  }
  return context;
};
