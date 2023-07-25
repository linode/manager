import { CreateLinodeRequest, Linode } from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import React from 'react';

import {
  useAllLinodesQuery,
  useCreateLinodeMutation,
} from 'src/queries/linodes/linodes';

interface Actions {
  createLinode: (data: CreateLinodeRequest) => Promise<Linode>;
}

export interface WithLinodesProps {
  linodeActions: Actions;
  linodesData: Linode[] | undefined;
  linodesError: APIError[] | null;
  linodesLoading: boolean;
}

export const withLinodes = <Props>(
  Component: React.ComponentType<Props & WithLinodesProps>
) => (props: Props) => {
  const {
    data: linodesData,
    error: linodesError,
    isLoading: linodesLoading,
  } = useAllLinodesQuery();

  const { mutateAsync: createLinode } = useCreateLinodeMutation();

  return React.createElement(Component, {
    ...props,
    linodeActions: {
      createLinode,
    },
    linodesData,
    linodesError,
    linodesLoading,
  });
};
