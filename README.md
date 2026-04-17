# Neon Tic Tac Toe — The Odin Project

A browser-based Tic Tac Toe game built as part of **The Odin Project JavaScript curriculum**, featuring a modern neon UI, responsive design, and a multi-difficulty AI. This project demonstrates the implementation of the **Model-View-Controller (MVC) architecture** to ensure clean code organization and separation of concerns.

🔗 Live Demo: https://syedtanzim.github.io/Tic-Tac-Toe/
---

## Project Goals

This project was built to practice:

- Organizing code using the **Model-View-Controller (MVC)** architectural pattern
- Keeping global scope clean using ES6 Modules
- Separating game logic from DOM manipulation
- Managing application state explicitly
- Implementing complex algorithms like **Minimax** for AI opponents

---

## Architecture Overview

The application is structured into three core modules:

### Model (`model.js`)

- Manages the application's data, state, and game logic
- Owns the game board state (a 2D array) and player data
- Handles logic for turn switching, win/tie detection, and score tracking
- Contains the AI logic (Random, Medium heuristics, and Hard Minimax algorithm)

### View (`view.js`)

- Responsible for all DOM interactions and UI rendering
- Dynamically renders the game board based on the state provided by the Controller
- Captures user inputs (clicks and keyboard events) and passes them to the Controller
- Handles UI updates, animations (Confetti), and synthesized sound effects

### Controller (`controller.js`)

- Acts as the intermediary between the Model and the View
- Initializes the game and binds View events to Model actions
- Validates moves, orchestrates turns, and checks for game-over conditions
- Triggers AI moves when appropriate

---

## Features

- **Two Game Modes**: Player vs Player (`X` vs `O`) or Player vs Computer
- **Multi-Difficulty AI**: 
  - *Easy*: Random moves
  - *Medium*: Blocks immediate threats or takes immediate wins
  - *Hard*: Unbeatable AI using the Minimax algorithm
- **Dynamic Neon UI**: Responsive, mobile-first design with a dark theme and glowing accents
- **Keyboard Accessibility**: Full keyboard support (Arrow keys for navigation, Enter/Space for selection)
- **Audio/Visual Feedback**: Synthesized sound effects (Web Audio API) and confetti win animations
- **Score Tracking**: Keeps track of wins, losses, and draws

---

## Technologies Used

- HTML
- CSS (Custom Variables, Flexbox, Grid, Animations)
- Vanilla JavaScript (ES6 Modules, IIFEs, Web Audio API)
- `canvas-confetti` (for win animations)

---

## Project Structure

├── index.html
├── style.css
├── app.js
├── controller.js
├── model.js
├── view.js
└── README.md

---

## How to Run

1. Clone the repository:
   ```bash
   git clone <your-repository-url>
   ```
2. Serve the directory using a local web server (e.g., Live Server in VS Code) since it uses ES6 Modules.
3. Open `index.html` in your browser.

## What I Learned

- How to refactor an application into the MVC pattern
- How to implement the Minimax algorithm for game trees
- Using the Web Audio API for synthesized sounds without external assets
- Adding keyboard navigation to grid-based layouts
- Handling responsive designs with custom CSS properties

## Assignment Source

This project is part of [The Odin Project – JavaScript Path: Tic Tac Toe Project](https://www.theodinproject.com/lessons/node-path-javascript-tic-tac-toe)
