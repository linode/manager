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

import { convertAlertsToTypeSet } from '../Utils/utils';

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
  const { serviceType } = props;
  const { data: alerts, isLoading } = useAlertDefinitionByServiceTypeQuery(
    serviceType
  );

  const [searchText, setSearchText] = React.useState<string>('');
  // This will be replaced with a variable in next PR
  const [_, setSelectedType] = React.useState<
    AlertDefinitionType | undefined
  >();

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
            <Tooltip title="The list contains only the alerts enabled in the Monitor centralized view.">
              <span>
                <InfoIcon />
              </span>
            </Tooltip>
          </Box>
          <Button
            data-testid="manage-alerts"
            onClick={() => history.push('/monitor/alerts/definitions')}
            sx={{ border: '1px solid' }}
          >
            Manage Alerts
          </Button>
        </Box>
        <Stack gap={2}>
          <Box display="flex" gap={2}>
            <DebouncedSearchTextField
              data-testid="search-alert"
              label=""
              noMarginTop
              onSearch={setSearchText}
              placeholder="Search for Alerts"
              sx={{ width: '250px' }}
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
        </Stack>
      </Stack>
    </Paper>
  );
};
