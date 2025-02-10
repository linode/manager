import React from 'react';

import NullComponent from 'src/components/NullComponent';

import type { AlertsEngineOptionProps } from './AlertsEngineTypeFilter';
import type { AlertsRegionProps } from './AlertsRegionFilter';
import type { MemoExoticComponent } from 'react';

export interface AlertResourcesFilterRendererProps {
  component:
    | MemoExoticComponent<
        React.ComponentType<AlertsEngineOptionProps | AlertsRegionProps>
      >
    | undefined;
  componentProps: AlertsEngineOptionProps | AlertsRegionProps;
}

export const buildFilterComponent = ({
  component,
  componentProps,
}: AlertResourcesFilterRendererProps) => {
  if (!component) {
    return <NullComponent />;
  }
  return React.createElement(component, {
    ...componentProps,
  });
};
