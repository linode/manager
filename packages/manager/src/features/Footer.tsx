import { Stack } from '@linode/ui';
import { Hidden, Typography } from '@mui/material';
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
  [theme.breakpoints.down('sm')]: {
    '&&': {
      marginTop: theme.tokens.spacing[20],
    },
    '&:first-child': {
      marginTop: 0,
    },
  },
}));

export const FOOTER_HEIGHT = 40;

export const Footer = React.memo(() => {
  return (
    <footer role="contentinfo">
      <Stack
        sx={(theme) => ({
          backgroundColor: theme.tokens.footer.Background,
        })}
        alignItems="center"
        direction="row"
        display="flex"
        height={FOOTER_HEIGHT}
        justifyContent="space-between"
        paddingX={{ md: 4, xs: 2 }}
        paddingY={1.5}
        spacing={{ xs: 1 }}
        textAlign="center"
      >
        <Hidden mdDown>
          <Stack direction="row" spacing={3}>
            <StyledLink
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
    </footer>
  );
});
