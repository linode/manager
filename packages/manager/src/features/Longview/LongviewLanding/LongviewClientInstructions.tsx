import { Paper } from '@linode/ui';
import Grid from '@mui/material/Grid2';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { EditableEntityLabel } from 'src/components/EditableEntityLabel/EditableEntityLabel';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { InstallationInstructions } from '../shared/InstallationInstructions';
import { LongviewActionMenu } from './LongviewActionMenu';
import { RestrictedUserLabel } from './RestrictedUserLabel';

import type { ActionHandlers } from './LongviewActionMenu';
import type { DispatchProps } from 'src/containers/longview.container';

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
        aria-label="Installation instructions for the Longview agent"
        container
        data-testid="installation"
      >
        <Grid container size={11}>
          <Grid
            size={{
              md: 3,
              xs: 12,
            }}
          >
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
          <Grid
            size={{
              md: 9,
              xs: 12,
            }}
          >
            <InstallationInstructions
              APIKey={clientAPIKey}
              installationKey={installCode}
            />
          </Grid>
        </Grid>
        <Grid size={1}>
          <Grid
            container
            spacing={2}
            sx={{
              justifyContent: 'flex-end',
            }}
          >
            <Grid>
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
