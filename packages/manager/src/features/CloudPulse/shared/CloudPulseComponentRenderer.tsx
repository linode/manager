import React from 'react';

import NullComponent from 'src/components/NullComponent';

import { CloudPulseCustomSelect } from './CloudPulseCustomSelect';
import { CloudPulseRegionSelect } from './CloudPulseRegionSelect';
import { CloudPulseResourcesSelect } from './CloudPulseResourcesSelect';
import { CloudPulseTagsSelect } from './CloudPulseTagsFilter';
import { CloudPulseTimeRangeSelect } from './CloudPulseTimeRangeSelect';

import type { CloudPulseCustomSelectProps } from './CloudPulseCustomSelect';
import type { CloudPulseRegionSelectProps } from './CloudPulseRegionSelect';
import type { CloudPulseResourcesSelectProps } from './CloudPulseResourcesSelect';
import type { CloudPulseTagsSelectProps } from './CloudPulseTagsFilter';
import type { CloudPulseTimeRangeSelectProps } from './CloudPulseTimeRangeSelect';
import type { MemoExoticComponent } from 'react';

export interface CloudPulseComponentRendererProps {
  componentKey: string;
  componentProps:
    | CloudPulseCustomSelectProps
    | CloudPulseRegionSelectProps
    | CloudPulseResourcesSelectProps
    | CloudPulseTagsSelectProps
    | CloudPulseTimeRangeSelectProps;
  key: string;
}

const Components: {
  [key: string]: MemoExoticComponent<
    React.ComponentType<
      | CloudPulseCustomSelectProps
      | CloudPulseRegionSelectProps
      | CloudPulseResourcesSelectProps
      | CloudPulseTagsSelectProps
      | CloudPulseTimeRangeSelectProps
    >
  >;
} = {
  customSelect: CloudPulseCustomSelect,
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
