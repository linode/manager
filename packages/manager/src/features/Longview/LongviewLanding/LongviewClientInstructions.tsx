import Close from '@material-ui/icons/Close';
import * as React from 'react';

import IconButton from 'src/components/core/IconButton';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import EditableEntityLabel from 'src/components/EditableEntityLabel';
import Grid from 'src/components/Grid';
import { DispatchProps } from 'src/containers/longview.container';

import Instructions from '../shared/InstallationInstructions';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(4),
    padding: theme.spacing(3)
  },
  button: {
    padding: 0,
    '&:hover': {
      color: theme.color.red
    }
  }
}));

interface Props {
  clientID: number;
  clientLabel: string;
  installCode: string;
  clientAPIKey: string;
  triggerDeleteLongviewClient: (id: number, label: string) => void;
  updateLongviewClient: DispatchProps['updateLongviewClient'];
}

export const LongviewClientInstructions: React.FC<Props> = props => {
  const {
    clientID,
    clientLabel,
    installCode,
    triggerDeleteLongviewClient,
    clientAPIKey,
    updateLongviewClient
  } = props;
  const classes = useStyles();

  const [updating, setUpdating] = React.useState<boolean>(false);

  const handleUpdateLabel = (newLabel: string) => {
    setUpdating(true);
    return updateLongviewClient(clientID, newLabel)
      .then(_ => {
        setUpdating(false);
      })
      .catch(_ => setUpdating(false));
  };

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
                text={clientLabel}
                iconVariant="linode"
                subText="Waiting for data..."
                onEdit={handleUpdateLabel}
                loading={updating}
              />
            </Grid>
            <Grid item xs={12} md={9}>
              <Instructions
                installationKey={installCode}
                APIKey={clientAPIKey}
              />
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
