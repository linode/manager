import { Box, Button } from '@linode/ui';
import { useTheme } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import EntityIcon from 'src/assets/icons/entityIcons/alerts.svg';
import { Breadcrumb } from 'src/components/Breadcrumb/Breadcrumb';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { useEditAlertDefinition } from 'src/queries/cloudpulse/alerts';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import {
  useAlertDefinitionQuery,
  useEditAlertDefinition,
} from 'src/queries/cloudpulse/alerts';

import { AlertResources } from '../AlertsResources/AlertsResources';
import { isResourcesEqual } from '../Utils/AlertResourceUtils';
import { getAlertBoxStyles } from '../Utils/utils';
import { EditAlertResourcesConfirmDialog } from './EditAlertResourcesConfirmationDialog';

import type { AlertRouteParams } from '../AlertsDetail/AlertDetail';
import type { CrumbOverridesProps } from 'src/components/Breadcrumb/Crumbs';

interface EditAlertResourcesProps {
  alertDetails: Alert;
  serviceType: AlertServiceType;
}
export const EditAlertResources = (props: EditAlertResourcesProps) => {
  const { alertDetails, serviceType } = props;
export const EditAlertResources = () => {
  const { alertId, serviceType } = useParams<AlertRouteParams>();

  const theme = useTheme();

  const history = useHistory();

  const definitionLanding = '/monitor/alerts/definitions';

  const alertId = alertDetails.id;
  const {
    isError: isEditAlertError,
    mutateAsync: editAlert,
    reset: resetEditAlert,
  } = useEditAlertDefinition(serviceType, Number(alertId));
  const { data: alertDetails, isError, isFetching } = useAlertDefinitionQuery(
    alertId,
    serviceType
  );

  const { mutateAsync: editAlert } = useEditAlertDefinition();
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
  const saveResources = () => {
    setShowConfirmation(false);
    editAlert({
      alertId,
      entity_ids: selectedResources,
      serviceType,
    })
      .then(() => {
        // on success land on the alert definition list page and show a success snackbar
        history.push(definitionLanding);
        showSnackbar('Alert resources successfully updated.', 'success');
      })
      .catch(() => {
        showSnackbar(
          'Error while updating the resources. Try again later.',
          'error'
        );
      });
  };
  const isSameResourcesSelected = React.useMemo(
    () => isResourcesEqual(alertDetails?.entity_ids, selectedResources),
    [alertDetails, selectedResources]
  );

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

  const {
    class: alertClass,
    entity_ids,
    label,
    service_type,
    type,
  } = alertDetails;

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
          alertClass={alertClass}
          alertLabel={label}
          alertResourceIds={entity_ids}
          alertType={type}
          handleResourcesSelection={handleResourcesSelection}
          isSelectionsNeeded
          serviceType={service_type}
        />
        <Box alignSelf="flex-end" display="flex" gap={1} m={3} mb={0}>
          <Button
            onClick={() => {
              history.push('/monitor/alerts/definitions');
            }}
            data-testid="cancel-save-resources"
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
            buttonType="primary"
            data-qa-buttons="true"
            data-testid="save-resources"
            disabled={isSameResourcesSelected}
          >
            Save
          </Button>
        </Box>
        <EditAlertResourcesConfirmDialog
          onClose={() => setShowConfirmation((prev) => !prev)}
          onConfirm={saveResources}
          openConfirmationDialog={showConfirmation}
        />
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

const showSnackbar = (message: string, variant: 'error' | 'success') => {
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
