import { Box, Paper, styled, Typography } from '@linode/ui';

export const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor:
    theme.name === 'light'
      ? theme.tokens.color.Neutrals[5]
      : theme.tokens.color.Neutrals[100],
  marginTop: theme.tokens.spacing.S8,
  padding: `${theme.tokens.spacing.S12} ${theme.tokens.spacing.S8}`,
}));

export const StyledTitle = styled(Typography, {
  // Prevent the `showName` prop from being forwarded to the DOM.
  // This resolves the React warning: "React does not recognize the `showName` prop on a DOM element."
  shouldForwardProp: (prop) => prop !== 'showName',
})<{
  showName?: boolean | undefined;
}>(({ theme, showName }) => ({
  font: theme.tokens.alias.Typography.Label.Bold.S,
  marginBottom: showName ? theme.tokens.spacing.S12 : undefined,
}));

export const StyledDescription = styled(Typography)(({ theme }) => ({
  marginBottom: theme.tokens.spacing.S12,
  marginTop: theme.tokens.spacing.S6,
  overflowWrap: 'anywhere',
  wordBreak: 'normal',
}));

export const StyledEntityBox = styled(Box, {
  // Prevent the `hideDetails` prop from being forwarded to the DOM.
  // This resolves the React warning: "React does not recognize the `hideDetails` prop on a DOM element."
  shouldForwardProp: (prop) => prop !== 'hideDetails',
})<{
  hideDetails: boolean | undefined;
}>(({ theme, hideDetails }) => ({
  marginTop: !hideDetails ? theme.tokens.spacing.S12 : undefined,
}));
