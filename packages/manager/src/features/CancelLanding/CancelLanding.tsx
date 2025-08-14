import { Button, Stack, Typography } from '@linode/ui';
import { useSearch } from '@tanstack/react-router';
import React from 'react';

import { ThemeAwareLogo } from 'src/components/ThemeAwareLogo';

export const CancelLanding = React.memo(() => {
  const search = useSearch({ from: '/cancel' });

  const surveyLink = search.survey_link;

  return (
    <Stack
      alignItems="center"
      gap={3}
      height="calc(100vh - 200px)"
      justifyContent="center"
    >
      <ThemeAwareLogo sx={{ width: '200px', height: '75px' }} />
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
