import { Chip, styled } from '@linode/ui';

import LockIcon from 'src/assets/icons/lock.svg';

export const StyledManagedChip = styled(Chip, {
  label: 'StyledManagedChip',
})(({ theme }) => ({
  backgroundColor: theme.tokens.component.Badge.Informative.Subtle.Background,
  color: theme.tokens.component.Badge.Informative.Subtle.Text,
  font: theme.font.bold,
  fontSize: theme.tokens.font.FontSize.Xxxs,
  '& .MuiChip-icon': {
    marginRight: '0px',
  },
}));

export const StyledLockIcon = styled(LockIcon)(({ theme }) => ({
  '& path': {
    fill: theme.tokens.alias.Accent.Info.Primary,
  },
  height: '12px',
  width: '12px',
}));
