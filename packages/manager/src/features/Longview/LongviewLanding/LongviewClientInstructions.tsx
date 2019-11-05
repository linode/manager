import Close from '@material-ui/icons/Close';
import * as React from 'react';

import Button from 'src/components/Button';
import CopyTooltip from 'src/components/CopyTooltip';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(4),
    padding: `0px ${theme.spacing()}px ${theme.spacing(
      3
    )}px ${theme.spacing()}px`
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
  helpText: {
    fontSize: '1em',
    lineHeight: '1.2em'
  },
  footer: {
    '& span:nth-child(n+2)': {
      marginLeft: theme.spacing(2),
      paddingLeft: theme.spacing(2),
      borderLeft: `solid 1px ${theme.color.grey3}`
    }
  },
  snippet: {}
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
        wrap="nowrap"
        justify="space-between"
        alignItems="center"
        spacing={4}
      >
        <Grid item xs={3}>
          Waiting for data...
        </Grid>
        <Grid container item spacing={1}>
          <Grid item>
            <Typography className={classes.helpText}>
              Before this client can gather data, you need to install the
              Longview Agent on your server by running the following command.
              After installation, it may be a few minutes before the client
              begins receiving data.
            </Typography>
          </Grid>
          <Grid item>
            <pre className={classes.snippet}>
              <CopyTooltip text={command} />
              <code>{command}</code>
            </pre>
          </Grid>
          <Grid item>
            <Typography className={classes.helpText}>
              This should work for most installations, but if you have issues,
              please consult our troubleshooting guide and manual installation
              instructions (API key required):
            </Typography>
          </Grid>
          <Grid item>
            <Typography className={classes.footer}>
              <span>
                <a>Troubleshooting guide</a>
              </span>
              <span>
                <a>Manual installation instructions</a>
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
        <Grid item style={{ alignSelf: 'flex-start' }}>
          <Button
            className={classes.button}
            onClick={() => triggerDeleteLongviewClient(clientID, clientLabel)}
          >
            <Close width={30} height={30} />
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default LongviewClientInstructions;
