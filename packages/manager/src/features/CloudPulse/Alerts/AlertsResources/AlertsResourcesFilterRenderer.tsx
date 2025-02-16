import React from 'react';

import NullComponent from 'src/components/NullComponent';

import type { AlertResourceFilterOptionProps } from './types';
import type { MemoExoticComponent } from 'react';

export interface AlertResourcesFilterRendererProps {
  component?: MemoExoticComponent<
    React.ComponentType<AlertResourceFilterOptionProps>
  >;
  componentProps: AlertResourceFilterOptionProps;
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
