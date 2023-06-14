import List from 'src/components/core/List';
import Typography from 'src/components/core/Typography';
import { Notice } from 'src/components/Notice/Notice';
import { styled } from '@mui/material/styles';
import { TextTooltip } from 'src/components/TextTooltip';
import type { Theme } from '@mui/material/styles';

export const StyledNotice = styled(Notice, {
  label: 'StyledNotice',
})(() => ({
  minHeight: 50,
}));

export const StyledNoticeTypography = styled(Typography, {
  label: 'StyledNoticeTypography',
})(({ theme }) => ({
  fontFamily: theme.font.bold,
}));

export const StyledTextTooltip = styled(TextTooltip, {
  label: 'StyledTextTooltip',
})(({ theme }) => ({
  '& ': {
    fontFamily: theme.font.bold,
  },
}));

export const StyledFormattedRegionList = styled(List, {
  label: 'StyledFormattedRegionList',
})(({ theme }) => ({
  padding: `${theme.spacing(0.5)} ${theme.spacing()}`,
  '& li': {
    padding: `4px 0`,
  },
}));

StyledTextTooltip.defaultProps = {
  placement: 'bottom-start',
  minWidth: 225,
  sxTypography: {
    fontFamily: (theme: Theme) => theme.font.bold,
  },
  variant: 'body2',
};

StyledNoticeTypography.defaultProps = {
  variant: 'body2',
};
