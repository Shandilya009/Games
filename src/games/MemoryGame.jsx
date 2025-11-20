import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { scoresAPI } from '../services/api';

const emojis = ['🎮', '🎯', '🎲', '🎨', '🎪', '🎭', '🎬', '🎤'];

function MemoryGame({ gameId }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    startNewGame();
  }, []);

  useEffect(() => {
    if (matched.length === emojis.length * 2 && matched.length > 0) {
      setGameWon(true);
      calculateScore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matched]);

  const startNewGame = () => {
    const pairs = [...emojis, ...emojis];
    const shuffled = pairs.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setGameWon(false);
  };

  const handleCardClick = (index) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) {
      return;
    }

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);
    setMoves(moves + 1);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (cards[first] === cards[second]) {
        setMatched([...matched, first, second]);
        setFlipped([]);
      } else {
        setTimeout(() => {
          setFlipped([]);
        }, 1000);
      }
    }
  };

  const calculateScore = async () => {
    if (!user) return;

    const baseScore = 500;
    const moveBonus = Math.max(0, 100 - moves * 5);
    const totalScore = baseScore + moveBonus;

    try {
      await scoresAPI.submit({
        userId: user._id,
        gameId: gameId || 'memory-game',
        pointsEarned: totalScore,
        gameName: 'Memory Game'
      });
      showToast(`Congratulations! You earned ${totalScore} points!`, 'success');
      const updatedUser = { ...user, totalPoints: (user.totalPoints || 0) + totalScore };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('userUpdated'));
    } catch {
      console.log('Score submission failed (using mock data)');
      const updatedUser = { ...user, totalPoints: (user.totalPoints || 0) + totalScore };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('userUpdated'));
      showToast(`Congratulations! You earned ${totalScore} points!`, 'success');
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-8 p-8 bg-[#1a2332] border border-[#2d3748] rounded-3xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl mb-4 text-white font-bold">Memory Game</h2>
        <div className="flex justify-center gap-8 text-[#a0aec0] font-semibold">
          <span>Moves: {moves}</span>
          <span>Matched: {matched.length / 2} / {emojis.length}</span>
        </div>
      </div>

      {gameWon && (
        <div className="text-center p-6 bg-[rgba(0,212,255,0.1)] border-2 border-[#00d4ff] rounded-xl mb-8">
          <h3 className="text-3xl text-[#00d4ff] mb-2 font-bold">🎉 You Won! 🎉</h3>
          <p className="text-[#a0aec0] text-lg">You completed the game in {moves} moves!</p>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4 mb-8">
        {cards.map((emoji, index) => {
          const isFlipped = flipped.includes(index) || matched.includes(index);
          return (
            <button
              key={index}
              className={`aspect-square bg-[#141b2d] border-2 border-[#2d3748] rounded-xl cursor-pointer relative transition-all hover:scale-105 hover:border-[#00d4ff] disabled:cursor-not-allowed ${
                isFlipped ? 'pointer-events-none' : ''
              }`}
              onClick={() => handleCardClick(index)}
              disabled={gameWon}
            >
              {isFlipped ? (
                <div className="absolute inset-0 w-full h-full flex items-center justify-center rounded-lg bg-[#1a2332] text-white text-4xl">
                  {emoji}
                </div>
              ) : (
                <div className="absolute inset-0 w-full h-full flex items-center justify-center rounded-lg bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] text-white text-4xl">
                  ?
                </div>
              )}
            </button>
          );
        })}
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

export default MemoryGame;
