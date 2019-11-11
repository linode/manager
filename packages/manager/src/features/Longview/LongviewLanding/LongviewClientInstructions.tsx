import Close from '@material-ui/icons/Close';
import * as React from 'react';

import CopyTooltip from 'src/components/CopyTooltip';
import IconButton from 'src/components/core/IconButton';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import EditableEntityLabel from 'src/components/EditableEntityLabel';
import Grid from 'src/components/Grid';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(4),
    padding: theme.spacing(3)
  },
  copyContainer: {
    backgroundColor: theme.color.grey5,
    margin: `${theme.spacing(1)}px 0`,
    borderRadius: theme.shape.borderRadius
  },
  copyCode: {
    overflowX: 'auto'
  },
  apiKey: {
    color: theme.color.grey1
  },
  button: {
    padding: 0,
    '&:hover': {
      color: theme.color.red
    }
  },
  helpText: {},
  footer: {
    '& span:nth-child(n+2)': {
      marginLeft: theme.spacing(2),
      paddingLeft: theme.spacing(2),
      borderLeft: `solid 1px ${theme.color.grey3}`
    }
  }
}));

interface Props {
  clientID: number;
  clientLabel: string;
  installCode: string;
  triggerDeleteLongviewClient: (id: number, label: string) => void;
}

export const LongviewClientInstructions: React.FC<Props> = props => {
  const {
    clientID,
    clientLabel,
    installCode,
    triggerDeleteLongviewClient
  } = props;
  const classes = useStyles();
  const command = `curl -s https://lv.linode.com/${installCode} | sudo bash`;
  return (
    <Paper className={classes.root}>
      <Grid
        container
        direction="row"
        justify="space-between"
        alignItems="flex-start"
        spacing={2}
        aria-label="Installation instructions for the Longview agent"
      >
        <Grid item xs={11}>
          <Grid container>
            <Grid item xs={12} md={3}>
              <EditableEntityLabel
                text={'longview3347837'}
                iconVariant="linode"
                subText="Waiting for data..."
                onEdit={() => Promise.resolve(null)}
                loading={false}
              />
            </Grid>
            <Grid item xs={12} md={9}>
              <Grid container>
                <Grid item>
                  <Typography className={classes.helpText}>
                    Before this client can gather data, you need to install the
                    Longview Agent on your server by running the following
                    command. After installation, it may be a few minutes before
                    the client begins receiving data.
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
                  <Typography className={classes.helpText}>
                    This should work for most installations, but if you have
                    issues, please consult our troubleshooting guide and manual
                    installation instructions (API key required):
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography className={classes.footer}>
                    <span>
                      <a href="https://www.linode.com/docs/platform/longview/longview/">
                        Troubleshooting guide
                      </a>
                    </span>
                    <span>
                      <a href="https://www.linode.com/docs/platform/longview/longview/#install-the-longview-client">
                        Manual installation instructions
                      </a>
                    </span>
                    <span>
                      API Key:{' '}
                      <span className={classes.apiKey}>
                        DCDC2FEB-3E84-42E5-A00909870A3E618C
                      </span>
                    </span>
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={1}>
          <Grid container justify="flex-end">
            <Grid item>
              <IconButton
                className={classes.button}
                onClick={() =>
                  triggerDeleteLongviewClient(clientID, clientLabel)
                }
              >
                <Close width={30} height={30} />
              </IconButton>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default LongviewClientInstructions;
