import { makeStyles } from 'tss-react/mui';

import type { Theme } from '@mui/material/styles';

export const useStyles = makeStyles()((theme: Theme) => ({
  connectionDetailsCtn: {
    '& p': {
      lineHeight: '1.5rem',
    },
    '& span': {
      font: theme.font.bold,
    },
    background: theme.tokens.alias.Interaction.Background.Secondary,
    border: `1px solid ${
      theme.name === 'light'
        ? theme.tokens.color.Neutrals[40]
        : theme.tokens.color.Neutrals.Black
    }`,
    padding: `${theme.spacing(1)} 15px`,
  },
  copyToolTip: {
    '& svg': {
      color: theme.palette.primary.main,
      height: `${theme.spacing(2)} !important`,
      width: `${theme.spacing(2)} !important`,
    },
    marginRight: 12,
  },
  error: {
    color: theme.color.red,
    marginLeft: theme.spacing(2),
  },
  header: {
    marginBottom: theme.spacing(2),
  },
  inlineCopyToolTip: {
    '& svg': {
      height: theme.spacing(2),
      width: theme.spacing(2),
    },
    '&:hover': {
      backgroundColor: 'transparent',
    },
    display: 'inline-flex',
    marginLeft: theme.spacing(0.5),
  },
  progressCtn: {
    '& circle': {
      stroke: theme.palette.primary.main,
    },
    alignSelf: 'flex-end',
    marginBottom: 2,
    marginLeft: 22,
  },
  provisioningText: {
    font: theme.font.normal,
    fontStyle: 'italic',
  },
  showBtn: {
    color: theme.palette.primary.main,
    fontSize: '0.875rem',
    marginLeft: theme.spacing(),
    minHeight: 'auto',
    minWidth: 'auto',
    padding: 0,
  },
}));
