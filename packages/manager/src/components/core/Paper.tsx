import _Paper, { PaperProps } from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import FormHelperText from './FormHelperText';

const StyledPaper = styled(_Paper)<Props>(({ theme, ...props }) => ({
  borderColor: Boolean(props.error) ? `#ca0813` : undefined,
  padding: theme.spacing(3),
  paddingTop: 17,
}));

export interface Props extends PaperProps {
  error?: string;
}

const Paper = (props: Props) => {
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

export default Paper;
