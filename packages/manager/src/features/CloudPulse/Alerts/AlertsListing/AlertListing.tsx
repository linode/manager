import { Autocomplete, Box, Button, Stack } from '@linode/ui';
import * as React from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';

import AlertsIcon from 'src/assets/icons/entityIcons/alerts.svg';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { Placeholder } from 'src/components/Placeholder/Placeholder';
import { useAllAlertDefinitionsQuery } from 'src/queries/cloudpulse/alerts';
import { useCloudPulseServiceTypes } from 'src/queries/cloudpulse/services';

import { usePreferencesToggle } from '../../Utils/UserPreference';
import { alertStatusOptions } from '../constants';
import { AlertListNoticeMessages } from '../Utils/AlertListNoticeMessages';
import { scrollToElement } from '../Utils/AlertResourceUtils';
import { AlertsListTable } from './AlertListTable';

import type { Item } from '../constants';
import type { Alert, AlertServiceType, AlertStatusType } from '@linode/api-v4';

const searchAndSelectSx = {
  lg: '250px',
  md: '300px',
  sm: '400px',
  xs: '300px',
};
// hardcoding the value is temporary solution until something from the API side is confirmed.
const maxAllowedAlerts = 100;
const maxAllowedMetrics = 100;

const alertLimitMessage =
  'You have reached the maximum number of definitions created per account.';
const metricLimitMessage =
  'You have reached the maximum number of metrics that can be evaluated by alerts created on this account.';
export const AlertListing = () => {
  const { url } = useRouteMatch();
  const history = useHistory();
  const { data: alerts, error, isLoading } = useAllAlertDefinitionsQuery();
  const {
    data: serviceOptions,
    error: serviceTypesError,
    isLoading: serviceTypesLoading,
  } = useCloudPulseServiceTypes(true);
  const topRef = React.useRef<HTMLButtonElement>(null);

  const isAlertLimitReached =
    alerts &&
    alerts.filter((alert) => alert.type === 'user').length >= maxAllowedAlerts;

  const isMetricLimitReached =
    alerts &&
    alerts
      .filter((alert) => alert.type === 'user')
      .reduce(
        (total, alert) => total + (alert.rule_criteria?.rules?.length ?? 0),
        0
      ) >= maxAllowedMetrics;

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

  const [searchText, setSearchText] = React.useState<string>('');

  const [serviceFilters, setServiceFilters] = React.useState<
    Item<string, AlertServiceType>[]
  >([]);
  const [statusFilters, setStatusFilters] = React.useState<
    Item<string, AlertStatusType>[]
  >([]);

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
    if (statusFilters && statusFilters.length !== 0 && alerts) {
      return alerts.filter((alert: Alert) => {
        return statusFilters.some(
          (statusFilter) => statusFilter.value === alert.status
        );
      });
    }
    return alerts;
  }, [statusFilters, alerts]);

  const getAlertsList = React.useMemo(() => {
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
  }, [
    alerts,
    searchText,
    serviceFilteredAlerts,
    serviceFilters,
    statusFilteredAlerts,
    statusFilters,
  ]);

  const {
    preference,
    toggle: toggleAlertsGroupedByTag,
  } = usePreferencesToggle('aclpAlertsGroupByTag', [false, true]);

  if (alerts && alerts.length === 0) {
    return (
      <Placeholder
        buttonProps={[
          {
            children: 'Create Alerts',
            onClick: () => {
              history.push(`${url}/create`);
            },
          },
        ]}
        icon={AlertsIcon}
        isEntity
        renderAsSecondary
        subtitle="Create alerts that notifies you of the potential issues within your systems to cut downtime and maintain the performance of your infrastructure."
        title=""
      />
    );
  }
  return (
    <Stack spacing={2}>
      {isAlertLimitReached && (
        <AlertListNoticeMessages
          errorMessage={alertLimitMessage}
          variant="warning"
        />
      )}
      {isMetricLimitReached && (
        <AlertListNoticeMessages
          errorMessage={metricLimitMessage}
          variant="warning"
        />
      )}
      <Box
        alignItems={{ lg: 'flex-end', md: 'flex-start' }}
        display="flex"
        flexDirection={{ lg: 'row', md: 'column', sm: 'column', xs: 'column' }}
        flexWrap="wrap"
        gap={3}
        justifyContent="space-between"
        ref={topRef}
      >
        <Box
          flexDirection={{
            lg: 'row',
            md: 'column',
            sm: 'column',
            xs: 'column',
          }}
          display="flex"
          gap={2}
        >
          <DebouncedSearchTextField
            sx={{
              maxHeight: '34px',
              width: searchAndSelectSx,
            }}
            data-qa-filter="alert-search"
            label=""
            noMarginTop
            onSearch={setSearchText}
            placeholder="Search for Alerts"
            value={searchText}
          />
          <Autocomplete
            errorText={
              serviceTypesError
                ? 'There was an error in fetching the services.'
                : ''
            }
            onChange={(_, selected) => {
              setServiceFilters(selected);
            }}
            sx={{
              width: searchAndSelectSx,
            }}
            autoHighlight
            data-qa-filter="alert-service-filter"
            data-testid="alert-service-filter"
            label=""
            limitTags={1}
            loading={serviceTypesLoading}
            multiple
            noMarginTop
            options={getServicesList}
            placeholder={serviceFilters.length > 0 ? '' : 'Select a Service'}
            value={serviceFilters}
          />
          <Autocomplete
            onChange={(_, selected) => {
              setStatusFilters(selected);
            }}
            sx={{
              width: searchAndSelectSx,
            }}
            autoHighlight
            data-qa-filter="alert-status-filter"
            data-testid="alert-status-filter"
            label=""
            limitTags={1}
            multiple
            noMarginTop
            options={alertStatusOptions}
            placeholder={statusFilters.length > 0 ? '' : 'Select a Status'}
            value={statusFilters}
          />
        </Box>
        <Button
          onClick={() => {
            history.push(`${url}/create`);
          }}
          sx={{
            height: '34px',
            paddingBottom: 0,
            paddingTop: 0,
            whiteSpace: 'noWrap',
            width: { lg: '120px', md: '120px', sm: '150px', xs: '150px' },
          }}
          buttonType="primary"
          data-qa-button="create-alert"
          data-qa-buttons="true"
          disabled={isAlertLimitReached || isMetricLimitReached}
          ref={topRef}
          tooltipText="You have reached your limit of definitions for this account."
          variant="contained"
        >
          Create Alert
        </Button>
      </Box>
      <AlertsListTable
        alerts={getAlertsList}
        alertsGroupedByTag={preference}
        error={error ?? undefined}
        isLoading={isLoading}
        scrollToElement={() => scrollToElement(topRef.current ?? null)}
        services={getServicesList}
        toggleAlertsGroupedByTag={() => toggleAlertsGroupedByTag?.() ?? false}
      />
    </Stack>
  );
};
