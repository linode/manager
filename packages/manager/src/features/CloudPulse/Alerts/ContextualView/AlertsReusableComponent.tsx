import {
  Autocomplete,
  Box,
  Button,
  CircleProgress,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@linode/ui';
import React from 'react';
import { useHistory } from 'react-router-dom';

import InfoIcon from 'src/assets/icons/info.svg';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { useAlertDefinitionByServiceTypeQuery } from 'src/queries/cloudpulse/alerts';

import { AlertContextualViewTableHeaderMap } from '../AlertsListing/constants';
import {
  convertAlertsToTypeSet,
  filterAlertsByStatusAndType,
} from '../Utils/utils';
import { AlertInformationActionTable } from './AlertInformationActionTable';

import type { AlertDefinitionType } from '@linode/api-v4';

interface AlertReusableComponentProps {
  /**
   * Id for the selected entity
   */
  entityId: string;

  /**
   * Name of the selected entity
   */
  entityName: string;

  /**
   * Service type of selected entity
   */
  serviceType: string;
}

export const AlertReusableComponent = (props: AlertReusableComponentProps) => {
  const { entityId, entityName, serviceType } = props;
  const {
    data: alerts,
    error,
    isLoading,
  } = useAlertDefinitionByServiceTypeQuery(serviceType);

  const [searchText, setSearchText] = React.useState<string>('');
  const [selectedType, setSelectedType] = React.useState<
    AlertDefinitionType | undefined
  >();

  // Filter alerts based on serach text & selected type
  const filteredAlerts = React.useMemo(() => {
    return filterAlertsByStatusAndType(alerts, searchText, selectedType);
  }, [alerts, searchText, selectedType]);

  const history = useHistory();

  // Filter unique alert types from alerts list
  const types = React.useMemo<{ label: AlertDefinitionType }[]>(() => {
    return convertAlertsToTypeSet(alerts);
  }, [alerts]);
  if (isLoading) {
    return <CircleProgress />;
  }
  return (
    <Paper>
      <Stack gap={3}>
        <Box display="flex" justifyContent="space-between">
          <Box alignItems={'center'} display="flex" gap={0.5}>
            <Typography variant="h2">Alerts</Typography>
            <Tooltip title="The list contains only the alerts enabled in the Monitor centralized view.">
              <span>
                <InfoIcon />
              </span>
            </Tooltip>
          </Box>
          <Button
            data-qa-buttons="true"
            data-testid="manage-alerts"
            onClick={() => history.push('/alerts/definitions')}
            sx={{ border: '1px solid' }}
          >
            Manage Alerts
          </Button>
        </Box>
        <Stack gap={2}>
          <Box display="flex" flexWrap="wrap" gap={2}>
            <DebouncedSearchTextField
              data-testid="search-alert"
              label=""
              noMarginTop
              onSearch={setSearchText}
              placeholder="Search for Alerts"
              sx={{ height: '34px', width: '250px' }}
              value={searchText}
            />
            <Autocomplete
              onChange={(_, selectedValue) => {
                setSelectedType(selectedValue?.label);
              }}
              autoHighlight
              data-testid="alert-type-select"
              label=""
              noMarginTop
              options={types}
              placeholder="Select Alert Type"
              sx={{ width: '250px' }}
            />
          </Box>
          <AlertInformationActionTable
            alerts={filteredAlerts}
            columns={AlertContextualViewTableHeaderMap}
            entityId={entityId}
            entityName={entityName}
            error={error}
            orderByColumn="Alert Name"
          />
        </Stack>
      </Stack>
    </Paper>
  );
};
