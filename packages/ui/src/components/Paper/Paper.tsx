import _Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { FormHelperText } from '../FormHelperText/FormHelperText';

import type { PaperProps } from '@mui/material/Paper';

interface Props extends PaperProps {
  /**
   * Displays an error in red text below the Paper
   */
  error?: string;
}

/**
 *
 * ## Overview
 *
 * Papers are surfaces that display content and actions on a single topic. They should be easy to scan for relevant and actionable information. Elements like text and images should be placed on them in a way that clearly indicates hierarchy.
 *
 * ## Usage
 * - Papers are used for grouping information.
 * - Papers allow for flexible layouts.
 *
 */
export const Paper = (props: Props) => {
  return (
    <React.Fragment>
      <StyledPaper
        {...props}
        data-qa-paper
        variant={props.error ? 'outlined' : props.variant}
      />
      {props.error && <StyledErrorText>{props.error}</StyledErrorText>}
    </React.Fragment>
  );
};

const StyledPaper = styled(_Paper, {
  shouldForwardProp: (prop) => prop !== 'error',
})<Props>(({ theme, ...props }) => ({
  borderColor: props.error ? theme.palette.error.dark : undefined,
  padding: theme.spacingFunction(24),
  paddingTop: theme.spacingFunction(16),
}));

const StyledErrorText = styled(FormHelperText)(({ theme }) => ({
  color: theme.palette.error.dark,
}));
