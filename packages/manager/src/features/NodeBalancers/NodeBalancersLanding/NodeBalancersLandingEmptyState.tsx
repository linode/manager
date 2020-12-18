import * as React from 'react';
import { useHistory } from 'react-router-dom';
import NodeBalancer from 'src/assets/icons/entityIcons/nodebalancer.svg';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Link from 'src/components/Link';
import Placeholder from 'src/components/Placeholder';

const NodeBalancerLandingEmptyState: React.FC<{}> = _ => {
  const history = useHistory();
  return (
    <React.Fragment>
      <DocumentTitleSegment segment="NodeBalancers" />
      <Placeholder
        title="NodeBalancers"
        isEntity
        icon={NodeBalancer}
        buttonProps={[
          {
            onClick: () => history.push('/nodebalancers/create'),
            children: 'Add a NodeBalancer'
          }
        ]}
      >
        <Typography variant="subtitle1">
          <Link to="https://www.linode.com/docs/platform/nodebalancer/getting-started-with-nodebalancers/">
            Learn how to use NodeBalancers with your Linode
          </Link>
          &nbsp;or&nbsp;
          <Link to="https://www.linode.com/docs/">
            visit our guides and tutorials.
          </Link>
        </Typography>
      </Placeholder>
    </React.Fragment>
  );
};

export default React.memo(NodeBalancerLandingEmptyState);
