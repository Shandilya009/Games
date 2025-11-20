import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { scoresAPI } from '../services/api';

function NumberGuesser({ gameId }) {
  const [targetNumber, setTargetNumber] = useState(null);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [maxAttempts] = useState(7);
  const [hint, setHint] = useState('');
  const [gameWon, setGameWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const number = Math.floor(Math.random() * 100) + 1;
    setTargetNumber(number);
    setGuess('');
    setAttempts(0);
    setHint('');
    setGameWon(false);
    setGameOver(false);
  };

  const handleGuess = () => {
    const numGuess = parseInt(guess);

    if (isNaN(numGuess) || numGuess < 1 || numGuess > 100) {
      showToast('Please enter a number between 1 and 100', 'error');
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (numGuess === targetNumber) {
      setGameWon(true);
      setGameOver(true);
      calculateScore(newAttempts);
      showToast('Congratulations! You guessed it!', 'success');
    } else if (newAttempts >= maxAttempts) {
      setGameOver(true);
      showToast(`Game Over! The number was ${targetNumber}`, 'error');
    } else {
      if (numGuess < targetNumber) {
        setHint('Too low! Try higher.');
      } else {
        setHint('Too high! Try lower.');
      }
    }
  };

  const calculateScore = async (attemptsUsed) => {
    if (!user) return;

    const baseScore = 300;
    const attemptBonus = (maxAttempts - attemptsUsed) * 50;
    const totalScore = baseScore + attemptBonus;

    try {
      await scoresAPI.submit({
        userId: user._id,
        gameId: gameId || 'number-guesser',
        pointsEarned: totalScore,
        gameName: 'Number Guesser'
      });
      showToast(`You earned ${totalScore} points!`, 'success');
      const updatedUser = { ...user, totalPoints: (user.totalPoints || 0) + totalScore };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('userUpdated'));
    } catch {
      console.log('Score submission failed (using mock data)');
      const updatedUser = { ...user, totalPoints: (user.totalPoints || 0) + totalScore };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('userUpdated'));
      showToast(`You earned ${totalScore} points!`, 'success');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !gameOver) {
      handleGuess();
    }
  };

  return (
    <div className="max-w-lg mx-auto my-8 p-8 bg-[#1a2332] border border-[#2d3748] rounded-3xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl mb-2 text-white font-bold">Number Guesser</h2>
        <p className="text-[#a0aec0] mb-4">Guess the number between 1 and 100!</p>
        <div className="text-[#a0aec0] font-semibold">
          <span>Attempts: {attempts} / {maxAttempts}</span>
        </div>
      </div>

      {gameWon && (
        <div className="text-center p-6 bg-[rgba(0,212,255,0.1)] border-2 border-[#00d4ff] rounded-xl mb-8">
          <h3 className="text-3xl text-[#00d4ff] mb-2 font-bold">🎉 You Won! 🎉</h3>
          <p className="text-[#a0aec0] text-lg">You guessed it in {attempts} attempts!</p>
        </div>
      )}

      {gameOver && !gameWon && (
        <div className="text-center p-6 bg-[rgba(255,0,110,0.1)] border-2 border-[#ff006e] rounded-xl mb-8">
          <h3 className="text-3xl text-[#ff006e] mb-2 font-bold">Game Over</h3>
          <p className="text-[#a0aec0] text-lg">The number was {targetNumber}</p>
        </div>
      )}

      <div className="mb-8">
        <div className="text-center p-6 bg-[#141b2d] rounded-xl mb-6 min-h-[60px] flex items-center justify-center">
          <p className="text-xl font-semibold text-white m-0">{hint || 'Enter your guess below'}</p>
        </div>

        <div className="flex gap-4">
          <input
            type="number"
            min="1"
            max="100"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter number (1-100)"
            disabled={gameOver}
            className="flex-1 p-4 bg-[#141b2d] border-2 border-[#2d3748] rounded-xl text-white text-xl text-center transition-all focus:outline-none focus:border-[#00d4ff] disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleGuess}
            disabled={gameOver || !guess}
            className="px-8 py-4 bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] text-white border-none rounded-xl text-base font-semibold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(0,212,255,0.3)] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Guess
          </button>
        </div>
      </div>

      <button
        onClick={startNewGame}
        className="w-full p-4 bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] text-white border-none rounded-xl text-base font-semibold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(0,212,255,0.3)]"
      >
        New Game
      </button>
    </div>
  );
}

export default NumberGuesser;
