import { Typography } from '@linode/ui';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { InlineMenuAction } from 'src/components/InlineMenuAction/InlineMenuAction';
import { MaskableText } from 'src/components/MaskableText/MaskableText';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { TableSortCell } from 'src/components/TableSortCell';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useTrustedDevicesQuery } from 'src/queries/profile/profile';

import { RevokeTrustedDeviceDialog } from './RevokeTrustedDevicesDialog';

import type { Theme } from '@mui/material/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  copy: {
    lineHeight: '20px',
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(),
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

  const { handleOrderChange, order, orderBy } = useOrder(
    {
      order: 'asc',
      orderBy: 'expiry',
    },
    preferenceKey
  );

  const { data, error, isLoading } = useTrustedDevicesQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    {
      '+order': order,
      '+order_by': orderBy,
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
        <TableRow key={device.id}>
          <TableCell>
            <MaskableText isToggleable text={device.user_agent} />
          </TableCell>
          <TableCell>
            <MaskableText isToggleable text={device.last_remote_addr} />
          </TableCell>
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
      <Typography className={classes.copy} data-qa-copy variant="body1">
        To add a trusted device, check the box &quot;Trust this device for 30
        days&quot; at login.
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Device</TableCell>
            <TableSortCell
              active={orderBy === 'last_remote_addr'}
              className={classes.dates}
              direction={order}
              handleClick={handleOrderChange}
              label="last_remote_addr"
            >
              Last IP
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'last_authenticated'}
              className={classes.dates}
              direction={order}
              handleClick={handleOrderChange}
              label="last_authenticated"
            >
              Last Used
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'expiry'}
              className={classes.dates}
              direction={order}
              handleClick={handleOrderChange}
              label="expiry"
            >
              Expires
            </TableSortCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>{renderTableBody()}</TableBody>
        <PaginationFooter
          count={data?.results ?? 0}
          eventCategory="Trusted Devices Panel"
          handlePageChange={pagination.handlePageChange}
          handleSizeChange={pagination.handlePageSizeChange}
          page={pagination.page}
          pageSize={pagination.pageSize}
        />
      </Table>
      <RevokeTrustedDeviceDialog
        deviceId={selectedDeviceId}
        onClose={() => setIsRevokeDialogOpen(false)}
        open={isRevokeDialogOpen}
      />
    </>
  );
};

export default TrustedDevices;
