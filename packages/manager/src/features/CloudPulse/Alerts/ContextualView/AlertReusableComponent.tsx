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
import React from 'react';
// eslint-disable-next-line no-restricted-imports
import { useHistory } from 'react-router-dom';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { useAlertDefinitionByServiceTypeQuery } from 'src/queries/cloudpulse/alerts';

import { AlertContextualViewTableHeaderMap } from '../AlertsListing/constants';
import {
  convertAlertsToTypeSet,
  filterAlertsByStatusAndType,
} from '../Utils/utils';
import { AlertInformationActionTable } from './AlertInformationActionTable';

import type {
  AlertDefinitionType,
  CloudPulseAlertsPayload,
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
   * Called when an alert is toggled on or off.
   * Only use in create flow.
   * @param payload enabled alerts ids
   */
  onToggleAlert?: (payload: CloudPulseAlertsPayload) => void;

  /**
   * Service type of selected entity
   */
  serviceType: string;
}

export const AlertReusableComponent = (props: AlertReusableComponentProps) => {
  const { entityId, entityName, onToggleAlert, serviceType } = props;
  const {
    data: alerts,
    error,
    isLoading,
  } = useAlertDefinitionByServiceTypeQuery(serviceType);

  const [searchText, setSearchText] = React.useState<string>('');
  const [selectedType, setSelectedType] = React.useState<
    AlertDefinitionType | undefined
  >();

  // Filter alerts based on status, search text & selected type
  const filteredAlerts = React.useMemo(
    () => filterAlertsByStatusAndType(alerts, searchText, selectedType),
    [alerts, searchText, selectedType]
  );

  const history = useHistory();

  // Filter unique alert types from alerts list
  const types = convertAlertsToTypeSet(alerts);

  if (isLoading) {
    return <CircleProgress />;
  }

  return (
    <Paper>
      <Stack gap={3}>
        <Box display="flex" justifyContent="space-between">
          <Box alignItems="center" display="flex" gap={0.5}>
            <Typography variant="h2">Alerts</Typography>
            <BetaChip />
          </Box>
          <Button
            buttonType="outlined"
            data-testid="manage-alerts"
            onClick={() => history.push('/alerts/definitions')}
          >
            Manage Alerts
          </Button>
        </Box>
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
          />
        </Stack>
      </Stack>
    </Paper>
  );
};
