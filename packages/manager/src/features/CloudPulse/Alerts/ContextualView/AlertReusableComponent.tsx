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
import type { SxProps, Theme } from '@linode/ui';

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
   * Called when this component's ready state changes.
   * Receives `true` when alerts have loaded successfully, or `false`
   * when alerts are still loading or failed to load due to an error.
   * Service owners can use this to enable or disable save buttons that depend
   * on the readiness of this component before allowing any action.
   */
  onStatusChange?: (isReady: boolean) => void;

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
   * Custom sx styles for the Paper wrapper component
   */
  paperSx?: SxProps<Theme>;

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
    onStatusChange,
    paperSx,
    serviceType,
    regionId,
    isLegacyAlertAvailable,
  } = props;
  const {
    data: alerts,
    error,
    isLoading,
  } = useAlertDefinitionByServiceTypeQuery(serviceType);

  React.useEffect(() => {
    onStatusChange?.(!isLoading && !error);
  }, [isLoading, error, onStatusChange]);

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
    <Paper sx={paperSx}>
      <Stack gap={3}>
        {/* When entityId is available for non-linode services: Show header with title and Manage Alerts button */}
        {entityId && serviceType !== 'linode' && (
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
            {/* When entityId is available for linode service: Show Manage Alerts button in search/filter row (right-aligned) */}
            {entityId && serviceType === 'linode' && (
              <Button
                buttonType="outlined"
                data-qa-buttons="true"
                data-testid="manage-alerts"
                onClick={() => navigate({ to: '/alerts/definitions' })}
                sx={{ marginLeft: 'auto' }}
              >
                Manage Alerts
              </Button>
            )}
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
