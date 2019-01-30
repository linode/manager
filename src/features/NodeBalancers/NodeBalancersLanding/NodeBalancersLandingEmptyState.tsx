import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import NodeBalancer from 'src/assets/addnewmenu/nodebalancer.svg';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
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
        title="Add a NodeBalancer"
        copy="Adding a NodeBalancer is easy. Click below to add a NodeBalancer."
        icon={NodeBalancer}
        buttonProps={{
          onClick: () => history.push('/nodebalancers/create'),
          children: 'Add a NodeBalancer'
        }}
      />
    </React.Fragment>
  );
};

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, {}>(
  styled,
  withRouter
);

export default enhanced(NodeBalancerLandingEmptyState);
