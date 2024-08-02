/**
 * The CloudPulseServiceTypeMap has list of filters to be built for different service types like dbaas, linode etc.,
 * @filters - The list of filters for a service type
 * @serviceType - The service types like dbaas, linode etc.,
 */
export interface CloudPulseServiceTypeFilterMap {
  filters: CloudPulseServiceTypeFilters[];
  serviceType: 'dbaas' | 'linode';
}

/**
 * CloudPulseServiceTypeFilters has the configuration required for each and every filter
 * @name - The name of the filter
 * @configuration - The configuration of the filters
 */
export interface CloudPulseServiceTypeFilters {
  configuration: CloudPulseServiceTypeFiltersConfiguration;
  name: string;
}

/**
 * CloudPulseServiceTypeFiltersConfiguration is the actual configuration of the filter component
 * @apiIdField - This is an optional field, it is required if the filter API response doesn't have id and we need to map it from the response
 * @apiIdField - This is an optional field, it is required if the filter API response doesn't have label and we need to map it from the response
 * @apiUrl - This is an optional field, it is required if the type is dynamic for call the respective API to get the filters
 * @dependency - This is an optional field, it is used to disable a certain filter, untill of the dependent filters are selected
 * @filterKey - This is the field that will be sent in the metrics api call or xFilter
 * @filterType - This is filterType like string, number
 * @isFilterable - If this is true, we will pass the filter in the metrics api otherwise, we don't
 * @isMetricsFilter - If this is true, we will pass the filter as a explicit key in the request else inside the filters object of metrics request
 * @isMultiSelect - If this is true, multiselect will be enabled for the filter, only applicable for static and dynamic, not for predefined ones
 * @maxSelections - If this is true, we will only allow users to select a certain threshold, only applicable for static and dynamic, not for predefined ones
 * @name - The name of the filter
 * @neededInServicePage - This will be helpful, when we build a reusable component for integrating in service page, whether to show the filter there or not
 * @options - This is an optional field, needed if the select type is static, this is the list of options to be displayed in dropdown component
 * @placeholder - This is an optional field, controls the placeholder we need to show in autocomplete component
 * @priority - This controls the order of the componenent, we have not used this for now, will be using in upcoming PR's
 * @type - default is predefined filters like (region, resources, timeduration), customfilters will need to specify either static or dynamic (customselect will be implemented in upcoming PR's)
 */
export interface CloudPulseServiceTypeFiltersConfiguration {
  apiIdField?: string;
  apiLabelField?: string;
  apiUrl?: string;
  dependency?: string[];
  filterKey: string;
  filterType: string;
  isFilterable: boolean;
  isMetricsFilter: boolean;
  isMultiSelect?: boolean;
  maxSelections?: number;
  name: string;
  neededInServicePage: boolean;
  options?: CloudPulseServiceTypeFiltersOptions[];
  placeholder?: string;
  priority: number;
  type?: CloudPulseSelectTypes;
}

/**
 * CloudPulseServiceTypeFiltersOptions is the type for the options associated with static and dynamic filters
 * @id - The Id of the filter
 * @label - The label is displayed in the dropdown
 */
export interface CloudPulseServiceTypeFiltersOptions {
  id: string;
  label: string;
}

/**
 * CloudPulseSelectTypes can be static and dynamic
 * @static - need to pass the static options in the filter configuration
 * @dynamic - need to pass the apiUrl needed to be called for getting the filters
 */
export enum CloudPulseSelectTypes {
  dynamic,
  static,
}
