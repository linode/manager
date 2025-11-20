import { Box, styled, Typography, WarningIcon } from '@linode/ui';
import { makeStyles } from 'tss-react/mui';

import type { Theme } from '@linode/ui';

interface StyledListItemProps {
  paddingMultiplier?: number; // optional, default 1
}

export const StyledListItem = styled(Typography, {
  label: 'StyledTypography',
})<StyledListItemProps>(({ theme, paddingMultiplier = 1 }) => ({
  alignItems: 'center',
  display: 'flex',
  padding: `${theme.spacingFunction(4 * paddingMultiplier)} 0`,
}));

export const StyledLabel = styled(Box, {
  label: 'StyledLabelBox',
})(({ theme }) => ({
  font: theme.font.bold,
  marginRight: theme.spacingFunction(4),
}));

export const StyledWarningIcon = styled(WarningIcon, {
  label: 'StyledWarningIcon',
})(({ theme }) => ({
  '& > path:nth-of-type(1)': {
    fill: theme.tokens.alias.Content.Icon.Warning,
  },
  '& > path:nth-of-type(2)': {
    fill: theme.tokens.color.Neutrals[90],
  },
  marginRight: theme.spacingFunction(4),
  width: '16px',
  height: '16px',
}));

export const useStyles = makeStyles()((theme: Theme) => ({
  copyIcon: {
    '& svg': {
      height: '1em',
      width: '1em',
    },
    color: theme.palette.primary.main,
    display: 'inline-block',
    position: 'relative',
    marginTop: theme.spacingFunction(4),
  },
}));
