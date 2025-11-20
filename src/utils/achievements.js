// Achievements system
export const ACHIEVEMENTS = {
  FIRST_GAME: {
    id: 'first_game',
    name: 'First Steps',
    description: 'Play your first game',
    icon: '🎮',
    points: 50,
    requirement: { type: 'games_played', value: 1 },
  },
  WINNER: {
    id: 'winner',
    name: 'Winner',
    description: 'Win your first game',
    icon: '🏆',
    points: 100,
    requirement: { type: 'wins', value: 1 },
  },
  POINT_COLLECTOR: {
    id: 'point_collector',
    name: 'Point Collector',
    description: 'Earn 1000 points',
    icon: '💎',
    points: 200,
    requirement: { type: 'total_points', value: 1000 },
  },
  MASTER_GAMER: {
    id: 'master_gamer',
    name: 'Master Gamer',
    description: 'Earn 5000 points',
    icon: '👑',
    points: 500,
    requirement: { type: 'total_points', value: 5000 },
  },
  LEGEND: {
    id: 'legend',
    name: 'Legend',
    description: 'Earn 10000 points',
    icon: '🌟',
    points: 1000,
    requirement: { type: 'total_points', value: 10000 },
  },
  DEDICATED: {
    id: 'dedicated',
    name: 'Dedicated Player',
    description: 'Play 10 games',
    icon: '🎯',
    points: 150,
    requirement: { type: 'games_played', value: 10 },
  },
  SPEED_DEMON: {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Complete a game in record time',
    icon: '⚡',
    points: 300,
    requirement: { type: 'speed', value: 1 },
  },
  PERFECT_SCORE: {
    id: 'perfect_score',
    name: 'Perfect Score',
    description: 'Get a perfect score in any game',
    icon: '💯',
    points: 400,
    requirement: { type: 'perfect_score', value: 1 },
  },
};

export const calculateAchievements = (userStats) => {
  const unlocked = [];

  Object.values(ACHIEVEMENTS).forEach((achievement) => {
    const { requirement } = achievement;
    let unlockedValue = false;

    switch (requirement.type) {
      case 'games_played':
        unlockedValue = (userStats.gamesPlayed || 0) >= requirement.value;
        break;
      case 'total_points':
        unlockedValue = (userStats.totalPoints || 0) >= requirement.value;
        break;
      case 'wins':
        unlockedValue = (userStats.wins || 0) >= requirement.value;
        break;
      case 'speed':
        unlockedValue = userStats.hasSpeedRecord || false;
        break;
      case 'perfect_score':
        unlockedValue = userStats.hasPerfectScore || false;
        break;
      default:
        break;
    }

    if (unlockedValue) {
      unlocked.push(achievement);
    }
  });

  return unlocked;
};

export const getLevel = (totalPoints) => {
  if (totalPoints < 100) return { level: 1, name: 'Bronze', color: '#CD7F32', nextLevel: 100 };
  if (totalPoints < 500) return { level: 2, name: 'Silver', color: '#C0C0C0', nextLevel: 500 };
  if (totalPoints < 1000) return { level: 3, name: 'Gold', color: '#FFD700', nextLevel: 1000 };
  if (totalPoints < 2500) return { level: 4, name: 'Platinum', color: '#E5E4E2', nextLevel: 2500 };
  if (totalPoints < 5000) return { level: 5, name: 'Diamond', color: '#00d4ff', nextLevel: 5000 };
  if (totalPoints < 10000) return { level: 6, name: 'Master', color: '#7b2cbf', nextLevel: 10000 };
  return { level: 7, name: 'Legend', color: '#ff006e', nextLevel: Infinity };
};

export const getProgressPercentage = (current, next) => {
  if (next === Infinity) return 100;
  return Math.min(100, (current / next) * 100);
};

