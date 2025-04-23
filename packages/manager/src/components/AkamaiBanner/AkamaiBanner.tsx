import { Box, Stack, Typography } from '@linode/ui';
import { replaceNewlinesWithLineBreaks } from '@linode/utilities';
import { useMediaQuery, useTheme } from '@mui/material';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { useFlags } from 'src/hooks/useFlags';

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
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const textWithLineBreaks = replaceNewlinesWithLineBreaks(text);

  return (
    <StyledBanner
      alignItems="stretch"
      direction={isSmallScreen ? 'column' : 'row'}
      margin={margin}
      warning={warning}
    >
      <StyledBannerLabel warning={warning}>
        <Stack alignItems="center" direction="row">
          <Box sx={{ height: 18, width: 25 }}>
            {warning ? (
              <StyledWarningIcon height={18} />
            ) : (
              <StyledAkamaiLogo height={18} />
            )}
          </Box>
          <Typography
            sx={(theme: Theme) => ({
              color: 'inherit',
              font: theme.font.bold,
              fontSize: 11,
              letterSpacing: 0.44,
            })}
          >
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
          {textWithLineBreaks}
          {link && (
            <>
              {' '}
              <Link external to={link.url}>
                {link.text}
              </Link>
            </>
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
