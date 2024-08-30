import React from 'react';

import { useAllTypes } from 'src/queries/types';

import type { APIError, LinodeType } from '@linode/api-v4';

export interface WithTypesProps {
  typesData?: LinodeType[];
  typesError?: APIError[];
  typesLoading: boolean;
}

export const withTypes = <Props>(
  Component: React.ComponentType<Props & WithTypesProps>,
  enabled = true
) => (props: Props) => {
  const {
    data: typesData,
    error: typesError,
    isLoading: typesLoading,
  } = useAllTypes(enabled);

  return React.createElement(Component, {
    ...props,
    typesData,
    typesError: typesError ?? undefined,
    typesLoading,
  });
};
