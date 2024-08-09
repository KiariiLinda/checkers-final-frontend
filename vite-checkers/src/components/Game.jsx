import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getBoard,
  makeMove,
  logout,
  resetBoard,
  getPossibleMoves,
} from "../services/api";
import "../styles/Game.css";
import humanPiece from "../assets/humanPiece.png";
import humanKing from "../assets/humanKing.png";
import computerPiece from "../assets/computerPiece.png";
import computerKing from "../assets/computerKing.png";

const Game = () => {
  const [gameState, setGameState] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [isComputerThinking, setIsComputerThinking] = useState(false);
  const [movesHistory, setMovesHistory] = useState([]);
  const [lastComputerMove, setLastComputerMove] = useState("");
  const [isGameOver, setIsGameOver] = useState(() => {
    return localStorage.getItem("isGameOver") === "true";
  });
  const [winner, setWinner] = useState(() => {
    return localStorage.getItem("winner") || null;
  });

  const navigate = useNavigate();

  const renderPiece = (piece) => {
    if (piece === "h")
      return (
        <img src={humanPiece} alt="Human Piece" className="checker-piece" />
      );
    if (piece === "H")
      return <img src={humanKing} alt="Human King" className="checker-piece" />;
    if (piece === "c")
      return (
        <img
          src={computerPiece}
          alt="Computer Piece"
          className="checker-piece"
        />
      );
    if (piece === "C")
      return (
        <img src={computerKing} alt="Computer King" className="checker-piece" />
      );
    return null;
  };

  const fetchPossibleMoves = useCallback(async () => {
    if (gameState && gameState.current_turn === "h" && !gameState.game_over) {
      try {
        const data = await getPossibleMoves();
        setPossibleMoves(data.possible_moves);
        if (data.possible_moves.length === 0) {
          setError("No moves available. The game will end.");
          setIsGameOver(true);
          setWinner("Computer");
          // Store game over state and winner in localStorage
          localStorage.setItem("isGameOver", "true");
          localStorage.setItem("winner", "Computer");
        }
      } catch (error) {
        console.error("Error fetching possible moves:", error);
        setError("Failed to fetch possible moves");
      }
    }
  }, [gameState]);

  useEffect(() => {
    fetchPossibleMoves();
  }, [fetchPossibleMoves]);

  const fetchBoard = useCallback(async () => {
    try {
      const data = await getBoard();
      console.log("Received game data:", data);
      setGameState(data);
      setError("");
    } catch (err) {
      console.error("Error fetching board:", err);
      setError("Failed to fetch the game board");
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
    } else {
      fetchBoard();
    }
  }, [navigate, fetchBoard]);

  const handleCellClick = (row, col) => {
    setError(""); // Clear any existing error messages
    if (isComputerThinking) return;
    if (isGameOver || isComputerThinking) return;

    // Convert row and col to checkers notation
    const colLetter = String.fromCharCode(65 + col); // 'A', 'B', 'C', etc.
    const rowNumber = row + 1; // Row 1 is at the bottom
    const position = `${colLetter}${rowNumber}`;

    if (!selectedPiece) {
      // First click - select the piece
      const piece = gameState.board[row][col];
      const isHumanPiece = piece === "h" || piece === "H";

      if (piece !== " " && isHumanPiece) {
        setSelectedPiece({ row, col });
        console.log(`Selected human piece at ${position}: ${piece}`);
      } else {
        console.log(`Invalid selection at ${position}: ${piece}`);
        if (piece === "c" || piece === "C") {
          setError("You can only move your own pieces");
        } else if (piece === " ") {
          setError("You must select a piece to move");
        }
      }
    } else {
      // Second click - attempt to move the piece
      const fromPosition = `${String.fromCharCode(65 + selectedPiece.col)}${
        selectedPiece.row + 1
      }`;
      console.log(`Attempting to move from ${fromPosition} to ${position}`);
      handleMove(selectedPiece.row, selectedPiece.col, row, col);
      setSelectedPiece(null);
    }
  };

  const handleMove = async (fromRow, fromCol, toRow, toCol) => {
    try {
      const srcNotation = `${String.fromCharCode(65 + fromCol)}${fromRow + 1}`;
      const destNotation = `${String.fromCharCode(65 + toCol)}${toRow + 1}`;

      const moveData = {
        src: srcNotation,
        dest: destNotation,
      };
      console.log("Sending move data:", moveData);

      // Store the initial board state
      const initialBoard = gameState.board.map((row) => [...row]);

      const updatedData = await makeMove(moveData);
      console.log("Received updated game data after move:", updatedData);

      if (updatedData && updatedData.board) {
        // Determine if the moved piece was a king
        const movedPiece = initialBoard[fromRow][fromCol];
        const isHumanKing = movedPiece === "H";

        // Check if the game is over
        if (updatedData.game_over) {
          console.log("Game Over detected!");
          setIsGameOver(true);
          const winnerValue =
            updatedData.winner === "computer" ? "Computer" : "Human";
          setWinner(winnerValue);
          // Store game over state and winner in localStorage
          localStorage.setItem("isGameOver", "true");
          localStorage.setItem("winner", winnerValue);
          console.log(`Winner set to: ${winnerValue}`);
        }

        // Add the human move to the history immediately
        const humanMove = `${
          isHumanKing ? "Human King" : "Human"
        }: ${srcNotation} to ${destNotation}`;
        setMovesHistory((prevMoves) => [...prevMoves, humanMove]);

        // Update the game state immediately, including current_turn
        setGameState((prevState) => ({
          ...prevState,
          ...updatedData,
          current_turn: "c", // Set to computer's turn after human move
          game_over: updatedData.game_over,
          winner: updatedData.winner,
        }));

        setError("");

        // Now set computer thinking to true
        setIsComputerThinking(true);

        // Simulate computer thinking time
        setTimeout(() => {
          setIsComputerThinking(false);
          // Add the computer's move to the history
          if (
            updatedData.computer_moves &&
            updatedData.computer_moves.length > 0
          ) {
            const computerMove = updatedData.computer_moves[0];
            setLastComputerMove(computerMove);

            // Determine if the computer moved a king
            const [fromSquare, toSquare] = computerMove.split("-");
            const [fromCol, fromRow] = fromSquare.split("");
            const computerPiece =
              initialBoard[Number(fromRow) - 1][fromCol.charCodeAt(0) - 65];
            const isComputerKing = computerPiece === "C";

            console.log("Computer move details:");
            console.log("From square:", fromSquare);
            // console.log("To square:", toSquare);
            console.log("Computer piece:", computerPiece);
            console.log("Is computer king:", isComputerKing);

            const newMove = `${
              isComputerKing ? "Computer King" : "Computer"
            }: ${computerMove}`;
            console.log("New move to be added:", newMove);

            setMovesHistory((prevMoves) => {
              const updatedMoves = [...prevMoves, newMove];
              console.log("Updated moves history:", updatedMoves);
              return updatedMoves;
            });
          }
          // Update the game state again to reflect the computer's move
          setGameState((prevState) => ({
            ...prevState,
            board: updatedData.board,
            current_turn: "h", // Set back to human's turn after computer move
            moves_without_capture: updatedData.moves_without_capture,
            message: updatedData.message,
          }));
        }, 1000);
      } else {
        setError("Received invalid game data after move");
        setIsComputerThinking(false);
      }
    } catch (err) {
      console.error("Error making move:", err);
      setError(err.message || "Failed to make the move");
      setIsComputerThinking(false);
    }
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      logout();
      navigate("/signin");
    }, 1500);
  };

  const startNewGame = async () => {
    setIsResetting(true);
    try {
      const resetData = await resetBoard();
      setGameState(resetData);
      setIsGameOver(false);
      setWinner(null);
      setPossibleMoves([]);
      setSelectedPiece(null);
      setMovesHistory([]);
      setLastComputerMove("");
      setMessage("New game started");
      setError("");
      // Clear localStorage
      localStorage.removeItem("isGameOver");
      localStorage.removeItem("winner");
    } catch (err) {
      console.error("Error starting new game:", err);
      setError("Failed to start a new game");
    } finally {
      setIsResetting(false);
      setTimeout(() => setMessage(""), 10000);
    }
  };

  const handleResetBoard = async () => {
    setIsResetting(true);
    try {
      const resetData = await resetBoard();
      console.log("Reset data received:", resetData);
      if (resetData.message === "Board is already in initial state") {
        setMessage(resetData.message);
      } else {
        setGameState(resetData);
        setIsGameOver(false);
        setWinner(null);
        setPossibleMoves([]);
        setSelectedPiece(null);
        setMessage("Board has been reset");
        console.log("Clearing moves history");
        setMovesHistory([]);
        setLastComputerMove("");
        // Clear localStorage
        localStorage.removeItem("isGameOver");
        localStorage.removeItem("winner");
      }
      setError("");
    } catch (err) {
      console.error("Error resetting board:", err);
      setError("Failed to reset the board");
    } finally {
      setIsResetting(false);
      setTimeout(() => setMessage(""), 10000);
    }
  };

  useEffect(() => {
    console.log("Moves history updated:", movesHistory);
  }, [movesHistory]);

  useEffect(() => {
    console.log("Game state updated:", gameState);
  }, [gameState]);

  useEffect(() => {
    console.log(`Game over status changed: ${isGameOver}`);
    console.log(`Winner: ${winner}`);
  }, [isGameOver, winner]);

  if (isLoggingOut) {
    return <div className="logging-out">Logging Out...</div>;
  }

  if (!gameState) {
    return <div>Loading...</div>;
  }

  return (
    <div className="game-container">
      <div className="game-controls">
        <button
          onClick={handleResetBoard}
          className="reset-button"
          disabled={isResetting || isGameOver}
        >
          {isResetting ? "Resetting..." : "Reset Board"}
        </button>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>

        {isGameOver && (
          <>
            <div className="game-over-message">Game Over! {winner} wins!</div>
            <button onClick={startNewGame} className="new-game-button">
              New Game
            </button>
          </>
        )}

        {gameState &&
          gameState.current_turn === "h" &&
          possibleMoves.length === 0 &&
          !isGameOver && (
            <div className="no-moves-message">
              You have no possible moves. The game will end.
            </div>
          )}
      </div>

      <div className="game-board-container">
        <h2>Game Board</h2>
        {message && <div className="message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <p
          className={`current-turn ${
            gameState.current_turn === "h" ? "human-turn" : ""
          }`}
        >
          Current Turn:{" "}
          {gameState.current_turn === "h"
            ? "Human"
            : gameState.current_turn === "c"
            ? "Computer"
            : "Unknown"}
        </p>

        {isComputerThinking && (
          <p className="thinking-message">Computer is thinking...</p>
        )}
        <p>Moves Without Capture: {gameState.moves_without_capture}</p>
        <p>{gameState.message}</p>
        <div
          className={`board ${
            isGameOver ||
            isResetting ||
            (gameState.current_turn === "h" && possibleMoves.length === 0)
              ? "disabled"
              : ""
          }`}
        >
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
                  disabled={
                    isGameOver ||
                    isResetting ||
                    (gameState.current_turn === "h" &&
                      possibleMoves.length === 0)
                  }
                >
                  {renderPiece(cell)}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="moves-history">
        <h3>Moves History</h3>
        <ul>
          {movesHistory.map((move, index) => (
            <li key={index}>{move}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Game;
