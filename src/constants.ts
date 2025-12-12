export enum PieceType {
    EMPTY = 0,
    PAWN = 1,
    KNIGHT = 2,
    BISHOP = 3,
    ROOK = 4,
    QUEEN = 5,
    KING = 6
}

export enum Color {
    WHITE = 0,
    BLACK = 1
}

export const BOARD_SIZE = 8;
export const SQUARE_SIZE = 75;
export const CANVAS_SIZE = 600;

export const SYMBOLS: Record<Color, Record<PieceType, string>> = {
    [Color.WHITE]: {
        [PieceType.EMPTY]: '',
        [PieceType.PAWN]: '♙',
        [PieceType.KNIGHT]: '♘',
        [PieceType.BISHOP]: '♗',
        [PieceType.ROOK]: '♖',
        [PieceType.QUEEN]: '♕',
        [PieceType.KING]: '♔'
    },
    [Color.BLACK]: {
        [PieceType.EMPTY]: '',
        [PieceType.PAWN]: '♟',
        [PieceType.KNIGHT]: '♞',
        [PieceType.BISHOP]: '♝',
        [PieceType.ROOK]: '♜',
        [PieceType.QUEEN]: '♛',
        [PieceType.KING]: '♚'
    }
};

export const PIECE_VALUES: Record<PieceType, number> = {
    [PieceType.EMPTY]: 0,
    [PieceType.PAWN]: 100,
    [PieceType.KNIGHT]: 320,
    [PieceType.BISHOP]: 330,
    [PieceType.ROOK]: 500,
    [PieceType.QUEEN]: 900,
    [PieceType.KING]: 20000
};
