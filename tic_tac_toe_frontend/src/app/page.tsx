"use client";

import React, { useState } from "react";

// Define player types
type Player = "X" | "O";
type Cell = Player | null;

// UI Colors based on theme palette
const COLORS = {
  accent: "#FF5252",
  primary: "#1976D2",
  secondary: "#FFFFFF",
  grid: "#E3E6EA",
  tile: "#F5F8FB",
};

const EMPTY_BOARD: Cell[] = Array(9).fill(null);

const getWinner = (board: Cell[]): Player | null => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // cols
    [0, 4, 8],
    [2, 4, 6], // diagonals
  ];
  for (const line of lines) {
    const [a, b, c] = line;
    if (
      board[a] &&
      board[a] === board[b] &&
      board[a] === board[c]
    ) {
      return board[a];
    }
  }
  return null;
};

// Returns an array of indices of empty cells
const getAvailableMoves = (board: Cell[]) =>
  board
    .map((cell, idx) => (cell === null ? idx : null))
    .filter((x): x is number => x !== null);

const isBoardFull = (board: Cell[]) =>
  board.every((cell) => cell !== null);

// PUBLIC_INTERFACE
function TicTacToe() {
  // Game state
  const [board, setBoard] = useState<Cell[]>([...EMPTY_BOARD]);
  const [current, setCurrent] = useState<Player>("X");
  const [aiMode, setAIMode] = useState<boolean>(false);
  const [winner, setWinner] = useState<Player | "Draw" | null>(null);
  const [score, setScore] = useState<{ X: number; O: number }>({ X: 0, O: 0 });
  const [startingPlayer, setStartingPlayer] = useState<Player>("X");

  // Make a move at the specified cell index
  // PUBLIC_INTERFACE
  const makeMove = (idx: number) => {
    // Ignore if cell is taken or there is a winner
    if (board[idx] || winner) return;
    const newBoard = board.slice();
    newBoard[idx] = current;
    const possibleWinner = getWinner(newBoard);
    // Check for winner or draw
    if (possibleWinner) {
      setBoard(newBoard);
      setWinner(possibleWinner);
      setScore((prev) => ({ ...prev, [possibleWinner]: prev[possibleWinner] + 1 }));
    } else if (isBoardFull(newBoard)) {
      setBoard(newBoard);
      setWinner("Draw");
    } else {
      setBoard(newBoard);
      setCurrent(current === "X" ? "O" : "X");
    }
  };

  // Find a move for the AI (simple random empty cell)
  // PUBLIC_INTERFACE
  const aiMove = () => {
    if (!aiMode || winner || current !== "O") return;
    const open = getAvailableMoves(board);
    if (open.length > 0) {
      const move = open[Math.floor(Math.random() * open.length)];
      setTimeout(() => makeMove(move), 500);
    }
  };

  // Trigger AI move after board updates
  React.useEffect(() => {
    aiMove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, board, aiMode, winner]);

  // PUBLIC_INTERFACE
  const restartGame = () => {
    setBoard([...EMPTY_BOARD]);
    setWinner(null);
    // Alternate starting player for fairness
    const nextStarting = startingPlayer === "X" ? "O" : "X";
    setStartingPlayer(nextStarting);
    setCurrent(nextStarting);
  };

  // PUBLIC_INTERFACE
  const resetAll = () => {
    setBoard([...EMPTY_BOARD]);
    setWinner(null);
    setScore({ X: 0, O: 0 });
    setAIMode(false);
    setStartingPlayer("X");
    setCurrent("X");
  };

  // UI helpers
  const turnMsg = winner
    ? winner === "Draw"
      ? "It's a Draw!"
      : `Winner: ${winner}`
    : `Turn: ${current}${aiMode && current === "O" ? " (AI)" : ""}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-[var(--color-background)] px-4 sm:px-0 select-none">
      {/* Minimal Top Nav */}
      <header
        className="w-full max-w-md text-center border-b border-gray-200 py-6 font-semibold text-xl tracking-tight"
        style={{ background: COLORS.secondary, color: COLORS.primary }}
      >
        Tic Tac Toe
      </header>
      {/* Main Game Area */}
      <main className="flex flex-col grow items-center justify-center gap-6 w-full max-w-md mx-auto">
        {/* Game Board */}
        <div
          className="grid grid-cols-3 grid-rows-3 gap-2 md:gap-4 rounded-lg p-2 sm:p-4 bg-white shadow-md"
          style={{
            background: COLORS.secondary,
            border: `1.5px solid ${COLORS.grid}`,
            boxShadow: "0 2px 8px 2px #F0F2F5",
          }}
        >
          {board.map((cell, i) => (
            <button
              key={i}
              aria-label={`Cell ${i%3+1},${Math.floor(i/3)+1}`}
              className="aspect-square w-16 sm:w-20 md:w-24 bg-[var(--color-background)] border border-gray-300 rounded-lg flex items-center justify-center text-2xl sm:text-3xl font-bold transition-all hover:bg-[#f8fafe] focus:outline-none"
              style={{
                borderColor: COLORS.grid,
                color:
                  cell === "X"
                    ? COLORS.primary
                    : cell === "O"
                    ? COLORS.accent
                    : "#828282",
                background:
                  cell
                    ? COLORS.tile
                    : COLORS.secondary,
                cursor: winner || cell ? "not-allowed" : "pointer",
                boxSizing: "border-box",
                transition: "background 0.2s",
              }}
              onClick={() => makeMove(i)}
              disabled={!!cell || !!winner}
            >
              {cell}
            </button>
          ))}
        </div>
        {/* Game Status */}
        <div
          className="min-h-8 text-base sm:text-lg font-medium text-center"
          style={{ color: COLORS.primary }}
          data-testid="game-status"
        >
          {turnMsg}
        </div>
        {/* Controls and Score Panel */}
        <div className="flex flex-wrap gap-3 w-full justify-center items-center mt-0">
          <button
            onClick={restartGame}
            className="px-4 py-2 rounded bg-[var(--color-foreground)] text-[var(--color-background)] font-medium border border-gray-200 hover:bg-[#1e60b7] hover:text-white transition"
            style={{
              background: COLORS.primary,
              color: COLORS.secondary,
              borderColor: COLORS.primary,
            }}
            aria-label="Restart game"
          >
            Restart
          </button>
          <button
            onClick={resetAll}
            className="px-4 py-2 rounded bg-white text-gray-700 border border-gray-200 font-medium hover:bg-[#ffe0e0] hover:text-[#e14b4b] hover:border-[#ffbaba] transition"
            style={{
              borderColor: COLORS.accent,
              color: COLORS.accent,
              background: "#FFF",
            }}
            aria-label="Reset all"
          >
            Reset All
          </button>
          <button
            onClick={() => setAIMode((prev) => !prev)}
            disabled={score.X > 0 || score.O > 0 || board.some((v) => v)}
            className={`px-4 py-2 rounded transition border font-medium ${
              aiMode
                ? "bg-[#ffe0e0] border-[#ffbaba] text-[#e14b4b]"
                : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-[#f2f2f2]"
            }`}
            aria-label={
              aiMode
                ? "AI Mode Enabled. Click to disable before starting."
                : "Enable AI to play against computer"
            }
            title={
              aiMode
                ? "AI Mode is ON (O is computer). To disable, reset the game."
                : "Enable AI (O as computer). Lock once game/score started."
            }
          >
            {aiMode ? "AI: ON" : "Play vs Computer"}
          </button>
        </div>
        {/* Score Panel */}
        <div
          className="w-full flex justify-between bg-[#f7fafc] rounded-lg py-3 px-6 mt-4 shadow-sm"
          style={{
            background: "#F7FAFC",
            color: "#334155",
            fontWeight: 600,
            fontSize: "1.10rem",
            letterSpacing: 0.3,
            border: "1px solid #e6eaf0",
          }}
        >
          <span>
            <span style={{ color: COLORS.primary }}>X</span>: {score.X}
          </span>
          <span>
            <span style={{ color: COLORS.accent }}>O</span>: {score.O}
          </span>
        </div>
      </main>
      {/* Simple Bottom Space */}
      <footer className="w-full h-8" />
    </div>
  );
}

export default function Home() {
  return <TicTacToe />;
}
