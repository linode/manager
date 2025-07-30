import { Button, H1Header, Typography } from '@linode/ui';
import { useTheme } from '@mui/material/styles';
import { redirect, useSearch } from '@tanstack/react-router';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import LightThemeAkamaiLogo from 'src/assets/logo/akamai-logo-color.svg';
import DarkThemeAkamaiLogo from 'src/assets/logo/akamai-logo.svg';

import type { Theme } from '@mui/material/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  logo: {
    width: '100px',
  },
  root: {
    '& button': {
      marginTop: theme.spacing(8),
    },
    '& h1': {
      marginBottom: theme.spacing(4),
      marginTop: theme.spacing(4),
    },
    '& p': {
      fontSize: theme.spacing(2),
      lineHeight: theme.spacing(3),
      marginTop: theme.spacing(2),
    },
    alignItems: 'center',
    backgroundColor: theme.bg.main,
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    padding: `${theme.spacing(4)} ${theme.spacing(2)} 0px`,
  },
}));

export const CancelLanding = React.memo(() => {
  const { classes } = useStyles();
  const search = useSearch({ from: '/cancel' });
  const theme = useTheme();

  const surveyLink = search.survey_link;

  if (!surveyLink) {
    throw redirect({ to: '/' });
  }

  const goToSurvey = () => {
    window.location.assign(surveyLink);
  };

  return (
    <div className={classes.root} data-testid="body">
      {theme.name === 'light' ? (
        <LightThemeAkamaiLogo className={classes.logo} />
      ) : (
        <DarkThemeAkamaiLogo className={classes.logo} />
      )}
      <H1Header title="It&rsquo;s been our pleasure to serve you." />
      <Typography>
        Your account is closed. We hope you&rsquo;ll consider us for your future
        cloud hosting needs.
      </Typography>
      <Typography>
        Would you mind taking a brief survey? It will help us understand why
        you&rsquo;re leaving and what we can do better.
      </Typography>
      <Button
        buttonType="primary"
        data-testid="survey-button"
        onClick={goToSurvey}
      >
        Take our exit survey
      </Button>
    </div>
  );
});
