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

interface LinodeCloneDataWithID extends LinodeCloneData {
  id: number;
}

interface Actions {
  cloneLinode: (data: {
    sourceLinodeId: LinodeCloneDataWithID['id'];
  }) => Promise<Linode>;
  createLinode: (data: CreateLinodeRequest) => Promise<Linode>;
}

export interface WithLinodesProps {
  linodeActions: Actions;
  linodesData: Linode[] | undefined;
  linodesError: APIError[] | null;
  linodesLoading: boolean;
}

interface ComponentProps<P> extends WithLinodesProps {
  componentProps: P;
}

export const withLinodes = <P>(
  Component: React.ComponentType<ComponentProps<P>>,
  enabled = true
) => (props: P) => {
  const {
    data: linodesData,
    error: linodesError,
    isLoading: linodesLoading,
  } = useAllLinodesQuery({}, {}, enabled);

  const { mutateAsync: createLinode } = useCreateLinodeMutation();
  const { mutateAsync: cloneLinode } = useCloneLinodeMutation();

  return React.createElement(Component, {
    componentProps: props,
    linodeActions: {
      cloneLinode,
      createLinode,
    },
    linodesData,
    linodesError,
    linodesLoading,
  });
};
