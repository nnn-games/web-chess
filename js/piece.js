import { PIECE_TYPE, COLOR } from './constants.js';

export class Piece {
    constructor(type, color) {
        this.type = type;
        this.color = color;
        this.hasMoved = false;
    }

    // Returns array of {row, col} pseudo-legal moves (not checking for checks yet)
    // Board is needed to check for blocking pieces
    getPseudoLegalMoves(board, row, col) {
        return [];
    }
}

export class Pawn extends Piece {
    constructor(color) {
        super(PIECE_TYPE.PAWN, color);
    }

    getPseudoLegalMoves(board, row, col) {
        const moves = [];
        const direction = this.color === COLOR.WHITE ? 1 : -1; // White moves up (assuming 0,0 is top-left?? Wait, standard is bottom-left 0,0 usually but in simple array 0,0 is top-left. Let's define: 0,0 is top-left. White is at 6,7 (rows 6,7), Black at 0,1.
        // ACTUALLY: Let's stick to array indices. 
        // Row 0 = Black pieces. Row 7 = White pieces.
        // So White moves UP (decreasing Row index). Black moves DOWN (increasing Row index).

        const forward = this.color === COLOR.WHITE ? -1 : 1;
        const startRow = this.color === COLOR.WHITE ? 6 : 1;

        // 1. Move forward 1
        const nextRow = row + forward;
        if (board.isValidSquare(nextRow, col) && board.isEmpty(nextRow, col)) {
            moves.push({ row: nextRow, col: col });

            // 2. Move forward 2
            const doubleNextRow = row + (forward * 2);
            if (row === startRow && board.isValidSquare(doubleNextRow, col) && board.isEmpty(doubleNextRow, col)) {
                moves.push({ row: doubleNextRow, col: col });
            }
        }

        // 3. Captures
        const captureCols = [col - 1, col + 1];
        for (const c of captureCols) {
            if (board.isValidSquare(nextRow, c)) {
                const target = board.getPiece(nextRow, c);
                if (target && target.color !== this.color) {
                    moves.push({ row: nextRow, col: c });
                }
            }
        }

        return moves;
    }
}

export class Knight extends Piece {
    constructor(color) {
        super(PIECE_TYPE.KNIGHT, color);
    }

    getPseudoLegalMoves(board, row, col) {
        const moves = [];
        const offsets = [
            [-2, -1], [-2, 1],
            [-1, -2], [-1, 2],
            [1, -2], [1, 2],
            [2, -1], [2, 1]
        ];

        for (const [rOff, cOff] of offsets) {
            const r = row + rOff;
            const c = col + cOff;
            if (board.isValidSquare(r, c)) {
                const target = board.getPiece(r, c);
                if (!target || target.color !== this.color) {
                    moves.push({ row: r, col: c });
                }
            }
        }
        return moves;
    }
}

export class Bishop extends Piece {
    constructor(color) {
        super(PIECE_TYPE.BISHOP, color);
    }

    getPseudoLegalMoves(board, row, col) {
        return getSlidingMoves(board, row, col, this.color, [
            [-1, -1], [-1, 1], [1, -1], [1, 1]
        ]);
    }
}

export class Rook extends Piece {
    constructor(color) {
        super(PIECE_TYPE.ROOK, color);
    }

    getPseudoLegalMoves(board, row, col) {
        return getSlidingMoves(board, row, col, this.color, [
            [-1, 0], [1, 0], [0, -1], [0, 1]
        ]);
    }
}

export class Queen extends Piece {
    constructor(color) {
        super(PIECE_TYPE.QUEEN, color);
    }

    getPseudoLegalMoves(board, row, col) {
        return getSlidingMoves(board, row, col, this.color, [
            [-1, -1], [-1, 1], [1, -1], [1, 1],
            [-1, 0], [1, 0], [0, -1], [0, 1]
        ]);
    }
}

export class King extends Piece {
    constructor(color) {
        super(PIECE_TYPE.KING, color);
    }

    getPseudoLegalMoves(board, row, col) {
        const moves = [];
        const offsets = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        for (const [rOff, cOff] of offsets) {
            const r = row + rOff;
            const c = col + cOff;
            if (board.isValidSquare(r, c)) {
                const target = board.getPiece(r, c);
                if (!target || target.color !== this.color) {
                    moves.push({ row: r, col: c });
                }
            }
        }
        return moves;
    }
}

function getSlidingMoves(board, row, col, color, directions) {
    const moves = [];
    for (const [dr, dc] of directions) {
        let r = row + dr;
        let c = col + dc;
        while (board.isValidSquare(r, c)) {
            const target = board.getPiece(r, c);
            if (!target) {
                // Empty square
                moves.push({ row: r, col: c });
            } else {
                // Occupied
                if (target.color !== color) {
                    // Capture
                    moves.push({ row: r, col: c });
                }
                // Blocked by any piece (friend or foe), stop sliding
                break;
            }
            r += dr;
            c += dc;
        }
    }
    return moves;
}

export function createPiece(type, color) {
    switch (type) {
        case PIECE_TYPE.PAWN: return new Pawn(color);
        case PIECE_TYPE.KNIGHT: return new Knight(color);
        case PIECE_TYPE.BISHOP: return new Bishop(color);
        case PIECE_TYPE.ROOK: return new Rook(color);
        case PIECE_TYPE.QUEEN: return new Queen(color);
        case PIECE_TYPE.KING: return new King(color);
        default: return null;
    }
}
