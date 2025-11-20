import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { scoresAPI } from '../services/api';

const CHOICES = ['rock', 'paper', 'scissors'];
const EMOJIS = { rock: '🪨', paper: '📄', scissors: '✂️' };

// Strategy patterns for computer AI (adds unpredictability)
const STRATEGIES = {
  random: () => CHOICES[Math.floor(Math.random() * CHOICES.length)],
  counter: (playerChoice) => {
    // Counter player's last choice
    if (playerChoice === 'rock') return 'paper';
    if (playerChoice === 'paper') return 'scissors';
    return 'rock';
  },
  mirror: (playerChoice) => {
    // Sometimes mirror player's choice
    return Math.random() > 0.5 ? playerChoice : CHOICES[Math.floor(Math.random() * CHOICES.length)];
  },
  weighted: () => {
    // Weighted random (slightly favors certain choices)
    const weights = [0.35, 0.35, 0.30]; // rock, paper, scissors
    const rand = Math.random();
    if (rand < weights[0]) return CHOICES[0];
    if (rand < weights[0] + weights[1]) return CHOICES[1];
    return CHOICES[2];
  },
};

function RockPaperScissors({ gameId }) {
  const [playerChoice, setPlayerChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [result, setResult] = useState(null);
  const [score, setScore] = useState({ wins: 0, losses: 0, draws: 0 });
  const [round, setRound] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [lastPlayerChoice, setLastPlayerChoice] = useState(null);
  const [currentStrategy, setCurrentStrategy] = useState('random');
  const thinkingTimeoutRef = useRef(null);
  const { user } = useAuth();
  const { showToast } = useToast();

  const MAX_ROUNDS = 5;

  // Randomly change strategy every few rounds
  useEffect(() => {
    if (round > 0 && round % 2 === 0) {
      const strategies = Object.keys(STRATEGIES);
      setCurrentStrategy(strategies[Math.floor(Math.random() * strategies.length)]);
    }
  }, [round]);

  const determineWinner = (player, computer) => {
    if (player === computer) return 'draw';
    if (
      (player === 'rock' && computer === 'scissors') ||
      (player === 'paper' && computer === 'rock') ||
      (player === 'scissors' && computer === 'paper')
    ) {
      return 'win';
    }
    return 'loss';
  };

  const getComputerChoice = (playerChoice) => {
    // Mix of strategies for unpredictability
    const strategyMix = Math.random();

    if (strategyMix < 0.4) {
      // 40% pure random
      return STRATEGIES.random();
    } else if (strategyMix < 0.7 && lastPlayerChoice) {
      // 30% counter last choice
      return STRATEGIES.counter(lastPlayerChoice);
    } else if (strategyMix < 0.85) {
      // 15% mirror
      return STRATEGIES.mirror(playerChoice);
    } else {
      // 15% weighted
      return STRATEGIES.weighted();
    }
  };

  const handleChoice = (choice) => {
    if (gameOver || result || isThinking) return;

    setPlayerChoice(choice);
    setIsThinking(true);

    // Random delay between 300-800ms to simulate thinking
    const thinkingDelay = 300 + Math.floor(Math.random() * 500);

    thinkingTimeoutRef.current = setTimeout(() => {
      const computer = getComputerChoice(choice);
      setComputerChoice(computer);
      setLastPlayerChoice(choice);
      setIsThinking(false);

      const gameResult = determineWinner(choice, computer);
      setResult(gameResult);

    setScore((prev) => ({
      wins: prev.wins + (gameResult === 'win' ? 1 : 0),
      losses: prev.losses + (gameResult === 'loss' ? 1 : 0),
      draws: prev.draws + (gameResult === 'draw' ? 1 : 0),
    }));

      setRound((prev) => {
        const newRound = prev + 1;
        if (newRound >= MAX_ROUNDS) {
          setTimeout(() => {
            setGameOver(true);
            handleGameEnd();
          }, 2000);
        }
        return newRound;
      });

      // Random delay before showing toast
      setTimeout(() => {
        if (gameResult === 'win') {
          showToast('You win this round!', 'success');
        } else if (gameResult === 'loss') {
          showToast('Computer wins this round!', 'error');
        } else {
          showToast("It's a draw!", 'warning');
        }
      }, 100 + Math.floor(Math.random() * 200));
    }, thinkingDelay);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (thinkingTimeoutRef.current) {
        clearTimeout(thinkingTimeoutRef.current);
      }
    };
  }, []);

  const nextRound = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult(null);
  };

  const resetGame = () => {
    if (thinkingTimeoutRef.current) {
      clearTimeout(thinkingTimeoutRef.current);
    }
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult(null);
    setScore({ wins: 0, losses: 0, draws: 0 });
    setRound(0);
    setGameOver(false);
    setIsThinking(false);
    setLastPlayerChoice(null);
    setCurrentStrategy('random');
  };

  const handleGameEnd = async () => {
    if (!user) return;

    const winPoints = score.wins * 50;
    const totalPoints = winPoints;

    try {
      await scoresAPI.submit({
        userId: user._id,
        gameId: gameId || 'rock-paper-scissors',
        pointsEarned: totalPoints,
        gameName: 'Rock Paper Scissors',
      });
      showToast(`Game Over! You earned ${totalPoints} points!`, 'success');
      const updatedUser = { ...user, totalPoints: (user.totalPoints || 0) + totalPoints };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('userUpdated'));
    } catch (error) {
      console.log('Score submission failed (using mock data)');
      const updatedUser = { ...user, totalPoints: (user.totalPoints || 0) + totalPoints };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('userUpdated'));
      showToast(`Game Over! You earned ${totalPoints} points!`, 'success');
    }
  };

  return (
    <div className="max-w-lg mx-auto my-8 p-8 bg-[#1a2332] border border-[#2d3748] rounded-3xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl mb-2 text-white font-bold">Rock Paper Scissors</h2>
        <div className="flex justify-center gap-8 text-[#a0aec0] font-semibold mb-4">
          <span>Round: {round} / {MAX_ROUNDS}</span>
          <span>Wins: {score.wins}</span>
        </div>
      </div>

      {gameOver && (
        <div className="text-center p-6 bg-[rgba(0,212,255,0.1)] border-2 border-[#00d4ff] rounded-xl mb-8">
          <h3 className="text-3xl text-[#00d4ff] mb-2 font-bold">Game Over!</h3>
          <p className="text-[#a0aec0] text-lg mb-2">
            Final Score: {score.wins} wins, {score.losses} losses, {score.draws} draws
          </p>
          <p className="text-[#a0aec0] text-lg">
            Points Earned: {score.wins * 50}
          </p>
        </div>
      )}

      {result && (
        <div className="mb-8">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="text-center p-6 bg-[#141b2d] rounded-xl">
              <p className="text-[#a0aec0] mb-2">You</p>
              <div className="text-8xl">{EMOJIS[playerChoice]}</div>
              <p className="text-white font-bold mt-2 capitalize">{playerChoice}</p>
            </div>
            <div className="text-center p-6 bg-[#141b2d] rounded-xl">
              <p className="text-[#a0aec0] mb-2">Computer</p>
              <div className="text-8xl">{EMOJIS[computerChoice]}</div>
              <p className="text-white font-bold mt-2 capitalize">{computerChoice}</p>
            </div>
          </div>
          <div className="text-center">
            <p className={`text-3xl font-bold ${
              result === 'win' ? 'text-[#00ff00]' :
              result === 'loss' ? 'text-[#ff006e]' :
              'text-[#00d4ff]'
            }`}>
              {result === 'win' ? 'You Win! 🎉' :
               result === 'loss' ? 'You Lose! 😔' :
               "It's a Draw! 🤝"}
            </p>
          </div>
          {!gameOver && (
            <button
              onClick={nextRound}
              className="w-full mt-4 p-4 bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] text-white border-none rounded-xl text-base font-semibold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(0,212,255,0.3)]"
            >
              Next Round
            </button>
          )}
        </div>
      )}

      {isThinking && (
        <div className="text-center p-6 bg-[#141b2d] rounded-xl mb-8">
          <p className="text-[#a0aec0] text-xl font-semibold">Computer is thinking...</p>
          <div className="mt-4 flex justify-center">
            <div className="animate-spin text-4xl">🤔</div>
          </div>
        </div>
      )}

      {!result && !gameOver && !isThinking && (
        <div className="mb-8">
          <p className="text-center text-[#a0aec0] text-lg mb-6">Choose your weapon:</p>
          <div className="grid grid-cols-3 gap-4">
            {CHOICES.map((choice) => (
              <button
                key={choice}
                onClick={() => handleChoice(choice)}
                className="p-6 bg-[#141b2d] border-2 border-[#2d3748] rounded-xl text-6xl cursor-pointer transition-all hover:border-[#00d4ff] hover:scale-110 hover:bg-[#1a2332] active:scale-95"
              >
                {EMOJIS[choice]}
              </button>
            ))}
          </div>
        </div>
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

export default RockPaperScissors;

