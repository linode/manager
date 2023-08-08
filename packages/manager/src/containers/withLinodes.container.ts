import {
  CreateLinodeRequest,
  Linode,
  LinodeCloneData,
} from '@linode/api-v4/lib/linodes';
import { APIError } from '@linode/api-v4/lib/types';
import React from 'react';

import {
  useAllLinodesQuery,
  useCloneLinodeMutation,
  useCreateLinodeMutation,
} from 'src/queries/linodes/linodes';

interface Actions {
  cloneLinode: (data: {
    sourceLinodeId: number & LinodeCloneData;
  }) => Promise<Linode>;
  createLinode: (data: CreateLinodeRequest) => Promise<Linode>;
}

export interface WithLinodesProps {
  linodeActions: Actions;
  linodesData: Linode[] | undefined;
  linodesError: APIError[] | null;
  linodesLoading: boolean;
}

export const withLinodes = <Props>(
  Component: React.ComponentType<Props & WithLinodesProps>,
  enabled = true
) => (props: Props) => {
  const {
    data: linodesData,
    error: linodesError,
    isLoading: linodesLoading,
  } = useAllLinodesQuery({}, {}, enabled);

  const { mutateAsync: createLinode } = useCreateLinodeMutation();
  const { mutateAsync: cloneLinode } = useCloneLinodeMutation();

  return React.createElement(Component, {
    ...props,
    linodeActions: {
      cloneLinode,
      createLinode,
    },
    linodesData,
    linodesError,
    linodesLoading,
  });
};
