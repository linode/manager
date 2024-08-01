export interface CloudPulseServiceTypeFilterMap {
  filters: CloudPulseServiceTypeFilters[];
  serviceType: 'dbaas' | 'linode';
}

export interface CloudPulseServiceTypeFilters {
  configuration: CloudPulseServiceTypeFiltersConfiguration;
  name: string;
}

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

export interface CloudPulseServiceTypeFiltersOptions {
  id: string;
  label: string;
}

export enum CloudPulseSelectTypes {
  dynamic,
  static,
}
