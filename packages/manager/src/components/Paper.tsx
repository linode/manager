import _Paper, { PaperProps } from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { omittedProps } from 'src/utilities/omittedProps';

import { FormHelperText } from './FormHelperText';

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
        variant={props.error ? 'outlined' : props.variant}
      />
      {props.error && <StyledErrorText>{props.error}</StyledErrorText>}
    </React.Fragment>
  );
};

const StyledPaper = styled(_Paper, {
  shouldForwardProp: omittedProps(['error']),
})<Props>(({ theme, ...props }) => ({
  borderColor: props.error ? theme.color.red : undefined,
  padding: theme.spacing(3),
  paddingTop: 17,
}));

const StyledErrorText = styled(FormHelperText)(({ theme }) => ({
  color: theme.color.red,
}));
