import { Box, Button } from '@linode/ui';
import { useTheme } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { Breadcrumb } from 'src/components/Breadcrumb/Breadcrumb';
import { useEditAlertDefinition } from 'src/queries/cloudpulse/alerts';

import { AlertResources } from '../AlertsResources/AlertsResources';
import { isResourcesEqual } from '../Utils/AlertResourceUtils';
import { getAlertBoxStyles } from '../Utils/utils';
import { EditAlertResourcesConfirmDialog } from './EditAlertResourcesConfirmationDialog';

import type { EditAlertProps } from './EditAlertDefinition';

export const EditAlertResources = (props: EditAlertProps) => {
  const theme = useTheme();

  const history = useHistory();

  const definitionLanding = '/alerts/definitions';

  const { alertDetails, serviceType } = props;
  const alertId = alertDetails.id;
  const { isPending, mutateAsync: editAlert } = useEditAlertDefinition();
  const [selectedResources, setSelectedResources] = React.useState<string[]>(
    []
  );
  const [showConfirmation, setShowConfirmation] =
    React.useState<boolean>(false);

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
    editAlert({
      alertId,
      entity_ids: selectedResources,
      serviceType,
      type: alertDetails.type,
    })
      .then(() => {
        setShowConfirmation(false);
        // on success land on the alert definition list page and show a success snackbar
        history.push(definitionLanding);
        showSnackbar('Alert entities successfully updated.', 'success');
      })
      .catch(() => {
        setShowConfirmation(false);
        showSnackbar(
          'Error while updating the entities. Try again later.',
          'error'
        );
      });
  };
  const isSameResourcesSelected = React.useMemo(
    () => isResourcesEqual(alertDetails?.entity_ids, selectedResources),
    [alertDetails, selectedResources]
  );
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
            data-testid="cancel-save-resources"
            onClick={() => {
              history.push('/alerts/definitions');
            }}
            variant="text"
          >
            Cancel
          </Button>
          <Button
            buttonType="primary"
            data-qa-buttons="true"
            data-testid="save-resources"
            disabled={isSameResourcesSelected}
            onClick={() => {
              window.scrollTo({
                behavior: 'instant',
                top: 0,
              });
              setShowConfirmation(true);
            }}
          >
            Save
          </Button>
        </Box>
        <EditAlertResourcesConfirmDialog
          isApiResponsePending={isPending}
          onClose={() => setShowConfirmation((prev) => !prev)}
          onConfirm={saveResources}
          openConfirmationDialog={showConfirmation}
        />
      </Box>
    </>
  );
};

const showSnackbar = (message: string, variant: 'error' | 'success') => {
  enqueueSnackbar(message, {
    anchorOrigin: {
      horizontal: 'right',
      vertical: 'bottom', // Show snackbar at the bottom
    },
    autoHideDuration: 2000,
    variant,
  });
};
