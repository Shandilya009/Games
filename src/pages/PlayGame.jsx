import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import TicTacToe from '../games/TicTacToe';
import MemoryGame from '../games/MemoryGame';
import NumberGuesser from '../games/NumberGuesser';
import SnakeGame from '../games/SnakeGame';
import WordScramble from '../games/WordScramble';
import ReactionTime from '../games/ReactionTime';
import QuizGame from '../games/QuizGame';
import RockPaperScissors from '../games/RockPaperScissors';

const gameComponents = {
  'tic-tac-toe': TicTacToe,
  'memory-game': MemoryGame,
  'number-guesser': NumberGuesser,
  'snake-game': SnakeGame,
  'word-scramble': WordScramble,
  'reaction-time': ReactionTime,
  'quiz-game': QuizGame,
  'rock-paper-scissors': RockPaperScissors,
};

const gameNames = {
  'tic-tac-toe': 'Tic Tac Toe',
  'memory-game': 'Memory Match',
  'number-guesser': 'Number Guesser',
  'snake-game': 'Snake Game',
  'word-scramble': 'Word Scramble',
  'reaction-time': 'Reaction Time Test',
  'quiz-game': 'Quiz Game',
  'rock-paper-scissors': 'Rock Paper Scissors',
};

function PlayGame() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const GameComponent = gameComponents[gameId];

  if (!user) {
    showToast('Please login to play games', 'warning');
    navigate('/login');
    return null;
  }

  if (!GameComponent) {
    return (
      <div className="min-h-[calc(100vh-80px)] p-8 max-w-6xl mx-auto">
        <div className="text-center py-20 px-8 bg-[#1a2332] border border-[#2d3748] rounded-3xl">
          <h2 className="text-3xl mb-4 text-white font-bold">Game Not Found</h2>
          <p className="text-[#a0aec0] mb-8">The game you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/games')}
            className="px-6 py-3 bg-[#141b2d] text-white border border-[#2d3748] rounded-lg font-semibold cursor-pointer transition-all hover:bg-[#252f42] hover:border-[#00d4ff] hover:-translate-x-1"
          >
            Back to Games
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8 p-6 bg-[#1a2332] border border-[#2d3748] rounded-xl flex-wrap gap-4">
        <button
          onClick={() => navigate('/games')}
          className="px-6 py-3 bg-[#141b2d] text-white border border-[#2d3748] rounded-lg font-semibold cursor-pointer transition-all hover:bg-[#252f42] hover:border-[#00d4ff] hover:-translate-x-1"
        >
          ← Back to Games
        </button>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] bg-clip-text text-transparent uppercase tracking-wide flex-1 text-center">
          {gameNames[gameId] || 'Game'}
        </h1>
        <div className="text-[#a0aec0] font-medium">
          <span>Playing as: {user.username}</span>
        </div>
      </div>
      <div className="bg-[#1a2332] border border-[#2d3748] rounded-3xl p-8 min-h-[500px]">
        <GameComponent gameId={gameId} />
      </div>
    </div>
  );
}

export default PlayGame;
