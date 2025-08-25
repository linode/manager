import {
  Autocomplete,
  BetaChip,
  Box,
  Button,
  CircleProgress,
  Paper,
  Stack,
  Typography,
} from '@linode/ui';
import { useNavigate } from '@tanstack/react-router';
import React from 'react';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { useFlags } from 'src/hooks/useFlags';
import { useAlertDefinitionByServiceTypeQuery } from 'src/queries/cloudpulse/alerts';

import { AlertContextualViewTableHeaderMap } from '../AlertsListing/constants';
import { convertAlertsToTypeSet, filterAlerts } from '../Utils/utils';
import { AlertInformationActionTable } from './AlertInformationActionTable';

import type {
  AlertDefinitionType,
  CloudPulseAlertsPayload,
  CloudPulseServiceType,
} from '@linode/api-v4';

interface AlertReusableComponentProps {
  /**
   * Id for the selected entity
   */
  entityId?: string;

  /**
   * Name of the selected entity
   */
  entityName?: string;

  /**
   * Whether the legacy alert is available for the entity
   */
  isLegacyAlertAvailable?: boolean;

  /**
   * Called when an alert is toggled on or off.
   * @param payload enabled alerts ids
   * @param hasUnsavedChanges boolean to check if there are unsaved changes
   */
  onToggleAlert?: (
    payload: CloudPulseAlertsPayload,
    hasUnsavedChanges?: boolean
  ) => void;

  /**
   * Region ID for the selected entity
   */
  regionId?: string;

  /**
   * Service type of selected entity
   */
  serviceType: CloudPulseServiceType;
}

export const AlertReusableComponent = (props: AlertReusableComponentProps) => {
  const {
    entityId,
    entityName,
    onToggleAlert,
    serviceType,
    regionId,
    isLegacyAlertAvailable,
  } = props;
  const {
    data: alerts,
    error,
    isLoading,
  } = useAlertDefinitionByServiceTypeQuery(serviceType);

  const [searchText, setSearchText] = React.useState<string>('');
  const [selectedType, setSelectedType] = React.useState<
    AlertDefinitionType | undefined
  >();

  // Filter alerts based on status, search text, selected type, and region
  const filteredAlerts = React.useMemo(
    () => filterAlerts({ alerts, searchText, selectedType, regionId }),
    [alerts, regionId, searchText, selectedType]
  );

  const { aclpServices } = useFlags();

  const navigate = useNavigate();

  // Filter unique alert types from alerts list
  const types = convertAlertsToTypeSet(alerts);

  if (isLoading) {
    return <CircleProgress />;
  }

  return (
    <Paper sx={{ p: entityId ? undefined : 0 }}>
      <Stack gap={3}>
        {entityId && (
          <Box display="flex" justifyContent="space-between">
            <Box alignItems="center" display="flex" gap={0.5}>
              <Typography variant="h2">Alerts</Typography>
              {aclpServices?.[serviceType]?.alerts?.beta && <BetaChip />}
            </Box>
            <Button
              buttonType="outlined"
              data-qa-buttons="true"
              data-testid="manage-alerts"
              onClick={() => navigate({ to: '/alerts/definitions' })}
            >
              Manage Alerts
            </Button>
          </Box>
        )}
        <Stack gap={2}>
          <Box display="flex" gap={2}>
            <DebouncedSearchTextField
              data-testid="search-alert"
              hideLabel
              label="Search Alerts"
              noMarginTop
              onSearch={setSearchText}
              placeholder="Search for Alerts"
              sx={{ width: '250px' }}
              value={searchText}
            />
            <Autocomplete
              autoHighlight
              data-testid="alert-type-select"
              label="Select Type"
              noMarginTop
              onChange={(_, selectedValue) => {
                setSelectedType(selectedValue?.label);
              }}
              options={types}
              placeholder="Select Alert Type"
              sx={{ width: '250px' }}
              textFieldProps={{
                hideLabel: true,
              }}
            />
          </Box>

          <AlertInformationActionTable
            alerts={filteredAlerts}
            columns={AlertContextualViewTableHeaderMap}
            entityId={entityId}
            entityName={entityName}
            error={error}
            onToggleAlert={onToggleAlert}
            orderByColumn="Alert Name"
            serviceType={serviceType}
            showConfirmationDialog={isLegacyAlertAvailable}
          />
        </Stack>
      </Stack>
    </Paper>
  );
};
