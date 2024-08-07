/**
 * The CloudPulseServiceTypeMap has list of filters to be built for different service types like dbaas, linode etc.,The properties here are readonly as it is only for reading and can't be modified in code
 */
export interface CloudPulseServiceTypeFilterMap {
  /**
   * The list of filters for a service type
   *
   * @type {CloudPulseServiceTypeFilters []}
   */

  readonly filters: CloudPulseServiceTypeFilters[];

  /**
   * The service types like dbaas, linode etc.,
   *
   * @type {'dbaas' | 'linode'}
   */
  readonly serviceType: 'dbaas' | 'linode';
}

/**
 * CloudPulseServiceTypeFilters has the configuration required for each and every filter
 */
export interface CloudPulseServiceTypeFilters {
  /**
   *  The configuration of the filters
   *
   * @type {CloudPulseServiceTypeFiltersConfiguration}
   */

  configuration: CloudPulseServiceTypeFiltersConfiguration;

  /**
   * The name of the filter
   *
   * @type {string}
   */
  name: string;
}

/**
 * CloudPulseServiceTypeFiltersConfiguration is the actual configuration of the filter component
 */
export interface CloudPulseServiceTypeFiltersConfiguration {
  /**
   * This is an optional field, it is required if the filter API response doesn't have id and we need to map it from the response
   *
   * @type {string}
   */
  apiIdField?: string;

  /**
   * This is an optional field, it is required if the filter API response doesn't have label and we need to map it from the response
   *
   * @type {string}
   */
  apiLabelField?: string;

  /**
   * This is an optional field, it is required if the type is dynamic for call the respective API to get the filters
   *
   * @type {string}
   */
  apiUrl?: string;

  /**
   * This is an optional field, it is used to disable a certain filter, untill of the dependent filters are selected
   *
   * @type {string[]}
   */
  dependency?: string[];

  /**
   * This is the field that will be sent in the metrics api call or xFilter
   *
   * @type {string}
   */
  filterKey: string;

  /**
   * This is filterType like string, number
   *
   * @type {string}
   */
  filterType: string;

  /**
   * If this is true, we will pass the filter in the metrics api otherwise, we don't
   *
   * @type {boolean}
   */
  isFilterable: boolean;

  /**
   * If this is true, we will pass the filter as a explicit key in the request else inside the filters object of metrics request
   *
   * @type {boolean}
   */
  isMetricsFilter: boolean;
  /**
   * If this is true, multiselect will be enabled for the filter, only applicable for static and dynamic, not for predefined ones
   *
   * @type {boolean}
   */
  isMultiSelect?: boolean;
  /**
   * If this is true, we will only allow users to select a certain threshold, only applicable for static and dynamic, not for predefined ones
   *
   * @type {number}
   */
  maxSelections?: number;
  /**
   * The name of the filter
   *
   * @type {name}
   */
  name: string;
  /**
   * This will be helpful, when we build a reusable component for integrating in service page, whether to show the filter there or not
   *
   * @type {boolean}
   */
  neededInServicePage: boolean;
  /**
   * This is an optional field, needed if the select type is static, this is the list of options to be displayed in dropdown component
   *
   * @type {CloudPulseServiceTypeFiltersOptions[]}
   */
  options?: CloudPulseServiceTypeFiltersOptions[];
  /**
   * This is an optional field, controls the placeholder we need to show in autocomplete component
   *
   * @type {string}
   */
  placeholder?: string;
  /**
   *  This controls the order of rendering the filtering componenents
   *
   * @type {number}
   */
  priority: number;
  /**
   * default is predefined filters like (region, resources, timeduration) or dynamic / static
   *
   * @type {CloudPulseSelectTypes}
   */
  type?: CloudPulseSelectTypes;
}

/**
 * CloudPulseServiceTypeFiltersOptions is the type for the options associated with static and dynamic filters
 */
export interface CloudPulseServiceTypeFiltersOptions {
  /**
   * The id of the filter option
   *
   * @type {string}
   */
  id: string;

  /**
   * The label of the filter option
   *
   * @type {string}
   */
  label: string;
}

/**
 * CloudPulseSelectTypes can be static and dynamic
 */
export enum CloudPulseSelectTypes {
  /**
   * dynamic selection type, where we will get an api url to get and list down the filter options
   */
  dynamic,

  /**
   * static selection type, where the service owner will give the static options for the filter
   */
  static,
}
