import { BOARD_SIZE, SQUARE_SIZE, COLOR, PIECE_TYPE, SYMBOLS } from './constants.js';

export class Renderer {
    constructor(canvas, board) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.board = board;
        this.lightSquareColor = '#e2e8f0'; // Tailwind slate-200
        this.darkSquareColor = '#475569';  // Tailwind slate-600

        // Interactive state
        this.selectedSquare = null; // {row, col}
        this.validMoves = []; // Array of {row, col}
    }

    draw() {
        this.drawBoard();
        this.drawHighlights();
        this.drawPieces();
    }

    drawBoard() {
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                const isLight = (r + c) % 2 === 0;
                this.ctx.fillStyle = isLight ? this.lightSquareColor : this.darkSquareColor;
                this.ctx.fillRect(c * SQUARE_SIZE, r * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);

                // Coordinate labels (optional)
                if (c === 0) {
                    this.ctx.fillStyle = isLight ? this.darkSquareColor : this.lightSquareColor;
                    this.ctx.font = '10px Arial';
                    this.ctx.fillText(8 - r, 2, r * SQUARE_SIZE + 12);
                }
                if (r === 7) {
                    this.ctx.fillStyle = isLight ? this.darkSquareColor : this.lightSquareColor;
                    this.ctx.fillText(String.fromCharCode(97 + c), c * SQUARE_SIZE + SQUARE_SIZE - 10, 600 - 3);
                }
            }
        }
    }

    drawHighlights() {
        // Highlight selected
        if (this.selectedSquare) {
            this.ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
            this.ctx.fillRect(this.selectedSquare.col * SQUARE_SIZE, this.selectedSquare.row * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
        }

        // Highlight moves
        this.ctx.fillStyle = 'rgba(100, 255, 100, 0.5)';
        for (const move of this.validMoves) {
            // Draw circle or highlight
            const cx = move.col * SQUARE_SIZE + SQUARE_SIZE / 2;
            const cy = move.row * SQUARE_SIZE + SQUARE_SIZE / 2;

            this.ctx.beginPath();
            this.ctx.arc(cx, cy, SQUARE_SIZE / 6, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Highlight last move (optional)
    }

    drawPieces() {
        this.ctx.font = `${SQUARE_SIZE * 0.8}px 'Arial'`; // Use Unicode for now, maybe SVG later for premium look
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                const piece = this.board.grid[r][c];
                if (piece) {
                    const symbol = SYMBOLS[piece.color][piece.type];
                    this.ctx.fillStyle = piece.color === COLOR.WHITE ? '#fff' : '#000';
                    // Stroke for visibility against similar background? 
                    // White piece on light square is visible? 
                    // White piece text is white. Light square is e2e8f0 (light gray). 
                    // Might need black outline for white pieces and white outline for black pieces.

                    const centerX = c * SQUARE_SIZE + SQUARE_SIZE / 2;
                    const centerY = r * SQUARE_SIZE + SQUARE_SIZE / 2 + 5; // +5 for Baseline adjustments

                    if (piece.color === COLOR.WHITE) {
                        this.ctx.fillStyle = '#ffffff';
                        this.ctx.shadowColor = 'black';
                        this.ctx.shadowBlur = 4;
                    } else {
                        this.ctx.fillStyle = '#000000';
                        this.ctx.shadowColor = 'white';
                        this.ctx.shadowBlur = 0; // Black pieces usually solid enough?
                    }

                    this.ctx.fillText(symbol, centerX, centerY);
                    this.ctx.shadowBlur = 0; // Reset
                }
            }
        }
    }

    updateSelection(row, col, validMoves) {
        this.selectedSquare = { row, col };
        this.validMoves = validMoves.map(m => ({ row: m.toRow, col: m.toCol }));
        this.draw();
    }

    clearSelection() {
        this.selectedSquare = null;
        this.validMoves = [];
        this.draw();
    }
}
