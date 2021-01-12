import { PoolNodeResponse } from '@linode/api-v4/lib/kubernetes';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { Link } from 'react-router-dom';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableFooter from 'src/components/core/TableFooter';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import StatusIndicator from 'src/components/StatusIndicator';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableContentWrapper from 'src/components/TableContentWrapper';
import TableRow from 'src/components/TableRow';
import TableSortCell from 'src/components/TableSortCell';
import { transitionText } from 'src/features/linodes/transitions';
import useLinodes from 'src/hooks/useLinodes';
import { useReduxLoad } from 'src/hooks/useReduxLoad';
import { LinodeWithMaintenanceAndDisplayStatus } from 'src/store/linodes/types';
import { useRecentEventForLinode } from 'src/store/selectors/recentEventForLinode';
import NodeActionMenu from './NodeActionMenu';

const useStyles = makeStyles((theme: Theme) => ({
  labelCell: {
    width: '35%'
  },
  statusCell: {
    width: '15%'
  },
  ipCell: {
    width: '25%'
  },
  actionMenu: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 0
  },
  error: {
    color: theme.color.red
  }
}));

// =============================================================================
// NodeTable
// =============================================================================
export interface Props {
  poolId: number;
  nodes: PoolNodeResponse[];
  typeLabel: string;
  openRecycleNodeDialog: (nodeID: string, linodeLabel: string) => void;
}

export const NodeTable: React.FC<Props> = props => {
  const { nodes, poolId, typeLabel, openRecycleNodeDialog } = props;

  const classes = useStyles();

  const { _loading } = useReduxLoad(['linodes']);
  const { linodes } = useLinodes();

  const rowData = nodes.map(thisNode =>
    nodeToRow(thisNode, Object.values(linodes.itemsById))
  );

  return (
    <OrderBy data={rowData} orderBy={'label'} order={'asc'}>
      {({ data: orderedData, handleOrderChange, order, orderBy }) => (
        <Paginate data={orderedData}>
          {({
            data: paginatedAndOrderedData,
            count,
            handlePageChange,
            handlePageSizeChange,
            page,
            pageSize
          }) => (
            <>
              <Paper>
                <Table
                  aria-label="List of Your Cluster Nodes"
                  isResponsive={false}
                >
                  <TableHead>
                    <TableRow>
                      <TableSortCell
                        active={orderBy === 'label'}
                        label={'label'}
                        direction={order}
                        handleClick={handleOrderChange}
                        className={classes.labelCell}
                      >
                        Linode
                      </TableSortCell>
                      <TableSortCell
                        active={orderBy === 'instanceStatus'}
                        label={'instanceStatus'}
                        direction={order}
                        handleClick={handleOrderChange}
                        className={classes.statusCell}
                      >
                        Status
                      </TableSortCell>
                      <TableSortCell
                        active={orderBy === 'ip'}
                        label={'ip'}
                        direction={order}
                        handleClick={handleOrderChange}
                        className={classes.ipCell}
                      >
                        IP Address
                      </TableSortCell>
                      <TableCell className={classes.actionMenu} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableContentWrapper
                      loading={linodes.loading || _loading}
                      lastUpdated={linodes.lastUpdated}
                      length={paginatedAndOrderedData.length}
                    >
                      {paginatedAndOrderedData.map(eachRow => {
                        return (
                          <NodeRow
                            key={`node-row-${eachRow.nodeId}`}
                            nodeId={eachRow.nodeId}
                            instanceId={eachRow.instanceId}
                            label={eachRow.label}
                            instanceStatus={eachRow.instanceStatus}
                            ip={eachRow.ip}
                            nodeStatus={eachRow.nodeStatus}
                            typeLabel={typeLabel}
                            linodeError={linodes.error?.read}
                            openRecycleNodeDialog={openRecycleNodeDialog}
                          />
                        );
                      })}
                    </TableContentWrapper>
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Typography>Pool ID {poolId}</Typography>
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </Paper>
              <PaginationFooter
                count={count}
                handlePageChange={handlePageChange}
                handleSizeChange={handlePageSizeChange}
                page={page}
                pageSize={pageSize}
                eventCategory="Node Table"
              />
            </>
          )}
        </Paginate>
      )}
    </OrderBy>
  );
};

export default React.memo(NodeTable);

// =============================================================================
// NodeRow
// =============================================================================
interface NodeRow {
  nodeId: string;
  instanceId?: number;
  label?: string;
  instanceStatus?: string;
  ip?: string;
  nodeStatus: string;
}

interface NodeRowProps extends NodeRow {
  typeLabel: string;
  linodeError?: APIError[];
  openRecycleNodeDialog: (nodeID: string, linodeLabel: string) => void;
}

export const NodeRow: React.FC<NodeRowProps> = React.memo(props => {
  const {
    nodeId,
    instanceId,
    label,
    instanceStatus,
    ip,
    typeLabel,
    nodeStatus,
    linodeError,
    openRecycleNodeDialog
  } = props;

  const classes = useStyles();

  const recentEvent = useRecentEventForLinode(instanceId ?? -1);

  const rowLink = instanceId ? `/linodes/${instanceId}` : undefined;
  const statusIndicator =
    nodeStatus === 'ready' && instanceStatus === 'running' ? 'active' : 'other';
  const displayLabel = label ?? typeLabel;
  const displayStatus =
    nodeStatus === 'not_ready'
      ? 'Provisioning'
      : transitionText(instanceStatus ?? '', instanceId ?? -1, recentEvent);

  const displayIP = ip ?? '';

  return (
    <TableRow ariaLabel={label}>
      <TableCell>
        <Grid container wrap="nowrap" alignItems="center">
          <Grid item>
            <StatusIndicator status={statusIndicator} />
          </Grid>
          <Grid item>
            <Typography variant="h3">
              {rowLink ? (
                <Link to={rowLink}>{displayLabel}</Link>
              ) : (
                displayLabel
              )}
            </Typography>
          </Grid>
        </Grid>
      </TableCell>
      <TableCell>
        {linodeError ? (
          <Typography className={classes.error}>
            Error retrieving status
          </Typography>
        ) : (
          displayStatus
        )}
      </TableCell>
      <TableCell>
        {linodeError ? (
          <Typography className={classes.error}>Error retrieving IP</Typography>
        ) : (
          displayIP
        )}
      </TableCell>
      <TableCell className={classes.actionMenu}>
        <NodeActionMenu
          nodeId={nodeId}
          instanceLabel={label}
          openRecycleNodeDialog={openRecycleNodeDialog}
        />
      </TableCell>
    </TableRow>
  );
});

// =============================================================================
// Utilities
// =============================================================================

/**
 * Transforms an LKE Pool Node to a NodeRow.
 */
export const nodeToRow = (
  node: PoolNodeResponse,
  linodes: LinodeWithMaintenanceAndDisplayStatus[]
): NodeRow => {
  const foundLinode = linodes.find(
    thisLinode => thisLinode.id === node.instance_id
  );

  return {
    nodeId: node.id,
    label: foundLinode?.label,
    instanceStatus: foundLinode?.status,
    ip: foundLinode?.ipv4[0],
    nodeStatus: node.status
  };
};
