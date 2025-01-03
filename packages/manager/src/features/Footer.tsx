import { Stack } from '@linode/ui';
import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { DEVELOPERS_LINK, FEEDBACK_LINK } from 'src/constants';

import packageJson from '../../package.json';

const StyledLink = styled(Link)(({ theme }) => ({
  '&:hover': {
    color: theme.tokens.footer.Text.Hover,
  },
  color: theme.tokens.footer.Text.Default,
}));

export const FOOTER_HEIGHT = 40;

export const Footer = React.memo(() => {
  return (
    <footer role="contentinfo" style={{ zIndex: 1300 }}>
      <Stack
        sx={(theme) => ({
          backgroundColor: theme.tokens.footer.Background,
          height: FOOTER_HEIGHT,
          paddingX: theme.spacing(4),
          paddingY: theme.spacing(1.5),
          textAlign: 'left',
          [theme.breakpoints.down('sm')]: {
            textAlign: 'center',
          },
        })}
        alignItems="center"
        direction={{ sm: 'row', xs: 'column' }}
        display="flex"
        justifyContent={'space-between'}
        spacing={{ xs: 1 }}
      >
        <Stack
          direction={{ md: 'row', sm: 'column' }}
          spacing={{ md: 3, sm: 1, xs: 1 }}
        >
          <StyledLink
            to={`https://github.com/linode/manager/releases/tag/linode-manager@v${packageJson.version}`}
          >
            v{packageJson.version}
          </StyledLink>
          <StyledLink to={DEVELOPERS_LINK}>API Reference</StyledLink>
          <StyledLink to={FEEDBACK_LINK}>Provide Feedback</StyledLink>
        </Stack>
        <Typography
          sx={(theme) => ({ color: theme.tokens.footer.Text.Default })}
          variant="body1"
        >
          Copyright ©2024 Akamai Technologies, Inc. All Rights Reserved
        </Typography>
      </Stack>
    </footer>
  );
});
