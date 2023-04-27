import * as React from 'react';
import { CircleProgress } from 'src/components/CircleProgress';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import LandingHeader from 'src/components/LandingHeader';
import TransferDisplay from 'src/components/TransferDisplay';
import { BackupsCTA } from 'src/features/Backups';
import EnableBackupsDialog from '../LinodesDetail/LinodeBackup/EnableBackupsDialog';
import LinodeRebuildDialog from '../LinodesDetail/LinodeRebuild/LinodeRebuildDialog';
import RescueDialog from '../LinodesDetail/LinodeRescue';
import LinodeResize from '../LinodesDetail/LinodeResize';
import { MigrateLinode } from 'src/features/linodes/MigrateLinode';
import PowerDialogOrDrawer, { Action } from '../PowerActionsDialogOrDrawer';
import { DeleteLinodeDialog } from './DeleteDialog';
import ListLinodesEmptyState from './ListLinodesEmptyState';
import { useLinodesQuery } from 'src/queries/linodes/linodes';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useHistory } from 'react-router-dom';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import TableCell from 'src/components/TableCell/TableCell';
import { TableSortCell } from 'src/components/TableSortCell/TableSortCell';
import { LinodeRow } from './LinodeRow/LinodeRow';
import Table from 'src/components/Table/Table';
import TableRow from 'src/components/core/TableRow';
import Hidden from 'src/components/core/Hidden';
import MaintenanceBanner from 'src/components/MaintenanceBanner';

export interface LinodeHandlers {
  onOpenPowerDialog: (linodeId: number, action: Action) => void;
  onOpenDeleteDialog: (linodeId: number) => void;
  onOpenResizeDialog: (linodeId: number) => void;
  onOpenRebuildDialog: (linodeId: number) => void;
  onOpenRescueDialog: (linodeId: number) => void;
  onOpenMigrateDialog: (linodeId: number) => void;
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
  const [enableBackupsDialogOpen, setEnableBackupsDialogOpen] = React.useState(
    false
  );

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
    setRescueDialogOpen(true);
    setSelectedLinodeId(linodeId);
  };

  if (error) {
    return <ErrorState errorText={error?.[0].reason} />;
  }

  if (isLoading) {
    return <CircleProgress />;
  }

  if (data?.results === 0) {
    return <ListLinodesEmptyState />;
  }

  const handlers = {
    onOpenPowerDialog,
    onOpenDeleteDialog,
    onOpenResizeDialog,
    onOpenRebuildDialog,
    onOpenRescueDialog,
    onOpenMigrateDialog,
  };

  return (
    <React.Fragment>
      <MaintenanceBanner />
      <DocumentTitleSegment segment="Linodes" />
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
            <LinodeRow key={linode.id} {...linode} handlers={handlers} />
          ))}
        </TableBody>
      </Table>
      <TransferDisplay />
      <PowerDialogOrDrawer
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
        onClose={() => setMigrateDialogOpen(true)}
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
      <EnableBackupsDialog
        open={enableBackupsDialogOpen}
        onClose={() => setEnableBackupsDialogOpen(false)}
        linodeId={selectedLinodeId}
      />
    </React.Fragment>
  );
};

export default LinodesLanding;
