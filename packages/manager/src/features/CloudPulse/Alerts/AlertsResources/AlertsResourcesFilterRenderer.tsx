import React from 'react';

import NullComponent from 'src/components/NullComponent';

import type { AlertResourceFiltersProps } from './types';
import type { MemoExoticComponent } from 'react';

export interface AlertResourcesFilterRendererProps {
  /**
   * The filter component to be rendered (e.g., `AlertsEngineTypeFilter`, `AlertsRegionFilter`).
   */
  component?: MemoExoticComponent<
    React.ComponentType<AlertResourceFiltersProps>
  >;
  /**
   * Props that will be passed to the filter component.
   */
  componentProps: AlertResourceFiltersProps;
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
