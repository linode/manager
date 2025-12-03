import { makeStyles } from 'tss-react/mui';

import type { Theme } from '@mui/material';

export const getActionMenuWrapperStyles = (theme: Theme) => ({
  justifyContent: 'flex-end',
  display: 'flex',
  alignItems: 'center',
  maxWidth: 40,
  '& button': {
    padding: 0,
    color: theme.tokens.alias.Content.Icon.Primary.Default,
    backgroundColor: 'transparent',
  },
  '& button:hover': {
    backgroundColor: 'transparent',
    color: theme.tokens.alias.Content.Icon.Primary.Hover,
  },
});

export const makeSettingsItemStyles = makeStyles()((theme: Theme) => ({
  actionBtn: {
    minWidth: 225,
    [theme.breakpoints.down('md')]: {
      alignSelf: 'flex-start',
      marginTop: '1rem',
      marginBottom: '1rem',
    },
  },
  sectionText: {
    marginBottom: '1rem',
    marginRight: 0,
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
    width: '65%',
  },
  sectionTitle: {
    marginBottom: '0.25rem',
    display: 'flex',
  },
  sectionTitleAndText: {
    width: '100%',
  },
  topSection: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',
    },
  },
}));
