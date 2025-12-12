import { Board } from './board.js';
import { Renderer } from './renderer.js';
import { AI } from './ai.js';
import { COLOR, SQUARE_SIZE, BOARD_SIZE } from './constants.js';

export class Game {
    constructor() {
        this.canvas = document.getElementById('chessBoard');
        this.board = new Board();
        this.renderer = new Renderer(this.canvas, this.board);
        this.ai = new AI(COLOR.BLACK);

        this.setupEventListeners();

        // UI Elements
        this.turnIndicator = document.getElementById('turnIndicator');
        this.gameStatus = document.getElementById('gameStatus');
        this.restartBtn = document.getElementById('restartBtn');
        this.aiDifficulty = document.getElementById('aiDifficulty');

        this.restartBtn.addEventListener('click', () => this.restart());
        this.aiDifficulty.addEventListener('change', (e) => this.ai.setDifficulty(e.target.value));

        this.playerColor = COLOR.WHITE; // Human is white
        this.isProcessing = false;
    }

    start() {
        this.renderer.draw();
        this.updateUI();
    }

    restart() {
        this.board.reset();
        this.isProcessing = false;
        this.renderer.clearSelection();
        this.updateUI();
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.handleClick(e));
    }

    handleClick(e) {
        if (this.board.turn !== this.playerColor || this.isProcessing || this.board.isGameOver) {
            return;
        }

        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        const col = Math.floor(x / SQUARE_SIZE);
        const row = Math.floor(y / SQUARE_SIZE);

        if (this.renderer.selectedSquare) {
            // Attempt to move
            const move = this.renderer.validMoves.find(m => m.row === row && m.col === col);
            if (move) {
                // Execute move
                this.executeMove({
                    fromRow: this.renderer.selectedSquare.row,
                    fromCol: this.renderer.selectedSquare.col,
                    toRow: row,
                    toCol: col
                });
                this.renderer.clearSelection();
            } else {
                // Clicked elsewhere
                // If clicked on own piece, select it. Else clear.
                const piece = this.board.getPiece(row, col);
                if (piece && piece.color === this.playerColor) {
                    this.selectPiece(row, col);
                } else {
                    this.renderer.clearSelection();
                }
            }
        } else {
            // Select piece
            const piece = this.board.getPiece(row, col);
            if (piece && piece.color === this.playerColor) {
                this.selectPiece(row, col);
            }
        }
    }

    selectPiece(row, col) {
        const legalMoves = this.board.getLegalMoves(this.playerColor);
        // Filter for this piece
        const movesForPiece = legalMoves.filter(m => m.fromRow === row && m.fromCol === col);
        this.renderer.updateSelection(row, col, movesForPiece);
    }

    executeMove(move) {
        this.board.makeMove(move);
        this.renderer.draw();

        if (this.checkGameOver()) return;

        this.isProcessing = true;
        this.updateUI();

        // AI Turn
        setTimeout(() => {
            if (this.board.turn === this.ai.color) {
                this.ai.makeMove(this.board, (bestMove) => {
                    if (bestMove) {
                        this.board.makeMove(bestMove);
                        this.renderer.draw();
                        this.checkGameOver();
                    }
                    this.isProcessing = false;
                    this.updateUI();
                });
            }
        }, 100);
    }

    checkGameOver() {
        if (this.board.isInCheck(this.board.turn)) {
            const moves = this.board.getLegalMoves(this.board.turn);
            if (moves.length === 0) {
                this.board.isGameOver = true;
                this.updateUI(`Checkmate! ${this.board.turn === COLOR.WHITE ? "Black" : "White"} Wins`);
                return true;
            }
            // else: Check
        } else {
            // Stalemate?
            const moves = this.board.getLegalMoves(this.board.turn);
            if (moves.length === 0) {
                this.board.isGameOver = true;
                this.updateUI('Stalemate!');
                return true;
            }
        }
        return false;
    }

    updateUI(statusOverride = null) {
        if (statusOverride) {
            this.gameStatus.textContent = statusOverride;
            this.turnIndicator.textContent = "Game Over";
            return;
        }

        const turnName = this.board.turn === COLOR.WHITE ? "White" : "Black";
        this.turnIndicator.textContent = `${turnName}'s Turn`;

        if (this.board.isInCheck(this.board.turn)) {
            this.gameStatus.textContent = "Check!";
        } else {
            this.gameStatus.textContent = "Game Active";
        }
    }
}
