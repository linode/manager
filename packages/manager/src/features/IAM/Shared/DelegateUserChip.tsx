import { Chip, styled } from '@linode/ui';
import * as React from 'react';

export const DelegateUserChip = () => {
  return <StyledChip label="delegate user" />;
};

const StyledChip = styled(Chip, {
  label: 'StyledChip',
})(({ theme }) => ({
  textTransform: theme.tokens.font.Textcase.Uppercase,
  marginLeft: theme.spacingFunction(4),
  color: theme.tokens.component.Badge.Informative.Subtle.Text,
  backgroundColor: theme.tokens.component.Badge.Informative.Subtle.Background,
  font: theme.font.extrabold,
  fontSize: theme.tokens.font.FontSize.Xxxs,
}));
