import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getBoard, makeMove, logout, resetBoard } from "../services/api";
import "../styles/Game.css";

const Game = () => {
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
    } else {
      fetchBoard();
    }
  }, [navigate]);

  const fetchBoard = async () => {
    try {
      const data = await getBoard();
      console.log("Received game data:", data);
      setGameState(data);
      setError("");
    } catch (err) {
      console.error("Error fetching board:", err);
      setError("Failed to fetch the game board");
    }
  };

  const handleCellClick = (row, col) => {
    if (!selectedPiece) {
      // First click - select the piece
      if (gameState.board[row][col] !== " ") {
        setSelectedPiece({ row, col });
      }
    } else {
      // Second click - attempt to move the piece
      handleMove(selectedPiece.row, selectedPiece.col, row, col);
      setSelectedPiece(null);
    }
  };

  const handleMove = async (fromRow, fromCol, toRow, toCol) => {
    try {
      const moveData = {
        src: { row: fromRow, col: fromCol },
        dst: { row: toRow, col: toCol },
      };
      const updatedData = await makeMove(moveData);
      console.log("Received updated game data after move:", updatedData);
      if (updatedData && updatedData.board) {
        setGameState(updatedData);
        setError("");
      } else {
        setError("Received invalid game data after move");
      }
    } catch (err) {
      console.error("Error making move:", err);
      setError("Failed to make the move");
    }
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      logout();
      navigate("/signin");
    }, 1500);
  };

  const handleResetBoard = async () => {
    setIsResetting(true);
    try {
      const resetData = await resetBoard();
      if (resetData.message === "Board is already in initial state") {
        setMessage(resetData.message);
      } else {
        setGameState(resetData);
        setMessage("Board has been reset");
      }
      setError("");
    } catch (err) {
      setError("Failed to reset the board");
    } finally {
      setIsResetting(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  if (isLoggingOut) {
    return <div className="logging-out">Logging Out...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!gameState) {
    return <div>Loading...</div>;
  }

  return (
    <div className="game-container">
      <h2>Game Board</h2>
      <button onClick={handleLogout} className="logout-button">
        Logout
      </button>
      <button
        onClick={handleResetBoard}
        className="reset-button"
        disabled={isResetting}
      >
        {isResetting ? "Resetting..." : "Reset Board"}
      </button>
      {message && <div className="message">{message}</div>}
      <p>{gameState.message}</p>
      <p>Current Turn: {gameState.current_turn}</p>
      <p>Moves Without Capture: {gameState.moves_without_capture}</p>
      <div className="board">
        {gameState.board.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((cell, cellIndex) => (
              <button
                key={cellIndex}
                className={`cell ${
                  selectedPiece &&
                  selectedPiece.row === rowIndex &&
                  selectedPiece.col === cellIndex
                    ? "selected"
                    : ""
                }`}
                onClick={() => handleCellClick(rowIndex, cellIndex)}
              >
                {cell}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Game;