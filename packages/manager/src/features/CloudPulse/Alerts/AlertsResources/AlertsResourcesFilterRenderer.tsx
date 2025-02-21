import React from 'react';

import NullComponent from 'src/components/NullComponent';

import type { AlertResourceFiltersProps } from './types';
import type { MemoExoticComponent } from 'react';

export interface AlertResourcesFilterRendererProps {
  component?: MemoExoticComponent<
    React.ComponentType<AlertResourceFiltersProps>
  >;
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
