import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import copy from 'copy-to-clipboard';
import * as React from 'react';

import SSHKeyIcon from 'src/assets/icons/ssh-key.svg';
import { Box } from 'src/components/Box';
import { Button } from 'src/components/Button/Button';
import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Typography } from 'src/components/Typography';
import Paper from 'src/components/core/Paper';
import { useManagedSSHKey } from 'src/queries/managed/managed';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

// @todo: is this URL correct? Are there new docs being written?
const DOC_URL =
  'https://www.linode.com/docs/platform/linode-managed/#adding-the-public-key';

const useStyles = makeStyles((theme: Theme) => ({
  copyToClipboard: {
    '& > button': {
      marginTop: theme.spacing(1),
      minWidth: 190,
    },
    alignItems: 'flex-start',
    display: 'flex',
    justifyContent: 'flex-start',
    [theme.breakpoints.up('sm')]: {
      justifyContent: 'flex-end',
    },
  },
  errorState: {
    '& > div': {
      padding: 0,
    },
    padding: `calc(${theme.spacing(2)} - 1px)`,
  },
  icon: {
    marginBottom: `calc(${theme.spacing(1)} - 2px)`,
    marginRight: theme.spacing(1),
    stroke: theme.color.offBlack,
  },
  loadingState: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
  },
  root: {
    minHeight: '112px',
    padding: theme.spacing(2.5),
  },
  spinner: {
    padding: theme.spacing(5),
  },
  sshKey: {
    // NOTE A:
    // I'm not confident about this CSS, but it works on recent versions
    // of Chrome, Firefox, Safari, and Edge. If we run into inconsistencies
    // in other environments, consider removing it and using the fallback
    '&:hover': {
      WebkitLineClamp: 'unset',
      transition: 'all 1s ease-in',
    },
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 3,
    color: theme.color.grey1,
    // provided in the component below.
    display: '-webkit-box',
    fontFamily: '"Ubuntu Mono", monospace, sans-serif',
    fontSize: '0.9rem',
    overflow: 'hidden',
    [theme.breakpoints.up('lg')]: {
      paddingRight: theme.spacing(6),
    },
    [theme.breakpoints.up('md')]: {
      padding: `0 ${theme.spacing(4)} 0 ${theme.spacing(1)}`,
    },
    [theme.breakpoints.up('xl')]: {
      paddingLeft: theme.spacing(4),
      paddingRight: theme.spacing(4),
    },
    transition: 'all 1s ease-in',
    wordBreak: 'break-all',
  },
  sshKeyContainer: {
    alignItems: 'center',
    display: 'flex',
    flex: 1,
  },
}));

const LinodePubKey: React.FC<{}> = () => {
  const classes = useStyles();

  const { data, error, isLoading } = useManagedSSHKey();

  const [copied, setCopied] = React.useState<boolean>(false);
  const timeout = React.useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    if (copied) {
      timeout.current = setTimeout(() => {
        setCopied(false);
      }, 1000);
    }

    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, [copied]);

  const handleCopy = () => {
    if (data) {
      setCopied(true);
      copy(data.ssh_key);
    }
  };

  if (error) {
    const errorMessage = getErrorStringOrDefault(error);
    return (
      <Paper className={classes.errorState}>
        <ErrorState cozy errorText={errorMessage} />
      </Paper>
    );
  }

  if (isLoading) {
    return (
      <Paper className={`${classes.root} ${classes.loadingState}`}>
        <CircleProgress className={classes.spinner} mini />
      </Paper>
    );
  }

  return (
    <Paper className={classes.root}>
      <Grid container justifyContent="space-between" spacing={2}>
        <Grid lg={4} md={3} xs={12}>
          <Box display="flex" flexDirection="row">
            <SSHKeyIcon className={classes.icon} />
            <Typography variant="h3">Linode Public Key</Typography>
          </Box>
          <Typography>
            You must{' '}
            <a
              aria-describedby="external-site"
              href={DOC_URL}
              rel="noopener noreferrer"
              target="_blank"
            >
              install our public SSH key
            </a>{' '}
            on all managed Linodes so we can access them and diagnose issues.
          </Typography>
        </Grid>
        {/* Hide the SSH key on x-small viewports */}
        <Grid className={classes.sshKeyContainer} md={6} sm={5} xs={12}>
          <Typography className={classes.sshKey} variant="subtitle1">
            {data?.ssh_key || ''}
            {/* See NOTE A. If that CSS is removed, we can use the following instead: */}
            {/* pubKey.slice(0, 160)} . . . */}
          </Typography>
        </Grid>
        <Grid className={classes.copyToClipboard} lg={2} md={3} sm={4} xs={12}>
          <Button buttonType="secondary" onClick={handleCopy}>
            {!copied ? 'Copy to clipboard' : 'Copied!'}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default LinodePubKey;
