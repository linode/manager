import { Theme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
import * as React from 'react';

import { EditableEntityLabel } from 'src/components/EditableEntityLabel/EditableEntityLabel';
import { Grid } from 'src/components/Grid';
import { Paper } from 'src/components/Paper';
import { DispatchProps } from 'src/containers/longview.container';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import Instructions from '../shared/InstallationInstructions';
import ActionMenu, { ActionHandlers } from './LongviewActionMenu';
import RestrictedUserLabel from './RestrictedUserLabel';

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    '&:hover': {
      color: theme.color.red,
    },
    padding: 0,
  },
  root: {
    marginBottom: theme.spacing(4),
    padding: theme.spacing(3),
  },
}));

interface Props extends ActionHandlers {
  clientAPIKey: string;
  clientID: number;
  clientLabel: string;
  installCode: string;
  updateLongviewClient: DispatchProps['updateLongviewClient'];
  userCanModifyClient: boolean;
}

export const LongviewClientInstructions: React.FC<Props> = (props) => {
  const {
    clientAPIKey,
    clientID,
    clientLabel,
    installCode,
    triggerDeleteLongviewClient,
    updateLongviewClient,
    userCanModifyClient,
  } = props;
  const classes = useStyles();

  const [updating, setUpdating] = React.useState<boolean>(false);

  const handleUpdateLabel = (newLabel: string) => {
    setUpdating(true);
    return updateLongviewClient(clientID, newLabel)
      .then((_) => {
        setUpdating(false);
      })
      .catch((error) => {
        setUpdating(false);
        return Promise.reject(
          getAPIErrorOrDefault(error, 'Error updating label')[0].reason
        );
      });
  };

  return (
    <Paper className={classes.root} data-testid={clientID}>
      <Grid
        alignItems="flex-start"
        aria-label="Installation instructions for the Longview agent"
        container
        data-testid="installation"
        direction="row"
        justifyContent="space-between"
        spacing={2}
      >
        <Grid item xs={11}>
          <Grid container spacing={2}>
            <Grid item md={3} xs={12}>
              {userCanModifyClient ? (
                <EditableEntityLabel
                  loading={updating}
                  onEdit={handleUpdateLabel}
                  subText="Waiting for data..."
                  text={clientLabel}
                />
              ) : (
                <RestrictedUserLabel
                  label={clientLabel}
                  subtext={'Waiting for data...'}
                />
              )}
            </Grid>
            <Grid item md={9} xs={12}>
              <Instructions
                APIKey={clientAPIKey}
                installationKey={installCode}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={1}>
          <Grid container justifyContent="flex-end" spacing={2}>
            <Grid item>
              <ActionMenu
                longviewClientID={clientID}
                longviewClientLabel={clientLabel}
                triggerDeleteLongviewClient={triggerDeleteLongviewClient}
                userCanModifyClient={userCanModifyClient}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default LongviewClientInstructions;
