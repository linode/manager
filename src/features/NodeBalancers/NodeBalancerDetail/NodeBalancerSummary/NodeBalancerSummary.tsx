import * as React from 'react';
import { withStyles, StyleRulesCallback, Theme, WithStyles } from '@material-ui/core/styles';

import SummaryPanel from './SummaryPanel';
import TablesPanel from './TablesPanel';
import NodeBalancerCreationErrors, {
  ConfigOrNodeErrorResponse,
} from './NodeBalancerCreationErrors';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
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
      <NodeBalancerCreationErrors errors={errorResponses} />
      <SummaryPanel nodeBalancer={nodeBalancer} />
      <TablesPanel nodeBalancer={nodeBalancer} />
    </React.Fragment>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(NodeBalancerSummary);
