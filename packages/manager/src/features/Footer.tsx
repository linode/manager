import { Stack, Typography } from '@linode/ui';
import { Hidden, styled } from '@mui/material';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { DEVELOPERS_LINK, FEEDBACK_LINK } from 'src/constants';

import packageJson from '../../package.json';

export const FOOTER_HEIGHT = 40;

export const Footer = React.memo(() => {
  return (
    <StyledFooter role="contentinfo">
      <Stack
        alignItems="center"
        direction="row"
        display="flex"
        height={FOOTER_HEIGHT}
        justifyContent="space-between"
        paddingX={{ md: 2, xs: 2 }}
        paddingY={1.5}
        spacing={{ xs: 1 }}
        textAlign="center"
      >
        <Hidden mdDown>
          <Stack direction="row" spacing={3}>
            <StyledLink
              sx={{ paddingLeft: 0 }}
              to={`https://github.com/linode/manager/releases/tag/linode-manager@v${packageJson.version}`}
            >
              v{packageJson.version}
            </StyledLink>
          </Stack>
          <Stack direction="row" spacing={3}>
            <StyledLink to={DEVELOPERS_LINK}>API Reference</StyledLink>
            <StyledLink to={FEEDBACK_LINK}>Provide Feedback</StyledLink>
            <Typography
              sx={(theme) => ({ color: theme.tokens.footer.Text.Default })}
              variant="body1"
            >
              Copyright ©{new Date().getFullYear()} Akamai Technologies, Inc.
              All Rights Reserved
            </Typography>
          </Stack>
        </Hidden>
        <Hidden mdUp>
          <Stack direction="row" spacing={1}>
            <StyledLink
              to={`https://github.com/linode/manager/releases/tag/linode-manager@v${packageJson.version}`}
            >
              v{packageJson.version}
            </StyledLink>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Typography
              sx={(theme) => ({ color: theme.tokens.footer.Text.Default })}
              variant="body1"
            >
              ©{new Date().getFullYear()} Akamai Technologies, Inc.
            </Typography>
          </Stack>
        </Hidden>
      </Stack>
    </StyledFooter>
  );
});

const StyledFooter = styled('footer')(({ theme }) => ({
  margin: `${theme.spacing(2)} auto`,
  marginBottom: theme.spacing(),
  maxWidth: `${theme.breakpoints.values.lg}px`,
  width: '100%',
}));

const StyledLink = styled(Link)(({ theme }) => ({
  '&:hover': {
    color: theme.tokens.footer.Text.Hover,
  },
  color: theme.tokens.footer.Text.Default,
}));
