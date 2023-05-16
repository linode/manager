import * as React from 'react';
import Box from 'src/components/core/Box';
import ErrorState from 'src/components/ErrorState';
import Hidden from 'src/components/core/Hidden';
import LandingHeader from 'src/components/LandingHeader';
import LinodeResize from '../LinodesDetail/LinodeResize/LinodeResize';
import MaintenanceBanner from 'src/components/MaintenanceBanner';
import TransferDisplay from 'src/components/TransferDisplay';
import { BackupsCTA } from 'src/features/Backups';
import { CircleProgress } from 'src/components/CircleProgress';
import { DeleteLinodeDialog } from './DeleteLinodeDialog';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { LinodeRebuildDialog } from '../LinodesDetail/LinodeRebuild/LinodeRebuildDialog';
import { LinodeRow } from './LinodeRow/LinodeRow';
import { LinodesLandingCSVDownload } from './LinodesLandingCSVDownload';
import { LinodesLandingEmptyState } from './LinodesLandingEmptyState';
import { MigrateLinode } from 'src/features/linodes/MigrateLinode';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { PowerActionsDialog, Action } from '../PowerActionsDialogOrDrawer';
import { RescueDialog } from '../LinodesDetail/LinodeRescue/RescueDialog';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell/TableSortCell';
import { useHistory } from 'react-router-dom';
import { useLinodesQuery } from 'src/queries/linodes/linodes';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';

export interface LinodeHandlers {
  onOpenPowerDialog: (action: Action) => void;
  onOpenDeleteDialog: () => void;
  onOpenResizeDialog: () => void;
  onOpenRebuildDialog: () => void;
  onOpenRescueDialog: () => void;
  onOpenMigrateDialog: () => void;
}

const preferenceKey = 'linodes';

export const LinodesLanding = () => {
  const history = useHistory();

  const [powerAction, setPowerAction] = React.useState<Action>('Reboot');
  const [powerDialogOpen, setPowerDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [rebuildDialogOpen, setRebuildDialogOpen] = React.useState(false);
  const [rescueDialogOpen, setRescueDialogOpen] = React.useState(false);
  const [linodeResizeOpen, setResizeDialogOpen] = React.useState(false);
  const [linodeMigrateOpen, setMigrateDialogOpen] = React.useState(false);

  const [selectedLinodeId, setSelectedLinodeId] = React.useState<
    number | undefined
  >();

  const pagination = usePagination(1, preferenceKey);

  const { order, orderBy, handleOrderChange } = useOrder(
    {
      orderBy: 'label',
      order: 'desc',
    },
    `${preferenceKey}-order`
  );

  const filter = {
    ['+order_by']: orderBy,
    ['+order']: order,
  };

  const { data, isLoading, error } = useLinodesQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filter
  );

  const onOpenPowerDialog = (linodeId: number, action: Action) => {
    setPowerDialogOpen(true);
    setPowerAction(action);
    setSelectedLinodeId(linodeId);
  };

  const onOpenDeleteDialog = (linodeId: number) => {
    setDeleteDialogOpen(true);
    setSelectedLinodeId(linodeId);
  };

  const onOpenResizeDialog = (linodeId: number) => {
    setResizeDialogOpen(true);
    setSelectedLinodeId(linodeId);
  };

  const onOpenRebuildDialog = (linodeId: number) => {
    setRebuildDialogOpen(true);
    setSelectedLinodeId(linodeId);
  };

  const onOpenRescueDialog = (linodeId: number) => {
    setRescueDialogOpen(true);
    setSelectedLinodeId(linodeId);
  };

  const onOpenMigrateDialog = (linodeId: number) => {
    setMigrateDialogOpen(true);
    setSelectedLinodeId(linodeId);
  };

  if (error) {
    return <ErrorState errorText={error?.[0].reason} />;
  }

  if (isLoading) {
    return <CircleProgress />;
  }

  if (data?.results === 0) {
    return <LinodesLandingEmptyState />;
  }

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Linodes" />
      <MaintenanceBanner />
      <BackupsCTA />
      <LandingHeader
        title="Linodes"
        entity="Linode"
        onButtonClick={() => history.push('/linodes/create')}
        docsLink="https://www.linode.com/docs/platform/billing-and-support/linode-beginners-guide/"
      />
      <Table>
        <TableHead>
          <TableRow>
            <TableSortCell
              active={orderBy === 'label'}
              direction={order}
              label="label"
              handleClick={handleOrderChange}
              data-qa-sort-label={order}
            >
              Label
            </TableSortCell>
            <TableCell>Status</TableCell>
            <Hidden smDown>
              <TableCell>Plan</TableCell>
              <TableCell>IP Address</TableCell>
            </Hidden>
            <Hidden lgDown>
              <TableSortCell
                active={orderBy === 'region'}
                direction={order}
                label="region"
                handleClick={handleOrderChange}
              >
                Region
              </TableSortCell>
              <TableCell>Last Backup</TableCell>
            </Hidden>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.data.map((linode) => (
            <LinodeRow
              key={linode.id}
              {...linode}
              handlers={{
                onOpenDeleteDialog: () => onOpenDeleteDialog(linode.id),
                onOpenMigrateDialog: () => onOpenMigrateDialog(linode.id),
                onOpenPowerDialog: (action: Action) =>
                  onOpenPowerDialog(linode.id, action),
                onOpenRebuildDialog: () => onOpenRebuildDialog(linode.id),
                onOpenRescueDialog: () => onOpenRescueDialog(linode.id),
                onOpenResizeDialog: () => onOpenResizeDialog(linode.id),
              }}
            />
          ))}
        </TableBody>
      </Table>
      <PaginationFooter
        count={data?.results ?? 0}
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
        eventCategory="Linodes Table"
      />
      <Box display="flex" justifyContent="flex-end" marginTop={1}>
        <LinodesLandingCSVDownload />
      </Box>
      <TransferDisplay />
      <PowerActionsDialog
        isOpen={powerDialogOpen}
        linodeId={selectedLinodeId}
        onClose={() => setPowerDialogOpen(false)}
        action={powerAction}
      />
      <DeleteLinodeDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        linodeId={selectedLinodeId}
      />
      <LinodeResize
        open={linodeResizeOpen}
        onClose={() => setResizeDialogOpen(false)}
        linodeId={selectedLinodeId}
      />
      <MigrateLinode
        open={linodeMigrateOpen}
        onClose={() => setMigrateDialogOpen(false)}
        linodeId={selectedLinodeId}
      />
      <LinodeRebuildDialog
        open={rebuildDialogOpen}
        onClose={() => setRebuildDialogOpen(false)}
        linodeId={selectedLinodeId}
      />
      <RescueDialog
        open={rescueDialogOpen}
        onClose={() => setRescueDialogOpen(false)}
        linodeId={selectedLinodeId}
      />
    </React.Fragment>
  );
};

export default LinodesLanding;
