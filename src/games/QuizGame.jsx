import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { scoresAPI } from '../services/api';

const QUIZ_QUESTIONS = [
  {
    question: 'What is the capital of France?',
    options: ['London', 'Berlin', 'Paris', 'Madrid'],
    correct: 2,
  },
  {
    question: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    correct: 1,
  },
  {
    question: 'What is 2 + 2?',
    options: ['3', '4', '5', '6'],
    correct: 1,
  },
  {
    question: 'Which programming language is used for web development?',
    options: ['Python', 'JavaScript', 'Java', 'C++'],
    correct: 1,
  },
  {
    question: 'What is the largest ocean on Earth?',
    options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
    correct: 3,
  },
  {
    question: 'How many continents are there?',
    options: ['5', '6', '7', '8'],
    correct: 2,
  },
  {
    question: 'What is the chemical symbol for gold?',
    options: ['Go', 'Gd', 'Au', 'Ag'],
    correct: 2,
  },
  {
    question: 'Which year did World War II end?',
    options: ['1943', '1944', '1945', '1946'],
    correct: 2,
  },
  {
    question: 'What is the smallest prime number?',
    options: ['0', '1', '2', '3'],
    correct: 2,
  },
  {
    question: 'Which animal is known as the King of the Jungle?',
    options: ['Tiger', 'Lion', 'Elephant', 'Bear'],
    correct: 1,
  },
];

function QuizGame({ gameId }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [usedQuestions, setUsedQuestions] = useState([]);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    startNewGame();
  }, []);

  useEffect(() => {
    if (gameOver && user) {
      handleGameEnd();
    }
  }, [gameOver]);

  const startNewGame = () => {
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setGameOver(false);
    setUsedQuestions([]);
    loadRandomQuestion();
  };

  const loadRandomQuestion = () => {
    let availableQuestions = QUIZ_QUESTIONS.filter((_, index) => !usedQuestions.includes(index));
    if (availableQuestions.length === 0) {
      availableQuestions = QUIZ_QUESTIONS;
      setUsedQuestions([]);
    }
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const questionIndex = QUIZ_QUESTIONS.indexOf(availableQuestions[randomIndex]);
    setUsedQuestions((prev) => [...prev, questionIndex]);
  };

  const handleAnswer = (answerIndex) => {
    if (showResult) return;

    setSelectedAnswer(answerIndex);
    setShowResult(true);

    const question = QUIZ_QUESTIONS[usedQuestions[usedQuestions.length - 1]];
    if (answerIndex === question.correct) {
      setScore((prev) => prev + 100);
      showToast('Correct! +100 points', 'success');
    } else {
      showToast('Incorrect!', 'error');
    }

    setTimeout(() => {
      if (currentQuestion < 9) {
        setCurrentQuestion((prev) => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
        loadRandomQuestion();
      } else {
        setGameOver(true);
      }
    }, 2000);
  };

  const handleGameEnd = async () => {
    if (!user) return;

    const bonusPoints = score > 500 ? 200 : score > 300 ? 100 : 0;
    const totalPoints = score + bonusPoints;

    try {
      await scoresAPI.submit({
        userId: user._id,
        gameId: gameId || 'quiz-game',
        pointsEarned: totalPoints,
        gameName: 'Quiz Game',
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

  if (gameOver) {
    return (
      <div className="max-w-lg mx-auto my-8 p-8 bg-[#1a2332] border border-[#2d3748] rounded-3xl">
        <div className="text-center">
          <h2 className="text-3xl mb-4 text-white font-bold">Quiz Complete!</h2>
          <div className="p-6 bg-[rgba(0,212,255,0.1)] border-2 border-[#00d4ff] rounded-xl mb-8">
            <p className="text-4xl text-[#00d4ff] font-bold mb-2">{score}</p>
            <p className="text-[#a0aec0] text-lg">Total Points</p>
            <p className="text-[#a0aec0] text-sm mt-2">
              Score: {Math.round((score / 1000) * 100)}%
            </p>
          </div>
          <button
            onClick={startNewGame}
            className="w-full p-4 bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] text-white border-none rounded-xl text-base font-semibold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(0,212,255,0.3)]"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  const question = QUIZ_QUESTIONS[usedQuestions[usedQuestions.length - 1]];

  return (
    <div className="max-w-lg mx-auto my-8 p-8 bg-[#1a2332] border border-[#2d3748] rounded-3xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl mb-2 text-white font-bold">Quiz Game</h2>
        <div className="flex justify-center gap-8 text-[#a0aec0] font-semibold mb-4">
          <span>Question: {currentQuestion + 1} / 10</span>
          <span>Score: {score}</span>
        </div>
      </div>

      {question && (
        <>
          <div className="mb-8">
            <div className="p-6 bg-[#141b2d] rounded-xl mb-6">
              <h3 className="text-2xl text-white font-bold mb-6">{question.question}</h3>
              <div className="grid grid-cols-1 gap-4">
                {question.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === question.correct;
                  let buttonClass = 'p-4 bg-[#1a2332] border-2 border-[#2d3748] rounded-xl text-white text-lg font-semibold cursor-pointer transition-all hover:border-[#00d4ff] hover:scale-105';

                  if (showResult) {
                    if (isCorrect) {
                      buttonClass = 'p-4 bg-[rgba(0,255,0,0.2)] border-2 border-[#00ff00] rounded-xl text-white text-lg font-semibold cursor-not-allowed';
                    } else if (isSelected && !isCorrect) {
                      buttonClass = 'p-4 bg-[rgba(255,0,110,0.2)] border-2 border-[#ff006e] rounded-xl text-white text-lg font-semibold cursor-not-allowed';
                    } else {
                      buttonClass = 'p-4 bg-[#1a2332] border-2 border-[#2d3748] rounded-xl text-white text-lg font-semibold cursor-not-allowed opacity-50';
                    }
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      disabled={showResult}
                      className={buttonClass}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default QuizGame;

