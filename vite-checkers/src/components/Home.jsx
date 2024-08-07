
import React from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";

const Home = () => {
  return (
    <div className="home-container">
      <h1 className="home-title">Welcome to Checkers</h1>
      <nav>
        <Link to="/signup" className="home-link">
          Play Game
        </Link>
      </nav>
    </div>
  );
};

export default Home;
