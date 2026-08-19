import React from 'react';

import { useFlags } from 'src/hooks/useFlags';
import { useCloudPulseDashboardsQuery } from 'src/queries/cloudpulse/dashboards';
import { useCloudPulseServiceTypes } from 'src/queries/cloudpulse/services';

import { useCloudPulseContext } from '../Context/useCloudPulseContext';
import { getAllDashboards, getEnabledServiceTypes } from '../Utils/utils';
import { DashboardPicker } from './DashboardPicker';

import type {
  CloudPulseServiceType,
  Dashboard,
  FilterValue,
} from '@linode/api-v4';

export type DashboardDiscoveryState =
  | { errorText: string; status: 'error' }
  | { status: 'loading' }
  | { status: 'ready' };

export interface CloudPulseDashboardSelectProps {
  /**
   * default value selected on initial render
   */
  defaultValue?: Partial<FilterValue>;
  /**
   *
   * @param dashboard latest dashboard object selected from dropdown
   * @param savePref boolean value to check whether changes to be saved on preferences or not
   */
  handleDashboardChange?: (
    dashboard: Dashboard | undefined,
    savePref?: boolean
  ) => void;
  /**
   * The service type to be used for the dashboard select in service level integration
   */
  integrationServiceType?: CloudPulseServiceType;
  /**
   * Called when the service types and dashboard discovery request state changes.
   */
  onDashboardDiscoveryStateChange?: (state: DashboardDiscoveryState) => void;
  /**
   * boolean value to identify whether only dashboard id is provided by service owner
   */
  onlyServiceLevelDashboardIdAvailable?: boolean;
  /**
   * boolean value to identify whether changes to be saved on preferences or not
   */
  savePreferences?: boolean;
}

export const CloudPulseDashboardSelect = React.memo(
  (props: CloudPulseDashboardSelectProps) => {
    const {
      defaultValue,
      handleDashboardChange = () => {},
      savePreferences,
      integrationServiceType,
      onlyServiceLevelDashboardIdAvailable,
      onDashboardDiscoveryStateChange,
    } = props;

    const {
      data: serviceTypesList,
      error: serviceTypesError,
      isLoading: serviceTypesLoading,
    } = useCloudPulseServiceTypes(true);

    const { setCurrentServiceLabel } = useCloudPulseContext();

    const { aclpServices } = useFlags();
    // Check if the integration service type is enabled
    const serviceType =
      integrationServiceType &&
      aclpServices?.[integrationServiceType]?.metrics?.enabled
        ? integrationServiceType
        : undefined;

    // Get formatted enabled service types based on the LD flag
    const serviceTypes: CloudPulseServiceType[] = serviceType
      ? [serviceType]
      : getEnabledServiceTypes(serviceTypesList, aclpServices);

    const serviceTypeMap: Map<CloudPulseServiceType, string> = React.useMemo(
      () =>
        new Map(
          (serviceTypesList?.data || [])
            .filter((item) => item?.service_type !== undefined)
            .map((item) => [item.service_type, item.label ?? ''])
        ),
      [serviceTypesList]
    );

    const {
      data: dashboardsList,
      error: dashboardsError,
      isLoading: dashboardsLoading,
    } = getAllDashboards(
      useCloudPulseDashboardsQuery(serviceTypes),
      serviceTypes
    );
    const [selectedDashboard, setSelectedDashboard] =
      React.useState<Dashboard>();

    const dashboardDiscoveryState = React.useMemo<DashboardDiscoveryState>(
      () =>
        serviceTypesError
          ? { errorText: 'Failed to fetch the services.', status: 'error' }
          : dashboardsError.length > 0
            ? { errorText: 'Failed to fetch the dashboards.', status: 'error' }
            : serviceTypesLoading || dashboardsLoading
              ? { status: 'loading' }
              : { status: 'ready' },
      [
        dashboardsError,
        dashboardsLoading,
        serviceTypesError,
        serviceTypesLoading,
      ]
    );

    React.useEffect(() => {
      onDashboardDiscoveryStateChange?.(dashboardDiscoveryState);
    }, [dashboardDiscoveryState, onDashboardDiscoveryStateChange]);

    // sorts dashboards by service type. Required due to unexpected autocomplete grouping behaviour
    const getSortedDashboardsList = (options: Dashboard[]): Dashboard[] => {
      return [...options].sort(
        (a, b) => -b.service_type.localeCompare(a.service_type)
      );
    };

    // Once the data is loaded, set the state variable with value stored in preferences
    React.useEffect(() => {
      // only call this code when the component is rendered initially
      if (
        (savePreferences || !!serviceType) &&
        dashboardDiscoveryState.status === 'ready' &&
        dashboardsList.length > 0 &&
        selectedDashboard === undefined
      ) {
        const dashboard = defaultValue
          ? dashboardsList.find((obj: Dashboard) => obj.id === defaultValue)
          : undefined;
        setSelectedDashboard(dashboard);
        // If only dashboard id is provided by service owner, there is no need to call the handleDashboardChange function
        if (!onlyServiceLevelDashboardIdAvailable) {
          handleDashboardChange(dashboard);
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dashboardsList, dashboardDiscoveryState.status]);

    React.useEffect(() => {
      if (selectedDashboard && serviceTypeMap.size > 0) {
        setCurrentServiceLabel(
          serviceTypeMap.get(selectedDashboard.service_type) ??
            selectedDashboard.service_type
        );
      }
    }, [selectedDashboard, serviceTypeMap, setCurrentServiceLabel]);
    return (
      <DashboardPicker
        aclpServices={aclpServices}
        disabled={
          dashboardDiscoveryState.status !== 'ready' ||
          !dashboardsList.length ||
          (!savePreferences && !!onlyServiceLevelDashboardIdAvailable) ||
          (!savePreferences &&
            dashboardsList.length === 1 &&
            integrationServiceType !== undefined)
        }
        isContextualView={integrationServiceType !== undefined}
        onChange={(dashboard) => {
          setSelectedDashboard(dashboard ?? undefined);
          handleDashboardChange(dashboard ?? undefined, savePreferences);
        }}
        options={getSortedDashboardsList(dashboardsList ?? [])}
        serviceTypeMap={serviceTypeMap}
        showServiceTypeLabel={!serviceType}
        value={selectedDashboard ?? null}
      />
    );
  }
);
