import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { scoresAPI } from '../services/api';

function TicTacToe({ gameId }) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (winner === 'X' && user) {
      handleGameEnd(100);
    } else if (winner === 'O') {
      handleGameEnd(0);
    } else if (winner === 'draw') {
      handleGameEnd(50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [winner]);

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    for (let line of lines) {
      const [a, b, c] = line;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }

    if (squares.every(square => square !== null)) {
      return 'draw';
    }

    return null;
  };

  const getBestMove = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    for (let line of lines) {
      const [a, b, c] = line;
      if (squares[a] === 'O' && squares[b] === 'O' && !squares[c]) return c;
      if (squares[a] === 'O' && squares[c] === 'O' && !squares[b]) return b;
      if (squares[b] === 'O' && squares[c] === 'O' && !squares[a]) return a;
    }

    for (let line of lines) {
      const [a, b, c] = line;
      if (squares[a] === 'X' && squares[b] === 'X' && !squares[c]) return c;
      if (squares[a] === 'X' && squares[c] === 'X' && !squares[b]) return b;
      if (squares[b] === 'X' && squares[c] === 'X' && !squares[a]) return a;
    }

    if (!squares[4]) return 4;

    const corners = [0, 2, 6, 8];
    for (let corner of corners) {
      if (!squares[corner]) return corner;
    }

    for (let i = 0; i < 9; i++) {
      if (!squares[i]) return i;
    }
  };

  const handleClick = (index) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    setIsXNext(false);

    const newWinner = calculateWinner(newBoard);
    if (newWinner) {
      setWinner(newWinner);
      return;
    }

    setTimeout(() => {
      const aiMove = getBestMove(newBoard);
      if (aiMove !== undefined) {
        const aiBoard = [...newBoard];
        aiBoard[aiMove] = 'O';
        setBoard(aiBoard);
        setIsXNext(true);

        const aiWinner = calculateWinner(aiBoard);
        if (aiWinner) {
          setWinner(aiWinner);
        }
      }
    }, 500);
  };

  const handleGameEnd = async (points) => {
    if (!user) return;

    try {
      await scoresAPI.submit({
        userId: user._id,
        gameId: gameId || 'tic-tac-toe',
        pointsEarned: points,
        gameName: 'Tic Tac Toe'
      });
      if (points > 0) {
        showToast(`You earned ${points} points!`, 'success');
        const updatedUser = { ...user, totalPoints: (user.totalPoints || 0) + points };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('userUpdated'));
      }
    } catch (error) {
      console.log('Score submission failed (using mock data)');
      if (points > 0) {
        const updatedUser = { ...user, totalPoints: (user.totalPoints || 0) + points };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('userUpdated'));
        showToast(`You earned ${points} points!`, 'success');
      }
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
  };

  const renderSquare = (index) => {
    return (
      <button
        className={`flex-1 aspect-square bg-[#1a2332] border-none text-5xl font-bold cursor-pointer transition-all rounded ${
          board[index] === 'X' ? 'text-[#00d4ff]' : board[index] === 'O' ? 'text-[#ff006e]' : 'text-white'
        } hover:bg-[#252f42] hover:scale-105 disabled:cursor-not-allowed`}
        onClick={() => handleClick(index)}
        disabled={!!winner || board[index]}
      >
        {board[index]}
      </button>
    );
  };

  const status = winner
    ? winner === 'X'
      ? 'You Win! 🎉'
      : winner === 'O'
        ? 'AI Wins! 😔'
        : 'Draw! 🤝'
    : `Next player: ${isXNext ? 'You (X)' : 'AI (O)'}`;

  return (
    <div className="max-w-lg mx-auto my-8 p-8 bg-[#1a2332] border border-[#2d3748] rounded-3xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl mb-2 text-white font-bold">Tic Tac Toe</h2>
        <p className="text-xl text-[#a0aec0] font-semibold">{status}</p>
      </div>

      <div className="flex flex-col gap-1 bg-[#141b2d] p-1 rounded-xl mb-8">
        <div className="flex gap-1">
          {renderSquare(0)}
          {renderSquare(1)}
          {renderSquare(2)}
        </div>
        <div className="flex gap-1">
          {renderSquare(3)}
          {renderSquare(4)}
          {renderSquare(5)}
        </div>
        <div className="flex gap-1">
          {renderSquare(6)}
          {renderSquare(7)}
          {renderSquare(8)}
        </div>
      </div>

      <button
        onClick={resetGame}
        className="w-full p-4 bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] text-white border-none rounded-xl text-base font-semibold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(0,212,255,0.3)]"
      >
        New Game
      </button>
    </div>
  );
}

export default TicTacToe;
