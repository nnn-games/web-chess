import { BOARD_SIZE, COLOR, PIECE_TYPE } from './constants.js';
import { createPiece } from './piece.js';

export class Board {
    constructor() {
        this.grid = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
        this.turn = COLOR.WHITE;
        this.isGameOver = false;
        this.moveHistory = [];
        this.reset();
    }

    reset() {
        this.grid = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
        this.turn = COLOR.WHITE;
        this.isGameOver = false;
        this.moveHistory = [];
        this.setupBoard();
    }

    setupBoard() {
        // Setup Pawns
        for (let i = 0; i < BOARD_SIZE; i++) {
            this.grid[1][i] = createPiece(PIECE_TYPE.PAWN, COLOR.BLACK);
            this.grid[6][i] = createPiece(PIECE_TYPE.PAWN, COLOR.WHITE);
        }

        const layout = [
            PIECE_TYPE.ROOK, PIECE_TYPE.KNIGHT, PIECE_TYPE.BISHOP, PIECE_TYPE.QUEEN,
            PIECE_TYPE.KING, PIECE_TYPE.BISHOP, PIECE_TYPE.KNIGHT, PIECE_TYPE.ROOK
        ];

        for (let i = 0; i < BOARD_SIZE; i++) {
            this.grid[0][i] = createPiece(layout[i], COLOR.BLACK);
            this.grid[7][i] = createPiece(layout[i], COLOR.WHITE);
        }
    }

    isValidSquare(row, col) {
        return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
    }

    isEmpty(row, col) {
        return this.grid[row][col] === null;
    }

    getPiece(row, col) {
        if (!this.isValidSquare(row, col)) return null;
        return this.grid[row][col];
    }

    // Deep copy for simulation
    clone() {
        const newBoard = new Board();
        // We need to copy grid structure but pieces can be referenced or shallow copied if they are immutable mostly.
        // Piece state 'hasMoved' is mutable, so we might need new instances or handle it carefully.
        // For simple minimax, full cloning is safer but slower. 
        // Let's do a simple clone of grid pointers for now and manual copy of mutable state if any.
        // Actually, piece objects have 'hasMoved'. We need to copy them.

        newBoard.grid = this.grid.map(row => row.map(p => {
            if (!p) return null;
            const newP = createPiece(p.type, p.color);
            newP.hasMoved = p.hasMoved;
            return newP;
        }));

        newBoard.turn = this.turn;
        newBoard.isGameOver = this.isGameOver;
        return newBoard;
    }

    makeMove(move) {
        const { fromRow, fromCol, toRow, toCol } = move;
        const piece = this.grid[fromRow][fromCol];
        const target = this.grid[toRow][toCol];

        // Save history for potential undo (though we might just clone for AI)
        // this.moveHistory.push({ ...move, captured: target, movedPiece: piece, prevHasMoved: piece.hasMoved });

        this.grid[toRow][toCol] = piece;
        this.grid[fromRow][fromCol] = null;
        piece.hasMoved = true;

        // Pawn promotion (auto-queen for simplicity)
        if (piece.type === PIECE_TYPE.PAWN) {
            if ((piece.color === COLOR.WHITE && toRow === 0) ||
                (piece.color === COLOR.BLACK && toRow === 7)) {
                this.grid[toRow][toCol] = createPiece(PIECE_TYPE.QUEEN, piece.color);
            }
        }

        this.turn = this.turn === COLOR.WHITE ? COLOR.BLACK : COLOR.WHITE;
    }

    undoMove(move) {
        // Not implementing full undo yet, relying on cloning for AI
        // If we need performance, we implement proper undo
    }

    getLegalMoves(color) {
        const moves = [];
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                const piece = this.grid[r][c];
                if (piece && piece.color === color) {
                    const pseudoMoves = piece.getPseudoLegalMoves(this, r, c);
                    for (const pm of pseudoMoves) {
                        // Validate if move results in self-check
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

    isInCheck(color) {
        // Find King
        let kingRow, kingCol;
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                const p = this.grid[r][c];
                if (p && p.type === PIECE_TYPE.KING && p.color === color) {
                    kingRow = r;
                    kingCol = c;
                    break;
                }
            }
        }

        // If no king found (shouldn't happen), return false
        if (kingRow === undefined) return false;

        // Check if any enemy piece attacks the king
        const enemyColor = color === COLOR.WHITE ? COLOR.BLACK : COLOR.WHITE;

        // Optimization: checking all enemy pieces' pseudo moves is slow. 
        // Faster: check lines radiating from King for sliding pieces + Knight jumps + Pawn attacks.

        // 1. Sliding pieces
        const lines = [
            [-1, 0], [1, 0], [0, -1], [0, 1], // Rook/Queen
            [-1, -1], [-1, 1], [1, -1], [1, 1] // Bishop/Queen
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

                        if (p.type === PIECE_TYPE.QUEEN) return true;
                        if (isDiagonal && p.type === PIECE_TYPE.BISHOP) return true;
                        if (isStraight && p.type === PIECE_TYPE.ROOK) return true;
                        if (isDiagonal && p.type === PIECE_TYPE.PAWN) {
                            // Pawn captures are specific.
                            // Black pawn at (r,c) attacks (r+1, c+/-1) => White King at row > Black Pawn row
                            // White King at (row, col). Enemy is BLACK. 
                            // Black pawn is at (r, c).
                            // If Black pawn checks White King, it must be "up" from King's perspective if we looked at board?
                            // Wait. White King at 6,4. Black Pawn at 5,3 => Attacks 6,4.
                            // So if enemy is Black, Pawn must be at kingRow - 1. 
                            // If enemy is White, Pawn must be at kingRow + 1.

                            const attackRow = enemyColor === COLOR.BLACK ? kingRow - 1 : kingRow + 1;
                            if (r === attackRow) return true;
                        }
                    }
                    break; // Blocked by any piece
                }
                r += dr;
                c += dc;
            }
        }

        // 2. Knights
        const knightJumps = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        for (const [dr, dc] of knightJumps) {
            const r = kingRow + dr;
            const c = kingCol + dc;
            if (this.isValidSquare(r, c)) {
                const p = this.grid[r][c];
                if (p && p.color === enemyColor && p.type === PIECE_TYPE.KNIGHT) return true;
            }
        }

        // 3. Pawns (already partially handled in sliding loop? No, sliding loop doesn't catch single step pawn attacks correctly if not diagonal line check)
        // Actually, the sliding loop for diagonal includes Pawn check logic.
        // It's correct: `if (isDiagonal && p.type === PIECE_TYPE.PAWN)` inside the while loop.
        // BUT `while` loop goes far. Pawn only attacks 1 square away.
        // Logic fix: inside the sliding loop, we only check for Pawn if it is the FIRST square.
        // My implementation above breaks loop on first piece. So if P is the first piece found, it checks.
        // BUT need to ensure distance is 1.

        // Let's refine the pawn check inside the loop or do it separately.
        // Separately is safer and clearer.

        const pawnRowDir = enemyColor === COLOR.WHITE ? -1 : 1; // White pawns attack "Up" (row-1), Black "Down" (row+1) relative to themselves.
        // So a White King is attacked by Black Pawn from (kingRow-1). 
        // A Black King is attacked by White Pawn from (kingRow+1).

        const attackFromRow = enemyColor === COLOR.WHITE ? kingRow + 1 : kingRow - 1;
        if (attackFromRow >= 0 && attackFromRow < BOARD_SIZE) {
            if (this.isValidSquare(attackFromRow, kingCol - 1)) {
                const p = this.grid[attackFromRow][kingCol - 1];
                if (p && p.color === enemyColor && p.type === PIECE_TYPE.PAWN) return true;
            }
            if (this.isValidSquare(attackFromRow, kingCol + 1)) {
                const p = this.grid[attackFromRow][kingCol + 1];
                if (p && p.color === enemyColor && p.type === PIECE_TYPE.PAWN) return true;
            }
        }

        // 4. King (enemy king next to our king)
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const r = kingRow + dr;
                const c = kingCol + dc;
                if (this.isValidSquare(r, c)) {
                    const p = this.grid[r][c];
                    if (p && p.color === enemyColor && p.type === PIECE_TYPE.KING) return true;
                }
            }
        }

        return false;
    }
}
