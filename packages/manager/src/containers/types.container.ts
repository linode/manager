import { APIError } from '@linode/api-v4/lib/types';
import React from 'react';
import {
  TypesQueryOptions,
  useAllTypes,
  useSpecificTypes,
} from 'src/queries/types';
import { ExtendedType } from 'src/queries/types';
import { cleanArray } from 'src/utilities/nullOrUndefined';

export interface WithTypesProps {
  typesData?: ExtendedType[];
  typesLoading: boolean;
  typesError?: APIError[];
}

export interface WithSpecificTypesProps {
  setRequestedTypes: (types: string[]) => void;
  requestedTypesData: ExtendedType[];
}

export const withTypes = <Props>(
  Component: React.ComponentType<Props & WithTypesProps>,
  options?: TypesQueryOptions
) => (props: Props) => {
  const {
    data: typesData,
    isLoading: typesLoading,
    error: typesError,
  } = useAllTypes(options);

  return React.createElement(Component, {
    ...props,
    typesData,
    typesLoading,
    typesError: typesError ?? undefined,
  });
};

export const withSpecificTypes = <Props>(
  Component: React.ComponentType<Props & WithSpecificTypesProps>
) => (props: Props) => {
  const [requestedTypes, setRequestedTypes] = React.useState<string[]>([]);
  const typesQuery = useSpecificTypes(requestedTypes);
  const requestedTypesData = cleanArray(
    typesQuery.map((result) => result.data)
  );

  return React.createElement(Component, {
    ...props,
    setRequestedTypes,
    requestedTypesData,
  });
};
