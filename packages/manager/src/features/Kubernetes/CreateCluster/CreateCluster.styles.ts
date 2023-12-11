import { Theme, styled } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';

import { Box } from 'src/components/Box';
import { Stack } from 'src/components/Stack';

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

export const StyledRegionSelectStack = styled(Stack, {
  label: 'StyledRegionSelectStack',
})(({ theme }) => ({
  flexDirection: 'row',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
  },
}));

export const StyledDocsLinkContainer = styled(Box, {
  label: 'StyledRegionSelectStack',
})(({ theme }) => ({
  alignSelf: 'flex-start',
  marginLeft: 'auto',
  marginTop: theme.spacing(2),
  [theme.breakpoints.down('md')]: {
    marginLeft: 'unset',
    marginTop: theme.spacing(2),
  },
}));
