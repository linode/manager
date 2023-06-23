import * as React from 'react';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';

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
    <Grid container>
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
          container
          wrap="nowrap"
          alignItems="center"
          className={classes.copyContainer}
        >
          <Grid item className="py0">
            <CopyTooltip text={command} />
          </Grid>
          <Grid item className={`${classes.copyCode} py0`}>
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
        <Grid container>
          <Grid item className={classes.instruction}>
            <Typography>
              <a
                href="https://www.linode.com/docs/platform/longview/troubleshooting-linode-longview/"
                target="_blank"
                aria-describedby="external-site"
                rel="noopener noreferrer"
              >
                Troubleshooting guide
              </a>
            </Typography>
          </Grid>
          <Grid item className={classes.instruction}>
            <Typography>
              <a
                href="https://www.linode.com/docs/platform/longview/what-is-longview/#install-the-longview-agent"
                target="_blank"
                aria-describedby="external-site"
                rel="noopener noreferrer"
              >
                Manual installation instructions
              </a>
            </Typography>
          </Grid>
          <Grid item className={classes.instruction}>
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
