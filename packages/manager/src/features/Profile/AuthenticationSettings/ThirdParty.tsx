import * as React from 'react';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ExternalLink from 'src/components/ExternalLink';
import Notice from 'src/components/Notice';

interface Props {
  provider: string;
  thirdPartyEnabled: boolean;
}

type CombinedProps = Props;

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(4)
  },
  copy: {
    lineHeight: '20px',
    marginTop: 6,
    marginBottom: theme.spacing(1)
  },
  link: {
    fontWeight: 600
  },
  button: {
    marginTop: theme.spacing(1)
  }
}));

export const ThirdParty: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  return (
    <React.Fragment>
      {props.thirdPartyEnabled && (
        <Paper className={classes.root}>
          <Notice warning>
            Third-Party Authentication via {props.provider} is enabled on your
            account.
          </Notice>
          <Typography variant="body2" className={classes.copy}>
            Your login credentials are currently managed via {props.provider}.
            If you need to reset your password, please visit{' '}
            <ExternalLink
              className={classes.link}
              hideIcon
              link={`https://www.` + `${props.provider}` + `.com/`}
              text={`the ` + `${props.provider}` + ` website`}
            />
            .
          </Typography>
          <Typography variant="body2" className={classes.copy}>
            To disable {props.provider} authentication and log in using your
            Linode credentials, click the button below. We’ll send you an e-mail
            with instructions on how to reset your password.
          </Typography>
          <Button buttonType="primary" className={classes.button}>
            Disable {props.provider} Authentication
          </Button>
        </Paper>
      )}
    </React.Fragment>
  );
};

export default ThirdParty;
