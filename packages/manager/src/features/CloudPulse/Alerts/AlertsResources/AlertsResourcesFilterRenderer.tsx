import React from 'react';
import type { MemoExoticComponent } from 'react';

import NullComponent from 'src/components/NullComponent';

import type { AlertResourceFiltersProps } from './types';

export interface AlertResourcesFilterRendererProps {
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
