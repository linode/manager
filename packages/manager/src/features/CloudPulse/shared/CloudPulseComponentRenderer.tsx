import { Box } from '@mui/material';
import React from 'react';

import { CloudPulseRegionSelect } from './CloudPulseRegionSelect';
import { CloudPulseResourcesSelect } from './CloudPulseResourcesSelect';
import { CloudPulseTimeRangeSelect } from './CloudPulseTimeRangeSelect';

import type { MemoExoticComponent } from 'react';

const Components: {
  [key: string]: MemoExoticComponent<React.ComponentType>;
} = {
  region: CloudPulseRegionSelect,
  relative_time_duration: CloudPulseTimeRangeSelect,
  resource_id: CloudPulseResourcesSelect,
};

const buildComponent = (props: any) => {
  if (typeof Components[props.componentKey] !== 'undefined') {
    return React.createElement(Components[props.componentKey], {
      ...props,
    });
  }

  return <Box></Box>;
};

export default buildComponent;
