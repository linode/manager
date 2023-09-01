import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import { Grid } from 'src/components/Grid';
import { Link } from 'src/components/Link';
import { Typography } from 'src/components/Typography';

const useStyles = makeStyles((theme: Theme) => ({
  apiKey: {
    color: theme.color.grey1,
  },
  copyCode: {
    overflowX: 'auto',
  },
  copyContainer: {
    backgroundColor: theme.color.grey5,
    borderRadius: theme.shape.borderRadius,
    margin: `${theme.spacing(1)} 0`,
    maxWidth: '100%',
  },
  instruction: {
    [theme.breakpoints.up('sm')]: {
      '&:not(:first-of-type)': {
        '&:before': {
          content: "'|'",
          left: `calc(-${theme.spacing(1)} + 2px)`,
          position: 'absolute',
          top: `calc(${theme.spacing(1)} - 3px)`,
        },
        marginLeft: theme.spacing(2),
        paddingLeft: theme.spacing(2),
        position: 'relative',
      },
      width: 'auto',
    },
    width: '100%',
  },
}));

interface Props {
  APIKey: string;
  installationKey: string;
}

type CombinedProps = Props;

const InstallationInstructions: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const command = `curl -s https://lv.linode.com/${props.installationKey} | sudo bash`;

  return (
    <Grid container spacing={2}>
      <Grid item>
        <Typography>
          Before this client can gather data, you need to install the Longview
          Agent on your server by running the following command. After
          installation, it may be a few minutes before the client begins
          receiving data.
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid
          alignItems="center"
          className={classes.copyContainer}
          container
          spacing={2}
          wrap="nowrap"
        >
          <Grid className="py0" item>
            <CopyTooltip text={command} />
          </Grid>
          <Grid className={`${classes.copyCode} py0`} item>
            <pre>
              <code>{command}</code>
            </pre>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Typography>
          This should work for most installations, but if you have issues,
          please consult our troubleshooting guide and manual installation
          instructions (API key required):
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={2}>
          <Grid className={classes.instruction} item>
            <Typography>
              <Link to="https://www.linode.com/docs/platform/longview/troubleshooting-linode-longview/">
                Troubleshooting guide
              </Link>
            </Typography>
          </Grid>
          <Grid className={classes.instruction} item>
            <Typography>
              <Link to="https://www.linode.com/docs/platform/longview/what-is-longview/#install-the-longview-agent">
                Manual installation instructions
              </Link>
            </Typography>
          </Grid>
          <Grid className={classes.instruction} item>
            <Typography data-testid="api-key">
              API Key: <span className={classes.apiKey}>{props.APIKey}</span>
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default React.memo(InstallationInstructions);
