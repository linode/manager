import { Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';

const sxLegendItemBefore = {
  borderRadius: 5,
  content: '""',
  height: 20,
  marginRight: 10,
  width: 20,
};

const sxLegendItem = {
  alignItems: 'center',
  display: 'flex',
  marginTop: 10,
};

const styledLinodeUsage = (backgroundColor: string) => ({
  ...sxLegendItem,
  '&  span': {
    flex: 1,
    lineHeight: 1.1,
  },
  '&:before': {
    ...sxLegendItemBefore,
    backgroundColor,
  },
});

export const StyledLinodeUsage = styled(Typography, {
  label: 'StyledLinodeUsage ',
})(({ theme }) => ({
  ...styledLinodeUsage(theme.tokens.color.Green[70]),
}));

export const StyledPoolUsage = styled(Typography, {
  label: 'StyledPoolUsage',
})(({ theme }) => ({
  ...styledLinodeUsage(theme.tokens.color.Green[60]),
}));

export const StyledRemainingPoolUsage = styled(Typography, {
  label: 'StyledRemainingUsage',
})(({ theme }) => ({
  ...styledLinodeUsage(theme.color.grey2),
}));
