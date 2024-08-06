import React from 'react';
import ReactDOM from 'react-dom/client';
import ErrorBoundary from "./components/ErrorBoundary";
import App from './App';
import Home from "./pages/Home";
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Game from "./pages/Game";
import { RouterProvider, createBrowserRouter } from "react-router-dom";


const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    ),
  },
  {
    path: "/home",
    element: (
      <ErrorBoundary>
        <Home />
      </ErrorBoundary>
    ),
  },
  {
    path: "/sign up",
    element: (
      <ErrorBoundary>
        <SignUp/>
      </ErrorBoundary>
    ),
  },
  {
    path: "/sign in",
    element: (
      <ErrorBoundary>
        <SignIn />
      </ErrorBoundary>
    ),
  },
  {
    path: "/game",
    element: (
      <ErrorBoundary>
        <Game />
      </ErrorBoundary>
    ),
  }


]);


ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
