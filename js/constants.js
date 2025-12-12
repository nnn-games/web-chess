export const PIECE_TYPE = {
    EMPTY: 0,
    PAWN: 1,
    KNIGHT: 2,
    BISHOP: 3,
    ROOK: 4,
    QUEEN: 5,
    KING: 6
};

export const COLOR = {
    WHITE: 0,
    BLACK: 1
};

export const BOARD_SIZE = 8;
export const SQUARE_SIZE = 75; // Based on 600px canvas / 8
export const CANVAS_SIZE = 600;

// Unicode symbols for pieces (fallback if we don't draw Custom shapes immediately, 
// but we will implement custom drawing in Renderer)
export const SYMBOLS = {
    [COLOR.WHITE]: {
        [PIECE_TYPE.PAWN]: '♙',
        [PIECE_TYPE.KNIGHT]: '♘',
        [PIECE_TYPE.BISHOP]: '♗',
        [PIECE_TYPE.ROOK]: '♖',
        [PIECE_TYPE.QUEEN]: '♕',
        [PIECE_TYPE.KING]: '♔'
    },
    [COLOR.BLACK]: {
        [PIECE_TYPE.PAWN]: '♟',
        [PIECE_TYPE.KNIGHT]: '♞',
        [PIECE_TYPE.BISHOP]: '♝',
        [PIECE_TYPE.ROOK]: '♜',
        [PIECE_TYPE.QUEEN]: '♛',
        [PIECE_TYPE.KING]: '♚'
    }
};

export const PIECE_VALUES = {
    [PIECE_TYPE.PAWN]: 100,
    [PIECE_TYPE.KNIGHT]: 320,
    [PIECE_TYPE.BISHOP]: 330,
    [PIECE_TYPE.ROOK]: 500,
    [PIECE_TYPE.QUEEN]: 900,
    [PIECE_TYPE.KING]: 20000
};
