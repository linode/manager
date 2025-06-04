import {
  Autocomplete,
  Box,
  Button,
  Notice,
  Stack,
  Typography,
} from '@linode/ui';
import { useNavigate } from '@tanstack/react-router';
import * as React from 'react';

import AlertsIcon from 'src/assets/icons/entityIcons/alerts.svg';
import { DebouncedSearchTextField } from 'src/components/DebouncedSearchTextField';
import { Placeholder } from 'src/components/Placeholder/Placeholder';
import { SupportLink } from 'src/components/SupportLink';
import { useAllAlertDefinitionsQuery } from 'src/queries/cloudpulse/alerts';
import { useCloudPulseServiceTypes } from 'src/queries/cloudpulse/services';

import { usePreferencesToggle } from '../../Utils/UserPreference';
import { alertStatusOptions } from '../constants';
import { AlertListNoticeMessages } from '../Utils/AlertListNoticeMessages';
import { scrollToElement } from '../Utils/AlertResourceUtils';
import { AlertsListTable } from './AlertListTable';
import {
  alertLimitMessage,
  alertToolTipText,
  metricLimitMessage,
} from './constants';

import type { Item } from '../constants';
import type { Alert, AlertServiceType, AlertStatusType } from '@linode/api-v4';

const searchAndSelectSx = {
  lg: '250px',
  md: '300px',
  sm: '400px',
  xs: '300px',
};
// hardcoding the value is temporary solution until a solution from API side is confirmed.
const maxAllowedAlerts = 100;
const maxAllowedMetrics = 100;
interface AlertsLimitErrorMessageProps {
  isAlertLimitReached: boolean;
  isMetricLimitReached: boolean;
}

export const AlertListing = () => {
  const navigate = useNavigate();
  const { data: alerts, error, isLoading } = useAllAlertDefinitionsQuery();
  const {
    data: serviceOptions,
    error: serviceTypesError,
    isLoading: serviceTypesLoading,
  } = useCloudPulseServiceTypes(true);

  const userAlerts = alerts?.filter(({ type }) => type === 'user') ?? [];
  const isAlertLimitReached = userAlerts.length >= maxAllowedAlerts;

  const isMetricLimitReached =
    userAlerts.reduce(
      (total, alert) => total + (alert.rule_criteria?.rules?.length ?? 0),
      0
    ) >= maxAllowedMetrics;

  const topRef = React.useRef<HTMLButtonElement>(null);

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

  const { preference: togglePreference, toggle: toggleGroupByTag } =
    usePreferencesToggle({
      preferenceKey: 'aclpAlertsGroupByTag',
      options: [false, true],
      defaultValue: false,
    });

  if (alerts && alerts.length === 0) {
    return (
      <Placeholder
        buttonProps={[
          {
            children: 'Create Alerts',
            onClick: () => {
              navigate({ to: '/alerts/definitions/create' });
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

  const failedAlertsCount =
    alerts?.filter((alert: Alert) => alert.status === 'failed').length ?? 0;

  return (
    <Stack spacing={3}>
      {(isAlertLimitReached || isMetricLimitReached) && (
        <AlertsLimitErrorMessage
          isAlertLimitReached={isAlertLimitReached}
          isMetricLimitReached={isMetricLimitReached}
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
          display="flex"
          flexDirection={{
            lg: 'row',
            md: 'column',
            sm: 'column',
            xs: 'column',
          }}
          gap={2}
        >
          <DebouncedSearchTextField
            data-qa-filter="alert-search"
            label=""
            noMarginTop
            onSearch={setSearchText}
            placeholder="Search for Alerts"
            sx={{
              width: searchAndSelectSx,
            }}
            value={searchText}
          />
          <Autocomplete
            autoHighlight
            data-qa-filter="alert-service-filter"
            data-testid="alert-service-filter"
            errorText={
              serviceTypesError
                ? 'There was an error in fetching the services.'
                : ''
            }
            label=""
            limitTags={1}
            loading={serviceTypesLoading}
            multiple
            noMarginTop
            onChange={(_, selected) => {
              setServiceFilters(selected);
            }}
            options={getServicesList}
            placeholder={serviceFilters.length > 0 ? '' : 'Select a Service'}
            sx={{
              width: searchAndSelectSx,
            }}
            value={serviceFilters}
          />
          <Autocomplete
            autoHighlight
            data-qa-filter="alert-status-filter"
            data-testid="alert-status-filter"
            label=""
            limitTags={1}
            multiple
            noMarginTop
            onChange={(_, selected) => {
              setStatusFilters(selected);
            }}
            options={alertStatusOptions}
            placeholder={statusFilters.length > 0 ? '' : 'Select a Status'}
            sx={{
              width: searchAndSelectSx,
            }}
            value={statusFilters}
          />
        </Box>
        <Button
          buttonType="primary"
          data-qa-button="create-alert"
          data-qa-buttons="true"
          disabled={isLoading || isAlertLimitReached || isMetricLimitReached}
          onClick={() => {
            navigate({ to: '/alerts/definitions/create' });
          }}
          ref={topRef}
          sx={{
            height: '34px',
            paddingBottom: 0,
            paddingTop: 0,
            whiteSpace: 'noWrap',
            width: { lg: '120px', md: '120px', sm: '150px', xs: '150px' },
          }}
          sxEndIcon={isLoading ? { display: 'none' } : undefined}
          tooltipText={isLoading ? undefined : alertToolTipText}
          variant="contained"
        >
          Create Alert
        </Button>
      </Box>
      {failedAlertsCount > 0 && (
        <Notice variant="error">
          <Typography
            sx={(theme) => ({
              font: theme.font.bold,
              fontSize: theme.spacingFunction(16),
            })}
          >
            Creation of {failedAlertsCount} alerts has failed as indicated in
            the status column. Please{' '}
            <SupportLink text="open a support ticket" /> for assistance.
          </Typography>
        </Notice>
      )}

      <AlertsListTable
        alerts={getAlertsList}
        error={error ?? undefined}
        isGroupedByTag={togglePreference}
        isLoading={isLoading}
        scrollToElement={() => scrollToElement(topRef.current ?? null)}
        services={getServicesList}
        toggleGroupByTag={() => toggleGroupByTag?.() ?? false}
      />
    </Stack>
  );
};

const AlertsLimitErrorMessage = ({
  isAlertLimitReached,
  isMetricLimitReached,
}: AlertsLimitErrorMessageProps) => {
  if (isAlertLimitReached && isMetricLimitReached) {
    return (
      <AlertListNoticeMessages
        errorMessage={`${alertLimitMessage}:${metricLimitMessage}`}
        separator=":"
        variant="warning"
      />
    );
  }

  if (isAlertLimitReached) {
    return (
      <AlertListNoticeMessages
        errorMessage={alertLimitMessage}
        variant="warning"
      />
    );
  }

  if (isMetricLimitReached) {
    return (
      <AlertListNoticeMessages
        errorMessage={metricLimitMessage}
        variant="warning"
      />
    );
  }

  return null;
};
