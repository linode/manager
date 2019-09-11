import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import NodeBalancer from 'src/assets/addnewmenu/nodebalancer.svg';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Placeholder from 'src/components/Placeholder';

type CombinedProps = RouteComponentProps<any>;

const NodeBalancerLandingEmptyState: React.StatelessComponent<
  CombinedProps
> = props => {
  const { history } = props;
  return (
    <React.Fragment>
      <DocumentTitleSegment segment="NodeBalancers" />
      <Placeholder
        title="Add NodeBalancers!"
        copy={<EmptyCopy />}
        icon={NodeBalancer}
        buttonProps={[
          {
            onClick: () => history.push('/nodebalancers/create'),
            children: 'Add a NodeBalancer'
          }
        ]}
      />
    </React.Fragment>
  );
};

const EmptyCopy = () => (
  <>
    <Typography variant="subtitle1">
      <a
        href="https://www.linode.com/docs/platform/nodebalancer/getting-started-with-nodebalancers/"
        target="_blank"
        rel="noopener noreferrer"
        className="h-u"
      >
        Learn how to use NodeBalancers with your Linode
      </a>
      &nbsp;or&nbsp;
      <a
        href="https://www.linode.com/docs/"
        target="_blank"
        rel="noopener noreferrer"
        className="h-u"
      >
        visit our guides and tutorials.
      </a>
    </Typography>
  </>
);

const enhanced = compose<CombinedProps, {}>(withRouter);

export default enhanced(NodeBalancerLandingEmptyState);
