# Checkers Game Front End

This is a React-based project for our Checkers game. It provides a user interface to interact with the backend, allowing players to manage a game of Checkers, make moves, and play against an AI opponent.

## Features

- User-friendly interface for playing Checkers
- Visual representation of the game board
- Interaction with backend API for game state management
- Sound effects for moves, captures, and game outcomes
- Display of moves history and current turn
- User authentication with Sign In and Sign Up functionalities

## Components

### 1. Game Board

- **Description**: Renders the current state of the Checkers board with pieces represented as images.
- **Functionality**: Allows players to select pieces and make moves.

### 2. Move Handling

- **Description**: Handles user input for moving pieces and validates moves based on game rules.
- **Functionality**: Interacts with the backend to fetch possible moves and update the board state.

### 3. Game Status

- **Description**: Displays the current game status, including messages for wins, losses, and draws.
- **Functionality**: Shows the current turn and any error messages.

### 4. Sound Effects

- **Description**: Plays audio feedback for moves, captures, and game outcomes.
- **Functionality**: Enhances user experience with immediate audio responses.

### 5. Sign In

- **Description**: Allows users to sign in to their accounts.
- **Functionality**: Validates user credentials and retrieves JWT for authentication.

### 6. Sign Up

- **Description**: Enables new users to create an account.
- **Functionality**: Validates user input and creates a new user in the system.

### 7. Not Found

- **Description**: Displays a 404 error page when a user navigates to a non-existent route.
- **Functionality**: Provides a link back to the home page.

## Game Logic

- The game uses a standard 8x8 Checkers board.
- Human pieces are represented by images of "humanPiece" and "humanKing".
- Computer pieces are represented by images of "computerPiece" and "computerKing".
- The game handles regular moves, captures, and kinging.
- The game ends when one player has no pieces left or after 40 moves without a capture (draw).

## Setup and Running

Install dependencies:

    npm install

    npm run dev

## Acknowledgments

> [Marc Ndegwa](https://github.com/teeno-vices) - Software Engineer
>
> [Jalen Mnene](https://github.com/Jalenzzz) - Software Engineer
>
> [Linda Kiarii](https://github.com/KiariiLinda) - Project Lead/Software Engineer
>
> [Immanuel Anyangu](https://github.com/Meshmanuu) - Software Engineer
>
> [Luther Isaboke](https://github.com/kib4n4) - Software Engineer
