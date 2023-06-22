import React from 'react';
import { Linode } from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';

export interface WithLinodesProps {
  linodesError: APIError[] | null;
  linodesLoading: boolean;
  linodesData: Linode[] | undefined;
}

export const withLinodes = <Props>(
  Component: React.ComponentType<Props & WithLinodesProps>
) => (props: Props) => {
  const {
    data: linodesData,
    isLoading: linodesLoading,
    error: linodesError,
  } = useAllLinodesQuery();

  return React.createElement(Component, {
    ...props,
    linodesData,
    linodesLoading,
    linodesError,
  });
};
