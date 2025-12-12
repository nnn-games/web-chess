import { PIECE_VALUES, Color, BOARD_SIZE } from './constants';
import { Board, FullMove } from './board';

export class AI {
    color: Color;
    depth: number;

    constructor(color: Color) {
        this.color = color;
        this.depth = 3;
    }

    setDifficulty(level: string) {
        this.depth = parseInt(level) + 1;
    }

    makeMove(board: Board, callback: (move: FullMove | null) => void) {
        setTimeout(() => {
            const bestMove = this.minimaxRoot(board, this.depth, true);
            callback(bestMove);
        }, 100);
    }

    evaluateBoard(board: Board): number {
        let totalEvaluation = 0;
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                const piece = board.grid[r][c];
                if (piece) {
                    const value = PIECE_VALUES[piece.type];
                    if (piece.color === this.color) {
                        totalEvaluation += value;
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

    minimaxRoot(board: Board, depth: number, isMaximizingPlayer: boolean): FullMove | null {
        const newGameMoves = board.getLegalMoves(this.color);
        let bestMove = -9999;
        let bestMoveFound: FullMove | null = null;

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

    minimax(board: Board, depth: number, alpha: number, beta: number, isMaximizingPlayer: boolean): number {
        if (depth === 0) {
            return this.evaluateBoard(board);
        }

        const currentTurnColor = isMaximizingPlayer ? this.color : (this.color === Color.WHITE ? Color.BLACK : Color.WHITE);
        const moves = board.getLegalMoves(currentTurnColor);

        if (moves.length === 0) {
            if (board.isInCheck(currentTurnColor)) {
                return isMaximizingPlayer ? -99999 : 99999;
            }
            return 0;
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
