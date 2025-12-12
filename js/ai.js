import { PIECE_VALUES, COLOR, BOARD_SIZE, PIECE_TYPE } from './constants.js';

export class AI {
    constructor(color) {
        this.color = color;
        this.depth = 3; // Default depth 
    }

    setDifficulty(level) {
        // level 1: Depth 2
        // level 2: Depth 3
        // level 3: Depth 4 (might be slow in JS without optimization/workers)
        this.depth = parseInt(level) + 1;
    }

    makeMove(board, callback) {
        // Run in timeout to allow UI to render first
        setTimeout(() => {
            const bestMove = this.minimaxRoot(board, this.depth, true);
            callback(bestMove);
        }, 100);
    }

    evaluateBoard(board) {
        let totalEvaluation = 0;
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                const piece = board.grid[r][c];
                if (piece) {
                    const value = PIECE_VALUES[piece.type];
                    if (piece.color === this.color) {
                        totalEvaluation += value;
                        // Add positional component? (Center control)
                        // Simple center bonus
                        if ((r >= 3 && r <= 4) && (c >= 3 && c <= 4)) totalEvaluation += 10;
                    } else {
                        totalEvaluation -= value;
                        if ((r >= 3 && r <= 4) && (c >= 3 && c <= 4)) totalEvaluation -= 10;
                    }
                }
            }
        }
        return totalEvaluation;
    }

    minimaxRoot(board, depth, isMaximizingPlayer) {
        const newGameMoves = board.getLegalMoves(this.color);
        let bestMove = -9999;
        let bestMoveFound = null;

        // Simple randomization to avoid identical games
        newGameMoves.sort(() => Math.random() - 0.5);

        for (let i = 0; i < newGameMoves.length; i++) {
            const move = newGameMoves[i];
            const simBoard = board.clone();
            simBoard.makeMove(move);

            const value = this.minimax(simBoard, depth - 1, -100000, 100000, !isMaximizingPlayer);
            if (value >= bestMove) {
                bestMove = value;
                bestMoveFound = move;
            }
        }
        return bestMoveFound;
    }

    minimax(board, depth, alpha, beta, isMaximizingPlayer) {
        if (depth === 0) {
            return this.evaluateBoard(board); // Actually flip sign? evaluateBoard returns score relative to 'this.color'.
            // If isMaximizingPlayer is true, we want max score.
            // Wait, evaluateBoard definition:
            // if piece.color === this.color => positive.
            // So higher is better for 'this.color'.

            // In recursion: 
            // Root (Maximize) -> asks for max value.
            // Level 1 (Minimize - Enemy) -> asks for min value.
            // ...
        }

        const moves = board.getLegalMoves(isMaximizingPlayer ? this.color : (this.color === COLOR.WHITE ? COLOR.BLACK : COLOR.WHITE));

        // Game over check or checkmate check could be here
        if (moves.length === 0) {
            // If checkmate, return huge value. If stalemate, return 0.
            if (board.isInCheck(isMaximizingPlayer ? this.color : (this.color === COLOR.WHITE ? COLOR.BLACK : COLOR.WHITE))) {
                return isMaximizingPlayer ? -99999 : 99999; // Lost
            }
            return 0; // Stalemate
        }

        if (isMaximizingPlayer) {
            let bestMove = -99999;
            for (let i = 0; i < moves.length; i++) {
                const simBoard = board.clone();
                simBoard.makeMove(moves[i]);
                bestMove = Math.max(bestMove, this.minimax(simBoard, depth - 1, alpha, beta, !isMaximizingPlayer));
                alpha = Math.max(alpha, bestMove);
                if (beta <= alpha) {
                    return bestMove;
                }
            }
            return bestMove;
        } else {
            let bestMove = 99999;
            for (let i = 0; i < moves.length; i++) {
                const simBoard = board.clone();
                simBoard.makeMove(moves[i]);
                bestMove = Math.min(bestMove, this.minimax(simBoard, depth - 1, alpha, beta, !isMaximizingPlayer));
                beta = Math.min(beta, bestMove);
                if (beta <= alpha) {
                    return bestMove;
                }
            }
            return bestMove;
        }
    }
}
