import * as React from 'react';
import Box from 'src/components/core/Box';
import Typography from 'src/components/core/Typography';
import { Link } from 'src/components/Link';
import { LOGIN_ROOT } from 'src/constants';
import { styled, useTheme } from '@mui/material/styles';

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
  marginTop: theme.spacing(),
  marginBottom: theme.spacing(),
}));

const StyledLink = styled(Link, {
  label: 'StyledLink',
})(({ theme }) => ({
  color: theme.palette.primary.main,
  fontSize: '0.875rem',
  marginTop: theme.spacing(),
}));
