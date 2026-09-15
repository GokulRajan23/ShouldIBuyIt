// Gradient-mesh palettes per category. Moved out of the old aiAdvisor so the
// app can theme itself with zero network calls.

export const GEO_DEFAULT = 'Germany'
export const CURRENCY_DEFAULT = '€'

export const DEFAULT_THEME = {
  colors: ['#FFD9C2', '#D9C9FF', '#C2F0E8'],
  name: 'neutral',
}

export const CATEGORY_THEMES = {
  tech: { colors: ['#BCD9FF', '#D0C7FF', '#9FE8F5'], name: 'electric' },
  fashion: { colors: ['#FFC2DD', '#FFE0A8', '#E1BEFF'], name: 'runway' },
  home: { colors: ['#F2E1C2', '#D4E5B9', '#F1C5B2'], name: 'cozy' },
  food: { colors: ['#FFD08A', '#FFB082', '#FFE49E'], name: 'warm' },
  fitness: { colors: ['#A8F0C2', '#B4E5FF', '#FFD27A'], name: 'energy' },
  beauty: { colors: ['#FFC9D6', '#F0D9FF', '#FFE8C9'], name: 'glow' },
  auto: { colors: ['#9FB7CC', '#C9CFD9', '#7FA3C2'], name: 'asphalt' },
  hobby: { colors: ['#D9C2FF', '#FFD9A8', '#A8E5FF'], name: 'playful' },
  alcohol: { colors: ['#8B2E3B', '#D4A857', '#3D1F2E'], name: 'cellar' },
  gambling: { colors: ['#1F4D2E', '#D4A857', '#0F2A18'], name: 'felt' },
  vape: { colors: ['#5A6B7A', '#B4C4D1', '#3D4A57'], name: 'smoke' },
  other: DEFAULT_THEME,
}

/** Three hex colors for a category, always falling back to the neutral theme. */
export function getThemeColors(category) {
  return (CATEGORY_THEMES[category] ?? DEFAULT_THEME).colors
}
