import { NodeBalancer } from 'linode-js-sdk/lib/nodebalancers';
import { APIError } from 'linode-js-sdk/lib/types';
import { take } from 'ramda';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { compose } from 'recompose';
import Hidden from 'src/components/core/Hidden';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Table from 'src/components/core/Table';
import TableBody from 'src/components/core/TableBody';
import TableCell from 'src/components/core/TableCell';
import Typography from 'src/components/core/Typography';
import EntityIcon from 'src/components/EntityIcon';
import Grid from 'src/components/Grid';
import TableRow from 'src/components/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import ViewAllLink from 'src/components/ViewAllLink';
import NodeBalancerContainer from 'src/containers/withNodeBalancers.container';
import RegionIndicator from 'src/features/linodes/LinodesLanding/RegionIndicator';
import {
  withNodeBalancerActions,
  WithNodeBalancerActions
} from 'src/store/nodeBalancer/nodeBalancer.containers';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import DashboardCard from '../DashboardCard';

type ClassNames =
  | 'root'
  | 'icon'
  | 'labelGridWrapper'
  | 'description'
  | 'labelCol'
  | 'moreCol'
  | 'actionsCol'
  | 'wrapHeader';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    icon: {
      position: 'relative',
      top: 3,
      width: 40,
      height: 40,
      '& .circle': {
        fill: theme.bg.offWhiteDT
      },
      '& .outerCircle': {
        stroke: theme.bg.main
      }
    },
    labelGridWrapper: {
      paddingLeft: '4px !important',
      paddingRight: '4px !important'
    },
    description: {
      paddingTop: theme.spacing(1) / 2,
      [theme.breakpoints.down('sm')]: {
        // Firefox only
        overflowWrap: 'anywhere'
      }
    },
    labelCol: {
      width: '70%'
    },
    moreCol: {
      width: '30%'
    },
    actionsCol: {
      width: '10%'
    },
    wrapHeader: {
      wordBreak: 'break-all'
    }
  });

interface NodeBalancerProps {
  nodeBalancersData: NodeBalancer[];
  nodeBalancersLoading: boolean;
  nodeBalancersLastUpdated: number;
  nodeBalancersResults: number;
  nodeBalancersError?: APIError[];
}

type CombinedProps = NodeBalancerProps &
  WithNodeBalancerActions &
  WithStyles<ClassNames>;

const NodeBalancersDashboardCard: React.FunctionComponent<CombinedProps> = props => {
  const {
    classes,
    nodeBalancerActions: { getNodeBalancerPage },
    nodeBalancersError,
    nodeBalancersLastUpdated,
    nodeBalancersLoading,
    nodeBalancersResults,
    nodeBalancersData
  } = props;

  React.useEffect(() => {
    if (
      nodeBalancersLastUpdated === 0 &&
      nodeBalancersResults === 0 &&
      !nodeBalancersLoading
    ) {
      // We don't have any data available and we aren't currently requesting it, so ask the API for what we need
      getNodeBalancerPage({ page_size: 25, page: 1 });
    }
  }, []);

  const data = take(5, nodeBalancersData);

  const renderAction = () =>
    nodeBalancersResults > 5 ? (
      <ViewAllLink
        text="View All"
        link={'/nodebalancers'}
        count={nodeBalancersResults}
      />
    ) : null;

  const renderContent = () => {
    if (nodeBalancersLoading && nodeBalancersLastUpdated === 0) {
      return renderLoading();
    }

    if (nodeBalancersError) {
      return renderErrors(nodeBalancersError);
    }

    if (data && data.length > 0) {
      return renderData();
    }

    return renderEmpty();
  };

  const renderLoading = () => {
    return <TableRowLoading colSpan={2} />;
  };

  const renderErrors = (errors: APIError[]) => (
    <TableRowError
      colSpan={2}
      message={
        getAPIErrorOrDefault(errors, 'Unable to load NodeBalancers.')[0].reason
      }
    />
  );

  const renderEmpty = () => <TableRowEmptyState colSpan={2} />;

  const renderData = () => {
    return data.map(({ id, label, region, hostname }) => (
      <TableRow key={label} rowLink={`/nodebalancers/${id}`}>
        <TableCell className={classes.labelCol}>
          <Grid container wrap="nowrap" alignItems="center">
            <Grid item className="py0">
              <EntityIcon variant="nodebalancer" />
            </Grid>
            <Grid item className={classes.labelGridWrapper}>
              <Link to={`/nodebalancers/${id}`} tabIndex={0}>
                <Typography
                  variant="h3"
                  className={classes.wrapHeader}
                  data-qa-label
                >
                  {label}
                </Typography>
              </Link>
              <Typography className={classes.description}>
                {hostname}
              </Typography>
            </Grid>
          </Grid>
        </TableCell>
        <Hidden xsDown>
          <TableCell className={classes.moreCol} data-qa-node-region>
            <RegionIndicator region={region} />
          </TableCell>
        </Hidden>
      </TableRow>
    ));
  };

  return (
    <DashboardCard
      title="NodeBalancers"
      headerAction={renderAction}
      alignHeader="flex-start"
    >
      <Paper>
        <Table>
          <TableBody>{renderContent()}</TableBody>
        </Table>
      </Paper>
    </DashboardCard>
  );
};

const styled = withStyles(styles);

const withNodeBalancers = NodeBalancerContainer(
  (
    ownProps,
    nodeBalancersData,
    nodeBalancersLoading,
    nodeBalancersResults,
    nodeBalancersLastUpdated,
    nodeBalancersError
  ) => ({
    ...ownProps,
    nodeBalancersData,
    nodeBalancersLoading,
    nodeBalancersLastUpdated,
    nodeBalancersError,
    nodeBalancersResults
  })
);
const enhanced = compose<CombinedProps, {}>(
  withNodeBalancers,
  withNodeBalancerActions,
  styled
);

export default enhanced(NodeBalancersDashboardCard);
