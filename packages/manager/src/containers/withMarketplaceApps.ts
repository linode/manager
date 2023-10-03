import { StackScript } from '@linode/api-v4';
import React from 'react';
import { useLocation } from 'react-router-dom';

import { baseApps } from 'src/features/StackScripts/stackScriptUtils';
import { useFlags } from 'src/hooks/useFlags';
import { useStackScriptsOCA } from 'src/queries/stackscripts';
import { getQueryParamFromQueryString } from 'src/utilities/queryParams';

const trimOneClickFromLabel = (script: StackScript) => {
  return {
    ...script,
    label: script.label.replace('One-Click', ''),
  };
};

export interface WithMarketplaceAppsProps {
  appInstances: StackScript[] | undefined;
  appInstancesError: string | undefined;
  appInstancesLoading: boolean;
}

export const withMarketplaceApps = <Props>(
  Component: React.ComponentType<Props & WithMarketplaceAppsProps>
) => (props: Props) => {
  const location = useLocation();
  const flags = useFlags();

  const type = getQueryParamFromQueryString(location.search, 'type');

  // Only enable the query when the user is on the Marketplace page
  const enabled = type === 'One-Click';

  const { data, error, isLoading } = useStackScriptsOCA(enabled);

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
