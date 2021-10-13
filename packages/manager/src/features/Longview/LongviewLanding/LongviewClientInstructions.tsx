import * as React from 'react';

import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import EditableEntityLabel from 'src/components/EditableEntityLabel';
import Grid from 'src/components/Grid';
import { DispatchProps } from 'src/containers/longview.container';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import ActionMenu, { ActionHandlers } from './LongviewActionMenu';
import RestrictedUserLabel from './RestrictedUserLabel';

import Instructions from '../shared/InstallationInstructions';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginBottom: theme.spacing(4),
    padding: theme.spacing(3),
  },
  button: {
    padding: 0,
    '&:hover': {
      color: theme.color.red,
    },
  },
}));

interface Props extends ActionHandlers {
  clientID: number;
  clientLabel: string;
  installCode: string;
  clientAPIKey: string;
  updateLongviewClient: DispatchProps['updateLongviewClient'];
  userCanModifyClient: boolean;
}

export const LongviewClientInstructions: React.FC<Props> = (props) => {
  const {
    clientID,
    clientLabel,
    installCode,
    clientAPIKey,
    updateLongviewClient,
    triggerDeleteLongviewClient,
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
    <Paper data-testid={clientID} className={classes.root}>
      <Grid
        container
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        spacing={2}
        aria-label="Installation instructions for the Longview agent"
        data-testid="installation"
      >
        <Grid item xs={11}>
          <Grid container>
            <Grid item xs={12} md={3}>
              {userCanModifyClient ? (
                <EditableEntityLabel
                  text={clientLabel}
                  subText="Waiting for data..."
                  onEdit={handleUpdateLabel}
                  loading={updating}
                />
              ) : (
                <RestrictedUserLabel
                  label={clientLabel}
                  subtext={'Waiting for data...'}
                />
              )}
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
          <Grid container justifyContent="flex-end">
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
