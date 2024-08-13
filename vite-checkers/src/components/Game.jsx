import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getBoard,
  makeHumanMove,
  makeComputerMove,
  logout,
  resetBoard,
  getPossibleMoves,
} from "../services/api";

import "../styles/Game.css";
import humanPiece from "../assets/humanPiece.png";
import humanKing from "../assets/humanKing.png";
import computerPiece from "../assets/computerPiece.png";
import computerKing from "../assets/computerKing.png";
import moveSound from "../assets/moveSound.mp3";
import captureSound from "../assets/captureSound.mp3";
import winSound from "../assets/winSound.mp3";
import loseSound from "../assets/loseSound.mp3";
import drawSound from "../assets/drawSound.mp3";

const Game = () => {
  const moveSoundRef = useRef(new Audio(moveSound));
  const captureSoundRef = useRef(new Audio(captureSound));
  const winSoundRef = useRef(new Audio(winSound));
  const loseSoundRef = useRef(new Audio(loseSound));
  const drawSoundRef = useRef(new Audio(drawSound));

  const [gameState, setGameState] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [greeting, setGreeting] = useState("");

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [isComputerThinking, setIsComputerThinking] = useState(false);
  const [movesHistory, setMovesHistory] = useState([]);
  const [possibleMoveDestinations, setPossibleMoveDestinations] = useState([]);
  const [lastComputerMove, setLastComputerMove] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGameOver, setIsGameOver] = useState(() => {
    return localStorage.getItem("isGameOver") === "true";
  });
  const [winner, setWinner] = useState(() => {
    return localStorage.getItem("winner") || null;
  });

  const navigate = useNavigate();
  // const userName = "User";

  const renderPiece = (piece) => {
    switch (piece) {
      case "h":
        return (
          <img src={humanPiece} alt="Human Piece" className="checker-piece" />
        );
      case "H":
        return (
          <img src={humanKing} alt="Human King" className="checker-piece" />
        );
      case "c":
        return (
          <img
            src={computerPiece}
            alt="Computer Piece"
            className="checker-piece"
          />
        );
      case "C":
        return (
          <img
            src={computerKing}
            alt="Computer King"
            className="checker-piece"
          />
        );
      default:
        return null;
    }
  };

  const fetchPossibleMoves = useCallback(async () => {
    if (gameState && gameState.current_turn === "h" && !gameState.game_over) {
      try {
        const possibleMoves = await getPossibleMoves();
        console.log("Possible moves:", possibleMoves);
        setPossibleMoves(possibleMoves);
        if (possibleMoves.length === 0) {
          setError("No moves available. The game will end.");
          setIsGameOver(true);
          setWinner("Computer");
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

  useEffect(() => {
    // console.log("selectedPiece updated:", selectedPiece);
  }, [selectedPiece]);

  useEffect(() => {
    // console.log("possibleMoveDestinations updated:", possibleMoveDestinations);
  }, [possibleMoveDestinations]);

  const fetchBoard = useCallback(async () => {
    try {
      const data = await getBoard();
      console.log("Received game data:", data);
      setGameState(data);
      setGreeting(data.message); // Set the greeting from the backend response
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

  const handleCellClick = async (row, col) => {
    console.log(`Cell clicked: row ${row}, col ${col}`);
    setError("");
    if (isComputerThinking || isGameOver) return;

    const piece = gameState.board[row][col];
    const isHumanPiece = piece === "h" || piece === "H";

    // If a piece is already selected
    if (selectedPiece) {
      // If clicking the same piece, deselect it
      if (selectedPiece.row === row && selectedPiece.col === col) {
        setSelectedPiece(null);
        setPossibleMoveDestinations([]);
        return;
      }

      // If clicking another human piece, select the new piece
      if (isHumanPiece) {
        setSelectedPiece({ row, col });
        fetchAndSetPossibleMoves(row, col);
        return;
      }

      // Attempt to move to the clicked cell
      console.log("Attempting move to:", row, col);
      // console.log(
      //   "Current possibleMoveDestinations:",
      //   possibleMoveDestinations
      // );
      const isPossibleMove = possibleMoveDestinations.some(
        (move) => move.to.row === row && move.to.col === col
      );
      console.log("Is possible move:", isPossibleMove);
      if (isPossibleMove) {
        handleMove(selectedPiece.row, selectedPiece.col, row, col);
      } else {
        setError("Invalid move. Please select a highlighted destination.");
      }
      setSelectedPiece(null);
      setPossibleMoveDestinations([]);
    } else {
      // If no piece is selected
      if (piece !== " " && isHumanPiece) {
        setSelectedPiece({ row, col });
        fetchAndSetPossibleMoves(row, col);
      } else {
        setError(
          piece === "c" || piece === "C"
            ? "You can only move your own pieces"
            : "You must select a piece to move"
        );
      }
    }
  };
  // Helper function to fetch and set possible moves
  const fetchAndSetPossibleMoves = async (row, col) => {
    try {
      const moves = await getPossibleMoves(row, col);
      // console.log("Possible moves for selected piece:", moves);
      const convertedMoves = moves
        .filter(
          (move) => move.from === `${String.fromCharCode(65 + col)}${row + 1}`
        )
        .map((move) => {
          const [, toCol, toRow] = move.to.match(/([A-H])(\d)/);
          return {
            from: { row, col },
            to: { row: parseInt(toRow) - 1, col: toCol.charCodeAt(0) - 65 },
          };
        });
      setPossibleMoveDestinations(convertedMoves);
    } catch (error) {
      console.error("Error fetching possible moves:", error);
      setError("Failed to fetch possible moves");
    }
  };

  const handleMove = async (fromRow, fromCol, toRow, toCol) => {
    try {
      const srcNotation = `${String.fromCharCode(65 + fromCol)}${fromRow + 1}`;
      const destNotation = `${String.fromCharCode(65 + toCol)}${toRow + 1}`;

      const moveData = { src: srcNotation, dest: destNotation };
      console.log("Sending move data:", moveData);

      const initialBoard = gameState.board.map((row) => [...row]);

      // Make the human move
      const humanMoveData = await makeHumanMove(moveData);
      console.log(
        "Received updated game data after human move:",
        humanMoveData
      );

      if (humanMoveData && humanMoveData.board) {
        const movedPiece = initialBoard[fromRow][fromCol];
        const isHumanKing = movedPiece === "H";

        const captureOccurred =
          Math.abs(fromRow - toRow) > 1 || Math.abs(fromCol - toCol) > 1;

        // Play sound immediately after the human move
        if (captureOccurred) {
          playCaptureSound();
        } else {
          playMoveSound();
        }

        // Add the human move to the history immediately
        const humanMove = `${
          isHumanKing ? "Human King" : "Human"
        }: ${srcNotation} to ${destNotation}`;
        setMovesHistory((prevMoves) => [...prevMoves, humanMove]);

        // Update the game state immediately after human move
        setGameState((prevState) => ({
          ...prevState,
          ...humanMoveData,
          current_turn: "c", // Set to computer's turn after human move
        }));

        setError("");
        setPossibleMoveDestinations([]); // Clear possible move destinations

        // Check if the game is over after human move
        if (humanMoveData.game_over) {
          handleGameOver(humanMoveData);
          return;
        }

        // Now set computer thinking to true
        setIsComputerThinking(true);

        // Introduce a delay for computer's thinking
        setTimeout(async () => {
          try {
            // Make the computer move
            const computerMoveData = await makeComputerMove();
            console.log(
              "Received updated game data after computer move:",
              computerMoveData
            );

            handleComputerMove(computerMoveData, initialBoard);

            // Check if the game is over after computer move
            if (computerMoveData.game_over) {
              handleGameOver(computerMoveData);
            }
          } catch (error) {
            console.error("Error making computer move:", error);
            setError("Failed to make the computer move");
          } finally {
            setIsComputerThinking(false);
          }
        }, 1000); // 1000 ms delay for computer thinking
      } else {
        setError("Received invalid game data after move");
      }
    } catch (err) {
      console.error("Error making move:", err);
      setError(err.message || "Failed to make the move");
      setIsComputerThinking(false);
    }
  };

  const playMoveSound = () => {
    moveSoundRef.current
      .play()
      .catch((error) => console.error("Error playing sound:", error));
  };

  const playCaptureSound = () => {
    captureSoundRef.current
      .play()
      .catch((error) => console.error("Error playing capture sound:", error));
  };

  const playWinSound = () => {
    winSoundRef.current
      .play()
      .catch((error) => console.error("Error playing win sound:", error));
  };

  const playLoseSound = () => {
    loseSoundRef.current
      .play()
      .catch((error) => console.error("Error playing lose sound:", error));
  };

  const playDrawSound = () => {
    drawSoundRef.current
      .play()
      .catch((error) => console.error("Error playing draw sound:", error));
  };

  const handleComputerMove = (computerMoveData, initialBoard) => {
    if (
      computerMoveData.computer_moves &&
      computerMoveData.computer_moves.length > 0
    ) {
      const computerMove = computerMoveData.computer_moves[0];
      console.log("Computer move:", computerMove); // For debugging
      setLastComputerMove(computerMove);

      // Split the move into parts, expecting "fromSquare to toSquare" format
      const [fromSquare, , toSquare] = computerMove.split(" ");

      if (fromSquare && toSquare) {
        const [fromCol, fromRow] = fromSquare.split("");
        const [toCol, toRow] = toSquare.split("");

        const computerPiece =
          initialBoard[Number(fromRow) - 1][fromCol.charCodeAt(0) - 65];
        const isComputerKing = computerPiece === "C";

        const captureOccurred =
          Math.abs(Number(fromRow) - Number(toRow)) > 1 ||
          Math.abs(fromCol.charCodeAt(0) - toCol.charCodeAt(0)) > 1;

        // Play sound immediately after the computer move
        if (captureOccurred) {
          playCaptureSound();
        } else {
          playMoveSound();
        }

        const newMove = `${
          isComputerKing ? "Computer King" : "Computer"
        }: ${computerMove}`;
        setMovesHistory((prevMoves) => [...prevMoves, newMove]);

        // Update the game state to reflect the computer's move
        setGameState((prevState) => ({
          ...prevState,
          board: computerMoveData.board,
          current_turn: "h", // Set back to human's turn after computer move
          moves_without_capture: computerMoveData.moves_without_capture,
          message: computerMoveData.message,
        }));
      } else {
        console.error("Invalid computer move format:", computerMove);
        setError("Received invalid computer move data");
      }
    } else {
      console.error("No computer moves received");
      setError("No computer moves received");
    }
  };

  const handleGameOver = (data) => {
    setIsGameOver(true);
    const winnerValue =
      data.winner === "draw"
        ? "Draw"
        : data.winner === "computer"
        ? "Computer"
        : "Human";
    setWinner(winnerValue);
    localStorage.setItem("isGameOver", "true");
    localStorage.setItem("winner", winnerValue);

    if (winnerValue === "Human") {
      playWinSound();
    } else if (winnerValue === "Computer") {
      playLoseSound();
    } else {
      // In case of a draw, you can decide which sound to play or add a new draw sound
      playDrawSound(); // or playLoseSound(); or a new drawSound();
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
    setIsLoading(true); // Start loading
    setIsResetting(true);
    try {
      const resetData = await resetBoard();
      if (resetData.message !== "Board is already in initial state") {
        setGameState(resetData);
        setIsGameOver(false);
        setWinner(null);
        setPossibleMoves([]);
        setSelectedPiece(null);
        setMovesHistory([]);
        setLastComputerMove("");
        setPossibleMoveDestinations([]); // Clear possible move destinations
        setMessage("Board has been reset");
      } else {
        setMessage(resetData.message);
      }
      localStorage.removeItem("isGameOver");
      localStorage.removeItem("winner");
    } catch (err) {
      console.error("Error resetting board:", err);
      setError("Failed to reset the board");
    } finally {
      setIsResetting(false);
      setIsLoading(false); // Stop loading
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
    console.log(`Game over status: ${isGameOver}`);
    console.log(`Winner: ${winner}`);
  }, [isGameOver, winner]);

  if (isLoggingOut) {
    return <div className="logging-out">Logging Out</div>;
  }

  if (!gameState) {
    return <div>Loading...</div>;
  }

  return (
    <div className="game-background">
      <header className="game-header">
        <h1>{greeting || "Checkers Game"}</h1>
      </header>

      <div className="button-container">
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
      </div>

      {/* {greeting && <Greeting message={greeting} />} */}

      {(isGameOver ||
        (!isLoading &&
          !isResetting &&
          gameState &&
          gameState.current_turn === "h" &&
          possibleMoves.length === 0)) && (
        <div className="game-status-overlay">
          <div className="game-status-content">
            <h2
              className={`game-over-message ${
                isGameOver
                  ? winner === "Human"
                    ? "human-wins"
                    : winner === "Computer"
                    ? "computer-wins"
                    : "draw"
                  : "no-moves"
              }`}
            >
              {isGameOver
                ? `Game Over! ${
                    winner === "Draw" ? "It's a draw!" : `${winner} wins!`
                  }`
                : "You have no possible moves. The game will end."}
            </h2>
            {isGameOver && (
              <button onClick={startNewGame} className="new-game-button">
                New Game
              </button>
            )}
          </div>
        </div>
      )}

      <div className="game-container-wrapper">
        <div className="game-info-container">
          {message && <div className="message info-element">{message}</div>}
          <div className="error-message-container info-element">
            <div className={`error-message ${error ? "visible" : ""}`}>
              {error}
            </div>
          </div>

          <div className="turn-indicator info-element">
            <span>Current Turn: </span>
            <span
              className={`current-turn ${
                gameState.current_turn === "h" ? "human-turn" : "computer-turn"
              }`}
            >
              {gameState.current_turn === "h" ? "Human" : "Computer"}
            </span>
          </div>

          {isComputerThinking && (
            <p className="thinking-message info-element">
              Computer is thinking...
            </p>
          )}
          <p className="info-element">
            Moves Without Capture: {gameState.moves_without_capture}
          </p>
        </div>

        <div className="game-board-container">
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
                    className={`cell 
                        ${
                          selectedPiece &&
                          selectedPiece.row === rowIndex &&
                          selectedPiece.col === cellIndex
                            ? "selected"
                            : ""
                        }
                        ${
                          possibleMoveDestinations.some(
                            (move) =>
                              move.to.row === rowIndex &&
                              move.to.col === cellIndex
                          )
                            ? "possible-move"
                            : ""
                        }
                      `}
                    onClick={() => handleCellClick(rowIndex, cellIndex)}
                    disabled={
                      isGameOver ||
                      isResetting ||
                      (gameState.current_turn === "h" &&
                        possibleMoves.length === 0)
                    }
                  >
                    {renderPiece(cell, rowIndex, cellIndex)}
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
    </div>
  );
};

export default Game;