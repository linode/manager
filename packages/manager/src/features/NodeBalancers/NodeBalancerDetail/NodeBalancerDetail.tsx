import * as React from 'react';
import {
  matchPath,
  useHistory,
  useLocation,
  useParams,
} from 'react-router-dom';

import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { LandingHeader } from 'src/components/LandingHeader';
import { Notice } from 'src/components/Notice/Notice';
import { SafeTabPanel } from 'src/components/SafeTabPanel/SafeTabPanel';
import { TabLinkList } from 'src/components/Tabs/TabLinkList';
import { TabPanels } from 'src/components/Tabs/TabPanels';
import { Tabs } from 'src/components/Tabs/Tabs';
import {
  useNodeBalancerQuery,
  useNodebalancerUpdateMutation,
} from 'src/queries/nodebalancers';
import { getErrorMap } from 'src/utilities/errorUtils';

import NodeBalancerConfigurations from './NodeBalancerConfigurations';
import NodeBalancerSettings from './NodeBalancerSettings';
import { NodeBalancerSummary } from './NodeBalancerSummary/NodeBalancerSummary';

export const NodeBalancerDetail = () => {
  const history = useHistory();
  const location = useLocation();
  const { nodeBalancerId } = useParams<{ nodeBalancerId: string }>();
  const id = Number(nodeBalancerId);
  const [label, setLabel] = React.useState<string>();

  const {
    error: updateError,
    mutateAsync: updateNodeBalancer,
  } = useNodebalancerUpdateMutation(id);

  const { data: nodebalancer, error, isLoading } = useNodeBalancerQuery(id);

  React.useEffect(() => {
    if (label !== nodebalancer?.label) {
      setLabel(nodebalancer?.label);
    }
  }, [nodebalancer]);

  const cancelUpdate = () => {
    setLabel(nodebalancer?.label);
  };

  const tabs = [
    {
      routeName: `/nodebalancers/${id}/summary`,
      title: 'Summary',
    },
    {
      routeName: `/nodebalancers/${id}/configurations`,
      title: 'Configurations',
    },
    {
      routeName: `/nodebalancers/${id}/settings`,
      title: 'Settings',
    },
  ];

  const matches = (pathName: string) =>
    Boolean(matchPath(location.pathname, { path: pathName }));

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

  const nodeBalancerLabel = label !== undefined ? label : nodebalancer?.label;

  const navToURL = (index: number) => {
    history.push(tabs[index].routeName);
  };

  return (
    <React.Fragment>
      <LandingHeader
        breadcrumbProps={{
          firstAndLastOnly: true,
          onEditHandlers: {
            editableTextTitle: nodeBalancerLabel,
            errorText: labelError,
            onCancel: cancelUpdate,
            onEdit: (label) => updateNodeBalancer({ label }),
          },
          pathname: `/nodebalancers/${nodeBalancerLabel}`,
        }}
        docsLabel="Docs"
        docsLink="https://www.linode.com/docs/guides/getting-started-with-nodebalancers/"
        title={nodeBalancerLabel}
      />
      {errorMap.none && <Notice text={errorMap.none} variant="error" />}
      <Tabs
        index={Math.max(
          tabs.findIndex((tab) => matches(tab.routeName)),
          0
        )}
        onChange={navToURL}
      >
        <TabLinkList tabs={tabs} />

        <TabPanels>
          <SafeTabPanel index={0}>
            <NodeBalancerSummary />
          </SafeTabPanel>
          <SafeTabPanel index={1}>
            <NodeBalancerConfigurations
              nodeBalancerLabel={nodebalancer.label}
              nodeBalancerRegion={nodebalancer.region}
            />
          </SafeTabPanel>
          <SafeTabPanel index={2}>
            <NodeBalancerSettings />
          </SafeTabPanel>
        </TabPanels>
      </Tabs>
    </React.Fragment>
  );
};
