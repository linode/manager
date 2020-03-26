import { PoolNodeResponse } from 'linode-js-sdk/lib/kubernetes';
import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import EntityIcon from 'src/components/EntityIcon';
import Grid from 'src/components/Grid';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableSortCell from 'src/components/TableSortCell';
import useLinodes from 'src/hooks/useLinodes';
import { LinodeWithMaintenanceAndDisplayStatus } from 'src/store/linodes/types';

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  labelCell: {
    width: '35%'
  },
  statusCell: {
    width: '15%'
  },
  ipCell: {
    width: '25%'
  },
  footer: {
    margin: theme.spacing()
  }
}));

interface Props {
  nodes?: PoolNodeResponse[];
  poolId: number;
}

type CombinedProps = Props;

const NodeTable: React.FC<CombinedProps> = props => {
  const { nodes, poolId } = props;

  const classes = useStyles();

  if (!nodes) {
    return <>No nodes</>;
  }

  // @todo: handle requesting Linodes if they haven't been already.
  const {
    linodes: { entities: allLinodes }
  } = useLinodes();

  const rowData = nodesToRowData(nodes, allLinodes);

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
                  <Table aria-label="List of Your Firewalls">
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
                      {paginatedAndOrderedData.map(eachRow => {
                        return (
                          <NodeRow
                            key={`node-row-${eachRow.id}`}
                            nodeId={eachRow.nodeId}
                            instanceId={eachRow.instanceId}
                            label={eachRow.label}
                            ip={eachRow.ip}
                            instanceStatus={eachRow.instanceStatus}
                            // {...actionMenuHandlers}
                          />
                        );
                      })}
                    </TableBody>
                  </Table>
                </Paper>
                <PaginationFooter
                  count={count}
                  handlePageChange={handlePageChange}
                  handleSizeChange={handlePageSizeChange}
                  page={page}
                  pageSize={pageSize}
                  eventCategory="Firewall Table"
                />
              </>
            )}
          </Paginate>
        )}
      </OrderBy>
      <div className={classes.footer}>
        <Typography>Pool ID {poolId}</Typography>
      </div>
    </>
  );
};

export default NodeTable;

export const nodesToRowData = (
  nodes: PoolNodeResponse[],
  linodes: LinodeWithMaintenanceAndDisplayStatus[]
) => {
  return nodes.map(thisNode => {
    const foundLinode = linodes.find(
      thisLinode => thisLinode.id === thisNode.instance_id
    );

    const label = foundLinode?.label ?? '';
    // @todo: display status
    const instanceStatus = foundLinode?.status ?? '';
    const ip = foundLinode?.ipv4?.[0] ?? '';

    return {
      label,
      nodeId: thisNode.id,
      instanceId: thisNode.instance_id,
      ip,
      instanceStatus
    };
  });
};

interface NodeRowProps {
  label: string;
  ip: string;
  nodeId: number;
  instanceId: number;
  instanceStatus: string;
}

export const NodeRow: React.FC<NodeRowProps> = props => {
  const { label, instanceStatus, ip, instanceId } = props;

  return (
    <TableRow rowLink={`/linodes/${instanceId}`} aria-label={label}>
      <TableCell>
        <Grid container wrap="nowrap" alignItems="center">
          <Grid item className="py0">
            {/* @todo: real icon  */}
            <EntityIcon size={28} variant="linode" status={instanceStatus} />
          </Grid>
          <Grid item>
            <Typography variant="h3">{label}</Typography>
          </Grid>
        </Grid>
      </TableCell>
      <TableCell>{instanceStatus}</TableCell>
      <TableCell>{ip}</TableCell>
      <TableCell>
        {/* @todo: action menu */}
        {/* <ActionMenu/> */}
      </TableCell>
    </TableRow>
  );
};
