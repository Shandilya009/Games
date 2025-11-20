// Profile themes
export const PROFILE_THEMES = {
  default: {
    name: 'Default',
    primary: '#00d4ff',
    secondary: '#7b2cbf',
    background: '#1a2332',
    accent: '#ff006e',
  },
  ocean: {
    name: 'Ocean',
    primary: '#00b4d8',
    secondary: '#0077b6',
    background: '#1a2332',
    accent: '#00d4ff',
  },
  fire: {
    name: 'Fire',
    primary: '#ff6b35',
    secondary: '#f7931e',
    background: '#1a2332',
    accent: '#ff006e',
  },
  forest: {
    name: 'Forest',
    primary: '#2d5016',
    secondary: '#4a7c59',
    background: '#1a2332',
    accent: '#6bcf7f',
  },
  purple: {
    name: 'Purple',
    primary: '#7b2cbf',
    secondary: '#9d4edd',
    background: '#1a2332',
    accent: '#c77dff',
  },
  gold: {
    name: 'Gold',
    primary: '#ffd700',
    secondary: '#ffed4e',
    background: '#1a2332',
    accent: '#ffb347',
  },
};

export const getTheme = (themeName) => {
  return PROFILE_THEMES[themeName] || PROFILE_THEMES.default;
};

