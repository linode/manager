import { Box, Typography } from '@linode/ui';
import Close from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { useFlags } from 'src/hooks/useFlags';
import { useMutatePreferences, usePreferences } from '@linode/queries';

export const MainContentBanner = React.memo(() => {
  // Uncomment this to test this banner:
  //
  // const flags = {
  //   mainContentBanner: {
  //     key: 'banner-test-1',
  //     link: {
  //       text: 'Learn more.',
  //       url: 'https://akamai.com',
  //     },
  //     text:
  //       'Linode is now Akamai. This is longer test for testing the pull request. Hopefully it looks nice on all viewports.',
  //   },
  // };

  const flags = useFlags();

  const { data: mainContentBannerPreferences } = usePreferences(
    (preferences) => preferences?.main_content_banner_dismissal
  );
  const { mutateAsync: updatePreferences } = useMutatePreferences();

  const handleDismiss = (key: string) => {
    const existingMainContentBannerDismissal =
      mainContentBannerPreferences ?? {};

    updatePreferences({
      main_content_banner_dismissal: {
        ...existingMainContentBannerDismissal,
        [key]: true,
      },
    });
  };

  const hasDismissedBanner =
    flags.mainContentBanner?.key !== undefined &&
    mainContentBannerPreferences?.[flags.mainContentBanner.key];

  if (
    !flags.mainContentBanner ||
    Object.keys(flags.mainContentBanner).length === 0 ||
    hasDismissedBanner
  ) {
    return null;
  }

  const url = flags.mainContentBanner.link.url;
  const linkText = flags.mainContentBanner.link.text;
  const text = flags.mainContentBanner.text;
  const key = flags.mainContentBanner.key;

  return (
    <Box
      sx={(theme) => ({
        alignItems: 'center',
        backgroundColor: theme.bg.mainContentBanner,
        color: theme.tokens.color.Neutrals.White,
        display: 'flex',
        justifyContent: 'space-between',
        position: 'sticky',
        px: 1,
        py: { lg: 0.25, xs: 1.5 },
        top: 0,
        zIndex: 20,
      })}
    >
      <Box display="flex" flexGrow={1} justifyContent="center">
        <Typography color="inherit" variant="h2">
          {text} {url && linkText && <Link to={url}>{linkText}</Link>}
        </Typography>
      </Box>
      <IconButton
        aria-label="Close"
        color="inherit"
        onClick={() => handleDismiss(key)}
      >
        <Close />
      </IconButton>
    </Box>
  );
});
