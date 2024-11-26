import { Box, Typography } from '@linode/ui';
import { styled, useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { LOGIN_ROOT } from 'src/constants';

interface Props {
  username?: string;
}

export const ResetPassword = (props: Props) => {
  const theme = useTheme();
  const { username } = props;

  return (
    <Box sx={{ marginBottom: theme.spacing(4) }}>
      <Typography variant="h3">Password Reset</Typography>
      <StyledCopy variant="body1">
        If you’ve forgotten your password or would like to change it, we’ll send
        you an e-mail with instructions.
      </StyledCopy>
      <StyledLink to={`${LOGIN_ROOT}/forgot/password?username=${username}`}>
        Reset Password
      </StyledLink>
    </Box>
  );
};

const StyledCopy = styled(Typography, {
  label: 'StyledCopy',
})(({ theme }) => ({
  lineHeight: '20px',
  marginBottom: theme.spacing(),
  marginTop: theme.spacing(),
}));

const StyledLink = styled(Link, {
  label: 'StyledLink',
})(({ theme }) => ({
  fontSize: '0.875rem',
  marginTop: theme.spacing(),
}));
