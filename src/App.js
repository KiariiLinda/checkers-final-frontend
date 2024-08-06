import React from "react";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import Game from "./pages/Game";
function App() {
  return (
    <div className="App">
      <SignIn />
      <SignUp />
      <Home />
      <Game />
      
    </div>
  );
}

export default App;
