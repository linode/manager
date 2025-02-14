import React from 'react';

import NullComponent from 'src/components/NullComponent';

import type { AlertsEngineOptionProps } from './AlertsEngineTypeFilter';
import type { AlertsRegionProps } from './AlertsRegionFilter';
import type { AlertsTagFilterProps } from './AlertsTagsFilter';
import type { MemoExoticComponent } from 'react';

export interface AlertResourcesFilterRendererProps {
  component:
    | MemoExoticComponent<
        React.ComponentType<
          AlertsEngineOptionProps | AlertsRegionProps | AlertsTagFilterProps
        >
      >
    | undefined;
  componentProps:
    | AlertsEngineOptionProps
    | AlertsRegionProps
    | AlertsTagFilterProps;
}

export const AlertResourcesFilterRenderer = ({
  component,
  componentProps,
}: AlertResourcesFilterRendererProps) => {
  return component ? (
    React.createElement(component, componentProps)
  ) : (
    <NullComponent />
  );
};
