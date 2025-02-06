import { Box, Button } from '@linode/ui';
import { useTheme } from '@mui/material';
import { useSnackbar } from 'notistack';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Breadcrumb } from 'src/components/Breadcrumb/Breadcrumb';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { useEditAlertDefinition } from 'src/queries/cloudpulse/alerts';

import { AlertResources } from '../AlertsResources/AlertsResources';
import { getAlertBoxStyles } from '../Utils/utils';

import type { Alert, AlertServiceType } from '@linode/api-v4';
import type { ActionPanelProps } from 'src/components/ActionsPanel/ActionsPanel';

interface EditAlertResourcesProps {
  alertDetails: Alert;
  serviceType: AlertServiceType;
}
export const EditAlertResources = (props: EditAlertResourcesProps) => {
  const { alertDetails, serviceType } = props;

  const history = useHistory();

  const { enqueueSnackbar } = useSnackbar();

  const theme = useTheme();

  const definitionLanding = '/monitor/alerts/definitions';

  const alertId = alertDetails.id;
  const {
    isError: isEditAlertError,
    mutateAsync: editAlert,
    reset: resetEditAlert,
  } = useEditAlertDefinition(serviceType, Number(alertId));

  React.useEffect(() => {
    setSelectedResources(
      alertDetails ? alertDetails.entity_ids.map((id) => Number(id)) : []
    );
  }, [alertDetails]);

  const { newPathname, overrides } = React.useMemo(() => {
    const overrides = [
      {
        label: 'Definitions',
        linkTo: definitionLanding,
        position: 1,
      },
      {
        label: 'Edit',
        linkTo: `${definitionLanding}/edit/${serviceType}/${alertId}`,
        position: 2,
      },
    ];

    return { newPathname: '/Definitions/Edit', overrides };
  }, [serviceType, alertId]);

  const [showConfirmation, setShowConfirmation] = React.useState<boolean>(
    false
  );

  const [selectedResources, setSelectedResources] = React.useState<number[]>(
    []
  );

  const isSameResourcesSelected = React.useMemo((): boolean => {
    if (
      !alertDetails ||
      !alertDetails?.entity_ids ||
      selectedResources.length !== alertDetails?.entity_ids.length
    ) {
      return false;
    }
    return selectedResources.every((resource) =>
      alertDetails?.entity_ids.includes(String(resource))
    );
  }, [alertDetails, selectedResources]);

  const handleResourcesSelection = (resourceIds: string[]) => {
    setSelectedResources(resourceIds.map((id) => Number(id))); // here we just keep track of it, on save we will update it
  };

  const saveResources = () => {
    setShowConfirmation(false);
    editAlert({
      entity_ids: selectedResources.map((id) => String(id)),
    }).then(() => {
      // on success land on the alert definition list page and show a success snackbar
      history.push(definitionLanding);
      enqueueSnackbar('Alert resources successfully updated.', {
        anchorOrigin: {
          horizontal: 'right',
          vertical: 'top', // Show snackbar at the top
        },
        autoHideDuration: 5000,
        style: {
          marginTop: '150px',
        },
        variant: 'success',
      });
    });
  };

  const saveConfirmationActionProps: ActionPanelProps = {
    primaryButtonProps: {
      'data-testid': 'editconfirmation',
      label: 'Confirm',
      onClick: saveResources,
    },
    secondaryButtonProps: {
      label: 'Cancel',
      onClick: () => setShowConfirmation(false),
    },
  };

  if (isEditAlertError) {
    enqueueSnackbar('Error while updating the resources. Try again later.', {
      anchorOrigin: {
        horizontal: 'right',
        vertical: 'top', // Show snackbar at the top
      },
      autoHideDuration: 5000,
      style: {
        marginTop: '150px',
      },
      variant: 'error',
    });
    resetEditAlert(); // reset the mutate use hook states
  }

  return (
    <>
      <Breadcrumb crumbOverrides={overrides} pathname={newPathname} />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          ...getAlertBoxStyles(theme),
        }}
      >
        <Box>
          <AlertResources
            alertLabel={alertDetails.label}
            alertResourceIds={alertDetails.entity_ids}
            alertType={alertDetails.type}
            handleResourcesSelection={handleResourcesSelection}
            isSelectionsNeeded
            serviceType={alertDetails.service_type}
          />
        </Box>
        <Box alignSelf="flex-end" m={3} mb={0}>
          <Button
            onClick={() => {
              history.push('/monitor/alerts/definitions');
            }}
            data-testid="cancelsaveresources"
            variant="text"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              window.scrollTo({
                behavior: 'instant',
                top: 0,
              });
              setShowConfirmation(true);
            }}
            sx={{
              ml: 1,
            }}
            buttonType="primary"
            data-qa-buttons="true"
            data-testid="saveresources"
            disabled={isSameResourcesSelected}
          >
            Save
          </Button>
        </Box>
        <ConfirmationDialog
          sx={{
            fontSize: '16px',
          }}
          actions={<ActionsPanel {...saveConfirmationActionProps} />}
          onClose={() => setShowConfirmation(!showConfirmation)}
          open={showConfirmation}
          title="Confirm alert updates"
        >
          You have changed the resource settings for your alert.
          <br /> This also updates your alert definition.
        </ConfirmationDialog>
      </Box>
    </>
  );
};
