import * as React from 'react';
import { CircleProgress } from 'src/components/CircleProgress';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Notice } from 'src/components/Notice/Notice';
import { SafeTabPanel } from 'src/components/SafeTabPanel/SafeTabPanel';
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
import { Tab, Tabs } from '@mui/material';

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

  const index = Math.max(
    tabs.findIndex((tab) => matches(tab.routeName)),
    0
  );

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
      <Tabs value={index} onChange={(_, i) => navToURL(i)}>
        {tabs.map((tab) => (
          <Tab key={tab.title} label={tab.title} />
        ))}
      </Tabs>
      <SafeTabPanel value={index} index={0}>
        <NodeBalancerSummary />
      </SafeTabPanel>
      <SafeTabPanel value={index} index={1}>
        <NodeBalancerConfigurations
          nodeBalancerLabel={nodebalancer.label}
          nodeBalancerRegion={nodebalancer.region}
        />
      </SafeTabPanel>
      <SafeTabPanel value={index} index={2}>
        <NodeBalancerSettings />
      </SafeTabPanel>
    </React.Fragment>
  );
};
