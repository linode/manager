import type {
  Capabilities,
  DatabaseEngine,
  DatabaseType,
} from '@linode/api-v4';
import type { QueryFunction, QueryKey } from '@tanstack/react-query';

/**
 * The CloudPulseServiceTypeMap has list of filters to be built for different service types like dbaas, linode etc.,The properties here are readonly as it is only for reading and can't be modified in code
 */
export interface CloudPulseServiceTypeFilterMap {
  /**
   * Current capability corresponding to a service type
   */
  readonly capability: Capabilities;
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
 * As of now, the list of possible custom filters are engine, database type, this union type will be expanded if we start enhancing our custom select config
 */
export type QueryFunctionType = DatabaseEngine[] | DatabaseType[];

/**
 * The non array types of QueryFunctionType like DatabaseEngine|DatabaseType
 */
export type QueryFunctionNonArrayType = SingleType<QueryFunctionType>;

/**
 * This infers the type from the QueryFunctionType and makes it a single object type, and by using this we can maintain only QueryFunctionType and NonArray Types are automatically identified
 */
type SingleType<T> = T extends (infer U)[] ? U : never;

/**
 * This interface holds the query function and query key from various factories, like databaseQueries, linodeQueries etc.,
 */
export interface QueryFunctionAndKey {
  /**
   * The query function that contains actual function that calls API like getDatabaseEngines, getDatabaseTypes etc.,
   */
  queryFn: QueryFunction<Awaited<QueryFunctionType>>;

  /**
   * The actual query key defined in the factory
   */
  queryKey: QueryKey;
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
   * example, databaseQueries.types, databaseQueries.engines etc., makes use of existing query key and optimises cache
   */
  apiV4QueryKey?: QueryFunctionAndKey;

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
   * If this is true, we will pass filter as an optional filter
   */
  isOptional?: boolean;

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
