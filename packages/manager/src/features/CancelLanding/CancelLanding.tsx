import { path } from 'ramda';
import * as React from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';

import AkamaiLogo from 'src/assets/logo/akamai-logo.svg';
import Button from 'src/components/Button';
import Typography from 'src/components/core/Typography';
import H1Header from 'src/components/H1Header';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    height: '100vh',
    backgroundColor: theme.bg.main,
    flexDirection: 'column',
    alignItems: 'center',
    padding: `${theme.spacing(4)} ${theme.spacing(2)} 0px`,
    '& h1': {
      marginTop: theme.spacing(4),
      marginBottom: theme.spacing(4),
    },
    '& p': {
      marginTop: theme.spacing(2),
      fontSize: theme.spacing(2),
      lineHeight: theme.spacing(3),
    },
    '& button': {
      marginTop: theme.spacing(8),
      backgroundColor: '#00b159',
      color: '#fff',
    },
  },
  logo: {
    width: '100px',
  },
}));

export const CancelLanding = () => {
  const classes = useStyles();
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
        onClick={goToSurvey}
        data-testid="survey-button"
      >
        Take our exit survey
      </Button>
    </div>
  );
};

export default React.memo(CancelLanding);
