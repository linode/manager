import { makeStyles } from 'tss-react/mui';

import type { Theme } from '@mui/material/styles';

export const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    '& .mlMain': {
      [theme.breakpoints.down('lg')]: {
        flexBasis: '100%',
        maxWidth: '100%',
      },
    },
    '& .mlSidebar': {
      [theme.breakpoints.down('lg')]: {
        background: theme.color.white,
        flexBasis: '100%',
        maxWidth: '100%',
        marginTop: theme.spacingFunction(16),
        padding: theme.spacingFunction(8),
      },
    },
  },
}));
