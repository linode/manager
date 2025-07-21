import React from 'react';
import type { MemoExoticComponent } from 'react';

import NullComponent from 'src/components/NullComponent';

import { CloudPulseCustomSelect } from './CloudPulseCustomSelect';
import { CloudPulseDateTimeRangePicker } from './CloudPulseDateTimeRangePicker';
import { CloudPulseNodeTypeFilter } from './CloudPulseNodeTypeFilter';
import { CloudPulsePortFilter } from './CloudPulsePortFilter';
import { CloudPulseRegionSelect } from './CloudPulseRegionSelect';
import { CloudPulseResourcesSelect } from './CloudPulseResourcesSelect';
import { CloudPulseTagsSelect } from './CloudPulseTagsFilter';

import type { CloudPulseCustomSelectProps } from './CloudPulseCustomSelect';
import type { CloudPulseDateTimeRangePickerProps } from './CloudPulseDateTimeRangePicker';
import type { CloudPulseNodeTypeFilterProps } from './CloudPulseNodeTypeFilter';
import type { CloudPulsePortFilterProps } from './CloudPulsePortFilter';
import type { CloudPulseRegionSelectProps } from './CloudPulseRegionSelect';
import type { CloudPulseResourcesSelectProps } from './CloudPulseResourcesSelect';
import type { CloudPulseTagsSelectProps } from './CloudPulseTagsFilter';

export interface CloudPulseComponentRendererProps {
  componentKey: string;
  componentProps:
    | CloudPulseCustomSelectProps
    | CloudPulseDateTimeRangePickerProps
    | CloudPulseNodeTypeFilterProps
    | CloudPulsePortFilterProps
    | CloudPulseRegionSelectProps
    | CloudPulseResourcesSelectProps
    | CloudPulseTagsSelectProps;
  key: string;
}

const Components: {
  [key: string]: MemoExoticComponent<
    React.ComponentType<
      | CloudPulseCustomSelectProps
      | CloudPulseDateTimeRangePickerProps
      | CloudPulseNodeTypeFilterProps
      | CloudPulsePortFilterProps
      | CloudPulseRegionSelectProps
      | CloudPulseResourcesSelectProps
      | CloudPulseTagsSelectProps
    >
  >;
} = {
  customSelect: CloudPulseCustomSelect,
  node_type: CloudPulseNodeTypeFilter,
  region: CloudPulseRegionSelect,
  relative_time_duration: CloudPulseDateTimeRangePicker,
  resource_id: CloudPulseResourcesSelect,
  tags: CloudPulseTagsSelect,
  port: CloudPulsePortFilter,
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
