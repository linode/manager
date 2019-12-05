import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';

import CopyTooltip from 'src/components/CopyTooltip';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';

const useStyles = makeStyles((theme: Theme) => ({
  copyContainer: {
    backgroundColor: theme.color.grey5,
    margin: `${theme.spacing(1)}px 0`,
    borderRadius: theme.shape.borderRadius,
    maxWidth: '100%'
  },
  copyCode: {
    overflowX: 'auto'
  },
  apiKey: {
    color: theme.color.grey1
  },
  instruction: {
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: 'auto',
      '&:not(:first-of-type)': {
        position: 'relative',
        marginLeft: theme.spacing(2),
        paddingLeft: theme.spacing(2),
        '&:before': {
          content: "'|'",
          position: 'absolute',
          top: theme.spacing(1) - 3,
          left: -theme.spacing(1) + 2
        }
      }
    }
  }
}));

interface Props {
  APIKey: string;
  installationKey: string;
}

type CombinedProps = Props;

const InstallationInstructions: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const command = `curl -s https://lv.linode.com/${
    props.installationKey
  } | sudo bash`;

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
      <Grid item>
        <Typography>
          This should work for most installations, but if you have issues,
          please consult our troubleshooting guide and manual installation
          instructions (API key required):
        </Typography>
      </Grid>
      <Grid item>
        <Grid container>
          <Grid item className={classes.instruction}>
            <Typography>
              <a
                href="https://www.linode.com/docs/platform/longview/longview/"
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
                href="https://www.linode.com/docs/platform/longview/longview/#install-the-longview-client"
                target="_blank"
                aria-describedby="external-site"
                rel="noopener noreferrer"
              >
                Manual installation instructions
              </a>
            </Typography>
          </Grid>
          <Grid item className={classes.instruction}>
            <Typography>
              API Key: <span className={classes.apiKey}>{props.APIKey}</span>
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default React.memo(InstallationInstructions);
