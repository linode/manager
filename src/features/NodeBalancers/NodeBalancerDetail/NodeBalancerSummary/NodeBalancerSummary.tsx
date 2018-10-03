import * as React from 'react';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';

import NodeBalancerCreationErrors, { ConfigOrNodeErrorResponse } from './NodeBalancerCreationErrors';
import SummaryPanel from './SummaryPanel';
import TablesPanel from './TablesPanel';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface Props {
  nodeBalancer: Linode.ExtendedNodeBalancer;
  errorResponses?: ConfigOrNodeErrorResponse[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

const NodeBalancerSummary: React.StatelessComponent<CombinedProps> = (props) => {
  const { nodeBalancer, errorResponses } = props;
  return (
    <React.Fragment>
      <DocumentTitleSegment segment={`${nodeBalancer.label} - Summary`} />
      <NodeBalancerCreationErrors errors={errorResponses} />
      <SummaryPanel nodeBalancer={nodeBalancer} />
      <TablesPanel nodeBalancer={nodeBalancer} />
    </React.Fragment>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(NodeBalancerSummary);
