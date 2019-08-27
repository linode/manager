import * as copy from 'copy-to-clipboard';
import * as React from 'react';
import SSHKeyIcon from 'src/assets/icons/ssh-key.svg';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import Box from 'src/components/core/Box';
import Hidden from 'src/components/core/Hidden';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import { useAPIRequest } from 'src/hooks/useAPIRequest';
import { getSSHPubKey } from 'src/services/managed';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

// @todo: is this URL correct? Are there new docs being written?
const DOC_URL =
  'https://www.linode.com/docs/platform/linode-managed/#adding-the-public-key';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(3),
    minHeight: '120px'
  },
  errorState: {
    padding: theme.spacing(2) - 1,
    '& > div': {
      padding: 0
    }
  },
  loadingState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  spinner: {
    padding: theme.spacing(5)
  },
  icon: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1) - 2,
    stroke: theme.color.offBlack
  },
  sshKey: {
    // NOTE A:
    // I'm not confident about this CSS, but it works on recent versions
    // of Chrome, Firefox, Safari, and Edge. If we run into inconsistencies
    // in other environments, consider removing it and using the fallback
    // provided in the component below.
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    wordBreak: 'break-all',
    fontFamily: '"Ubuntu Mono", monospace, sans-serif',
    color: theme.color.grey1,
    fontSize: '0.9rem'
  },
  copyToClipboard: {
    [theme.breakpoints.up('md')]: {
      alignItems: 'center',
      justifyContent: 'center',
      display: 'flex'
    },
    '& > button': {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1)
    }
  }
}));

const LinodePubKey: React.FC<{}> = props => {
  const classes = useStyles();

  const { data, loading, error } = useAPIRequest<Linode.ManagedSSHPubKey>(
    getSSHPubKey,
    { ssh_key: '' }
  );

  if (error) {
    const errorMessage = getErrorStringOrDefault(error);
    return (
      <Paper className={classes.errorState}>
        <ErrorState cozy errorText={errorMessage} />
      </Paper>
    );
  }

  if (loading) {
    return (
      <Paper className={`${classes.root} ${classes.loadingState}`}>
        <CircleProgress mini className={classes.spinner} />
      </Paper>
    );
  }

  return (
    <>
      <Paper className={classes.root}>
        <Grid container>
          <Grid item xs={12} md={3}>
            <Box display="flex" flexDirection="row" justifyContent="flex-start">
              <SSHKeyIcon className={classes.icon} />
              <Typography variant="h3">Linode Public Key</Typography>
            </Box>
            <Typography>
              You must{' '}
              <a href={DOC_URL} target="_blank">
                install our public SSH key
              </a>{' '}
              on all managed Linodes so we can access them and diagnose issues.
            </Typography>
          </Grid>
          {/* Hide the SSH key on x-small viewports */}
          <Hidden xsDown>
            <Grid item xs={6} lg={7}>
              <Typography variant="subtitle1" className={classes.sshKey}>
                {data.ssh_key}
                {/* See NOTE A. If that CSS is removed, we can use the following instead: */}
                {/* pubKey.slice(0, 160)} . . . */}
              </Typography>
            </Grid>
          </Hidden>
          <Grid item xs={6} md={3} lg={2} className={classes.copyToClipboard}>
            {/* @todo: Should we include an indication that the key was successfully copied? */}
            <Button buttonType="secondary" onClick={() => copy(data.ssh_key)}>
              Copy to clipboard
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
};

export default LinodePubKey;
