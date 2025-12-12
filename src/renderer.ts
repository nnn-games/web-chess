import { BOARD_SIZE, SQUARE_SIZE, Color, SYMBOLS } from './constants';
import { Board, FullMove } from './board';

export interface RenderMove {
    row: number;
    col: number;
}

export class Renderer {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    board: Board;
    lightSquareColor: string;
    darkSquareColor: string;
    selectedSquare: { row: number, col: number } | null;
    validMoves: RenderMove[];

    constructor(canvas: HTMLCanvasElement, board: Board) {
        this.canvas = canvas;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Could not get 2d context");
        this.ctx = ctx;
        this.board = board;
        this.lightSquareColor = '#e2e8f0';
        this.darkSquareColor = '#475569';

        this.selectedSquare = null;
        this.validMoves = [];
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

                if (c === 0) {
                    this.ctx.fillStyle = isLight ? this.darkSquareColor : this.lightSquareColor;
                    this.ctx.font = '10px Arial';
                    this.ctx.fillText(String(8 - r), 2, r * SQUARE_SIZE + 12);
                }
                if (r === 7) {
                    this.ctx.fillStyle = isLight ? this.darkSquareColor : this.lightSquareColor;
                    this.ctx.fillText(String.fromCharCode(97 + c), c * SQUARE_SIZE + SQUARE_SIZE - 10, 600 - 3);
                }
            }
        }
    }

    drawHighlights() {
        if (this.selectedSquare) {
            this.ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
            this.ctx.fillRect(this.selectedSquare.col * SQUARE_SIZE, this.selectedSquare.row * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
        }

        this.ctx.fillStyle = 'rgba(100, 255, 100, 0.5)';
        for (const move of this.validMoves) {
            const cx = move.col * SQUARE_SIZE + SQUARE_SIZE / 2;
            const cy = move.row * SQUARE_SIZE + SQUARE_SIZE / 2;

            this.ctx.beginPath();
            this.ctx.arc(cx, cy, SQUARE_SIZE / 6, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawPieces() {
        this.ctx.font = `${SQUARE_SIZE * 0.8}px 'Arial'`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                const piece = this.board.grid[r][c];
                if (piece) {
                    const symbol = SYMBOLS[piece.color][piece.type];

                    const centerX = c * SQUARE_SIZE + SQUARE_SIZE / 2;
                    const centerY = r * SQUARE_SIZE + SQUARE_SIZE / 2 + 5;

                    if (piece.color === Color.WHITE) {
                        this.ctx.fillStyle = '#ffffff';
                        this.ctx.shadowColor = 'black';
                        this.ctx.shadowBlur = 4;
                    } else {
                        this.ctx.fillStyle = '#000000';
                        this.ctx.shadowColor = 'white';
                        this.ctx.shadowBlur = 0;
                    }

                    this.ctx.fillText(symbol, centerX, centerY);
                    this.ctx.shadowBlur = 0;
                }
            }
        }
    }

    updateSelection(row: number, col: number, validMoves: FullMove[]) {
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
