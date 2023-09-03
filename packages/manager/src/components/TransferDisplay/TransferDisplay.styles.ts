import { styled } from '@mui/material/styles';

import BarPercent from 'src/components/BarPercent';
import { Box } from 'src/components/Box';

export const StyledTransferDisplayContainer = styled(Box, {
  label: 'StyledTransferDisplayTypography',
})(({ theme }) => ({
  margin: 'auto',
  textAlign: 'center',
  [theme.breakpoints.down('md')]: {
    width: '85%',
  },
  width: '100%',
}));

export const StyledBarPercent = styled(BarPercent, {
  label: 'StyledBarPercent',
  shouldForwardProp: (prop) =>
    prop !== 'fillerRelativePct' && prop !== 'pullUsagePct',
})<{ fillerRelativePct: number; pullUsagePct: number }>(
  ({ fillerRelativePct, pullUsagePct, theme }) => ({
    '& .MuiLinearProgress-bar': {
      background: `linear-gradient(90deg, #5ad865 0%, #5ad865 75%, orange 90%, red);`,
      transform: 'none !important',
      width: `${fillerRelativePct}%`,
    },
    '& .MuiLinearProgress-root': {
      width: `${pullUsagePct}%`,
    },
    backgroundColor: 'rgb(231, 231, 231)',
    borderRadius: theme.shape.borderRadius,
  })
);
