import * as React from 'react';
import { TableBody } from 'src/components/TableBody';
import { TableHead } from 'src/components/TableHead';
import Typography from 'src/components/core/Typography';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableSortCell } from 'src/components/TableSortCell';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import InlineMenuAction from 'src/components/InlineMenuAction';
import { Theme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';
import { usePagination } from 'src/hooks/usePagination';
import { useOrder } from 'src/hooks/useOrder';
import { useTrustedDevicesQuery } from 'src/queries/profile';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { RevokeTrustedDeviceDialog } from './RevokeTrustedDevicesDialog';

const useStyles = makeStyles()((theme: Theme) => ({
  copy: {
    lineHeight: '20px',
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(2),
  },
  dates: {
    minWidth: 150,
  },
}));

const preferenceKey = 'trusted-devices';

const TrustedDevices = () => {
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = React.useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = React.useState<number>(0);

  const { classes } = useStyles();

  const pagination = usePagination(1, preferenceKey);

  const { order, orderBy, handleOrderChange } = useOrder(
    {
      orderBy: 'expiry',
      order: 'asc',
    },
    preferenceKey
  );

  const { data, isLoading, error } = useTrustedDevicesQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    {
      '+order_by': orderBy,
      '+order': order,
    }
  );

  const onRevoke = (id: number) => {
    setSelectedDeviceId(id);
    setIsRevokeDialogOpen(true);
  };

  const renderTableBody = () => {
    if (isLoading) {
      return <TableRowLoading columns={5} />;
    }

    if (error) {
      return (
        <TableRowError
          colSpan={6}
          message="There was an issue loading your trusted devices."
        />
      );
    }

    if (data?.results === 0) {
      return <TableRowEmpty colSpan={6} />;
    }

    return data?.data.map((device) => {
      return (
        <TableRow ariaLabel={`Device ${device.id}`} key={device.id}>
          <TableCell>{device.user_agent}</TableCell>
          <TableCell>{device.last_remote_addr}</TableCell>
          <TableCell>
            <DateTimeDisplay value={device.last_authenticated} />
          </TableCell>
          <TableCell>
            <DateTimeDisplay value={device.expiry} />
          </TableCell>
          <TableCell className="p0">
            <InlineMenuAction
              actionText="Revoke"
              onClick={() => onRevoke(device.id)}
            />
          </TableCell>
        </TableRow>
      );
    });
  };

  return (
    <>
      <Typography variant="h3">Trusted Devices</Typography>
      <Typography variant="body1" className={classes.copy} data-qa-copy>
        To add a trusted device, check the box &quot;Trust this device for 30
        days&quot; at login.
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Device</TableCell>
            <TableSortCell
              className={classes.dates}
              active={orderBy === 'last_remote_addr'}
              label="last_remote_addr"
              direction={order}
              handleClick={handleOrderChange}
            >
              Last IP
            </TableSortCell>
            <TableSortCell
              className={classes.dates}
              active={orderBy === 'last_authenticated'}
              label="last_authenticated"
              direction={order}
              handleClick={handleOrderChange}
            >
              Last Used
            </TableSortCell>
            <TableSortCell
              className={classes.dates}
              active={orderBy === 'expiry'}
              label="expiry"
              direction={order}
              handleClick={handleOrderChange}
            >
              Expires
            </TableSortCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>{renderTableBody()}</TableBody>
        <PaginationFooter
          count={data?.results ?? 0}
          page={pagination.page}
          pageSize={pagination.pageSize}
          handlePageChange={pagination.handlePageChange}
          handleSizeChange={pagination.handlePageSizeChange}
          eventCategory="Trusted Devices Panel"
        />
      </Table>
      <RevokeTrustedDeviceDialog
        open={isRevokeDialogOpen}
        onClose={() => setIsRevokeDialogOpen(false)}
        deviceId={selectedDeviceId}
      />
    </>
  );
};

export default TrustedDevices;
