import * as React from 'react';

import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';
import { useFlags } from 'src/hooks/useFlags';

import { Box } from '../Box';
import { Stack } from '../Stack';
import {
  StyledAkamaiLogo,
  StyledBanner,
  StyledBannerAction,
  StyledBannerLabel,
  StyledWarningIcon,
} from './AkamaiBanner.styles';

import type { Theme } from '@mui/material/styles';

interface AkamaiBannerProps {
  action?: JSX.Element;
  link?: {
    text: string;
    url: string;
  };
  margin?: number;
  text: string;
  warning?: boolean;
}

export const AkamaiBanner = React.memo((props: AkamaiBannerProps) => {
  const { action, link, margin, text, warning } = props;
  const flags = useFlags();

  const textWithLineBreaks = text.split('\n').map((text, i, lines) =>
    i === lines.length - 1 ? (
      text
    ) : (
      <>
        {text}
        <br />
      </>
    )
  );

  return (
    <StyledBanner
      alignItems="stretch"
      direction="row"
      margin={margin}
      warning={warning}
    >
      <StyledBannerLabel>
        <Stack alignItems="center" direction="row">
          <Box sx={{ height: 25, width: 30 }}>
            {warning ? (
              <StyledWarningIcon height={25} />
            ) : (
              <StyledAkamaiLogo height={25} />
            )}
          </Box>
          <Typography sx={(theme: Theme) => ({ color: theme.color.white })}>
            {flags.secureVmCopy?.bannerLabel}
          </Typography>
        </Stack>
      </StyledBannerLabel>
      <Box
        alignItems="center"
        display="flex"
        flexGrow={1}
        sx={(theme: Theme) => ({ padding: theme.spacing(2) })}
      >
        <Typography
          sx={(theme: Theme) => ({
            color: warning ? theme.bg.mainContentBanner : theme.color.black,
          })}
          variant="body2"
        >
          {textWithLineBreaks}{' '}
          {link && (
            <Link external to={link.url}>
              {link.text}
            </Link>
          )}
        </Typography>
      </Box>
      <StyledBannerAction alignItems="center" display="flex" warning={warning}>
        <Typography color="inherit" variant="body2">
          {action}
        </Typography>
      </StyledBannerAction>
    </StyledBanner>
  );
});
