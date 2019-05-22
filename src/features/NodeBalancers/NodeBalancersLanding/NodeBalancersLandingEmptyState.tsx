import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import NodeBalancer from 'src/assets/addnewmenu/nodebalancer.svg';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Placeholder from 'src/components/Placeholder';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {}
});

type CombinedProps = RouteComponentProps<any> & WithStyles<ClassNames>;

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
        buttonProps={{
          onClick: () => history.push('/nodebalancers/create'),
          children: 'Add a NodeBalancer'
        }}
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
        className="h-u"
      >
        Learn how to use NodeBalancers with your Linode
      </a>
      &nbsp;or&nbsp;
      <a href="https://www.linode.com/docs/" target="_blank" className="h-u">
        visit our guides and tutorials.
      </a>
    </Typography>
  </>
);

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, {}>(
  styled,
  withRouter
);

export default enhanced(NodeBalancerLandingEmptyState);
