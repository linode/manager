import { Autocomplete, Button, Paper, Stack } from '@linode/ui';
import { Grid } from '@mui/material';
import * as React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';

import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { StyledPlaceholder } from 'src/features/StackScripts/StackScriptBase/StackScriptBase.styles';
import { useAllAlertDefinitionsQuery } from 'src/queries/cloudpulse/alerts';
import { useCloudPulseServiceTypes } from 'src/queries/cloudpulse/services';

import { alertStatusOptions } from '../constants';
import { AlertsListTable } from './AlertsListTable';

import type { Item } from '../constants';
import type { Alert, AlertServiceType, AlertStatusType } from '@linode/api-v4';

export const AlertListing = () => {
  const { url } = useRouteMatch();
  const history = useHistory();
  const { data: alerts, error, isLoading } = useAllAlertDefinitionsQuery();
  const {
    data: serviceOptions,
    error: serviceTypesError,
    isLoading: serviceTypesLoading,
  } = useCloudPulseServiceTypes(true);

  const getServicesList = React.useMemo((): Item<
    string,
    AlertServiceType
  >[] => {
    return serviceOptions && serviceOptions.data.length > 0
      ? serviceOptions.data.map((service) => ({
          label: service.label,
          value: service.service_type as AlertServiceType,
        }))
      : [];
  }, [serviceOptions]);

  React.useEffect(() => {
    setServiceFilters(getServicesList);
  }, [getServicesList]);
  const [searchText, setSearchText] = React.useState<string>('');

  const [serviceFilters, setServiceFilters] = React.useState<
    Item<string, AlertServiceType>[]
  >([]);
  const [statusFilters, setStatusFilters] = React.useState<
    Item<string, AlertStatusType>[]
  >(alertStatusOptions);

  const serviceFilteredAlerts = React.useMemo(() => {
    if (serviceFilters && serviceFilters.length !== 0 && alerts) {
      return alerts.filter((alert: Alert) => {
        return serviceFilters.some(
          (serviceFilter) => serviceFilter.value === alert.service_type
        );
      });
    }

    return alerts;
  }, [serviceFilters, alerts]);

  const statusFilteredAlerts = React.useMemo(() => {
    if (statusFilters && statusFilters?.length !== 0 && alerts) {
      return alerts.filter((alert: Alert) => {
        return statusFilters.some(
          (statusFilter) => statusFilter.value === alert.status
        );
      });
    }
    return alerts;
  }, [statusFilters, alerts]);

  if (alerts?.length === 0) {
    return (
      <Grid item xs={12}>
        <Paper>
          <StyledPlaceholder
            subtitle="Start Monitoring your resources."
            title=""
          />
        </Paper>
      </Grid>
    );
  }

  const getAlertsList = () => {
    if (!alerts) {
      return [];
    }
    let filteredAlerts = alerts;

    if (serviceFilters && serviceFilters.length > 0) {
      filteredAlerts = serviceFilteredAlerts ?? [];
    }

    if (statusFilters && statusFilters.length > 0) {
      filteredAlerts = statusFilteredAlerts ?? [];
    }

    if (serviceFilters.length > 0 && statusFilters.length > 0) {
      filteredAlerts = filteredAlerts.filter((alert) => {
        return (
          serviceFilters.some(
            (serviceFilter) => serviceFilter.value === alert.service_type
          ) &&
          statusFilters.some(
            (statusFilter) => statusFilter.value === alert.status
          )
        );
      });
    }

    if (searchText) {
      filteredAlerts = filteredAlerts.filter((alert: Alert) => {
        return alert.label.toLowerCase().includes(searchText.toLowerCase());
      });
    }

    return filteredAlerts;
  };

  return (
    <Stack spacing={2}>
      <Grid container display="flex" gap={2} overflow="auto">
        <Grid item md={3} sm={5} sx={{ paddingLeft: 0 }} xs={10}>
          <DebouncedSearchTextField
            data-testid="alert-search"
            debounceTime={250}
            label=""
            noMarginTop
            onSearch={setSearchText}
            placeholder="Search for Alerts"
            value={searchText}
          />
        </Grid>
        <Grid item md={3} sm={5} xs={10}>
          <Autocomplete
            errorText={
              serviceTypesError ? 'An error in fetching the services.' : ''
            }
            onChange={(_, selected) => {
              setServiceFilters(selected);
            }}
            data-qa-filter="alert-service-filter"
            data-testid="alert-service-filter"
            label={''}
            loading={serviceTypesLoading}
            multiple
            noMarginTop
            options={getServicesList}
            placeholder={serviceFilters.length > 0 ? '' : 'Select a Service'}
            value={serviceFilters}
          />
        </Grid>
        <Grid item md={3} sm={5} xs={10}>
          <Autocomplete
            onChange={(_, selected) => {
              setStatusFilters(selected);
            }}
            data-qa-filter="alert-status-filter"
            data-testid="alert-status-filter"
            label={''}
            multiple
            noMarginTop
            options={alertStatusOptions}
            placeholder={statusFilters.length > 0 ? '' : 'Select a Status'}
            value={statusFilters}
          />
        </Grid>
        <Grid
          sx={{
            alignContent: 'center',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
          container
          item
          md={2}
          sm={5}
          xs={10}
        >
          <Button
            onClick={() => {
              history.push(`${url}/create`);
            }}
            buttonType="primary"
            data-qa-button="create-alert"
            data-qa-buttons="true"
            sx={{ height: { md: '34px' }, width: { md: '140px' } }}
            variant="contained"
          >
            Create Alert
          </Button>
        </Grid>
      </Grid>
      <AlertsListTable
        alerts={getAlertsList()}
        error={error ?? undefined}
        isLoading={isLoading}
        services={getServicesList}
      />
    </Stack>
  );
};
