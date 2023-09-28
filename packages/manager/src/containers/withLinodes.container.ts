import { StackScript } from '@linode/api-v4';
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
import { useStackScriptsOCA } from 'src/queries/stackscripts';
import { baseApps } from 'src/features/StackScripts/stackScriptUtils';
import { useFlags } from 'src/hooks/useFlags';

const trimOneClickFromLabel = (script: StackScript) => {
  return {
    ...script,
    label: script.label.replace('One-Click', ''),
  };
};

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

export interface WithMarketplaceAppsProps {
  appInstances: StackScript[] | undefined;
  appInstancesError: string | undefined;
  appInstancesLoading: boolean;
}

export const withMarketplaceApps = <Props>(
  Component: React.ComponentType<Props & WithMarketplaceAppsProps>,
  enabled = true
) => (props: Props) => {
  const { data, error, isLoading } = useStackScriptsOCA(enabled);
  const flags = useFlags();
  const newApps = flags.oneClickApps || [];
  const allowedApps = Object.keys({ ...baseApps, ...newApps });

  const filteredApps = (data ?? []).filter((script) => {
    return (
      !script.label.match(/helpers/i) && allowedApps.includes(String(script.id))
    );
  });
  const trimmedApps = filteredApps.map((stackscript) =>
    trimOneClickFromLabel(stackscript)
  );

  return React.createElement(Component, {
    ...props,
    appInstances: trimmedApps,
    appInstancesError: error?.[0]?.reason,
    appInstancesLoading: isLoading,
  });
};
