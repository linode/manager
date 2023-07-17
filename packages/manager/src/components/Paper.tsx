import _Paper, { PaperProps } from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import FormHelperText from './core/FormHelperText';

const StyledPaper = styled(_Paper)<Props>(({ theme, ...props }) => ({
  borderColor: props.error ? `#ca0813` : undefined,
  padding: theme.spacing(3),
  paddingTop: 17,
}));

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
  const { className, error, ...rest } = props;

  return (
    <React.Fragment>
      <StyledPaper className={className} {...rest} />
      {error && (
        <FormHelperText sx={{ color: '#ca0813' }}>{error}</FormHelperText>
      )}
    </React.Fragment>
  );
};
