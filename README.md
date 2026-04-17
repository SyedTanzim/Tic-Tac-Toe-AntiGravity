# Tic Tac Toe — The Odin Project

A browser-based Tic Tac Toe game built as part of **The Odin Project JavaScript curriculum**, with a focus on code organization, encapsulation, and separation of concerns.

🔗 Live Demo: https://syedtanzim.github.io/Tic-Tac-Toe-AntiGravity
---

## Project Goals

This project was built to practice:

- Organizing code using factories and the module (IIFE) pattern  
- Keeping global scope clean  
- Separating game logic from DOM manipulation  
- Managing application state explicitly  
- Building the game logic first, then connecting it to the UI  

---

## Architecture Overview

The application is divided into clear logical modules:

### Player (Factory)

- Creates player objects  
- Stores player name and mark (`X` or `O`)  

### gameBoard (IIFE Module)

- Owns the game board state  
- Stores the board internally as a 2D array  
- Exposes methods to:
  - Get the board  
  - Place a mark  
  - Reset the board  

### gameController (IIFE Module)

- Controls game flow and rules  
- Tracks:
  - Current player  
  - Game-over state  
- Handles:
  - Turn switching  
  - Win detection  
  - Tie detection  
  - Validating moves  

### displayController (IIFE Module)

- Responsible for all DOM interactions  
- Renders the board based on game state  
- Handles user input (clicks)  
- Re-renders the UI only when the game state changes  

---

## Features

- Two-player Tic Tac Toe (`X` vs `O`)  
- Click-based interaction  
- Prevents overwriting occupied cells  
- Detects:
  - Wins (rows, columns, diagonals)  
  - Ties  
- State-driven rendering (UI updates only on valid moves)  
- Minimal global variables  

---

## Technologies Used

- HTML  
- CSS  
- Vanilla JavaScript (ES6+)  

No external libraries or frameworks were used.

---

## Project Structure

├── index.html
├── style.css
├── app.js
└── README.md

---

## How to Run

1. Clone the repository:
   ```bash
   git clone <your-repository-url>
2. Open index.html in your browser.

## What I Learned

How and why to use IIFEs for single-instance modules

How to design functions around state changes, not events

Why DOM updates should be a reaction to state, not a trigger

How separating responsibilities simplifies debugging and reasoning

## Assignment Source

This project is part of The Odin Project – JavaScript Path
Tic Tac Toe Project
