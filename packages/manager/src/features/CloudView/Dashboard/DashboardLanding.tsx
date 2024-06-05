import { Dashboard, TimeDuration, TimeGranularity } from '@linode/api-v4';
import { Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import CloudViewIcon from 'src/assets/icons/entityIcons/cv_overview.svg';
import { CircleProgress } from 'src/components/CircleProgress';
import { Placeholder } from 'src/components/Placeholder/Placeholder';

import { FiltersObject } from '../Models/GlobalFilterProperties';
import { GlobalFilters } from '../Overview/GlobalFilters';
import {
  DASHBOARD_ID,
  INTERVAL,
  REFRESH,
  REGION,
  RESOURCES,
  TIME_DURATION,
} from '../Utils/CloudPulseConstants';
import {
  fetchUserPrefObject,
  getUserPreference,
  updateGlobalFilterPreference,
} from '../Utils/UserPreference';
import { CloudPulseDashboard } from './Dashboard';

const StyledPlaceholder = styled(Placeholder, {
  label: 'StyledPlaceholder',
})({
  flex: 'auto',
});

export const DashBoardLanding = () => {
  const generateStartTime = (modifier: string, nowInSeconds: number) => {
    switch (modifier) {
      case 'Past 30 Minutes':
        return nowInSeconds - 30 * 60;
      case 'Past 12 Hours':
        return nowInSeconds - 12 * 60 * 60;
      case 'Past 24 Hours':
        return nowInSeconds - 24 * 60 * 60;
      case 'Past 7 Days':
        return nowInSeconds - 7 * 24 * 60 * 60;
      default:
        return nowInSeconds - 30 * 24 * 60 * 60;
    }
  };

  const [timeDuration, setTimeDuration] = React.useState<TimeDuration>();
  const [region, setRegion] = React.useState<string>();
  const [resources, setResources] = React.useState<string[]>();
  const [timeStamp, setTimeStamp] = React.useState<number>();
  const [serviceType, setServiceType] = React.useState<string>();
  const [dashboard, selectedDashboard] = React.useState<Dashboard>();
  const [preferences, setPreferences] = React.useState<any>();

  const handleGlobalFilterChange = (
    globalFilter: FiltersObject,
    changedFilter: string
  ) => {
    if (changedFilter === TIME_DURATION) {
      setTimeDuration(globalFilter.duration);
    }

    if (changedFilter === REGION && region != globalFilter.region) {
      setRegion(globalFilter.region);
      setResources([]);
    }

    if (changedFilter === RESOURCES) {
      setResources(globalFilter.resource);
    }

    if (changedFilter === REFRESH) {
      setTimeStamp(globalFilter.timestamp);
    }
  };

  const handleDashboardChange = (dashboard: Dashboard) => {
    if (!dashboard) {
      selectedDashboard(undefined);
      updateGlobalFilterPreference({
        [DASHBOARD_ID]: undefined,
        [RESOURCES]: [],
      });
      return;
    }

    // update prefs if any
    if (preferences && preferences.aclpPreference.widgets) {
      for (let i = 0; i < dashboard.widgets.length; i++) {
        for (let j = 0; j < preferences.aclpPreference.widgets.length; j++) {
          if (
            preferences.aclpPreference.widgets[j].label ==
            dashboard.widgets[i].label
          ) {
            dashboard.widgets[i].size =
              preferences.aclpPreference.widgets[j].size ??
              dashboard.widgets[i].size;
            dashboard.widgets[i].aggregate_function =
              preferences.aclpPreference.widgets[j].aggregateFunction ??
              dashboard.widgets[i].aggregate_function;
            dashboard.widgets[i].time_granularity = preferences.aclpPreference
              .widgets[j].time_granularity ?? {
              ...dashboard.widgets[i].time_granularity,
            };
            break;
          }
        }
      }
    }
    setServiceType(dashboard.service_type);
    selectedDashboard(dashboard);

    if (dashboard && dashboard.id) {
      updateGlobalFilterPreference({
        [DASHBOARD_ID]: dashboard.id,
        [RESOURCES]: [],
      });
      setResources([]);
    }
  };

  const saveOrEditDashboard = (dashboard: Dashboard) => {
    // todo, implement save option
  };

  const deleteDashboard = (dashboardId: number) => {
    // todo, implement delete option
  };

  const markDashboardAsFavorite = () => {
    // todo, implement mark dashboard as favorite
  };

  const resetView = () => {
    // todo, implement the reset view function
  };

  const dashboardChange = (dashboardObj: Dashboard) => {
    selectedDashboard(dashboardObj);
  };

  // Fetch the data from preferences
  React.useEffect(() => {
    const fetchPreferences = async () => {
      const userPreference = await getUserPreference();
      if (!userPreference || !userPreference.aclpPreference) {
        setPreferences({ aclpPreference: {} });
      } else {
        setPreferences(userPreference);
      }
    };
    fetchPreferences();
  }, []);

  if (!preferences) {
    return <CircleProgress></CircleProgress>;
  }

  return (
    <>
      <Paper style={{ border: 'solid 1px #e3e5e8' }}>
        <div style={{ display: 'flex' }}>
          <div style={{ width: '100%' }}>
            <GlobalFilters
              handleAnyFilterChange={(
                filters: FiltersObject,
                changedFilter: string
              ) => handleGlobalFilterChange(filters, changedFilter)}
              handleDashboardChange={(dashboardObj: Dashboard) =>
                handleDashboardChange(dashboardObj)
              }
              filterPreferences={preferences.aclpPreference}
              globalFilters={{} as FiltersObject}
              region={region}
              serviceType={serviceType}
            ></GlobalFilters>
          </div>
        </div>
      </Paper>
      {dashboard &&
        region &&
        resources &&
        resources.length > 0 &&
        timeDuration && (
          <CloudPulseDashboard
            dashboardId={dashboard.id}
            duration={timeDuration}
            manualRefreshTimeStamp={timeStamp}
            onDashboardChange={dashboardChange}
            region={region}
            resources={resources}
            widgetPreferences={fetchUserPrefObject().widgets}
          />
        )}

      {(!dashboard ||
        !region ||
        !resources ||
        resources.length == 0 ||
        !timeDuration) && (
        <Paper>
          <StyledPlaceholder
            icon={CloudViewIcon}
            subtitle="Select Service Type, Region and Resource to visualize metrics"
            title=""
          />
        </Paper>
      )}
    </>
  );
};
