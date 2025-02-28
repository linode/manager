import { Box, Stack } from '@linode/ui';
import { styled } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';

import type { Theme } from '@mui/material/styles';

export const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    '& .mlMain': {
      flexBasis: '100%',
      maxWidth: '100%',
      [theme.breakpoints.up('lg')]: {
        flexBasis: '78.8%',
        maxWidth: '78.8%',
      },
    },
    '& .mlSidebar': {
      flexBasis: '100%',
      maxWidth: '100%',
      position: 'static',
      [theme.breakpoints.up('lg')]: {
        flexBasis: '21.2%',
        maxWidth: '21.2%',
        position: 'sticky',
      },
      width: '100%',
    },
  },
  sidebar: {
    background: 'none',
    marginTop: '0px !important',
    paddingTop: '0px !important',
    [theme.breakpoints.down('lg')]: {
      background: theme.color.white,
      marginTop: `${theme.spacing(3)} !important`,
      padding: `${theme.spacing(3)} !important`,
    },
    [theme.breakpoints.down('md')]: {
      padding: `${theme.spacing()} !important`,
    },
  },
}));

export const StyledStackWithTabletBreakpoint = styled(Stack, {
  label: 'StyledStackWithTabletBreakpoint',
})(({ theme }) => ({
  flexDirection: 'row',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
  },
}));

export const StyledDocsLinkContainer = styled(Box, {
  label: 'StyledDocsLinkContainer',
})(({ theme }) => ({
  alignSelf: 'flex-start',
  marginLeft: 'auto',
  [theme.breakpoints.down('md')]: {
    marginLeft: 'unset',
    marginTop: theme.spacing(2),
  },
}));
