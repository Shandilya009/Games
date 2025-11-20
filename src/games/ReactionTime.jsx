import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { scoresAPI } from '../services/api';

function ReactionTime({ gameId }) {
  const [waiting, setWaiting] = useState(false);
  const [ready, setReady] = useState(false);
  const [reactionTime, setReactionTime] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [times, setTimes] = useState([]);
  const [round, setRound] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const timeoutRef = useRef(null);
  const { user } = useAuth();
  const { showToast } = useToast();

  const MAX_ROUNDS = 5;
  const MIN_WAIT = 2000;
  const MAX_WAIT = 5000;

  useEffect(() => {
    if (gameOver && user && times.length === MAX_ROUNDS) {
      handleGameEnd();
    }
  }, [gameOver, times.length]);

  const startRound = () => {
    setReady(false);
    setWaiting(true);
    setReactionTime(null);

    const waitTime = Math.random() * (MAX_WAIT - MIN_WAIT) + MIN_WAIT;

    timeoutRef.current = setTimeout(() => {
      setWaiting(false);
      setReady(true);
      setStartTime(Date.now());
    }, waitTime);
  };

  const handleClick = () => {
    if (waiting) {
      clearTimeout(timeoutRef.current);
      setWaiting(false);
      setReady(false);
      showToast('Too early! Wait for the green light.', 'error');
      return;
    }

    if (ready && startTime) {
      const time = Date.now() - startTime;
      setReactionTime(time);
      setTimes((prev) => [...prev, time]);
      setRound((prev) => {
        const newRound = prev + 1;
        if (newRound >= MAX_ROUNDS) {
          setGameOver(true);
        }
        return newRound;
      });
      setReady(false);
    }
  };

  const resetGame = () => {
    setWaiting(false);
    setReady(false);
    setReactionTime(null);
    setTimes([]);
    setRound(0);
    setGameOver(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const getAverageTime = () => {
    if (times.length === 0) return 0;
    return Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  };

  const handleGameEnd = async () => {
    if (!user) return;

    const avgTime = getAverageTime();
    const pointsEarned = Math.max(0, Math.round((500 - avgTime) * 2));

    try {
      await scoresAPI.submit({
        userId: user._id,
        gameId: gameId || 'reaction-time',
        pointsEarned: pointsEarned,
        gameName: 'Reaction Time Test',
      });
      showToast(`Game Over! You earned ${pointsEarned} points!`, 'success');
      const updatedUser = { ...user, totalPoints: (user.totalPoints || 0) + pointsEarned };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('userUpdated'));
    } catch {
      console.log('Score submission failed (using mock data)');
      const updatedUser = { ...user, totalPoints: (user.totalPoints || 0) + pointsEarned };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('userUpdated'));
      showToast(`Game Over! You earned ${pointsEarned} points!`, 'success');
    }
  };

  const getButtonColor = () => {
    if (waiting) return 'bg-[#ff006e]';
    if (ready) return 'bg-[#00ff00]';
    return 'bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf]';
  };

  const getButtonText = () => {
    if (waiting) return 'Wait...';
    if (ready) return 'CLICK NOW!';
    if (gameOver) return 'Play Again';
    return 'Start Round';
  };

  return (
    <div className="max-w-lg mx-auto my-8 p-8 bg-[#1a2332] border border-[#2d3748] rounded-3xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl mb-2 text-white font-bold">Reaction Time Test</h2>
        <div className="flex justify-center gap-8 text-[#a0aec0] font-semibold mb-4">
          <span>Round: {round} / {MAX_ROUNDS}</span>
          {reactionTime && <span>Last: {reactionTime}ms</span>}
        </div>
        {times.length > 0 && (
          <div className="text-[#00d4ff] font-bold text-xl mb-2">
            Average: {getAverageTime()}ms
          </div>
        )}
      </div>

      {gameOver && (
        <div className="text-center p-6 bg-[rgba(0,212,255,0.1)] border-2 border-[#00d4ff] rounded-xl mb-8">
          <h3 className="text-3xl text-[#00d4ff] mb-2 font-bold">Game Complete!</h3>
          <p className="text-[#a0aec0] text-lg mb-2">Average Reaction Time: {getAverageTime()}ms</p>
          <div className="text-[#a0aec0] text-sm">
            {times.map((time, index) => (
              <span key={index} className="mx-2">{time}ms</span>
            ))}
          </div>
        </div>
      )}

      <div className="mb-8">
        <button
          onClick={ready || waiting ? handleClick : startRound}
          className={`w-full h-64 ${getButtonColor()} text-white border-none rounded-xl text-3xl font-bold cursor-pointer transition-all hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed`}
          disabled={gameOver && !ready && !waiting}
        >
          {getButtonText()}
        </button>
      </div>

      {!gameOver && (
        <div className="text-center mb-6">
          <p className="text-[#a0aec0] text-sm">
            {waiting && 'Wait for the green light...'}
            {ready && 'Click as fast as you can!'}
            {!waiting && !ready && 'Click to start the round'}
          </p>
        </div>
      )}

      <button
        onClick={resetGame}
        className="w-full p-4 bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] text-white border-none rounded-xl text-base font-semibold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(0,212,255,0.3)]"
      >
        Reset Game
      </button>
    </div>
  );
}

export default ReactionTime;

