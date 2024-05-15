import { Dashboard } from '@linode/api-v4';
import { Paper } from '@mui/material';
import * as React from 'react';

import { useMutatePreferences, usePreferences } from 'src/queries/preferences';

import { AclpConfig } from '../Models/CloudPulsePreferences';
import { FiltersObject } from '../Models/GlobalFilterProperties';
import { GlobalFilters } from '../Overview/GlobalFilters';
import { CloudPulseDashboard, DashboardProperties } from './Dashboard';

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

  const getInitDashboardProps = () => {
    const props = {} as DashboardProperties;
    props.dashboardFilters = {} as FiltersObject;

    props.dashboardFilters.interval = '1minute';
    props.dashboardFilters.step = { unit: 'min', value: 1 };

    props.dashboardFilters.region = undefined!;
    props.dashboardFilters.resource = [];
    props.dashboardFilters.serviceType = undefined;
    props.dashboardFilters.duration = { unit: 'min', value: 30 };
    props.dashboardFilters.timeRange = {
      end: Date.now() / 1000,
      start: generateStartTime('Past 30 Minutes', Date.now() / 1000),
    };

    return props;
  };

  const [dashboardProp, setDashboardProp] = React.useState<DashboardProperties>(
    getInitDashboardProps()
  );

  const dashbboardPropRef = React.useRef<DashboardProperties>(
    getInitDashboardProps()
  );

  const { data: preferences, refetch: refetchPreferences } = usePreferences();
  const { mutateAsync: updatePreferences } = useMutatePreferences();

  const updatedDashboard = React.useRef<Dashboard>();

  const handlPrefChange = (item: AclpConfig) => {
    refetchPreferences()
      .then(({ data: response }) => response ?? Promise.reject())
      .then((response) => {
        updatePreferences({
          ...response,
          aclpPreference: item,
        });
      })
      .catch(); // swallow the error, it's nbd if the choice isn't saved
  };

  const handleGlobalFilterChange = (
    globalFilter: FiltersObject,
    changedFilter: string
  ) => {
    if (!dashbboardPropRef || !dashbboardPropRef.current) {
      dashbboardPropRef.current = getInitDashboardProps();
    }

    let aclpConf: AclpConfig = {} as AclpConfig;

    if (preferences && preferences.aclpPreference) {
      aclpConf = { ...preferences.aclpPreference };
    }

    if (changedFilter == 'timeduration') {
      dashbboardPropRef.current.dashboardFilters.duration =
        globalFilter.duration;
      dashbboardPropRef.current.dashboardFilters.timeRange =
        globalFilter.timeRange;
      aclpConf.timeDuration = globalFilter.durationLabel;
    }

    if (
      changedFilter == 'region' &&
      dashbboardPropRef.current.dashboardFilters.region != globalFilter.region
    ) {
      console.log('region', globalFilter.region);
      dashbboardPropRef.current.dashboardFilters.region = globalFilter.region;
      aclpConf.region = globalFilter.region;
      if (preferences && preferences.aclpPreference.region != aclpConf.region) {
        aclpConf.resources = [];
        dashbboardPropRef.current.dashboardFilters.resource = [];
      }
    }

    if (changedFilter == 'resource') {
      dashbboardPropRef.current.dashboardFilters.resource =
        globalFilter.resource;
      aclpConf.dashboardId = dashbboardPropRef.current.dashbaord
        ? dashbboardPropRef.current.dashbaord.id
        : undefined!;
      aclpConf.region = dashbboardPropRef.current.dashboardFilters.region;
      aclpConf.resources = globalFilter.resource;
    }

    if (changedFilter == 'timestep') {
      dashbboardPropRef.current.dashboardFilters.interval =
        globalFilter.interval;
      dashbboardPropRef.current.dashboardFilters.step = globalFilter.step;
      aclpConf.interval = globalFilter.interval;
    }
    // set as dashboard filter
    setDashboardProp({
      ...dashboardProp,
      dashbaord: updatedDashboard.current!,
      dashboardFilters: { ...dashbboardPropRef.current.dashboardFilters },
    });

    handlPrefChange(aclpConf);

    console.log('triggered');
  };

  const handleDashboardChange = (dashboard: Dashboard) => {
    console.log('triggered');

    if (!dashboard) {
      dashbboardPropRef.current.dashbaord = undefined!;
      dashbboardPropRef.current.dashboardFilters.serviceType = undefined!;
      updatedDashboard.current = undefined!;
      setDashboardProp({ ...dashbboardPropRef.current });
      let aclpConf: AclpConfig = {} as AclpConfig;

      if (preferences && preferences.aclpPreference) {
        aclpConf = { ...preferences.aclpPreference };
      }

      aclpConf.dashboardId = undefined!;
      aclpConf.resources = [];

      handlPrefChange(aclpConf);
      return;
    }

    if (!dashbboardPropRef || !dashbboardPropRef.current) {
      dashbboardPropRef.current = getInitDashboardProps();
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
              preferences.aclpPreference.widgets[j].size;
            break;
          }
        }
      }
    }
    dashbboardPropRef.current.dashbaord = dashboard;
    dashbboardPropRef.current.dashboardFilters.serviceType =
      dashboard.service_type;

    setDashboardProp({ ...dashbboardPropRef.current });
    updatedDashboard.current = { ...dashboard };

    let aclpConf: AclpConfig = {} as AclpConfig;

    if (preferences && preferences.aclpPreference) {
      aclpConf = { ...preferences.aclpPreference };
    }

    if (dashboard && dashboard.id) {
      aclpConf.dashboardId = dashboard.id;

      if (
        preferences &&
        preferences.aclpPreference.dashboardId != aclpConf.dashboardId
      ) {
        aclpConf.resources = [];
        dashbboardPropRef.current.dashboardFilters.resource = [];
      }
    }

    handlPrefChange(aclpConf);
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

  const dashbaordChange = (dashboardObj: Dashboard) => {
    // todo, whenever a change in dashboard happens
    updatedDashboard.current = { ...dashboardObj };

    let aclpConf: AclpConfig = {} as AclpConfig;

    if (preferences && preferences.aclpPreference) {
      aclpConf = { ...preferences.aclpPreference };
    }

    if (dashboardObj.widgets) {
      aclpConf.widgets = dashboardObj.widgets.map((obj) => {
        return { label: obj.label, size: obj.size };
      });
      // call preferences
      handlPrefChange(aclpConf);
    }
  };

  if (!preferences) {
    return <></>;
  }

  return (
    <>
      <Paper>
        <div style={{ display: 'flex' }}>
          <div style={{ width: '100%' }}>
            <GlobalFilters
              globalFilters={
                dashboardProp.dashboardFilters
                  ? dashboardProp.dashboardFilters
                  : ({} as FiltersObject)
              }
              handleAnyFilterChange={(
                filters: FiltersObject,
                changedFilter: string
              ) => handleGlobalFilterChange(filters, changedFilter)}
              handleDashboardChange={(dashboardObj: Dashboard) =>
                handleDashboardChange(dashboardObj)
              }
              filterPreferences={preferences.aclpPreference}
            ></GlobalFilters>
          </div>
        </div>
      </Paper>
      <CloudPulseDashboard
        {...dashboardProp}
        onDashboardChange={dashbaordChange}
      />
    </>
  );
};
