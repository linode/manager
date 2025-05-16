import {
  useGrants,
  useNodeBalancerQuery,
  useNodebalancerUpdateMutation,
  useQuery,
  useQueryClient,
} from '@linode/queries';
import { CircleProgress, ErrorState, Notice } from '@linode/ui';
import { Outlet, useParams } from '@tanstack/react-router';
import React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { useIsResourceRestricted } from 'src/hooks/useIsResourceRestricted';
import { useTabs } from 'src/hooks/useTabs';
import { getErrorMap } from 'src/utilities/errorUtils';

import { NodeBalancerConfigurations } from './NodeBalancerConfigurations';
import { getConfigsWithNodes } from './requests';

import type { ConfigsWithNodes } from './requests';
import type { APIError } from '@linode/api-v4';

export const NodeBalancerDetail = () => {
  const { id } = useParams({ from: '/nodebalancers/$id' });

  const { error: updateError, mutateAsync: updateNodeBalancer } =
    useNodebalancerUpdateMutation(id);

  const { data: nodebalancer, error, isLoading } = useNodeBalancerQuery(id);

  const isNodeBalancerReadOnly = useIsResourceRestricted({
    grantLevel: 'read_only',
    grantType: 'nodebalancer',
    id: nodebalancer?.id,
  });

  const { handleTabChange, tabIndex, tabs } = useTabs([
    {
      title: 'Summary',
      to: '/nodebalancers/$id/summary',
    },
    {
      title: 'Configurations',
      to: '/nodebalancers/$id/configurations',
    },
    {
      title: 'Settings',
      to: '/nodebalancers/$id/settings',
    },
  ]);

  if (isLoading) {
    return <CircleProgress />;
  }

  if (error) {
    return (
      <ErrorState errorText="There was an error retrieving your NodeBalancer. Please reload and try again." />
    );
  }

  if (!nodebalancer) {
    return null;
  }

  const errorMap = getErrorMap(['label'], updateError);
  const labelError = errorMap.label;

  return (
    <React.Fragment>
      <LandingHeader
        breadcrumbProps={{
          crumbOverrides: [{ label: 'NodeBalancers', position: 1 }],
          firstAndLastOnly: true,
          onEditHandlers: {
            editableTextTitle: nodebalancer.label,
            errorText: labelError,
            onCancel: () => '',
            onEdit: (label) => updateNodeBalancer({ label }),
          },
          pathname: `/nodebalancers/${nodebalancer.label}`,
        }}
        docsLabel="Docs"
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/getting-started-with-nodebalancers"
        spacingBottom={4}
        title={nodebalancer.label}
      />
      {errorMap.none && <Notice text={errorMap.none} variant="error" />}
      {isNodeBalancerReadOnly && (
        <Notice
          text={getRestrictedResourceText({
            resourceType: 'NodeBalancers',
          })}
          variant="warning"
        />
      )}
      <Tabs index={tabIndex} onChange={handleTabChange}>
        <TanStackTabLinkList tabs={tabs} />
        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            <SafeTabPanel index={0}>
              <Outlet />
            </SafeTabPanel>
            <SafeTabPanel index={1}>
              <Outlet />
            </SafeTabPanel>
            <SafeTabPanel index={2}>
              <Outlet />
            </SafeTabPanel>
          </TabPanels>
        </React.Suspense>
      </Tabs>
    </React.Fragment>
  );
};

export const NodeBalancerConfigurationWrapper = () => {
  const queryClient = useQueryClient();

  const { id: nodeBalancerId } = useParams({
    from: '/nodebalancers/$id/configurations',
  });

  const { configId } = useParams({ strict: false });

  const { data: grants } = useGrants();
  const { data: nodeBalancer } = useNodeBalancerQuery(nodeBalancerId);

  const { data, isPending, error } = useQuery<ConfigsWithNodes, APIError[]>({
    queryKey: ['nodebalancers', nodeBalancerId, 'configs-with-nodes'],
    queryFn: () => getConfigsWithNodes(nodeBalancerId),
    gcTime: 0,
  });

  if (isPending) {
    return <CircleProgress />;
  }

  if (error) {
    return <ErrorState errorText={error[0].reason} />;
  }

  return (
    <NodeBalancerConfigurations
      configId={configId}
      configs={data}
      grants={grants}
      nodeBalancerId={nodeBalancerId}
      nodeBalancerLabel={nodeBalancer?.label ?? ''}
      nodeBalancerRegion={nodeBalancer?.region ?? ''}
      queryClient={queryClient}
    />
  );
};
