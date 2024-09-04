import { CloudPulseSelectTypes } from './models';

import type { CloudPulseServiceTypeFilterMap } from './models';

const TIME_DURATION = 'Time Duration';

export const LINODE_CONFIG: Readonly<CloudPulseServiceTypeFilterMap> = {
  filters: [
    {
      configuration: {
        filterKey: 'region',
        filterType: 'string',
        isFilterable: false,
        isMetricsFilter: false,
        name: 'Region',
        neededInServicePage: false,
        priority: 1,
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
        name: 'Resource',
        neededInServicePage: false,
        placeholder: 'Select Resources',
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
        neededInServicePage: false,
        placeholder: 'Select Duration',
        priority: 3,
      },
      name: TIME_DURATION,
    },
  ],
  serviceType: 'linode',
};

export const DBAAS_CONFIG: Readonly<CloudPulseServiceTypeFilterMap> = {
  filters: [
    {
      configuration: {
        filterKey: 'engine',
        filterType: 'string',
        isFilterable: false, // isFilterable -- this determines whethere you need to pass it metrics api
        isMetricsFilter: false, // if it is false, it will go as a part of filter params, else global filter
        isMultiSelect: false,
        name: 'DB Engine',
        neededInServicePage: false,
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
        placeholder: 'Select an Engine',
        priority: 2,
        type: CloudPulseSelectTypes.static,
      },
      name: 'DB Engine',
    },
    {
      configuration: {
        filterKey: 'region',
        filterType: 'string',
        isFilterable: false,
        isMetricsFilter: false,
        name: 'Region',
        neededInServicePage: false,
        priority: 1,
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
        name: 'Resource',
        neededInServicePage: false,
        placeholder: 'Select DB Cluster Names',
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
        neededInServicePage: false, // we will have a static time duration component, no need render from filter builder
        placeholder: 'Select Duration',
        priority: 4,
      },
      name: TIME_DURATION,
    },
    {
      configuration: {
        filterKey: 'role',
        filterType: 'string',
        isFilterable: true, // isFilterable -- this determines whether you need to pass it metrics api
        isMetricsFilter: false, // if it is false, it will go as a part of filter params, else global filter
        isMultiSelect: false,
        name: 'Node Type',
        neededInServicePage: true,
        options: [
          {
            id: 'primary',
            label: 'Primary',
          },
          {
            id: 'secondary',
            label: 'Secondary',
          },
        ],
        placeholder: 'Select Node Type',
        priority: 5,
        type: CloudPulseSelectTypes.static,
      },
      name: 'Node Type',
    },
  ],
  serviceType: 'dbaas',
};

export const FILTER_CONFIG: Readonly<
  Map<string, CloudPulseServiceTypeFilterMap>
> = new Map([
  ['dbaas', DBAAS_CONFIG],
  ['linode', LINODE_CONFIG],
]);
