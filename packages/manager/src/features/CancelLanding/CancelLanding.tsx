import { path } from 'ramda';
import * as React from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';

import Logo from 'src/assets/logo/logo-footer.svg';
import Button from 'src/components/Button';
import Typography from 'src/components/core/Typography';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    height: '100vh',
    backgroundColor: theme.bg.main,
    flexDirection: 'column',
    alignItems: 'center',
    padding: `${theme.spacing(4)}px ${theme.spacing(2)}px 0px`,
    '& h1': {
      marginTop: theme.spacing(4),
      marginBottom: theme.spacing(4)
    },
    '& p': {
      marginTop: theme.spacing(2),
      fontSize: theme.spacing(2),
      lineHeight: `${theme.spacing(3)}px`
    },
    '& button': {
      marginTop: theme.spacing(8),
      backgroundColor: '#00b159',
      color: '#fff'
    }
  },
  logo: {
    width: '100px'
  }
}));

export const CancelLanding: React.FC<{}> = () => {
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
      <Logo className={classes.logo} />
      <Typography variant="h1">It's been our pleasure to serve you.</Typography>
      <Typography>
        Your account is closed. We hope you'll consider Linode for your future
        cloud hosting needs.
      </Typography>
      <Typography>
        Would you mind taking a brief survey? It will help us understand why
        you're leaving and what we can do better.
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

export default compose<{}, {}>(React.memo)(CancelLanding);
