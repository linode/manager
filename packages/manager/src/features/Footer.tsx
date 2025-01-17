import { Stack, Typography } from '@linode/ui';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { DEVELOPERS_LINK, FEEDBACK_LINK } from 'src/constants';

import packageJson from '../../package.json';

export const Footer = React.memo(() => {
  return (
    <footer role="contentinfo">
      <Stack
        alignItems={{
          md: 'center',
          xs: 'center',
        }}
        direction={{
          sm: 'row',
          xs: 'column',
        }}
        flexDirection={{
          md: 'row',
          xs: 'column',
        }}
        textAlign={{
          sm: 'left',
          xs: 'center',
        }}
        display="flex"
        justifyContent="space-between"
        padding={2}
        spacing={{ xs: 1 }}
      >
        <Stack direction="row" spacing={3}>
          <StyledLink
            sx={{ paddingLeft: 0 }}
            to={`https://github.com/linode/manager/releases/tag/linode-manager@v${packageJson.version}`}
          >
            v{packageJson.version}
          </StyledLink>
          <StyledLink to={DEVELOPERS_LINK}>API Reference</StyledLink>
          <StyledLink to={FEEDBACK_LINK}>Provide Feedback</StyledLink>
        </Stack>
        <Stack
          sx={{
            '&&': { marginTop: 0 },
          }}
          direction="row"
          spacing={3}
        >
          <Typography
            sx={(theme) => ({
              color: theme.tokens.content.Text.Primary.Default,
            })}
            variant="body1"
          >
            Copyright ©{new Date().getFullYear()} Akamai Technologies, Inc. All
            Rights Reserved
          </Typography>
        </Stack>
      </Stack>
    </footer>
  );
});

const StyledLink = styled(Link)(({ theme }) => ({
  '&:hover': {
    color: theme.tokens.footer.Link.Hover,
  },
  color: theme.tokens.footer.Link.Default,
}));
