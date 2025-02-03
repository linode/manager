import {
  Autocomplete,
  Box,
  Button,
  CircleProgress,
  Paper,
  Stack,
  Typography,
} from '@linode/ui';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { useAlertDefinitionByServiceTypeQuery } from 'src/queries/cloudpulse/alerts';

import { AlertListReusableTable } from '../AlertsListing/AlertListReusableTable';

import type { AlertDefinitionType } from '@linode/api-v4';

interface AlertReusableComponentProps {
  entityId: string;
  entityName: string;
  serviceType: string;
}

export const AlertReusableComponent = (props: AlertReusableComponentProps) => {
  const { entityId, entityName, serviceType } = props;
  const { data: alerts, isLoading } = useAlertDefinitionByServiceTypeQuery(
    serviceType
  );

  const [searchText, setSearchText] = React.useState<string>('');

  const history = useHistory();

  const types = React.useMemo<{ label: AlertDefinitionType }[]>(() => {
    const types = new Set(alerts?.map((alert) => alert.type) ?? []);

    return Array.from(types).reduce(
      (previousValue, type) => [...previousValue, { label: type }],
      []
    );
  }, [alerts]);

  if (isLoading) {
    return <CircleProgress />;
  }

  return (
    <Paper>
      <Stack gap={3}>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="h2">Alerts</Typography>
          <Button
            onClick={() => history.push('/monitor/alerts/definitions')}
            sx={{ border: '1px solid' }}
          >
            Manage Alerts
          </Button>
        </Box>
        <Stack gap={2}>
          <Box display="flex" gap={2}>
            <DebouncedSearchTextField
              label=""
              noMarginTop
              onSearch={setSearchText}
              placeholder="Search for Alerts"
              sx={{ width: '250px' }}
              value={searchText}
            />
            <Autocomplete
              label=""
              noMarginTop
              onChange={(_, selectedValue) => {}}
              options={types}
              placeholder="Select Alert Type"
              sx={{ width: '250px' }}
            />
          </Box>
          <AlertListReusableTable
            columns={[
              { columnName: 'Alert Name', label: 'label' },
              { columnName: 'Metric Threshold', label: 'id' },
              { columnName: 'Alert Type', label: 'type' },
            ]}
            alerts={alerts ?? []}
            entityId={entityId}
            entityName={entityName}
            ordeByColumn="Alert Name"
          />
        </Stack>
      </Stack>
    </Paper>
  );
};
