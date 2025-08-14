import { Button, Stack, Typography } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import { useSearch } from '@tanstack/react-router';
import React from 'react';

import LightThemeAkamaiLogo from 'src/assets/logo/akamai-logo-navy-text.svg';
import DarkThemeAkamaiLogo from 'src/assets/logo/akamai-logo-white-text.svg';

export const CancelLanding = React.memo(() => {
  const search = useSearch({ from: '/cancel' });
  const theme = useTheme();

  const surveyLink = search.survey_link;

  const Logo =
    theme.name === 'light' ? LightThemeAkamaiLogo : DarkThemeAkamaiLogo;

  return (
    <Stack
      alignItems="center"
      gap={3}
      height="calc(100vh - 200px)"
      justifyContent="center"
    >
      <Logo />
      <Typography variant="h2">
        It&rsquo;s been our pleasure to serve you.
      </Typography>
      <Stack mb={2} spacing={1} textAlign="center">
        <Typography>
          Your account is closed. We hope you&rsquo;ll consider us for your
          future cloud hosting needs.
        </Typography>
        <Typography>
          Would you mind taking a brief survey? It will help us understand why
          you&rsquo;re leaving and what we can do better.
        </Typography>
      </Stack>
      <Button
        buttonType="primary"
        data-testid="survey-button"
        href={surveyLink}
      >
        Take our exit survey
      </Button>
    </Stack>
  );
});
