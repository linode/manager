import { capabilityServiceTypeMapping } from '@linode/api-v4';

import { queryFactory } from 'src/queries/cloudpulse/queries';

import {
  ENDPOINT,
  INTERFACE_IDS_PLACEHOLDER_TEXT,
  NODEBALANCER_ID,
  PARENT_ENTITY_REGION,
  REGION,
  RESOURCE_ID,
} from './constants';
import { CloudPulseAvailableViews, CloudPulseSelectTypes } from './models';
import { filterKubernetesClusters, getValidSortedEndpoints } from './utils';

import type { AssociatedEntityType } from '../shared/types';
import type { CloudPulseServiceTypeFiltersConfiguration } from './models';
import type { CloudPulseServiceTypeFilterMap } from './models';
import type { KubernetesCluster, ObjectStorageBucket } from '@linode/api-v4';

const TIME_DURATION = 'Time Range';

export const LINODE_CONFIG: Readonly<CloudPulseServiceTypeFilterMap> = {
  capability: capabilityServiceTypeMapping['linode'],
  filters: [
    {
      configuration: {
        filterKey: 'region',
        children: ['resource_id'],
        filterType: 'string',
        isFilterable: false,
        isMetricsFilter: false,
        name: 'Region',
        priority: 1,
        neededInViews: [CloudPulseAvailableViews.central],
      },
      name: 'Region',
    },
    {
      configuration: {
        dependency: ['region'],
        filterKey: 'resource_id',
        filterType: 'string',
        isFilterable: true,
        isMetricsFilter: true,
        isMultiSelect: true,
        name: 'Linode Label(s)',
        neededInViews: [CloudPulseAvailableViews.central],
        placeholder: 'Select Linode Label(s)',
        priority: 2,
      },
      name: 'Resources',
    },
    {
      configuration: {
        filterKey: 'relative_time_duration',
        filterType: 'string',
        isFilterable: true,
        isMetricsFilter: true,
        isMultiSelect: false,
        name: TIME_DURATION,
        neededInViews: [],
        placeholder: 'Select a Duration',
        priority: 3,
      },
      name: TIME_DURATION,
    },
  ],
  serviceType: 'linode',
};

export const DBAAS_CONFIG: Readonly<CloudPulseServiceTypeFilterMap> = {
  capability: capabilityServiceTypeMapping['dbaas'],
  filters: [
    {
      configuration: {
        filterKey: 'engine',
        children: ['region', 'resource_id'],
        filterType: 'string',
        isFilterable: false, // isFilterable -- this determines whethere you need to pass it metrics api
        isMetricsFilter: false, // if it is false, it will go as a part of filter params, else global filter
        isMultiSelect: false,
        name: 'Database Engine',
        neededInViews: [CloudPulseAvailableViews.central],
        options: [
          {
            id: 'mysql',
            label: 'MySQL',
          },
          {
            id: 'postgresql',
            label: 'PostgreSQL',
          },
        ],
        placeholder: 'Select a Database Engine',
        priority: 2,
        type: CloudPulseSelectTypes.static,
      },
      name: 'DB Engine',
    },
    {
      configuration: {
        dependency: ['engine'],
        children: ['resource_id'],
        filterKey: 'region',
        filterType: 'string',
        isFilterable: false,
        isMetricsFilter: false,
        name: 'Region',
        priority: 1,
        neededInViews: [CloudPulseAvailableViews.central],
      },
      name: 'Region',
    },
    {
      configuration: {
        dependency: ['region', 'engine'],
        children: ['node_type'],
        filterKey: 'resource_id',
        filterType: 'string',
        isFilterable: true,
        isMetricsFilter: true,
        isMultiSelect: true,
        name: 'Database Clusters',
        neededInViews: [CloudPulseAvailableViews.central],
        placeholder: 'Select Database Clusters',
        priority: 3,
      },
      name: 'Resources',
    },
    {
      configuration: {
        filterKey: 'relative_time_duration',
        filterType: 'string',
        isFilterable: true,
        isMetricsFilter: true,
        isMultiSelect: false,
        name: TIME_DURATION,
        neededInViews: [], // we will have a static time duration component, no need render from filter builder
        placeholder: 'Select a Duration',
        priority: 4,
      },
      name: TIME_DURATION,
    },
    {
      configuration: {
        dependency: [RESOURCE_ID],
        filterKey: 'node_type',
        filterType: 'string',
        isFilterable: true, // isFilterable -- this determines whether you need to pass it metrics api
        isMetricsFilter: false, // if it is false, it will go as a part of filter params, else global filter
        isMultiSelect: false,
        name: 'Node Type',
        neededInViews: [
          CloudPulseAvailableViews.service,
          CloudPulseAvailableViews.central,
        ],
        placeholder: 'Select a Node Type',
        priority: 5,
      },
      name: 'Node Type',
    },
  ],
  serviceType: 'dbaas',
};

export const NODEBALANCER_CONFIG: Readonly<CloudPulseServiceTypeFilterMap> = {
  capability: capabilityServiceTypeMapping['nodebalancer'],
  filters: [
    {
      configuration: {
        filterKey: 'region',
        children: ['resource_id'],
        filterType: 'string',
        isFilterable: false,
        isMetricsFilter: false,
        name: 'Region',
        priority: 1,
        neededInViews: [CloudPulseAvailableViews.central],
      },
      name: 'Region',
    },
    {
      configuration: {
        dependency: ['region'],
        filterKey: 'resource_id',
        filterType: 'string',
        isFilterable: true,
        isMetricsFilter: true,
        isMultiSelect: true,
        name: 'Nodebalancers',
        neededInViews: [CloudPulseAvailableViews.central],
        placeholder: 'Select Nodebalancers',
        priority: 2,
      },
      name: 'Nodebalancers',
    },
    {
      configuration: {
        filterKey: 'port',
        filterType: 'string',
        isFilterable: true,
        isMetricsFilter: false,
        isOptional: true,
        name: 'Ports',
        neededInViews: [
          CloudPulseAvailableViews.central,
          CloudPulseAvailableViews.service,
        ],
        placeholder: 'e.g., 80,443,3000',
        priority: 4,
      },
      name: 'Ports',
    },
    {
      configuration: {
        filterKey: 'relative_time_duration',
        filterType: 'string',
        isFilterable: true,
        isMetricsFilter: true,
        isMultiSelect: false,
        name: TIME_DURATION,
        neededInViews: [], // we will have a static time duration component, no need render from filter builder
        placeholder: 'Select a Duration',
        priority: 4,
      },
      name: TIME_DURATION,
    },
  ],
  serviceType: 'nodebalancer',
};

export const FIREWALL_CONFIG: Readonly<CloudPulseServiceTypeFilterMap> = {
  capability: capabilityServiceTypeMapping['firewall'],
  filters: [
    {
      configuration: {
        filterKey: 'resource_id',
        filterType: 'string',
        isFilterable: true,
        isMetricsFilter: true,
        isMultiSelect: true,
        name: 'Firewalls',
        neededInViews: [CloudPulseAvailableViews.central],
        placeholder: 'Select Firewalls',
        priority: 1,
        associatedEntityType: 'linode',
      },
      name: 'Firewalls',
    },
    {
      configuration: {
        filterKey: PARENT_ENTITY_REGION,
        filterType: 'string',
        isFilterable: true,
        isMetricsFilter: true,
        isMultiSelect: false,
        name: 'Linode Region',
        neededInViews: [
          CloudPulseAvailableViews.central,
          CloudPulseAvailableViews.service,
        ],
        placeholder: 'Select a Linode Region',
        priority: 2,
      },
      name: 'Linode Region',
    },
    {
      configuration: {
        filterKey: 'interface_type',
        filterType: 'string',
        isFilterable: true,
        isMetricsFilter: false,
        isMultiSelect: true,
        name: 'Interface Types',
        isOptional: true,
        neededInViews: [
          CloudPulseAvailableViews.central,
          CloudPulseAvailableViews.service,
        ],
        options: [
          {
            id: 'vpc',
            label: 'VPC',
          },
          {
            id: 'public',
            label: 'Public',
          },
        ],
        placeholder: 'Select Interface Types',
        priority: 3,
        type: CloudPulseSelectTypes.static,
      },
      name: 'Interface Types',
    },
    {
      configuration: {
        filterKey: 'interface_id',
        filterType: 'string',
        isFilterable: true,
        isMetricsFilter: false,
        isOptional: true,
        name: 'Interface IDs',
        neededInViews: [
          CloudPulseAvailableViews.central,
          CloudPulseAvailableViews.service,
        ],
        placeholder: INTERFACE_IDS_PLACEHOLDER_TEXT,
        priority: 2,
      },
      name: 'Interface IDs',
    },
    {
      configuration: {
        filterKey: 'relative_time_duration',
        filterType: 'string',
        isFilterable: true,
        isMetricsFilter: true,
        isMultiSelect: false,
        name: TIME_DURATION,
        neededInViews: [], // we will have a static time duration component, no need render from filter builder
        placeholder: 'Select a Duration',
        priority: 4,
      },
      name: TIME_DURATION,
    },
  ],
  serviceType: 'firewall',
  associatedEntityType: 'linode',
};

export const FIREWALL_NODEBALANCER_CONFIG: Readonly<CloudPulseServiceTypeFilterMap> =
  {
    capability: capabilityServiceTypeMapping['firewall'],
    filters: [
      {
        configuration: {
          filterKey: RESOURCE_ID,
          children: [NODEBALANCER_ID],
          filterType: 'string',
          isFilterable: true,
          isMetricsFilter: true,
          name: 'Firewall',
          neededInViews: [CloudPulseAvailableViews.central],
          associatedEntityType: 'nodebalancer',
          placeholder: 'Select a Firewall',
          priority: 1,
          apiV4QueryKey: queryFactory.resources('firewall'),
        },
        name: 'Firewall',
      },
      {
        configuration: {
          children: [NODEBALANCER_ID],
          filterKey: PARENT_ENTITY_REGION,
          filterType: 'string',
          isFilterable: true,
          isMetricsFilter: true,
          name: 'NodeBalancer Region',
          priority: 2,
          neededInViews: [
            CloudPulseAvailableViews.central,
            CloudPulseAvailableViews.service,
          ],
          placeholder: 'Select a NodeBalancer Region',
        },
        name: 'NodeBalancer Region',
      },
      {
        configuration: {
          dependency: [PARENT_ENTITY_REGION, RESOURCE_ID],
          filterKey: NODEBALANCER_ID,
          filterType: 'string',
          isFilterable: true,
          isMetricsFilter: false,
          isMultiSelect: true,
          isOptional: true,
          name: 'NodeBalancers',
          neededInViews: [
            CloudPulseAvailableViews.central,
            CloudPulseAvailableViews.service,
          ],
          placeholder: 'Select NodeBalancers',
          priority: 3,
        },
        name: 'NodeBalancers',
      },
    ],
    serviceType: 'firewall',
    associatedEntityType: 'nodebalancer',
  };

export const OBJECTSTORAGE_CONFIG_BUCKET: Readonly<CloudPulseServiceTypeFilterMap> =
  {
    capability: capabilityServiceTypeMapping['objectstorage'],
    filters: [
      {
        configuration: {
          filterKey: REGION,
          children: [ENDPOINT, RESOURCE_ID],
          filterType: 'string',
          isFilterable: true,
          isMetricsFilter: true,
          name: 'Region',
          priority: 1,
          neededInViews: [CloudPulseAvailableViews.central],
        },
        name: 'Region',
      },
      {
        configuration: {
          dependency: [REGION],
          children: [RESOURCE_ID],
          filterKey: ENDPOINT,
          filterType: 'string',
          isFilterable: false,
          isMetricsFilter: false,
          isMultiSelect: true,
          name: 'Endpoints',
          priority: 2,
          neededInViews: [CloudPulseAvailableViews.central],
          filterFn: (resources: ObjectStorageBucket[]) =>
            getValidSortedEndpoints(resources),
        },
        name: 'Endpoints',
      },
      {
        configuration: {
          dependency: [REGION, ENDPOINT],
          filterKey: RESOURCE_ID,
          filterType: 'string',
          isFilterable: true,
          isMetricsFilter: true,
          isMultiSelect: true,
          name: 'Buckets',
          neededInViews: [CloudPulseAvailableViews.central],
          placeholder: 'Select Buckets',
          priority: 3,
        },
        name: 'Buckets',
      },
    ],
    serviceType: 'objectstorage',
  };

export const ENDPOINT_DASHBOARD_CONFIG: Readonly<CloudPulseServiceTypeFilterMap> =
  {
    capability: capabilityServiceTypeMapping['objectstorage'],
    filters: [
      {
        configuration: {
          filterKey: REGION,
          children: [ENDPOINT],
          filterType: 'string',
          isFilterable: true,
          isMetricsFilter: true,
          name: 'Region',
          priority: 1,
          neededInViews: [CloudPulseAvailableViews.central],
        },
        name: 'Region',
      },
      {
        configuration: {
          dependency: [REGION],
          filterKey: ENDPOINT,
          filterType: 'string',
          isFilterable: true,
          isMetricsFilter: false,
          isMultiSelect: true,
          hasRestrictedSelections: true,
          name: 'Endpoints',
          priority: 2,
          neededInViews: [CloudPulseAvailableViews.central],
          filterFn: (resources: ObjectStorageBucket[]) =>
            getValidSortedEndpoints(resources),
        },
        name: 'Endpoints',
      },
    ],
    serviceType: 'objectstorage',
  };

export const BLOCKSTORAGE_CONFIG: Readonly<CloudPulseServiceTypeFilterMap> = {
  capability: capabilityServiceTypeMapping['blockstorage'],
  filters: [
    {
      configuration: {
        filterKey: 'region',
        children: ['resource_id'],
        filterType: 'string',
        isFilterable: false,
        isMetricsFilter: false,
        name: 'Region',
        priority: 1,
        neededInViews: [CloudPulseAvailableViews.central],
      },
      name: 'Region',
    },
    {
      configuration: {
        dependency: ['region'],
        filterKey: 'resource_id',
        filterType: 'string',
        isFilterable: true,
        isMetricsFilter: true,
        isMultiSelect: true,
        name: 'Volumes',
        neededInViews: [CloudPulseAvailableViews.central],
        placeholder: 'Select Volumes',
        priority: 2,
      },
      name: 'Volumes',
    },
  ],
  serviceType: 'blockstorage',
};
export const LKE_CONFIG: Readonly<CloudPulseServiceTypeFilterMap> = {
  capability: capabilityServiceTypeMapping['lke'],
  filters: [
    {
      configuration: {
        filterKey: 'region',
        filterType: 'string',
        isFilterable: false,
        isMetricsFilter: false,
        name: 'Region',
        priority: 1,
        neededInViews: [CloudPulseAvailableViews.central],
      },
      name: 'Region',
    },
    {
      configuration: {
        dependency: ['region'],
        filterKey: 'resource_id',
        filterType: 'string',
        isFilterable: true,
        isMetricsFilter: true,
        isMultiSelect: true,
        name: 'Clusters',
        neededInViews: [CloudPulseAvailableViews.central],
        placeholder: 'Select Clusters',
        priority: 2,
        filterFn: (resources: KubernetesCluster[]) =>
          filterKubernetesClusters(resources),
      },
      name: 'Clusters',
    },
  ],
  serviceType: 'lke',
};
export const FILTER_CONFIG: Readonly<
  Map<number, CloudPulseServiceTypeFilterMap>
> = new Map([
  [1, DBAAS_CONFIG],
  [2, LINODE_CONFIG],
  [3, NODEBALANCER_CONFIG],
  [4, FIREWALL_CONFIG],
  [6, OBJECTSTORAGE_CONFIG_BUCKET],
  [7, BLOCKSTORAGE_CONFIG],
  [8, FIREWALL_NODEBALANCER_CONFIG],
  [9, LKE_CONFIG],
  [10, ENDPOINT_DASHBOARD_CONFIG],
]);

/**
 * @param dashboardId The id of the dashboard
 * @returns The resources filter configuration for the dashboard
 */
export const getResourcesFilterConfig = (
  dashboardId: number | undefined
): CloudPulseServiceTypeFiltersConfiguration | undefined => {
  if (!dashboardId) {
    return undefined;
  }
  // Get the resources filter configuration for the dashboard
  const filterConfig = FILTER_CONFIG.get(dashboardId);
  if (dashboardId === 10) {
    return filterConfig?.filters.find(
      (filter) => filter.configuration.filterKey === ENDPOINT
    )?.configuration;
  }
  return filterConfig?.filters.find(
    (filter) => filter.configuration.filterKey === RESOURCE_ID
  )?.configuration;
};

/**
 * @param dashboardId The id of the dashboard
 * @returns The associated entity type for the dashboard
 */
export const getAssociatedEntityType = (
  dashboardId: number | undefined
): AssociatedEntityType | undefined => {
  if (!dashboardId) {
    return undefined;
  }
  return FILTER_CONFIG.get(dashboardId)?.associatedEntityType;
};

/**
 * @param dashboardId id of the dashboard
 * @returns whether dashboard is an endpoints only dashboard
 */
export const isEndpointsOnlyDashboard = (dashboardId: number): boolean => {
  const filterConfig = FILTER_CONFIG.get(dashboardId);
  if (!filterConfig) {
    return false;
  }
  const endpointsFilter = filterConfig?.filters.find(
    (filter) => filter.name === 'Endpoints'
  );
  if (endpointsFilter) {
    // Verify if the dashboard has buckets filter, if not then it is an endpoints only dashboard
    return !filterConfig.filters.some((filter) => filter.name === 'Buckets');
  }

  return false;
};
