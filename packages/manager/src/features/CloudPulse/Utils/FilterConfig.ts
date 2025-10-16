import { capabilityServiceTypeMapping } from '@linode/api-v4';

import {
  ENDPOINT,
  INTERFACE_IDS_PLACEHOLDER_TEXT,
  PARENT_ENTITY_REGION,
  REGION,
  RESOURCE_ID,
} from './constants';
import { CloudPulseAvailableViews, CloudPulseSelectTypes } from './models';

import type { CloudPulseServiceTypeFilterMap } from './models';

const TIME_DURATION = 'Time Range';

export const LINODE_CONFIG: Readonly<CloudPulseServiceTypeFilterMap> = {
  capability: capabilityServiceTypeMapping['linode'],
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
        dependency: ['resource_id'],
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
};

export const FIREWALL_NODEBALANCER_CONFIG: Readonly<CloudPulseServiceTypeFilterMap> =
  {
    capability: capabilityServiceTypeMapping['firewall'],
    filters: [
      {
        configuration: {
          filterKey: RESOURCE_ID,
          filterType: 'string',
          isFilterable: true,
          isMetricsFilter: true,
          isMultiSelect: true,
          name: 'Firewalls',
          neededInViews: [CloudPulseAvailableViews.central],
          associatedEntityType: 'nodebalancer',
          placeholder: 'Select Firewalls',
          priority: 1,
        },
        name: 'Firewalls',
      },
      {
        configuration: {
          dependency: [RESOURCE_ID],
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
    ],
    serviceType: 'firewall',
  };

export const OBJECTSTORAGE_CONFIG_BUCKET: Readonly<CloudPulseServiceTypeFilterMap> =
  {
    capability: capabilityServiceTypeMapping['objectstorage'],
    filters: [
      {
        configuration: {
          filterKey: REGION,
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
          isFilterable: false,
          isMetricsFilter: false,
          isMultiSelect: true,
          name: 'Endpoints',
          priority: 2,
          neededInViews: [CloudPulseAvailableViews.central],
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

export const BLOCKSTORAGE_CONFIG: Readonly<CloudPulseServiceTypeFilterMap> = {
  capability: capabilityServiceTypeMapping['blockstorage'],
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
]);
