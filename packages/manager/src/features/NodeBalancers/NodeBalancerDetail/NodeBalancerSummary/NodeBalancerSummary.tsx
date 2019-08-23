import * as React from 'react';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import Grid from 'src/components/Grid';
import NodeBalancerCreationErrors, {
  ConfigOrNodeErrorResponse
} from './NodeBalancerCreationErrors';
import SummaryPanel from './SummaryPanel';
import TablesPanel from './TablesPanel';

type ClassNames = 'main' | 'sidebar';

const styles = (theme: Theme) =>
  createStyles({
    main: {
      [theme.breakpoints.up('md')]: {
        order: 1
      }
    },
    sidebar: {
      [theme.breakpoints.up('md')]: {
        order: 2
      }
    }
  });

interface Props {
  nodeBalancer: Linode.ExtendedNodeBalancer;
  errorResponses?: ConfigOrNodeErrorResponse[];
}

type CombinedProps = Props & WithStyles<ClassNames>;

const NodeBalancerSummary: React.StatelessComponent<CombinedProps> = props => {
  const { nodeBalancer, errorResponses, classes } = props;
  return (
    <React.Fragment>
      <DocumentTitleSegment segment={`${nodeBalancer.label} - Summary`} />
      <NodeBalancerCreationErrors errors={errorResponses} />
      <Grid container>
        <Grid item xs={12} md={4} lg={3} className={classes.sidebar}>
          <SummaryPanel nodeBalancer={nodeBalancer} />
        </Grid>
        <Grid item xs={12} md={8} lg={9} className={classes.main}>
          <TablesPanel nodeBalancer={nodeBalancer} />
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

const styled = withStyles(styles);

export default styled(NodeBalancerSummary);
