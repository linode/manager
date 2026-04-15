import { omittedProps, styled } from '@linode/ui';
import React from 'react';

export interface DividerProps {
  spacingBottom?: number | string;
  spacingTop?: number | string;
}

export const Divider = (props: DividerProps) => {
  return <StyledDivider {...props} />;
};

export const StyledDivider = styled('hr', {
  label: 'StyledDivider',
  shouldForwardProp: omittedProps(['spacingTop', 'spacingBottom']),
})<DividerProps>(({ theme, spacingTop, spacingBottom }) => ({
  display: 'block',
  margin: `${theme.tokens.spacing.S8} 0`,
  width: '100%',
  borderWidth: '0 0 thin',
  borderStyle: 'solid',
  borderColor: theme.tokens.component.Divider.Border,
  marginBottom: spacingBottom,
  marginTop: spacingTop,
}));
