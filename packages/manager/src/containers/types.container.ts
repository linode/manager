import { LinodeType } from '@linode/api-v4';
import React from 'react';

import { useAllTypes, useSpecificTypes } from 'src/queries/types';
import { isNotNullOrUndefined } from 'src/utilities/nullOrUndefined';

import type { FormattedAPIError } from 'src/types/FormattedAPIError';

export interface WithTypesProps {
  typesData?: LinodeType[];
  typesError?: FormattedAPIError[];
  typesLoading: boolean;
}

export interface WithSpecificTypesProps {
  requestedTypesData: LinodeType[];
  setRequestedTypes: (types: string[]) => void;
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

export const withSpecificTypes = <Props>(
  Component: React.ComponentType<Props & WithSpecificTypesProps>,
  enabled = true
) => (props: Props) => {
  const [requestedTypes, setRequestedTypes] = React.useState<string[]>([]);
  const typesQuery = useSpecificTypes(requestedTypes, enabled);
  const requestedTypesData = typesQuery
    .map((result) => result.data)
    .filter(isNotNullOrUndefined);

  return React.createElement(Component, {
    ...props,
    requestedTypesData,
    setRequestedTypes,
  });
};
