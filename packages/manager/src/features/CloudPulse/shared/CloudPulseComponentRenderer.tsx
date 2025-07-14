import React from 'react';
import type { MemoExoticComponent } from 'react';

import NullComponent from 'src/components/NullComponent';

import { CloudPulseCustomSelect } from './CloudPulseCustomSelect';
import { CloudPulseNodeTypeFilter } from './CloudPulseNodeTypeFilter';
import { CloudPulseRegionSelect } from './CloudPulseRegionSelect';
import { CloudPulseResourcesSelect } from './CloudPulseResourcesSelect';
import { CloudPulseTagsSelect } from './CloudPulseTagsFilter';
import { CloudPulseTextFilter } from './CloudPulseTextFilter';
import { CloudPulseTimeRangeSelect } from './CloudPulseTimeRangeSelect';

import type { CloudPulseCustomSelectProps } from './CloudPulseCustomSelect';
import type { CloudPulseNodeTypeFilterProps } from './CloudPulseNodeTypeFilter';
import type { CloudPulseRegionSelectProps } from './CloudPulseRegionSelect';
import type { CloudPulseResourcesSelectProps } from './CloudPulseResourcesSelect';
import type { CloudPulseTagsSelectProps } from './CloudPulseTagsFilter';
import type { CloudPulseTextFilterProps } from './CloudPulseTextFilter';
import type { CloudPulseTimeRangeSelectProps } from './CloudPulseTimeRangeSelect';

export interface CloudPulseComponentRendererProps {
  componentKey: string;
  componentProps:
    | CloudPulseCustomSelectProps
    | CloudPulseNodeTypeFilterProps
    | CloudPulseRegionSelectProps
    | CloudPulseResourcesSelectProps
    | CloudPulseTagsSelectProps
    | CloudPulseTextFilterProps
    | CloudPulseTimeRangeSelectProps;
  key: string;
}

const Components: {
  [key: string]: MemoExoticComponent<
    React.ComponentType<
      | CloudPulseCustomSelectProps
      | CloudPulseNodeTypeFilterProps
      | CloudPulseRegionSelectProps
      | CloudPulseResourcesSelectProps
      | CloudPulseTagsSelectProps
      | CloudPulseTextFilterProps
      | CloudPulseTimeRangeSelectProps
    >
  >;
} = {
  customSelect: CloudPulseCustomSelect,
  interface_id: CloudPulseTextFilter,
  node_type: CloudPulseNodeTypeFilter,
  port: CloudPulseTextFilter,
  region: CloudPulseRegionSelect,
  relative_time_duration: CloudPulseTimeRangeSelect,
  resource_id: CloudPulseResourcesSelect,
  tags: CloudPulseTagsSelect,
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
