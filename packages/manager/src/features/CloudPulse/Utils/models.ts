/**
 * The CloudPulseServiceTypeMap has list of filters to be built for different service types like dbaas, linode etc.,The properties here are readonly as it is only for reading and can't be modified in code
 */
export interface CloudPulseServiceTypeFilterMap {
  /**
   * The list of filters for a service type
   */

  readonly filters: CloudPulseServiceTypeFilters[];

  /**
   * The service types like dbaas, linode etc.,
   */
  readonly serviceType: 'dbaas' | 'linode';
}

/**
 * CloudPulseServiceTypeFilters has the configuration required for each and every filter
 */
export interface CloudPulseServiceTypeFilters {
  /**
   *  The configuration of the filters
   */

  configuration: CloudPulseServiceTypeFiltersConfiguration;

  /**
   * The name of the filter
   */
  name: string;
}

/**
 * CloudPulseServiceTypeFiltersConfiguration is the actual configuration of the filter component
 */
export interface CloudPulseServiceTypeFiltersConfiguration {
  /**
   * This is an optional field, it is required if the filter API response doesn't have id and we need to map it from the response
   */
  apiIdField?: string;

  /**
   * This is an optional field, it is required if the filter API response doesn't have label and we need to map it from the response
   */
  apiLabelField?: string;

  /**
   * This is an optional field, it is required if the type is dynamic for call the respective API to get the filters
   */
  apiUrl?: string;

  /**
   * This is an optional field, it is used to disable a certain filter, untill of the dependent filters are selected
   */
  dependency?: string[];

  /**
   * This is the field that will be sent in the metrics api call or xFilter
   */
  filterKey: string;

  /**
   * This is filterType like string, number
   */
  filterType: string;

  /**
   * If this is true, we will pass the filter in the metrics api otherwise, we don't
   */
  isFilterable: boolean;

  /**
   * If this is true, we will pass the filter as a explicit key in the request else inside the filters object of metrics request
   */
  isMetricsFilter: boolean;
  /**
   * If this is true, multiselect will be enabled for the filter, only applicable for static and dynamic, not for predefined ones
   */
  isMultiSelect?: boolean;
  /**
   * If this is true, we will only allow users to select a certain threshold, only applicable for static and dynamic, not for predefined ones
   */
  maxSelections?: number;
  /**
   * The name of the filter
   */
  name: string;
  /**
   * This will be helpful, when we build a reusable component for integrating in service page, whether to show the filter there or not
   */
  neededInServicePage: boolean;
  /**
   * This is an optional field, needed if the select type is static, this is the list of options to be displayed in dropdown component
   */
  options?: CloudPulseServiceTypeFiltersOptions[];
  /**
   * This is an optional field, controls the placeholder we need to show in autocomplete component
   */
  placeholder?: string;
  /**
   *  This controls the order of rendering the filtering componenents
   */
  priority: number;
  /**
   * default is predefined filters like (region, resources, timeduration) or dynamic / static
   */
  type?: CloudPulseSelectTypes;
}

/**
 * CloudPulseServiceTypeFiltersOptions is the type for the options associated with static and dynamic filters
 */
export interface CloudPulseServiceTypeFiltersOptions {
  /**
   * The id of the filter option
   */
  id: string;

  /**
   * The label of the filter option
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
