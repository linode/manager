import type { Theme } from '@mui/material/styles';

// Shared styles for both ProductSelectionCard and its skeleton
export const PRODUCT_CARD_STYLES = {
  cardBase: (theme: Theme) => ({
    alignItems: 'flex-start',
    flexDirection: 'column',
    minHeight: {
      md: '280px',
      sm: '320px',
      xs: '300px',
    },
    padding: `${theme.spacingFunction(16)} ${theme.spacingFunction(20)}`,
    position: 'relative',
    gap: theme.spacingFunction(12),
    backgroundColor: theme.tokens.alias.Background.Normal,
    '&:hover': {
      borderColor: theme.borderColors.divider,
      backgroundColor: theme.tokens.alias.Background.Normal,
      boxShadow: theme.tokens.alias.Elevation.S,
    },
  }),
  cardBaseIcon: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    width: '100%',
    '& img': {
      maxHeight: '48px',
      maxWidth: '96px',
    },
  },
} as const;

export const PRODUCT_CARD_GRID_SIZE = {
  xs: 12,
  sm: 6,
  md: 4,
  lg: 4,
  xl: 4,
} as const;
