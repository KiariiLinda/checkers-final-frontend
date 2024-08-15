import React, { useRef, useState, useEffect } from "react"; // eslint-disable-line no-unused-vars
import { Link } from "react-router-dom";
import backgroundImage from "../assets/checkers-background-home-page.jpg";
import projectImage from "../assets/github_icon-home-page.png";
import footerStripImage from "../assets/wallpaperflare.com_wallpaper.jpg";
import "../styles/Home.css";

const Home = () => {
  const aboutSectionRef = useRef(null);
  const [highlightAbout, setHighlightAbout] = useState(false);
  const projectRepositoryUrl =
    "https://github.com/KiariiLinda/checkers-final-backend";

  const scrollToAbout = (e) => {
    e.preventDefault();
    aboutSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    setHighlightAbout(true);
    setTimeout(() => setHighlightAbout(false), 2000);
  };

  useEffect(() => {
    document.title = "Home | Checkers Game";
  }, []);

  return (
    <div className="home-container">
      <div
        className="content-wrapper"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <header className="header">
          <h1 className="title">CHECKERS</h1>
          <nav className="nav">
            <Link to="/signup" className="nav-link">
              Play
            </Link>
            <span className="nav-separator">|</span>
            <a href="#about" className="nav-link" onClick={scrollToAbout}>
              About
            </a>
          </nav>
        </header>
        <main className="main-content">
          <section className="section">
            <h2 className="section-title">Checkers Rules</h2>
            <div className="section-content">
              <p>
                Checkers, also known as Draughts, is a classic board game with a
                rich history dating back to around 3000 BC. This two-player
                strategy game is played on an 8x8 checkered board, identical to
                a chess board. Each player begins with 12 pieces, traditionally
                colored black and red (or white), placed on the dark squares of
                the three rows closest to them.
              </p>
              <p>
                The objective of Checkers is to capture all of your
                opponent&apos;s pieces or create a situation where your opponent
                has no legal moves left. The game&apos;s simplicity makes it
                easy to learn, but mastering its strategies can take a lifetime,
                making it an enduring favorite across generations and cultures.
              </p>
            </div>
          </section>

          <section className="section">
            <h2 className="section-title">Gameplay</h2>
            <div className="section-content">
              <p>
                1. Movement: Pieces move diagonally forward on dark squares
                only. A regular move consists of moving a piece to an empty
                adjacent square diagonally forward.
              </p>
              <p>
                2. Capturing: If an opponent&apos;s piece is on an adjacent
                forward diagonal and the next square beyond it is empty, you
                must jump over the opponent&apos;s piece, landing on the empty
                square, and remove the jumped piece from the board. Multiple
                jumps are allowed and mandatory in a single turn if possible.
              </p>
              <p>
                3. Kinging: When a piece reaches the last row on the
                opponent&apos;s side of the board, it is &quot;crowned&quot; and
                becomes a King. Kings can move and capture both forward and
                backward diagonally.
              </p>
              <p>
                4. Strategy: The game involves careful planning, sacrificing
                pieces for positional advantage, and creating &quot;traps&quot;
                for your opponent. Controlling the center of the board and
                keeping your back row intact for as long as possible are common
                strategies.
              </p>
              <p>
                5. Forced Captures: If a player has the opportunity to capture
                an opponent&apos;s piece, they must do so. If multiple capture
                moves are available, the player may choose which one to take,
                even if it results in fewer captures.
              </p>
            </div>
          </section>

          <section className="section">
            <h2 className="section-title">Winning</h2>
            <div className="section-content">
              <p className="game-end-intro">
                The game can end in four different ways:
              </p>
              <ol className="game-end-list">
                <li>
                  Capture all pieces: If a player captures all of their
                  opponent&apos;s pieces, they win the game.
                </li>
                <li>
                  Block all moves: If a player cannot make any legal moves on
                  their turn because all of their pieces are blocked, they lose
                  the game.
                </li>
                <li>
                  40-move rule: If 40 moves are made without any captures, the
                  game is declared a draw. This prevents excessively long games
                  where neither player can make progress.
                </li>
              </ol>
            </div>
          </section>

          <section
            id="about"
            ref={aboutSectionRef}
            className={`section about-project ${
              highlightAbout ? "highlight" : ""
            }`}
          >
            <h2 className="section-title">About the Project</h2>
            <div className="about-content">
              <a
                href={projectRepositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={projectImage}
                  alt="Project"
                  className="project-image"
                />
              </a>
              <div className="section-content">
                <p>
                  This online version of Checkers is a collaborative effort by
                  Group 1 members of Aurora Prime. Our goal was to create an
                  engaging, user-friendly digital adaptation of the classic
                  board game. We&apos;ve implemented the standard rules of
                  Checkers while adding modern features like AI-powered gameplay
                  and an intuitive user interface.
                </p>
                <p>
                  The project showcases our team&apos;s skills in full-stack
                  development, using technologies such as React for the frontend
                  and Flask for the backend. Our backend implements a robust
                  game logic, including an AI opponent using the minimax
                  algorithm for strategic gameplay. We&apos;ve focused on
                  creating a responsive design to ensure a seamless experience.
                </p>
                <p>Key features of our implementation include:</p>
                <ul>
                  <li>RESTful API for game state management</li>
                  <li>JWT authentication for secure gameplay</li>
                  <li>AI opponent with adjustable difficulty</li>
                  <li>Real-time board state updates</li>
                  <li>Game reset functionality</li>
                </ul>
                <p>
                  We welcome contributions and feedback from the community.
                  Click on the GitHub icon to access our repository, where you
                  can find more detailed information about the project
                  structure, including setup instructions for both the frontend
                  and backend components.
                </p>
                <p>
                  We hope you enjoy playing our version of Checkers as much as
                  we enjoyed creating it. Challenge our AI and may the best
                  strategist win!
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
      <footer className="footer-strip">
        <img
          src={footerStripImage}
          alt="Footer strip"
          className="footer-strip-image"
        />
      </footer>
    </div>
  );
};

export default Home;
