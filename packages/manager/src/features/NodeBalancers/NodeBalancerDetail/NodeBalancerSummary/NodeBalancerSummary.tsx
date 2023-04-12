import * as React from 'react';
import Grid from 'src/components/Grid';
import SummaryPanel from './SummaryPanel';
import TablesPanel from './TablesPanel';
import { useParams } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { useNodeBalancerQuery } from 'src/queries/nodebalancers';
import { Theme } from '@mui/material/styles';

const useStyles = makeStyles((theme: Theme) => ({
  main: {
    [theme.breakpoints.up('md')]: {
      order: 1,
    },
  },
  sidebar: {
    [theme.breakpoints.up('md')]: {
      order: 2,
    },
  },
}));

const NodeBalancerSummary = () => {
  const classes = useStyles();
  const { nodeBalancerId } = useParams<{ nodeBalancerId: string }>();
  const id = Number(nodeBalancerId);
  const { data: nodebalancer } = useNodeBalancerQuery(id);

  return (
    <div>
      <DocumentTitleSegment segment={`${nodebalancer?.label} - Summary`} />
      <Grid container>
        <Grid item xs={12} md={8} lg={9} className={classes.main}>
          <TablesPanel />
        </Grid>
        <Grid item xs={12} md={4} lg={3} className={classes.sidebar}>
          <SummaryPanel />
        </Grid>
      </Grid>
    </div>
  );
};

export default NodeBalancerSummary;
