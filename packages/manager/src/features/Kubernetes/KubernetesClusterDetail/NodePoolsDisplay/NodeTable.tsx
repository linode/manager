import { PoolNodeResponse } from '@linode/api-v4/lib/kubernetes';
import { APIError } from '@linode/api-v4/lib/types';
import Grid from '@mui/material/Unstable_Grid2';
import { Theme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { CopyTooltip } from 'src/components/CopyTooltip/CopyTooltip';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableContentWrapper } from 'src/components/TableContentWrapper/TableContentWrapper';
import { TableFooter } from 'src/components/TableFooter';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { Typography } from 'src/components/Typography';
import { transitionText } from 'src/features/Linodes/transitions';
import { useInProgressEvents } from 'src/queries/events';
import { useAllLinodesQuery } from 'src/queries/linodes/linodes';
import { LinodeWithMaintenance } from 'src/utilities/linodes';

import NodeActionMenu from './NodeActionMenu';

const useStyles = makeStyles<void, 'copy'>()(
  (theme: Theme, _params, classes) => ({
    copy: {
      '& svg': {
        height: `12px`,
        opacity: 0,
        width: `12px`,
      },
      marginLeft: 4,
      top: 1,
    },
    error: {
      color: theme.color.red,
    },
    ipCell: {
      ...theme.applyTableHeaderStyles,
      width: '35%',
    },
    labelCell: {
      ...theme.applyTableHeaderStyles,
      width: '35%',
    },
    row: {
      '&:hover': {
        backgroundColor: theme.bg.lightBlue1,
      },
      [`&:hover .${classes.copy} > svg, & .${classes.copy}:focus > svg`]: {
        opacity: 1,
      },
    },
    statusCell: {
      ...theme.applyTableHeaderStyles,
      width: '15%',
    },
    table: {
      borderLeft: `1px solid ${theme.borderColors.borderTable}`,
      borderRight: `1px solid ${theme.borderColors.borderTable}`,
    },
  })
);

// =============================================================================
// NodeTable
// =============================================================================
export interface Props {
  nodes: PoolNodeResponse[];
  openRecycleNodeDialog: (nodeID: string, linodeLabel: string) => void;
  poolId: number;
  typeLabel: string;
}

export const NodeTable: React.FC<Props> = (props) => {
  const { nodes, openRecycleNodeDialog, poolId, typeLabel } = props;

  const { classes } = useStyles();

  const { data: linodes, error, isLoading } = useAllLinodesQuery();

  const rowData = nodes.map((thisNode) => nodeToRow(thisNode, linodes ?? []));

  return (
    <OrderBy data={rowData} order={'asc'} orderBy={'label'}>
      {({ data: orderedData, handleOrderChange, order, orderBy }) => (
        <Paginate data={orderedData}>
          {({
            count,
            data: paginatedAndOrderedData,
            handlePageChange,
            handlePageSizeChange,
            page,
            pageSize,
          }) => (
            <>
              <Table
                aria-label="List of Your Cluster Nodes"
                className={classes.table}
              >
                <TableHead>
                  <TableRow>
                    <TableSortCell
                      active={orderBy === 'label'}
                      className={classes.labelCell}
                      direction={order}
                      handleClick={handleOrderChange}
                      label={'label'}
                    >
                      Linode
                    </TableSortCell>
                    <TableSortCell
                      active={orderBy === 'instanceStatus'}
                      className={classes.statusCell}
                      direction={order}
                      handleClick={handleOrderChange}
                      label={'instanceStatus'}
                    >
                      Status
                    </TableSortCell>
                    <TableSortCell
                      active={orderBy === 'ip'}
                      className={classes.ipCell}
                      direction={order}
                      handleClick={handleOrderChange}
                      label={'ip'}
                    >
                      IP Address
                    </TableSortCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableContentWrapper
                    length={paginatedAndOrderedData.length}
                    loading={isLoading}
                    loadingProps={{ columns: 4 }}
                  >
                    {paginatedAndOrderedData.map((eachRow) => {
                      return (
                        <NodeRow
                          instanceId={eachRow.instanceId}
                          instanceStatus={eachRow.instanceStatus}
                          ip={eachRow.ip}
                          key={`node-row-${eachRow.nodeId}`}
                          label={eachRow.label}
                          linodeError={error ?? undefined}
                          nodeId={eachRow.nodeId}
                          nodeStatus={eachRow.nodeStatus}
                          openRecycleNodeDialog={openRecycleNodeDialog}
                          typeLabel={typeLabel}
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
              <PaginationFooter
                count={count}
                eventCategory="Node Table"
                handlePageChange={handlePageChange}
                handleSizeChange={handlePageSizeChange}
                page={page}
                pageSize={pageSize}
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
  instanceId?: number;
  instanceStatus?: string;
  ip?: string;
  label?: string;
  nodeId: string;
  nodeStatus: string;
}

interface NodeRowProps extends NodeRow {
  linodeError?: APIError[];
  openRecycleNodeDialog: (nodeID: string, linodeLabel: string) => void;
  typeLabel: string;
}

export const NodeRow: React.FC<NodeRowProps> = React.memo((props) => {
  const {
    instanceId,
    instanceStatus,
    ip,
    label,
    linodeError,
    nodeId,
    nodeStatus,
    openRecycleNodeDialog,
    typeLabel,
  } = props;

  const { classes } = useStyles();

  const { data: events } = useInProgressEvents();

  const recentEvent = events?.find(
    (event) =>
      event.entity?.id === instanceId && event.entity?.type === 'linode'
  );

  const linodeLink = instanceId ? `/linodes/${instanceId}` : undefined;

  const nodeReadyAndInstanceRunning =
    nodeStatus === 'ready' && instanceStatus === 'running';
  const iconStatus = nodeReadyAndInstanceRunning ? 'active' : 'inactive';

  const displayLabel = label ?? typeLabel;
  const displayStatus =
    nodeStatus === 'not_ready'
      ? 'Provisioning'
      : transitionText(instanceStatus ?? '', instanceId ?? -1, recentEvent);

  const displayIP = ip ?? '';

  return (
    <TableRow
      ariaLabel={label}
      className={classes.row}
      data-qa-node-row={nodeId}
    >
      <TableCell>
        <Grid alignItems="center" container wrap="nowrap">
          <Grid>
            <Typography>
              {linodeLink ? (
                <Link to={linodeLink}>{displayLabel}</Link>
              ) : (
                displayLabel
              )}
            </Typography>
          </Grid>
        </Grid>
      </TableCell>
      <TableCell statusCell={!linodeError}>
        {linodeError ? (
          <Typography className={classes.error}>
            Error retrieving status
          </Typography>
        ) : (
          <>
            <StatusIcon status={iconStatus} />
            {displayStatus}
          </>
        )}
      </TableCell>
      <TableCell>
        {linodeError ? (
          <Typography className={classes.error}>Error retrieving IP</Typography>
        ) : displayIP.length > 0 ? (
          <>
            <CopyTooltip copyableText text={displayIP} />
            <CopyTooltip className={classes.copy} text={displayIP} />
          </>
        ) : null}
      </TableCell>
      <TableCell>
        <NodeActionMenu
          instanceLabel={label}
          nodeId={nodeId}
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
  linodes: LinodeWithMaintenance[]
): NodeRow => {
  const foundLinode = linodes.find(
    (thisLinode) => thisLinode.id === node.instance_id
  );

  return {
    instanceId: node.instance_id || undefined,
    instanceStatus: foundLinode?.status,
    ip: foundLinode?.ipv4[0],
    label: foundLinode?.label,
    nodeId: node.id,
    nodeStatus: node.status,
  };
};
