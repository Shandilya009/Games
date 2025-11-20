import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { scoresAPI } from '../services/api';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const BASE_GAME_SPEED = 150;
const MIN_SPEED = 100;
const MAX_SPEED = 200;

// Generate random starting position
const getRandomStartPosition = () => {
  const x = Math.floor(Math.random() * (GRID_SIZE - 4)) + 2;
  const y = Math.floor(Math.random() * (GRID_SIZE - 4)) + 2;
  return { x, y };
};

// Generate random starting direction
const getRandomDirection = () => {
  const directions = [
    { x: 1, y: 0 },   // Right
    { x: -1, y: 0 },  // Left
    { x: 0, y: 1 },   // Down
    { x: 0, y: -1 },  // Up
  ];
  return directions[Math.floor(Math.random() * directions.length)];
};

function SnakeGame({ gameId }) {
  const [snake, setSnake] = useState(() => {
    const startPos = getRandomStartPosition();
    return [{ x: startPos.x, y: startPos.y }];
  });
  const [food, setFood] = useState(() => {
    const startPos = getRandomStartPosition();
    return { x: startPos.x, y: startPos.y };
  });
  const [direction, setDirection] = useState(() => getRandomDirection());
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(BASE_GAME_SPEED);
  const [gameStarted, setGameStarted] = useState(false);
  const gameLoopRef = useRef(null);
  const directionRef = useRef(getRandomDirection());
  const foodRef = useRef(null);
  const { user } = useAuth();
  const { showToast } = useToast();

  // Generate food that doesn't overlap with snake
  const generateRandomFood = (snakeBody) => {
    let newFood;
    let attempts = 0;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      attempts++;
    } while (
      snakeBody.some(segment => segment.x === newFood.x && segment.y === newFood.y) &&
      attempts < 100
    );
    return newFood;
  };

  // Initialize game with random values
  useEffect(() => {
    const startPos = getRandomStartPosition();
    const startDir = getRandomDirection();
    const startFood = generateRandomFood([{ x: startPos.x, y: startPos.y }]);

    setSnake([{ x: startPos.x, y: startPos.y }]);
    setFood(startFood);
    foodRef.current = startFood;
    setDirection(startDir);
    directionRef.current = startDir;
    setGameSpeed(BASE_GAME_SPEED);
    setGameStarted(true);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, []);

  // Sync foodRef with food state
  useEffect(() => {
    if (food) {
      foodRef.current = food;
    }
  }, [food]);

  useEffect(() => {
    if (gameOver && user && gameStarted) {
      handleGameEnd();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameOver, gameStarted]);

  const moveSnake = useCallback(() => {
    setSnake((prevSnake) => {
      const head = { ...prevSnake[0] };
      head.x += directionRef.current.x;
      head.y += directionRef.current.y;

      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameOver(true);
        if (gameLoopRef.current) {
          clearInterval(gameLoopRef.current);
        }
        return prevSnake;
      }

      if (prevSnake.some((segment) => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        if (gameLoopRef.current) {
          clearInterval(gameLoopRef.current);
        }
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];
      const currentFood = foodRef.current;

      if (head.x === currentFood.x && head.y === currentFood.y) {
        // Random points between 10-20
        const pointsEarned = 10 + Math.floor(Math.random() * 11);
        setScore((prev) => prev + pointsEarned);

        // Gradually increase speed as score increases (makes it harder)
        setGameSpeed((prevSpeed) => {
          const newSpeed = Math.max(MIN_SPEED, prevSpeed - 2);
          return newSpeed;
        });

        // Generate new food that doesn't overlap with snake
        const newFood = generateRandomFood(newSnake);
        setFood(newFood);
        foodRef.current = newFood;

        return newSnake;
      } else {
        newSnake.pop();
        return newSnake;
      }
    });
  }, []);

  const startGame = useCallback(() => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    // Add slight random variation to game speed for unpredictability
    const speedVariation = Math.floor(Math.random() * 20) - 10; // -10 to +10ms
    const currentSpeed = Math.max(MIN_SPEED, Math.min(MAX_SPEED, gameSpeed + speedVariation));

    gameLoopRef.current = setInterval(() => {
      if (!isPaused && !gameOver && gameStarted) {
        moveSnake();
      }
    }, currentSpeed);
  }, [isPaused, gameOver, gameStarted, gameSpeed, moveSnake]);

  // Start game loop when game is ready
  useEffect(() => {
    if (gameStarted && !gameOver && !isPaused) {
      startGame();
    }
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameStarted, gameOver, isPaused, startGame]);

  const handleKeyPress = useCallback((e) => {
    if (gameOver || !gameStarted) return;

    const key = e.key;
    const newDirection = { ...directionRef.current };

    // Arrow keys and WASD support
    if ((key === 'ArrowUp' || key === 'w' || key === 'W') && directionRef.current.y === 0) {
      e.preventDefault();
      newDirection.x = 0;
      newDirection.y = -1;
      directionRef.current = newDirection;
      setDirection(newDirection);
    } else if ((key === 'ArrowDown' || key === 's' || key === 'S') && directionRef.current.y === 0) {
      e.preventDefault();
      newDirection.x = 0;
      newDirection.y = 1;
      directionRef.current = newDirection;
      setDirection(newDirection);
    } else if ((key === 'ArrowLeft' || key === 'a' || key === 'A') && directionRef.current.x === 0) {
      e.preventDefault();
      newDirection.x = -1;
      newDirection.y = 0;
      directionRef.current = newDirection;
      setDirection(newDirection);
    } else if ((key === 'ArrowRight' || key === 'd' || key === 'D') && directionRef.current.x === 0) {
      e.preventDefault();
      newDirection.x = 1;
      newDirection.y = 0;
      directionRef.current = newDirection;
      setDirection(newDirection);
    } else if (key === ' ' || key === 'Space') {
      e.preventDefault();
      setIsPaused((prev) => !prev);
    }
  }, [gameOver, gameStarted]);

  useEffect(() => {
    if (gameStarted) {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [handleKeyPress, gameStarted]);

  const resetGame = () => {
    const startPos = getRandomStartPosition();
    const startDir = getRandomDirection();
    const startFood = generateRandomFood([{ x: startPos.x, y: startPos.y }]);

    setSnake([{ x: startPos.x, y: startPos.y }]);
    setFood(startFood);
    foodRef.current = startFood;
    setDirection(startDir);
    directionRef.current = startDir;
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
    setGameSpeed(BASE_GAME_SPEED);
    setGameStarted(true);
  };

  const handleGameEnd = async () => {
    if (!user) return;

    const pointsEarned = score * 2;

    try {
      await scoresAPI.submit({
        userId: user._id,
        gameId: gameId || 'snake-game',
        pointsEarned: pointsEarned,
        gameName: 'Snake Game',
      });
      showToast(`Game Over! You earned ${pointsEarned} points!`, 'success');
      const updatedUser = { ...user, totalPoints: (user.totalPoints || 0) + pointsEarned };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('userUpdated'));
    } catch (error) {
      console.log('Score submission failed (using mock data)');
      const updatedUser = { ...user, totalPoints: (user.totalPoints || 0) + pointsEarned };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('userUpdated'));
      showToast(`Game Over! You earned ${pointsEarned} points!`, 'success');
    }
  };

  return (
    <div className="max-w-lg mx-auto my-8 p-8 bg-[#1a2332] border border-[#2d3748] rounded-3xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl mb-2 text-white font-bold">Snake Game</h2>
        <div className="flex justify-center gap-8 text-[#a0aec0] font-semibold mb-4">
          <span>Score: {score}</span>
          <span>Length: {snake.length}</span>
        </div>
        {isPaused && !gameOver && (
          <p className="text-[#00d4ff] text-xl font-bold">⏸ PAUSED</p>
        )}
      </div>

      {gameOver && (
        <div className="text-center p-6 bg-[rgba(255,0,110,0.1)] border-2 border-[#ff006e] rounded-xl mb-8">
          <h3 className="text-3xl text-[#ff006e] mb-2 font-bold">Game Over!</h3>
          <p className="text-[#a0aec0] text-lg">Final Score: {score}</p>
        </div>
      )}

      <div className="flex justify-center mb-8">
        <div
          className="bg-[#141b2d] border-2 border-[#2d3748] rounded-xl p-4"
          style={{
            width: GRID_SIZE * CELL_SIZE + 8,
            height: GRID_SIZE * CELL_SIZE + 8,
          }}
        >
          <div className="relative" style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }}>
            {snake.map((segment, index) => (
              <div
                key={index}
                className={`absolute rounded ${
                  index === 0 ? 'bg-[#00d4ff]' : 'bg-[#7b2cbf]'
                }`}
                style={{
                  left: segment.x * CELL_SIZE,
                  top: segment.y * CELL_SIZE,
                  width: CELL_SIZE - 2,
                  height: CELL_SIZE - 2,
                }}
              />
            ))}
            <div
              className="absolute bg-[#ff006e] rounded-full"
              style={{
                left: food.x * CELL_SIZE,
                top: food.y * CELL_SIZE,
                width: CELL_SIZE - 2,
                height: CELL_SIZE - 2,
              }}
            />
          </div>
        </div>
      </div>

      {!gameStarted && (
        <div className="text-center p-6 bg-[rgba(0,212,255,0.1)] border-2 border-[#00d4ff] rounded-xl mb-8">
          <h3 className="text-2xl text-[#00d4ff] mb-2 font-bold">Ready to Play!</h3>
          <p className="text-[#a0aec0] text-lg">Game will start automatically</p>
        </div>
      )}

      <div className="text-center mb-6">
        <p className="text-[#a0aec0] text-sm mb-2">Use Arrow Keys or WASD to move</p>
        <p className="text-[#a0aec0] text-sm">Press SPACE to pause</p>
        <p className="text-[#a0aec0] text-xs mt-2">Speed increases as you score!</p>
      </div>

      <button
        onClick={resetGame}
        className="w-full p-4 bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] text-white border-none rounded-xl text-base font-semibold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(0,212,255,0.3)]"
      >
        {gameOver ? 'Play Again' : 'Reset Game'}
      </button>
    </div>
  );
}

export default SnakeGame;

