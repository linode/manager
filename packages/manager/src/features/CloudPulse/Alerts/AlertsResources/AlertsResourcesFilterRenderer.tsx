import React from 'react';

import NullComponent from 'src/components/NullComponent';

import type { AlertsEngineOptionProps } from './AlertsEngineTypeFilter';
import type { AlertsRegionProps } from './AlertsRegionFilter';
import type { MemoExoticComponent } from 'react';

export interface AlertResourcesFilterRendererProps {
  /**
   * The filter component to be rendered (e.g., `AlertsEngineTypeFilter`, `AlertsRegionFilter`).
   */
  component?:
    | MemoExoticComponent<
        React.ComponentType<AlertsEngineOptionProps | AlertsRegionProps>
      >
    | undefined;
  /**
   * Props that will be passed to the filter component.
   */
  componentProps: AlertsEngineOptionProps | AlertsRegionProps;
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
