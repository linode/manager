import { TPAProvider } from '@linode/api-v4/lib/profile';
import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ExternalLink from 'src/components/ExternalLink';
import Notice from 'src/components/Notice';
import { providers } from './shared';

interface Props {
  authType: TPAProvider;
}

type CombinedProps = Props;

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(4),
  },
  notice: {
    fontFamily: theme.font.bold,
    fontSize: '0.875rem',
    marginBottom: `${theme.spacing(2)}px !important`,
  },
  copy: {
    marginBottom: theme.spacing(2),
  },
}));

export const ThirdParty: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const displayName =
    providers.find((thisProvider) => thisProvider.name === props.authType)
      ?.displayName || '';

  return (
    <Paper className={classes.root}>
      <Notice className={classes.notice} warning>
        Third-Party Authentication via {displayName} is enabled on your account.
      </Notice>
      <Typography variant="body1" className={classes.copy}>
        Your login credentials are currently managed by {displayName}. If you
        need to reset your password, please visit the{' '}
        <ExternalLink
          hideIcon
          link={`https://www.` + `${props.authType}` + `.com/`}
          text={`${displayName}` + ` website`}
        />
        .
      </Typography>
      <Typography variant="body1" className={classes.copy}>
        To remove the current Third-Party Authentication (TPA) from your account
        and allow you to log in with Linode credentials, click on the Linode
        button above.
        <br />
        We&apos;ll send you an e-mail with instructions on how to reset your
        password.
      </Typography>
    </Paper>
  );
};

export default ThirdParty;
