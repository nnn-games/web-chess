import { BOARD_SIZE, Color, PieceType } from './constants';
import { createPiece, Piece } from './piece';

export interface FullMove {
    fromRow: number;
    fromCol: number;
    toRow: number;
    toCol: number;
}

export class Board {
    grid: (Piece | null)[][];
    turn: Color;
    isGameOver: boolean;
    // moveHistory: any[];

    constructor() {
        this.grid = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
        this.turn = Color.WHITE;
        this.isGameOver = false;
        // this.moveHistory = [];
        this.reset();
    }

    reset() {
        this.grid = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
        this.turn = Color.WHITE;
        this.isGameOver = false;
        // this.moveHistory = [];
        this.setupBoard();
    }

    setupBoard() {
        for (let i = 0; i < BOARD_SIZE; i++) {
            this.grid[1][i] = createPiece(PieceType.PAWN, Color.BLACK);
            this.grid[6][i] = createPiece(PieceType.PAWN, Color.WHITE);
        }

        const layout = [
            PieceType.ROOK, PieceType.KNIGHT, PieceType.BISHOP, PieceType.QUEEN,
            PieceType.KING, PieceType.BISHOP, PieceType.KNIGHT, PieceType.ROOK
        ];

        for (let i = 0; i < BOARD_SIZE; i++) {
            this.grid[0][i] = createPiece(layout[i], Color.BLACK);
            this.grid[7][i] = createPiece(layout[i], Color.WHITE);
        }
    }

    isValidSquare(row: number, col: number): boolean {
        return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
    }

    isEmpty(row: number, col: number): boolean {
        return this.grid[row][col] === null;
    }

    getPiece(row: number, col: number): Piece | null {
        if (!this.isValidSquare(row, col)) return null;
        return this.grid[row][col];
    }

    clone(): Board {
        const newBoard = new Board();
        newBoard.grid = this.grid.map(row => row.map(p => {
            if (!p) return null;
            const newP = createPiece(p.type, p.color);
            if (newP) newP.hasMoved = p.hasMoved;
            return newP;
        }));
        newBoard.turn = this.turn;
        newBoard.isGameOver = this.isGameOver;
        return newBoard;
    }

    makeMove(move: FullMove) {
        const { fromRow, fromCol, toRow, toCol } = move;
        const piece = this.grid[fromRow][fromCol];

        if (!piece) return;

        this.grid[toRow][toCol] = piece;
        this.grid[fromRow][fromCol] = null;
        piece.hasMoved = true;

        if (piece.type === PieceType.PAWN) {
            if ((piece.color === Color.WHITE && toRow === 0) ||
                (piece.color === Color.BLACK && toRow === 7)) {
                this.grid[toRow][toCol] = createPiece(PieceType.QUEEN, piece.color);
            }
        }

        this.turn = this.turn === Color.WHITE ? Color.BLACK : Color.WHITE;
    }

    getLegalMoves(color: Color): FullMove[] {
        const moves: FullMove[] = [];
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                const piece = this.grid[r][c];
                if (piece && piece.color === color) {
                    const pseudoMoves = piece.getPseudoLegalMoves(this, r, c);
                    for (const pm of pseudoMoves) {
                        const simBoard = this.clone();
                        simBoard.makeMove({ fromRow: r, fromCol: c, toRow: pm.row, toCol: pm.col });
                        if (!simBoard.isInCheck(color)) {
                            moves.push({ fromRow: r, fromCol: c, toRow: pm.row, toCol: pm.col });
                        }
                    }
                }
            }
        }
        return moves;
    }

    isInCheck(color: Color): boolean {
        let kingRow = -1, kingCol = -1;
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                const p = this.grid[r][c];
                if (p && p.type === PieceType.KING && p.color === color) {
                    kingRow = r;
                    kingCol = c;
                    break;
                }
            }
        }

        if (kingRow === -1) return false;

        const enemyColor = color === Color.WHITE ? Color.BLACK : Color.WHITE;

        // Sliding
        const lines = [
            [-1, 0], [1, 0], [0, -1], [0, 1],
            [-1, -1], [-1, 1], [1, -1], [1, 1]
        ];

        for (const [dr, dc] of lines) {
            let r = kingRow + dr;
            let c = kingCol + dc;
            while (this.isValidSquare(r, c)) {
                const p = this.grid[r][c];
                if (p) {
                    if (p.color === enemyColor) {
                        const isDiagonal = Math.abs(dr) === Math.abs(dc);
                        const isStraight = !isDiagonal;

                        if (p.type === PieceType.QUEEN) return true;
                        if (isDiagonal && p.type === PieceType.BISHOP) return true;
                        if (isStraight && p.type === PieceType.ROOK) return true;
                    }
                    break;
                }
                r += dr;
                c += dc;
            }
        }

        // Knights
        const knightJumps = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        for (const [dr, dc] of knightJumps) {
            const r = kingRow + dr;
            const c = kingCol + dc;
            if (this.isValidSquare(r, c)) {
                const p = this.grid[r][c];
                if (p && p.color === enemyColor && p.type === PieceType.KNIGHT) return true;
            }
        }

        // Pawns
        const attackFromRow = enemyColor === Color.WHITE ? kingRow + 1 : kingRow - 1;
        if (attackFromRow >= 0 && attackFromRow < BOARD_SIZE) {
            if (this.isValidSquare(attackFromRow, kingCol - 1)) {
                const p = this.grid[attackFromRow][kingCol - 1];
                if (p && p.color === enemyColor && p.type === PieceType.PAWN) return true;
            }
            if (this.isValidSquare(attackFromRow, kingCol + 1)) {
                const p = this.grid[attackFromRow][kingCol + 1];
                if (p && p.color === enemyColor && p.type === PieceType.PAWN) return true;
            }
        }

        // King
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const r = kingRow + dr;
                const c = kingCol + dc;
                if (this.isValidSquare(r, c)) {
                    const p = this.grid[r][c];
                    if (p && p.color === enemyColor && p.type === PieceType.KING) return true;
                }
            }
        }

        return false;
    }
}
