import { Board, FullMove } from './board';
import { Renderer } from './renderer';
import { AI } from './ai';
import { Color, SQUARE_SIZE } from './constants';

export class Game {
    canvas: HTMLCanvasElement;
    board: Board;
    renderer: Renderer;
    ai: AI;
    turnIndicator: HTMLElement;
    gameStatus: HTMLElement;
    restartBtn: HTMLButtonElement;
    aiDifficulty: HTMLSelectElement;
    playerColor: Color;
    isProcessing: boolean;

    constructor() {
        const canvas = document.getElementById('chessBoard');
        if (!canvas) throw new Error("Canvas not found");
        this.canvas = canvas as HTMLCanvasElement;

        this.board = new Board();
        this.renderer = new Renderer(this.canvas, this.board);
        this.ai = new AI(Color.BLACK);

        this.turnIndicator = document.getElementById('turnIndicator') as HTMLElement;
        this.gameStatus = document.getElementById('gameStatus') as HTMLElement;
        this.restartBtn = document.getElementById('restartBtn') as HTMLButtonElement;
        this.aiDifficulty = document.getElementById('aiDifficulty') as HTMLSelectElement;

        this.setupEventListeners();

        this.restartBtn.addEventListener('click', () => this.restart());
        this.aiDifficulty.addEventListener('change', (e) => {
            const target = e.target as HTMLSelectElement;
            this.ai.setDifficulty(target.value);
        });

        this.playerColor = Color.WHITE;
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

    handleClick(e: MouseEvent) {
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
            const move = this.renderer.validMoves.find(m => m.row === row && m.col === col);
            if (move) {
                this.executeMove({
                    fromRow: this.renderer.selectedSquare.row,
                    fromCol: this.renderer.selectedSquare.col,
                    toRow: row,
                    toCol: col
                });
                this.renderer.clearSelection();
            } else {
                const piece = this.board.getPiece(row, col);
                if (piece && piece.color === this.playerColor) {
                    this.selectPiece(row, col);
                } else {
                    this.renderer.clearSelection();
                }
            }
        } else {
            const piece = this.board.getPiece(row, col);
            if (piece && piece.color === this.playerColor) {
                this.selectPiece(row, col);
            }
        }
    }

    selectPiece(row: number, col: number) {
        const legalMoves = this.board.getLegalMoves(this.playerColor);
        const movesForPiece = legalMoves.filter(m => m.fromRow === row && m.fromCol === col);
        this.renderer.updateSelection(row, col, movesForPiece);
    }

    executeMove(move: FullMove) {
        this.board.makeMove(move);
        this.renderer.draw();

        if (this.checkGameOver()) return;

        this.isProcessing = true;
        this.updateUI();

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

    checkGameOver(): boolean {
        if (this.board.isInCheck(this.board.turn)) {
            const moves = this.board.getLegalMoves(this.board.turn);
            if (moves.length === 0) {
                this.board.isGameOver = true;
                this.updateUI(`Checkmate! ${this.board.turn === Color.WHITE ? "Black" : "White"} Wins`);
                return true;
            }
        } else {
            const moves = this.board.getLegalMoves(this.board.turn);
            if (moves.length === 0) {
                this.board.isGameOver = true;
                this.updateUI('Stalemate!');
                return true;
            }
        }
        return false;
    }

    updateUI(statusOverride: string | null = null) {
        if (statusOverride) {
            this.gameStatus.textContent = statusOverride;
            this.turnIndicator.textContent = "Game Over";
            return;
        }

        const turnName = this.board.turn === Color.WHITE ? "White" : "Black";
        this.turnIndicator.textContent = `${turnName}'s Turn`;

        if (this.board.isInCheck(this.board.turn)) {
            this.gameStatus.textContent = "Check!";
        } else {
            this.gameStatus.textContent = "Game Active";
        }
    }
}
