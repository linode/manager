import React from 'react';
import { CreateLinodeRequest, Linode } from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import {
  useAllLinodesQuery,
  useCreateLinodeMutation,
} from 'src/queries/linodes/linodes';

interface Actions {
  createLinode: (data: CreateLinodeRequest) => Promise<Linode>;
}

export interface WithLinodesProps {
  linodesError: APIError[] | null;
  linodesLoading: boolean;
  linodesData: Linode[] | undefined;
  linodeActions: Actions;
}

export const withLinodes = <Props>(
  Component: React.ComponentType<Props & WithLinodesProps>
) => (props: Props) => {
  const {
    data: linodesData,
    isLoading: linodesLoading,
    error: linodesError,
  } = useAllLinodesQuery();

  const { mutateAsync: createLinode } = useCreateLinodeMutation();

  return React.createElement(Component, {
    ...props,
    linodesData,
    linodesLoading,
    linodesError,
    linodeActions: {
      createLinode,
    },
  });
};
