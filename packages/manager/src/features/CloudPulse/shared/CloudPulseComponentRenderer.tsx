import React from 'react';
import type { MemoExoticComponent } from 'react';

import NullComponent from 'src/components/NullComponent';

import { CloudPulseCustomSelect } from './CloudPulseCustomSelect';
import { CloudPulseDateTimeRangePicker } from './CloudPulseDateTimeRangePicker';
import { CloudPulseEndpointsSelect } from './CloudPulseEndpointsSelect';
import { CloudPulseNodeTypeFilter } from './CloudPulseNodeTypeFilter';
import { CloudPulseRegionSelect } from './CloudPulseRegionSelect';
import { CloudPulseResourcesSelect } from './CloudPulseResourcesSelect';
import { CloudPulseTagsSelect } from './CloudPulseTagsFilter';
import { CloudPulseTextFilter } from './CloudPulseTextFilter';

import type { CloudPulseCustomSelectProps } from './CloudPulseCustomSelect';
import type { CloudPulseDateTimeRangePickerProps } from './CloudPulseDateTimeRangePicker';
import type { CloudPulseEndpointsSelectProps } from './CloudPulseEndpointsSelect';
import type { CloudPulseNodeTypeFilterProps } from './CloudPulseNodeTypeFilter';
import type { CloudPulseRegionSelectProps } from './CloudPulseRegionSelect';
import type { CloudPulseResourcesSelectProps } from './CloudPulseResourcesSelect';
import type { CloudPulseTagsSelectProps } from './CloudPulseTagsFilter';
import type { CloudPulseTextFilterProps } from './CloudPulseTextFilter';

export interface CloudPulseComponentRendererProps {
  componentKey: string;
  componentProps:
    | CloudPulseCustomSelectProps
    | CloudPulseDateTimeRangePickerProps
    | CloudPulseEndpointsSelectProps
    | CloudPulseNodeTypeFilterProps
    | CloudPulseRegionSelectProps
    | CloudPulseResourcesSelectProps
    | CloudPulseTagsSelectProps
    | CloudPulseTextFilterProps;
  key: string;
}

const Components: {
  [key: string]: MemoExoticComponent<
    React.ComponentType<
      | CloudPulseCustomSelectProps
      | CloudPulseDateTimeRangePickerProps
      | CloudPulseEndpointsSelectProps
      | CloudPulseNodeTypeFilterProps
      | CloudPulseRegionSelectProps
      | CloudPulseResourcesSelectProps
      | CloudPulseTagsSelectProps
      | CloudPulseTextFilterProps
    >
  >;
} = {
  customSelect: CloudPulseCustomSelect,
  interface_id: CloudPulseTextFilter,
  node_type: CloudPulseNodeTypeFilter,
  port: CloudPulseTextFilter,
  region: CloudPulseRegionSelect,
  relative_time_duration: CloudPulseDateTimeRangePicker,
  resource_id: CloudPulseResourcesSelect,
  tags: CloudPulseTagsSelect,
  associated_entity_region: CloudPulseRegionSelect,
  endpoint: CloudPulseEndpointsSelect,
};

const buildComponent = (props: CloudPulseComponentRendererProps) => {
  if (typeof Components[props.componentKey] !== 'undefined') {
    return React.createElement(Components[props.componentKey], {
      ...props.componentProps,
    });
  }

  return <NullComponent />;
};

export default buildComponent;
