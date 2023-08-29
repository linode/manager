import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { DateTime } from 'luxon';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import BarPercent from 'src/components/BarPercent';
import { Dialog } from 'src/components/Dialog/Dialog';
import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';
import { useAccountTransfer } from 'src/queries/accountTransfer';

import { StyledLinkButton } from '../Button/StyledLinkButton';

import { styled } from '@mui/material/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  paddedDocsText: {
    [theme.breakpoints.up('md')]: {
      paddingRight: theme.spacing(3), // Prevents link text from being split onto two lines.
    },
  },
  paper: {
    padding: theme.spacing(3),
  },
  poolUsageProgress: {
    '& .MuiLinearProgress-root': {
      borderRadius: 1,
    },
    marginBottom: theme.spacing(0.5),
  },
  proratedNotice: {
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
  root: {
    margin: 'auto',
    textAlign: 'center',
    [theme.breakpoints.down('md')]: {
      width: '85%',
    },
    width: '100%',
  },
}));
