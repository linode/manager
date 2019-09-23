import * as copy from 'copy-to-clipboard';
import { getSSHPubKey, ManagedSSHPubKey } from 'linode-js-sdk/lib/managed';
import * as React from 'react';
import SSHKeyIcon from 'src/assets/icons/ssh-key.svg';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import Box from 'src/components/core/Box';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import { useAPIRequest } from 'src/hooks/useAPIRequest';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

// @todo: is this URL correct? Are there new docs being written?
const DOC_URL =
  'https://www.linode.com/docs/platform/linode-managed/#adding-the-public-key';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2.5),
    minHeight: '112px'
  },
  copy: {
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4)
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
  sshKeyContainer: {
    display: 'flex',
    alignItems: 'center',
    flex: 1
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
    fontSize: '0.9rem',
    [theme.breakpoints.up('md')]: {
      padding: `0 ${theme.spacing(4)}px 0 ${theme.spacing(1)}px`
    },
    [theme.breakpoints.up('lg')]: {
      paddingRight: theme.spacing(6)
    },
    [theme.breakpoints.up('xl')]: {
      paddingRight: theme.spacing(4),
      paddingLeft: theme.spacing(4)
    }
  },
  copyToClipboard: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'flex-start',
    [theme.breakpoints.up('sm')]: {
      justifyContent: 'flex-end'
    },
    '& > button': {
      minWidth: 190
    }
  }
}));

const LinodePubKey: React.FC<{}> = props => {
  const classes = useStyles();

  const { data, loading, error } = useAPIRequest<ManagedSSHPubKey>(
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
        <Grid container justify="space-between">
          <Grid item xs={12} md={3} lg={4} className={classes.copy}>
            <Box display="flex" flexDirection="row">
              <SSHKeyIcon className={classes.icon} />
              <Typography variant="h3">Linode Public Key</Typography>
            </Box>
            <Typography>
              You must{' '}
              <a href={DOC_URL} target="_blank" rel="noopener noreferrer">
                install our public SSH key
              </a>{' '}
              on all managed Linodes so we can access them and diagnose issues.
            </Typography>
          </Grid>
          {/* Hide the SSH key on x-small viewports */}
          <Grid item xs={12} sm={5} md={6} className={classes.sshKeyContainer}>
            <Typography variant="subtitle1" className={classes.sshKey}>
              {data.ssh_key}
              {/* See NOTE A. If that CSS is removed, we can use the following instead: */}
              {/* pubKey.slice(0, 160)} . . . */}
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            sm={4}
            md={3}
            lg={2}
            className={classes.copyToClipboard}
          >
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
