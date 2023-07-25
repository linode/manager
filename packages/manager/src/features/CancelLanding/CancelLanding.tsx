import { Theme } from '@mui/material/styles';
import { path } from 'ramda';
import * as React from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';

import AkamaiLogo from 'src/assets/logo/akamai-logo.svg';
import { Button } from 'src/components/Button/Button';
import { H1Header } from 'src/components/H1Header/H1Header';
import { Typography } from 'src/components/Typography';

const useStyles = makeStyles()((theme: Theme) => ({
  logo: {
    width: '100px',
  },
  root: {
    '& button': {
      backgroundColor: '#00b159',
      color: '#fff',
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
  const location = useLocation();

  const survey_link = path<string>(['state', 'survey_link'], location);

  if (!survey_link) {
    return <Redirect to="/" />;
  }

  const goToSurvey = () => {
    window.location.assign(survey_link);
  };

  return (
    <div className={classes.root} data-testid="body">
      <AkamaiLogo className={classes.logo} />
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

export default CancelLanding;
