import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { scoresAPI } from '../services/api';

const WORDS = [
  { word: 'JAVASCRIPT', hint: 'Programming language for web development' },
  { word: 'REACT', hint: 'Popular JavaScript library for UI' },
  { word: 'GAMING', hint: 'Playing video games' },
  { word: 'PUZZLE', hint: 'A game or problem that tests ingenuity' },
  { word: 'CHALLENGE', hint: 'A difficult task or problem' },
  { word: 'VICTORY', hint: 'The act of defeating an opponent' },
  { word: 'STRATEGY', hint: 'A plan of action designed to achieve a goal' },
  { word: 'ADVENTURE', hint: 'An exciting or dangerous experience' },
  { word: 'CHAMPION', hint: 'A person who has defeated all opponents' },
  { word: 'LEADERBOARD', hint: 'A ranking of players by score' },
];

function WordScramble({ gameId }) {
  const [currentWord, setCurrentWord] = useState('');
  const [scrambledWord, setScrambledWord] = useState('');
  const [hint, setHint] = useState('');
  const [guess, setGuess] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    startNewWord();
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (gameOver && user) {
      handleGameEnd();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameOver]);

  const scrambleWord = (word) => {
    const letters = word.split('');
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    return letters.join('');
  };

  const startNewWord = () => {
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    setCurrentWord(randomWord.word);
    setScrambledWord(scrambleWord(randomWord.word));
    setHint(randomWord.hint);
    setGuess('');
  };

  const handleGuess = () => {
    if (guess.toUpperCase() === currentWord) {
      const points = currentWord.length * 10;
      setScore((prev) => prev + points);
      setCorrectCount((prev) => prev + 1);
      showToast(`Correct! +${points} points`, 'success');
      startNewWord();
    } else {
      showToast('Incorrect! Try again.', 'error');
      setGuess('');
    }
  };

  const handleSkip = () => {
    startNewWord();
    showToast('Word skipped', 'warning');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !gameOver) {
      handleGuess();
    }
  };

  const handleGameEnd = async () => {
    if (!user) return;

    const bonusPoints = correctCount * 50;
    const totalPoints = score + bonusPoints;

    try {
      await scoresAPI.submit({
        userId: user._id,
        gameId: gameId || 'word-scramble',
        pointsEarned: totalPoints,
        gameName: 'Word Scramble',
      });
      showToast(`Game Over! You earned ${totalPoints} points!`, 'success');
      const updatedUser = { ...user, totalPoints: (user.totalPoints || 0) + totalPoints };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('userUpdated'));
    } catch {
      console.log('Score submission failed (using mock data)');
      const updatedUser = { ...user, totalPoints: (user.totalPoints || 0) + totalPoints };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('userUpdated'));
      showToast(`Game Over! You earned ${totalPoints} points!`, 'success');
    }
  };

  const resetGame = () => {
    setScore(0);
    setTimeLeft(60);
    setGameOver(false);
    setCorrectCount(0);
    startNewWord();
  };

  return (
    <div className="max-w-lg mx-auto my-8 p-8 bg-[#1a2332] border border-[#2d3748] rounded-3xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl mb-2 text-white font-bold">Word Scramble</h2>
        <div className="flex justify-center gap-8 text-[#a0aec0] font-semibold mb-4">
          <span>Score: {score}</span>
          <span>Time: {timeLeft}s</span>
          <span>Correct: {correctCount}</span>
        </div>
      </div>

      {gameOver && (
        <div className="text-center p-6 bg-[rgba(255,0,110,0.1)] border-2 border-[#ff006e] rounded-xl mb-8">
          <h3 className="text-3xl text-[#ff006e] mb-2 font-bold">Time's Up!</h3>
          <p className="text-[#a0aec0] text-lg">Final Score: {score}</p>
          <p className="text-[#a0aec0] text-lg">Words Correct: {correctCount}</p>
        </div>
      )}

      {!gameOver && (
        <>
          <div className="mb-8">
            <div className="text-center p-6 bg-[#141b2d] rounded-xl mb-4">
              <p className="text-4xl font-bold text-[#00d4ff] mb-4 tracking-widest">
                {scrambledWord}
              </p>
              <p className="text-[#a0aec0] text-lg">Hint: {hint}</p>
            </div>

            <div className="flex gap-4">
              <input
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                placeholder="Enter the word"
                disabled={gameOver}
                className="flex-1 p-4 bg-[#141b2d] border-2 border-[#2d3748] rounded-xl text-white text-xl text-center transition-all focus:outline-none focus:border-[#00d4ff] disabled:opacity-60 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleGuess}
                disabled={gameOver || !guess}
                className="px-8 py-4 bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] text-white border-none rounded-xl text-base font-semibold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(0,212,255,0.3)] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Submit
              </button>
            </div>
            <button
              onClick={handleSkip}
              disabled={gameOver}
              className="w-full mt-4 p-3 bg-[#141b2d] text-[#a0aec0] border-2 border-[#2d3748] rounded-xl text-base font-semibold cursor-pointer transition-all hover:border-[#00d4ff] hover:text-white disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Skip Word
            </button>
          </div>
        </>
      )}

      <button
        onClick={resetGame}
        className="w-full p-4 bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] text-white border-none rounded-xl text-base font-semibold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(0,212,255,0.3)]"
      >
        {gameOver ? 'Play Again' : 'Reset Game'}
      </button>
    </div>
  );
}

export default WordScramble;

