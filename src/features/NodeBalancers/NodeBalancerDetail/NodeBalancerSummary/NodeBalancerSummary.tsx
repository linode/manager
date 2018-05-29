import * as React from 'react';
import {
  withStyles,
  StyleRulesCallback,
  Theme,
  WithStyles,
} from 'material-ui';

import SummaryPanel from './SummaryPanel';
import TablesPanel from './TablesPanel';


type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
});

interface Props {
  nodeBalancer: Linode.ExtendedNodeBalancer;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const NodeBalancerSummary: React.StatelessComponent<CombinedProps> = (props) => {
  const { nodeBalancer } = props;
  return (
    <React.Fragment>
      <SummaryPanel nodeBalancer={nodeBalancer} />
      <TablesPanel nodeBalancer={nodeBalancer} />
    </React.Fragment>
  );
};

const styled = withStyles(styles, { withTheme: true });

export default styled<Props>(NodeBalancerSummary);

