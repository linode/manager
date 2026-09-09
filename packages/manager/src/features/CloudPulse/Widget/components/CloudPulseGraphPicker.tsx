import * as React from 'react';

import { CloudPulseBarChart } from './CloudPulseBarChart';
import { CloudPulseLineGraph } from './CloudPulseLineGraph';

import type { CloudPulseGraphPickerProps } from './chartTypes';

export const CloudPulseGraphPicker = React.memo(
  (props: CloudPulseGraphPickerProps) => {
    const { variant, widgetLabel, zoomResetKey, ...chartProps } = props;

    const graphPickerProps: CloudPulseGraphPickerProps = {
      variant,
      widgetLabel,
      zoomResetKey,
      ...chartProps,
    };

    switch (variant) {
      case 'area':
      case 'line':
        return <CloudPulseLineGraph {...graphPickerProps} />;
      case 'bar':
      case 'stacked-bar':
        return <CloudPulseBarChart {...graphPickerProps} />;
      default:
        return null;
    }
  }
);
