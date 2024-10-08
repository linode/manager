// This component was built asuming an unmodified MUI <Table />
import { styled } from '@mui/material/styles';

import { Box } from 'src/components/Box';
import { Typography } from 'src/components/Typography';

import type { Theme } from '@mui/material/styles';

export const StyledBox = styled(Box, { label: 'StyledBox' })(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  [theme.breakpoints.down('lg')]: {
    minHeight: theme.spacing(3),
  },
  [theme.breakpoints.down('md')]: {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  [theme.breakpoints.up('lg')]: {
    minHeight: theme.spacing(5),
  },
}));

export const StyledLabelBox = styled(Box, { label: 'StyledLabelBox' })(
  ({ theme }) => ({
    alignItems: 'center',
    display: 'flex',
    fontFamily: theme.font.bold,
    marginRight: theme.spacing(0.5),
  })
);

export const sxListItemMdBp = {
  borderRight: 0,
  flex: '50%',
  padding: 0,
};

export const StyledListItem = styled(Typography, { label: 'StyledTypography' })(
  ({ theme }) => ({
    color: theme.textColors.tableStatic,
    display: 'flex',
    padding: `0px 10px`,
    [theme.breakpoints.down('md')]: {
      ...sxListItemMdBp,
    },
  })
);

export const sxListItemFirstChild = (theme: Theme) => ({
  [theme.breakpoints.down('md')]: {
    ...sxListItemMdBp,
    '&:first-of-type': {
      paddingBottom: theme.spacing(0.5),
    },
  },
});
