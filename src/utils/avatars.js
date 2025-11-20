// Game-themed avatar icons
export const GAME_AVATARS = [
  { id: 'default', emoji: '👤', name: 'Default' },
  { id: 'gamer', emoji: '🎮', name: 'Gamer' },
  { id: 'trophy', emoji: '🏆', name: 'Champion' },
  { id: 'star', emoji: '⭐', name: 'Star' },
  { id: 'crown', emoji: '👑', name: 'Royal' },
  { id: 'rocket', emoji: '🚀', name: 'Rocket' },
  { id: 'fire', emoji: '🔥', name: 'Fire' },
  { id: 'diamond', emoji: '💎', name: 'Diamond' },
  { id: 'ninja', emoji: '🥷', name: 'Ninja' },
  { id: 'robot', emoji: '🤖', name: 'Robot' },
  { id: 'alien', emoji: '👽', name: 'Alien' },
  { id: 'ghost', emoji: '👻', name: 'Ghost' },
  { id: 'wizard', emoji: '🧙', name: 'Wizard' },
  { id: 'warrior', emoji: '⚔️', name: 'Warrior' },
  { id: 'knight', emoji: '🛡️', name: 'Knight' },
  { id: 'dragon', emoji: '🐉', name: 'Dragon' },
];

export const getAvatarById = (id) => {
  return GAME_AVATARS.find(avatar => avatar.id === id) || GAME_AVATARS[0];
};

