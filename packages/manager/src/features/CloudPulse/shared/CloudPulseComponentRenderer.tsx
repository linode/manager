import { Box } from '@mui/material';
import React from 'react';

import { CloudPulseRegionSelect } from './CloudPulseRegionSelect';
import { CloudPulseResourcesSelect } from './CloudPulseResourcesSelect';
import { CloudPulseTimeRangeSelect } from './CloudPulseTimeRangeSelect';

import type { CloudPulseRegionSelectProps } from './CloudPulseRegionSelect';
import type { CloudPulseResourcesSelectProps } from './CloudPulseResourcesSelect';
import type { Props } from './CloudPulseTimeRangeSelect';
import type { MemoExoticComponent } from 'react';

export interface CloudPulseComponentRendererProps {
  componentKey: string;
  componentProps:
    | CloudPulseRegionSelectProps
    | CloudPulseResourcesSelectProps
    | Props;
}

const Components: {
  [key: string]: MemoExoticComponent<
    React.ComponentType<
      CloudPulseRegionSelectProps | CloudPulseResourcesSelectProps | Props
    >
  >;
} = {
  region: CloudPulseRegionSelect,
  relative_time_duration: CloudPulseTimeRangeSelect,
  resource_id: CloudPulseResourcesSelect,
};

const buildComponent = (props: CloudPulseComponentRendererProps) => {
  if (typeof Components[props.componentKey] !== 'undefined') {
    return React.createElement(Components[props.componentKey], {
      ...props.componentProps,
    });
  }

  return <Box></Box>;
};

export default buildComponent;
