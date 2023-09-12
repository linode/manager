import { styled } from '@mui/material/styles';

import { Typography } from 'src/components/Typography';

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
})({
  ...styledLinodeUsage('#1CB35C'),
});

export const StyledPoolUsage = styled(Typography, {
  label: 'StyledPoolUsage',
})(() => ({
  ...styledLinodeUsage('#5ad865'),
}));

export const StyledRemainingPoolUsage = styled(Typography, {
  label: 'StyledRemainingUsage',
})(({ theme }) => ({
  ...styledLinodeUsage(theme.color.grey2),
}));
