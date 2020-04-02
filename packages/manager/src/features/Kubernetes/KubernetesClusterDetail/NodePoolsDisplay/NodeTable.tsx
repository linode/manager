import { PoolNodeResponse } from 'linode-js-sdk/lib/kubernetes';
import * as React from 'react';
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
import { LinodeWithMaintenanceAndDisplayStatus } from 'src/store/linodes/types';
import { useRecentEventForLinode } from 'src/store/selectors/recentEventForLinode';

const useStyles = makeStyles((theme: Theme) => ({
  labelCell: {
    width: '35%'
  },
  statusCell: {
    width: '15%'
  },
  ipCell: {
    width: '25%'
  }
}));

// =============================================================================
// NodeTable
// =============================================================================
export interface Props {
  poolId: number;
  nodes: PoolNodeResponse[];
}

export const NodeTable: React.FC<Props> = props => {
  const { nodes, poolId } = props;

  const classes = useStyles();

  const { linodes, requestLinodes } = useLinodes();

  React.useEffect(() => {
    // Request Linodes if we haven't already.
    if (linodes.lastUpdated === 0 && !linodes.loading) {
      // OK to swallow the error here; we'll rely on Redux errors.
      requestLinodes().catch(_ => null);
    }
  }, []);

  const rowData = nodes.map(thisNode => nodeToRow(thisNode, linodes.entities));

  return (
    <>
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
                          active={orderBy === 'status'}
                          label={'status'}
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
                        <TableCell />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableContentWrapper
                        loading={linodes.loading}
                        error={linodes.error?.read}
                        lastUpdated={linodes.lastUpdated}
                        length={paginatedAndOrderedData.length}
                      >
                        {paginatedAndOrderedData.map(eachRow => {
                          return (
                            <NodeRow
                              key={`node-row-${eachRow.nodeId}`}
                              instanceId={eachRow.instanceId}
                              label={eachRow.label}
                              instanceStatus={eachRow.instanceStatus}
                              ip={eachRow.ip}
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
    </>
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
}

type NodeRowProps = Omit<NodeRow, 'nodeId'>;

export const NodeRow: React.FC<NodeRowProps> = React.memo(props => {
  const { instanceId, label, instanceStatus, ip } = props;

  const recentEvent = useRecentEventForLinode(instanceId ?? -1);

  const rowLink = instanceId ? `/linodes/${instanceId}` : undefined;
  const statusIndicator = instanceStatus === 'running' ? 'active' : 'other';
  const displayLabel = label ?? 'Not yet available';
  const displayStatus = transitionText(
    instanceStatus ?? '',
    instanceId ?? -1,
    recentEvent
  );
  const displayIP = ip ?? 'Not yet available';

  return (
    <TableRow rowLink={rowLink} aria-label={label}>
      <TableCell>
        <Grid container wrap="nowrap" alignItems="center">
          <Grid item>
            <StatusIndicator status={statusIndicator} />
          </Grid>
          <Grid item>
            <Typography variant="h3">{displayLabel}</Typography>
          </Grid>
        </Grid>
      </TableCell>
      <TableCell>{displayStatus}</TableCell>
      <TableCell>{displayIP}</TableCell>
      <TableCell>
        {/* @todo: action menu */}
        {/* <ActionMenu/> */}
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
    instanceId: foundLinode?.id,
    label: foundLinode?.label,
    instanceStatus: foundLinode?.status,
    ip: foundLinode?.ipv4[0]
  };
};
