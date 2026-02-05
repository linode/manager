import { Chip, omittedProps, styled } from '@linode/ui';
import * as React from 'react';

interface Props {
  // When true, hide the chip on screens smaller than 'sm'
  hideBelowSm?: boolean;
}

export const DelegateUserChip = ({ hideBelowSm = false }: Props) => {
  return <StyledChip hideBelowSm={hideBelowSm} label="delegate user" />;
};

const StyledChip = styled(Chip, {
  label: 'StyledChip',
  shouldForwardProp: omittedProps(['hideBelowSm']),
})<{ hideBelowSm?: boolean }>(({ theme, ...props }) => ({
  textTransform: theme.tokens.font.Textcase.Uppercase,
  marginLeft: theme.spacingFunction(4),
  color: theme.tokens.component.Badge.Informative.Subtle.Text,
  backgroundColor: theme.tokens.component.Badge.Informative.Subtle.Background,
  font: theme.font.extrabold,
  fontSize: theme.tokens.font.FontSize.Xxxs,
  ...(props.hideBelowSm && {
    [theme.breakpoints.down('sm')]: { display: 'none' },
  }),
}));
