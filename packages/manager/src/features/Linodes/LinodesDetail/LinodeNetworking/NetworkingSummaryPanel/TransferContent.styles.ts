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

export const StyledGreyTypography = styled(Typography, {
  label: 'StyledGreyTypography',
})(({ theme }) => ({
  ...sxLegendItem,
  '&  span': {
    flex: 1,
  },
  '&:before': {
    ...sxLegendItemBefore,
    backgroundColor: theme.color.grey2,
  },
}));

export const StyledGreenTypography = styled(Typography, {
  label: 'StyledGreenTypography ',
})({
  ...sxLegendItem,
  '&  span': {
    flex: 1,
  },
  '&:before': {
    ...sxLegendItemBefore,
    backgroundColor: '#5ad865',
  },
});
