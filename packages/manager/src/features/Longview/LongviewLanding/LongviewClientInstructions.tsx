import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { EditableEntityLabel } from 'src/components/EditableEntityLabel/EditableEntityLabel';
import { Grid } from 'src/components/Grid';
import { Paper } from 'src/components/Paper';
import { DispatchProps } from 'src/containers/longview.container';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { InstallationInstructions } from '../shared/InstallationInstructions';
import { LongviewActionMenu, ActionHandlers } from './LongviewActionMenu';
import { RestrictedUserLabel } from './RestrictedUserLabel';

interface Props extends ActionHandlers {
  clientAPIKey: string;
  clientID: number;
  clientLabel: string;
  installCode: string;
  updateLongviewClient: DispatchProps['updateLongviewClient'];
  userCanModifyClient: boolean;
}

export const LongviewClientInstructions = (props: Props) => {
  const {
    clientAPIKey,
    clientID,
    clientLabel,
    installCode,
    triggerDeleteLongviewClient,
    updateLongviewClient,
    userCanModifyClient,
  } = props;

  const theme = useTheme();

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
    <Paper
      data-testid={clientID}
      sx={{
        marginBottom: theme.spacing(4),
        padding: theme.spacing(3),
      }}
    >
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
              <InstallationInstructions
                APIKey={clientAPIKey}
                installationKey={installCode}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={1}>
          <Grid container justifyContent="flex-end" spacing={2}>
            <Grid item>
              <LongviewActionMenu
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
