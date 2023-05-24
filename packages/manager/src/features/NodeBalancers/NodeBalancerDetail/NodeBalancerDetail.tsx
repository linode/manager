import * as React from 'react';
import { CircleProgress } from 'src/components/CircleProgress';
import TabPanels from 'src/components/core/ReachTabPanels';
import Tabs from 'src/components/core/ReachTabs';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Notice } from 'src/components/Notice/Notice';
import SafeTabPanel from 'src/components/SafeTabPanel';
import TabLinkList from 'src/components/TabLinkList';
import NodeBalancerConfigurations from './NodeBalancerConfigurations';
import NodeBalancerSettings from './NodeBalancerSettings';
import { NodeBalancerSummary } from './NodeBalancerSummary/NodeBalancerSummary';
import { getErrorMap } from 'src/utilities/errorUtils';
import LandingHeader from 'src/components/LandingHeader';
import {
  useNodeBalancerQuery,
  useNodebalancerUpdateMutation,
} from 'src/queries/nodebalancers';
import {
  matchPath,
  useHistory,
  useLocation,
  useParams,
} from 'react-router-dom';

export const NodeBalancerDetail = () => {
  const history = useHistory();
  const location = useLocation();
  const { nodeBalancerId } = useParams<{ nodeBalancerId: string }>();
  const id = Number(nodeBalancerId);
  const [label, setLabel] = React.useState<string>();

  const {
    mutateAsync: updateNodeBalancer,
    error: updateError,
  } = useNodebalancerUpdateMutation(id);

  const { data: nodebalancer, isLoading, error } = useNodeBalancerQuery(id);

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
        title={nodeBalancerLabel}
        docsLabel="Docs"
        docsLink="https://www.linode.com/docs/guides/getting-started-with-nodebalancers/"
        breadcrumbProps={{
          firstAndLastOnly: true,
          pathname: `/nodebalancers/${nodeBalancerLabel}`,
          onEditHandlers: {
            editableTextTitle: nodeBalancerLabel,
            onEdit: (label) => updateNodeBalancer({ label }),
            onCancel: cancelUpdate,
            errorText: labelError,
          },
        }}
      />
      {errorMap.none && <Notice error text={errorMap.none} />}
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
