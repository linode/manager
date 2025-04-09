import { Box, Typography } from '@linode/ui';
import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';

export const sxTooltipIcon = {
  marginLeft: 1,
  padding: 0,
};

export const StyledTypography = styled(Typography, {
  label: 'StyledTypography',
})(({ theme }) => ({
  fontFamily: theme.font.bold,
  marginBottom: 0,
}));

export const StyledGrid = styled(Grid, { label: 'StyledGrid' })(() => ({
  alignItems: 'center',
  marginBottom: 2,
}));

export const StyledPermissionItem = styled(Typography, {
  label: 'StyledPermissionItem',
})(({ theme }) => ({
  borderRight: `1px solid ${theme.tokens.border.Normal}`,
  display: 'inline-block',
  padding: `0px ${theme.spacing(0.75)} ${theme.spacing(0.25)}`,
}));

export const StyledContainer = styled('div', {
  label: 'StyledContainer',
})(() => ({
  marginLeft: -6,
  position: 'relative',
}));

export const StyledClampedContent = styled('div', {
  label: 'StyledClampedContent',
})<{ showAll?: boolean }>(({ showAll }) => ({
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: showAll ? 'unset' : 2,
  display: '-webkit-box',
  overflow: 'hidden',
}));

export const StyledBox = styled(Box, {
  label: 'StyledBox',
})(({ theme }) => ({
  backgroundColor:
    theme.name === 'light'
      ? theme.tokens.color.Neutrals[5]
      : theme.tokens.color.Neutrals[90],
  bottom: 1,
  display: 'flex',
  justifyContent: 'space-between',
  position: 'absolute',
  right: 0,
}));

export const StyledSpan = styled(Typography, { label: 'StyledSpan' })(
  ({ theme }) => ({
    borderRight: `1px solid ${theme.tokens.border.Normal}`,
    bottom: 0,
    marginRight: theme.spacing(0.5),
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5),
  })
);
