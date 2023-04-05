import _Paper, { PaperProps } from '@mui/material/Paper';
import * as React from 'react';
import { styled } from '@mui/material/styles';
import FormHelperText from './FormHelperText';

const StyledPaper = styled(_Paper)<Props>(({ theme, ...props }) => ({
  padding: theme.spacing(3),
  paddingTop: 17,
  borderColor: Boolean(props.error) ? `#ca0813` : undefined,
}));

export interface Props extends PaperProps {
  error?: string;
}

const Paper = (props: Props) => {
  const { error, className, ...rest } = props;

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
