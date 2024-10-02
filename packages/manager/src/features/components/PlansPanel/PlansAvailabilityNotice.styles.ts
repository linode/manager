import { styled } from '@mui/material/styles';

import { List } from 'src/components/List';
import { TextTooltip } from 'src/components/TextTooltip';
import { Typography } from 'src/components/Typography';

import type { Theme } from '@mui/material/styles';

export const StyledNoticeTypography = styled(Typography, {
  label: 'StyledNoticeTypography',
})(({ theme }) => ({
  fontFamily: theme.font.bold,
}));

export const StyledTextTooltip = styled(TextTooltip, {
  label: 'StyledTextTooltip',
})(() => ({}));

export const StyledFormattedRegionList = styled(List, {
  label: 'StyledFormattedRegionList',
})(({ theme }) => ({
  '& li': {
    padding: `4px 0`,
  },
  padding: `${theme.spacing(0.5)} ${theme.spacing()}`,
}));

StyledTextTooltip.defaultProps = {
  minWidth: 225,
  placement: 'bottom-start',
  sxTypography: {
    fontFamily: (theme: Theme) => theme.font.bold,
  },
  variant: 'body2',
};

StyledNoticeTypography.defaultProps = {
  variant: 'body2',
};
