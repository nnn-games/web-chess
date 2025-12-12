import { PieceType, Color } from './constants';
import { Board } from './board';

export interface Move {
    row: number;
    col: number;
}

export abstract class Piece {
    type: PieceType;
    color: Color;
    hasMoved: boolean;

    constructor(type: PieceType, color: Color) {
        this.type = type;
        this.color = color;
        this.hasMoved = false;
    }

    abstract getPseudoLegalMoves(board: Board, row: number, col: number): Move[];
}

export class Pawn extends Piece {
    constructor(color: Color) {
        super(PieceType.PAWN, color);
    }

    getPseudoLegalMoves(board: Board, row: number, col: number): Move[] {
        const moves: Move[] = [];
        const forward = this.color === Color.WHITE ? -1 : 1;
        const startRow = this.color === Color.WHITE ? 6 : 1;

        const nextRow = row + forward;
        if (board.isValidSquare(nextRow, col) && board.isEmpty(nextRow, col)) {
            moves.push({ row: nextRow, col: col });

            const doubleNextRow = row + (forward * 2);
            if (row === startRow && board.isValidSquare(doubleNextRow, col) && board.isEmpty(doubleNextRow, col)) {
                moves.push({ row: doubleNextRow, col: col });
            }
        }

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
    constructor(color: Color) {
        super(PieceType.KNIGHT, color);
    }

    getPseudoLegalMoves(board: Board, row: number, col: number): Move[] {
        const moves: Move[] = [];
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
    constructor(color: Color) {
        super(PieceType.BISHOP, color);
    }

    getPseudoLegalMoves(board: Board, row: number, col: number): Move[] {
        return getSlidingMoves(board, row, col, this.color, [
            [-1, -1], [-1, 1], [1, -1], [1, 1]
        ]);
    }
}

export class Rook extends Piece {
    constructor(color: Color) {
        super(PieceType.ROOK, color);
    }

    getPseudoLegalMoves(board: Board, row: number, col: number): Move[] {
        return getSlidingMoves(board, row, col, this.color, [
            [-1, 0], [1, 0], [0, -1], [0, 1]
        ]);
    }
}

export class Queen extends Piece {
    constructor(color: Color) {
        super(PieceType.QUEEN, color);
    }

    getPseudoLegalMoves(board: Board, row: number, col: number): Move[] {
        return getSlidingMoves(board, row, col, this.color, [
            [-1, -1], [-1, 1], [1, -1], [1, 1],
            [-1, 0], [1, 0], [0, -1], [0, 1]
        ]);
    }
}

export class King extends Piece {
    constructor(color: Color) {
        super(PieceType.KING, color);
    }

    getPseudoLegalMoves(board: Board, row: number, col: number): Move[] {
        const moves: Move[] = [];
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

function getSlidingMoves(board: Board, row: number, col: number, color: Color, directions: number[][]): Move[] {
    const moves: Move[] = [];
    for (const [dr, dc] of directions) {
        let r = row + dr;
        let c = col + dc;
        while (board.isValidSquare(r, c)) {
            const target = board.getPiece(r, c);
            if (!target) {
                moves.push({ row: r, col: c });
            } else {
                if (target.color !== color) {
                    moves.push({ row: r, col: c });
                }
                break;
            }
            r += dr;
            c += dc;
        }
    }
    return moves;
}

export function createPiece(type: PieceType, color: Color): Piece | null {
    switch (type) {
        case PieceType.PAWN: return new Pawn(color);
        case PieceType.KNIGHT: return new Knight(color);
        case PieceType.BISHOP: return new Bishop(color);
        case PieceType.ROOK: return new Rook(color);
        case PieceType.QUEEN: return new Queen(color);
        case PieceType.KING: return new King(color);
        default: return null;
    }
}
