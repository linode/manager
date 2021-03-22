import { TPAProvider } from '@linode/api-v4/lib/profile';
import * as React from 'react';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ExternalLink from 'src/components/ExternalLink';
import Notice from 'src/components/Notice';
import { LOGIN_ROOT } from 'src/constants';
import { providers } from './shared';

interface Props {
  authType: TPAProvider;
}

type CombinedProps = Props;

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(4),
  },
  copy: {
    lineHeight: '20px',
    marginTop: 6,
    marginBottom: theme.spacing(1),
  },
  link: {
    fontWeight: 600,
  },
  button: {
    marginTop: theme.spacing(1),
  },
}));

export const ThirdParty: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const displayName =
    providers.find((thisProvider) => thisProvider.name === props.authType)
      ?.displayName || '';

  return (
    <Paper className={classes.root}>
      <Notice warning>
        Third-Party Authentication via {displayName} is enabled on your account.
      </Notice>
      <Typography variant="body1" className={classes.copy}>
        Your login credentials are currently managed via {displayName}. If you
        need to reset your password, please visit{' '}
        <ExternalLink
          className={classes.link}
          hideIcon
          link={`https://www.` + `${props.authType}` + `.com/`}
          text={`the ` + `${displayName}` + ` website`}
        />
        .
      </Typography>
      <Typography variant="body1" className={classes.copy}>
        To disable {displayName} authentication and log in using your Linode
        credentials, click the button below. We’ll send you an e-mail with
        instructions on how to reset your password.
      </Typography>
      <Button
        aria-describedby="external-site"
        buttonType="primary"
        className={classes.button}
        onClick={() => {
          window.open(`${LOGIN_ROOT}/tpa/disable`, '_blank', 'noopener');
        }}
      >
        Disable Third-Party Authentication
      </Button>
    </Paper>
  );
};

export default ThirdParty;
