import { APIError } from '@linode/api-v4/lib/types';
import React from 'react';
import { useAllTypes, useSpecificTypes } from 'src/queries/types';
import { ExtendedType } from 'src/queries/types';
import cleanArray from 'src/utilities/cleanArray';

export interface WithTypesProps {
  typesData?: ExtendedType[];
  typesLoading: boolean;
  typesError?: APIError[];
}

export interface WithSpecificTypesProps {
  setRequestedTypes: (types: string[]) => void;
  requestedTypesData: ExtendedType[];
}

const withTypes = <Props>(
  Component: React.ComponentType<
    Props & WithTypesProps & WithSpecificTypesProps
  >
) => (props: Props) => {
  const {
    data: typesData,
    isLoading: typesLoading,
    error: typesError,
  } = useAllTypes();

  const [requestedTypes, setRequestedTypes] = React.useState<string[]>([]);
  const typesQuery = useSpecificTypes(requestedTypes);
  const requestedTypesData = cleanArray(
    typesQuery.map((result) => result.data)
  );

  return React.createElement(Component, {
    ...props,
    typesData,
    typesLoading,
    typesError: typesError ?? undefined,
    setRequestedTypes,
    requestedTypesData,
  });
};

export default withTypes;
