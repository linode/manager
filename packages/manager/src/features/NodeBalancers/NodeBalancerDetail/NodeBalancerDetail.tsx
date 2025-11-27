import {
  useNodeBalancerQuery,
  useNodebalancerUpdateMutation,
} from '@linode/queries';
import { CircleProgress, ErrorState, Notice } from '@linode/ui';
import { useParams } from '@tanstack/react-router';
import React from 'react';

import { LandingHeader } from 'src/components/LandingHeader';
import { SuspenseLoader } from 'src/components/SuspenseLoader';
import { SafeTabPanel } from 'src/components/Tabs/SafeTabPanel';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import { TanStackTabLinkList } from 'src/components/Tabs/TanStackTabLinkList';
import { CloudPulseDashboardWithFilters } from 'src/features/CloudPulse/Dashboard/CloudPulseDashboardWithFilters';
import { usePermissions } from 'src/features/IAM/hooks/usePermissions';
import { useTabs } from 'src/hooks/useTabs';
import { getErrorMap } from 'src/utilities/errorUtils';

import { NodeBalancerConfigurationsWrapper } from './NodeBalancerConfigurationsWrapper';
import { NodeBalancerSettings } from './NodeBalancerSettings';
import { NodeBalancerSummary } from './NodeBalancerSummary/NodeBalancerSummary';

export const NodeBalancerDetail = () => {
  const { id } = useParams({
    strict: false,
  });

  const {
    error: updateError,
    mutateAsync: updateNodeBalancer,
    reset,
  } = useNodebalancerUpdateMutation(Number(id));

  const {
    data: nodebalancer,
    error,
    isLoading,
  } = useNodeBalancerQuery(Number(id), Boolean(id));

  const { data: permissions } = usePermissions(
    'nodebalancer',
    ['update_nodebalancer'],
    nodebalancer?.id
  );

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
    {
      title: 'Metrics',
      to: '/nodebalancers/$id/metrics',
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
            onCancel: () => reset(),
            onEdit: (label) => updateNodeBalancer({ label }),
          },
          pathname: `/nodebalancers/${nodebalancer.label}`,
        }}
        disabledBreadcrumbEditButton={!permissions.update_nodebalancer}
        docsLabel="Docs"
        docsLink="https://techdocs.akamai.com/cloud-computing/docs/getting-started-with-nodebalancers"
        spacingBottom={4}
        title={nodebalancer.label}
      />
      {errorMap.none && <Notice text={errorMap.none} variant="error" />}
      <Tabs index={tabIndex} onChange={handleTabChange}>
        <TanStackTabLinkList tabs={tabs} />
        <React.Suspense fallback={<SuspenseLoader />}>
          <TabPanels>
            <SafeTabPanel index={0}>
              <NodeBalancerSummary />
            </SafeTabPanel>
            <SafeTabPanel index={1}>
              <NodeBalancerConfigurationsWrapper />
            </SafeTabPanel>
            <SafeTabPanel index={2}>
              <NodeBalancerSettings />
            </SafeTabPanel>
            <SafeTabPanel index={3}>
              <CloudPulseDashboardWithFilters
                resource={nodebalancer.id}
                serviceType={'nodebalancer'}
              />
            </SafeTabPanel>
          </TabPanels>
        </React.Suspense>
      </Tabs>
    </React.Fragment>
  );
};
