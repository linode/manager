import { Box, Button, CircleProgress } from '@linode/ui';
import { useTheme } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import React from 'react';
import { useHistory, useParams } from 'react-router-dom';

import EntityIcon from 'src/assets/icons/entityIcons/alerts.svg';
import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { Breadcrumb } from 'src/components/Breadcrumb/Breadcrumb';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import {
  useAlertDefinitionQuery,
  useEditAlertDefinition,
} from 'src/queries/cloudpulse/alerts';

import { StyledPlaceholder } from '../AlertsDetail/AlertDetail';
import { AlertResources } from '../AlertsResources/AlertsResources';
import { getAlertBoxStyles } from '../Utils/utils';

import type { AlertRouteParams } from '../AlertsDetail/AlertDetail';
import type { ActionPanelProps } from 'src/components/ActionsPanel/ActionsPanel';
import type { CrumbOverridesProps } from 'src/components/Breadcrumb/Crumbs';

export const EditAlertResources = () => {
  const { alertId, serviceType } = useParams<AlertRouteParams>();

  const theme = useTheme();

  const history = useHistory();

  const definitionLanding = '/monitor/alerts/definitions';

  const { data: alertDetails, isError, isFetching } = useAlertDefinitionQuery(
    Number(alertId),
    serviceType
  );

  const { mutateAsync: editAlert } = useEditAlertDefinition(
    serviceType,
    Number(alertId)
  );
  const [selectedResources, setSelectedResources] = React.useState<string[]>(
    []
  );
  const [showConfirmation, setShowConfirmation] = React.useState<boolean>(
    false
  );

  React.useEffect(() => {
    setSelectedResources(
      alertDetails ? alertDetails.entity_ids.map((id) => id) : []
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

  const saveResources = () => {
    setShowConfirmation(false);
    editAlert({
      entity_ids: selectedResources.map((id) => String(id)),
    })
      .then(() => {
        // on success land on the alert definition list page and show a success snackbar
        history.push(definitionLanding);
        enqueueASnackbar('Alert resources successfully updated.', 'success');
      })
      .catch(() => {
        enqueueASnackbar(
          'Error while updating the resources. Try again later.',
          'error'
        );
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
    return getEditAlertMessage(<CircleProgress />, newPathname, overrides);
  }

  if (isError) {
    return getEditAlertMessage(
      <ErrorState
        errorText={
          'An error occurred while loading the alerts definitions and resources. Please try again later.'
        }
      />,
      newPathname,
      overrides
    );
  }

  if (!alertDetails) {
    return getEditAlertMessage(
      <StyledPlaceholder icon={EntityIcon} title="No Data to display." />,
      newPathname,
      overrides
    );
  }

  const handleResourcesSelection = (resourceIds: string[]) => {
    setSelectedResources(resourceIds); // keep track of the selected resources and update it on save
  };

  const { entity_ids, label, service_type } = alertDetails;

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
        <AlertResources
          alertLabel={label}
          alertResourceIds={entity_ids}
          handleResourcesSelection={handleResourcesSelection}
          isSelectionsNeeded
          serviceType={service_type}
        />
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

/**
 * Returns a common UI structure for loading, error, or empty states.
 * @param messageComponent - A React component to display (e.g., CircleProgress, ErrorState, or Placeholder).
 * @param pathName - The current pathname to be provided in breadcrumb
 * @param crumbOverrides - The overrides to be provided in breadcrumb
 */
const getEditAlertMessage = (
  messageComponent: React.ReactNode,
  pathName: string,
  crumbOverrides: CrumbOverridesProps[]
) => {
  return (
    <>
      <Breadcrumb crumbOverrides={crumbOverrides} pathname={pathName} />
      <Box alignContent="center" height="600px">
        {messageComponent}
      </Box>
    </>
  );
};

const enqueueASnackbar = (message: string, variant: 'error' | 'success') => {
  enqueueSnackbar(message, {
    anchorOrigin: {
      horizontal: 'right',
      vertical: 'top', // Show snackbar at the top
    },
    autoHideDuration: 2000,
    style: {
      marginTop: '150px',
    },
    variant,
  });
};
