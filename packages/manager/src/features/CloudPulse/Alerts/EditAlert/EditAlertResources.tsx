import { Box, Button, CircleProgress } from '@linode/ui';
import { useTheme } from '@mui/material';
import { useSnackbar } from 'notistack';
import React from 'react';
import { useHistory, useParams } from 'react-router-dom';

import EntityIcon from 'src/assets/icons/entityIcons/alerts.svg';
import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Breadcrumb } from 'src/components/Breadcrumb/Breadcrumb';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import {
  useAlertDefinitionQuery,
  useEditAlertDefinitionResources,
} from 'src/queries/cloudpulse/alerts';

import { StyledPlaceholder } from '../AlertsDetail/AlertDetail';
import { AlertResources } from '../AlertsResources/AlertsResources';
import { getAlertBoxStyles } from '../Utils/utils';

import type { AlertRouteParams } from '../AlertsDetail/AlertDetail';
import type { ActionPanelProps } from 'src/components/ActionsPanel/ActionsPanel';

export const EditAlertResources = () => {
  const { alertId, serviceType } = useParams<AlertRouteParams>();

  const history = useHistory();

  const { enqueueSnackbar } = useSnackbar();

  const theme = useTheme();

  const definitionLanding = '/monitor/alerts/definitions';

  const { data: alertDetails, isError, isFetching } = useAlertDefinitionQuery(
    Number(alertId),
    serviceType
  );

  const {
    isError: isEditAlertError,
    mutateAsync: editAlert,
    reset: resetEditAlert,
  } = useEditAlertDefinitionResources(serviceType, Number(alertId));

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

  if (isFetching) {
    return (
      <>
        <Breadcrumb crumbOverrides={overrides} pathname={newPathname} />
        <Box alignContent="center" height={theme.spacing(75)}>
          <CircleProgress />
        </Box>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <Breadcrumb crumbOverrides={overrides} pathname={newPathname} />
        <Box alignContent="center" height={theme.spacing(75)}>
          <ErrorState
            errorText={
              'An error occurred while loading the alerts definitions and resources. Please try again later.'
            }
          />
        </Box>
      </>
    );
  }

  if (!alertDetails) {
    return (
      <>
        <Breadcrumb crumbOverrides={overrides} pathname={newPathname} />
        <Box alignContent="center" height={theme.spacing(75)}>
          <StyledPlaceholder icon={EntityIcon} title="No Data to display." />
        </Box>
      </>
    );
  }

  const handleResourcesSelection = (resourceIds: string[]) => {
    setSelectedResources(resourceIds.map((id) => Number(id))); // here we just keep track of it, on save we will update it
  };

  const saveResources = () => {
    setShowConfirmation(false);
    editAlert({
      resource_ids: selectedResources.map((id) => String(id)),
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
            handleResourcesSelection={handleResourcesSelection}
            isSelectionsNeeded
            serviceType={alertDetails.service_type}
            showTitle
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
