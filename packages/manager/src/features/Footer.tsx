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
          xs: 'left',
        }}
        direction={{
          sm: 'row',
          xs: 'column',
        }}
        flexDirection={{
          md: 'row',
          xs: 'column',
        }}
        sx={(theme) => ({
          borderTop: `1px solid ${theme.tokens.component.GlobalFooter.Border}`,
          padding: `12px 16px`,
        })}
        textAlign={{
          sm: 'left',
          xs: 'left',
        }}
        display="flex"
        justifyContent="space-between"
        rowGap={2}
        spacing={{ xs: 1 }}
      >
        <Stack
          sx={{
            '&&': {
              margin: 0,
            },
          }}
          direction="row"
          flexWrap="wrap"
          gap={3}
          rowGap={1}
          spacing={3}
        >
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
            '&&': { marginLeft: 0, marginTop: 0 },
          }}
          direction="row"
          spacing={3}
        >
          <Typography
            sx={(theme) => ({
              color: theme.tokens.alias.Content.Text.Primary.Default,
            })}
            variant="body1"
          >
            © {new Date().getFullYear()} Akamai Technologies, Inc. All Rights
            Reserved
          </Typography>
        </Stack>
      </Stack>
    </footer>
  );
});

const StyledLink = styled(Link)(({ theme }) => ({
  '&&': {
    marginLeft: 0,
  },
  '&:hover': {
    color: theme.tokens.component.GlobalFooter.Link.Hover,
  },
  color: theme.tokens.component.GlobalFooter.Link.Default,
}));
