import { Event } from '@linode/api-v4/lib/account';
import { Config } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { compose } from 'recompose';
import { bindActionCreators, Dispatch } from 'redux';
import { TableBody } from 'src/components/TableBody';
import { TableHead } from 'src/components/TableHead';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import LandingHeader from 'src/components/LandingHeader';
import Loading from 'src/components/LandingLoading';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Table } from 'src/components/Table';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useVolumesQuery } from 'src/queries/volumes';
import {
  LinodeOptions,
  openForClone,
  openForConfig,
  openForCreating,
  openForEdit,
  openForResize,
  Origin as VolumeDrawerOrigin,
} from 'src/store/volumeForm';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { DestructiveVolumeDialog } from './DestructiveVolumeDialog';
import { UpgradeVolumeDialog } from './UpgradeVolumeDialog';
import { VolumeAttachmentDrawer } from './VolumeAttachmentDrawer';
import { ActionHandlers as VolumeHandlers } from './VolumesActionMenu';
import { VolumesLandingEmptyState } from './VolumesLandingEmptyState';
import { VolumeTableRow } from './VolumeTableRow';

interface Props {
  isVolumesLanding?: boolean;
  linodeId?: number;
  linodeLabel?: string;
  linodeRegion?: string;
  linodeConfigs?: Config[];
  recentEvent?: Event;
  readOnly?: boolean;
  removeBreadCrumb?: boolean;
  fromLinodes?: boolean;
}

interface DispatchProps {
  openForEdit: (
    volumeId: number,
    volumeLabel: string,
    volumeTags: string[]
  ) => void;
  openForResize: (
    volumeId: number,
    volumeSize: number,
    volumeLabel: string
  ) => void;
  openForClone: (
    volumeId: number,
    volumeLabel: string,
    volumeSize: number,
    volumeRegion: string
  ) => void;
  openForCreating: (
    origin: VolumeDrawerOrigin,
    linodeOptions?: LinodeOptions
  ) => void;
  openForConfig: (volumeLabel: string, volumePath: string) => void;
}

type CombinedProps = Props & DispatchProps;

const preferenceKey = 'volumes';

export const VolumesLanding = (props: CombinedProps) => {
  const history = useHistory();

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

  const { data: volumes, isLoading, error } = useVolumesQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filter
  );

  const { openForConfig, openForClone, openForEdit, openForResize } = props;

  const [upgradeVolumeDialog, setUpgradeVolumeDialog] = React.useState({
    open: false,
    volumeId: 0,
    volumeLabel: '',
  });

  const [attachmentDrawer, setAttachmentDrawer] = React.useState({
    open: false,
    volumeId: 0,
    volumeLabel: '',
    linodeRegion: '',
  });

  const [destructiveDialog, setDestructiveDialog] = React.useState<{
    open: boolean;
    mode: 'detach' | 'delete';
    volumeId?: number;
    volumeLabel: string;
    linodeLabel?: string;
    linodeId?: number;
  }>({
    open: false,
    mode: 'detach',
    volumeId: 0,
    volumeLabel: '',
    linodeId: undefined,
    linodeLabel: undefined,
  });

  const handleCloseAttachDrawer = () => {
    setAttachmentDrawer((attachmentDrawer) => ({
      ...attachmentDrawer,
      open: false,
    }));
  };

  const handleUpgrade = (volumeId: number, label: string) => {
    setUpgradeVolumeDialog({ open: true, volumeId, volumeLabel: label });
  };

  const handleAttach = (volumeId: number, label: string, regionID: string) => {
    setAttachmentDrawer((attachmentDrawer) => ({
      ...attachmentDrawer,
      open: true,
      volumeId,
      volumeLabel: label,
      linodeRegion: regionID,
    }));
  };

  const handleDetach = (
    volumeId: number,
    volumeLabel: string,
    linodeLabel: string,
    linodeId: number
  ) => {
    setDestructiveDialog((destructiveDialog) => ({
      ...destructiveDialog,
      open: true,
      mode: 'detach',
      volumeId,
      volumeLabel,
      linodeLabel,
      linodeId,
      error: '',
    }));
  };

  const handleDelete = (volumeId: number, volumeLabel: string) => {
    setDestructiveDialog((destructiveDialog) => ({
      ...destructiveDialog,
      open: true,
      mode: 'delete',
      volumeId,
      volumeLabel,
      linodeLabel: '',
      error: '',
    }));
  };

  const closeDestructiveDialog = () => {
    setDestructiveDialog((destructiveDialog) => ({
      ...destructiveDialog,
      open: false,
    }));
  };

  const closeUpgradeVolumeDialog = () => {
    setUpgradeVolumeDialog((values) => ({
      ...values,
      open: false,
    }));
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <ErrorState
        errorText={
          getAPIErrorOrDefault(error, 'Error loading your volumes.')[0].reason
        }
      />
    );
  }

  if (volumes?.results === 0) {
    return <VolumesLandingEmptyState />;
  }

  const handlers: VolumeHandlers = {
    openForConfig,
    openForEdit,
    openForResize,
    openForClone,
    handleAttach,
    handleDetach,
    handleDelete,
    handleUpgrade,
  };

  return (
    <>
      <DocumentTitleSegment segment="Volumes" />
      <LandingHeader
        title="Volumes"
        entity="Volume"
        onButtonClick={() => history.push('/volumes/create')}
        docsLink="https://www.linode.com/docs/platform/block-storage/how-to-use-block-storage-with-your-linode/"
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
            <TableSortCell
              active={orderBy === 'status'}
              direction={order}
              label="status"
              handleClick={handleOrderChange}
            >
              Status
            </TableSortCell>
            <TableCell>Region</TableCell>
            <TableSortCell
              active={orderBy === 'size'}
              direction={order}
              label="size"
              handleClick={handleOrderChange}
            >
              Size
            </TableSortCell>
            <TableCell>Attached To</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {volumes?.data.map((volume) => (
            <VolumeTableRow key={volume.id} {...volume} {...handlers} />
          ))}
        </TableBody>
      </Table>
      <PaginationFooter
        count={volumes?.results ?? 0}
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
        eventCategory="Volumes Table"
      />
      <UpgradeVolumeDialog
        open={upgradeVolumeDialog.open}
        id={upgradeVolumeDialog.volumeId}
        label={upgradeVolumeDialog.volumeLabel}
        onClose={closeUpgradeVolumeDialog}
      />
      <VolumeAttachmentDrawer
        open={attachmentDrawer.open}
        volumeId={attachmentDrawer.volumeId || 0}
        volumeLabel={attachmentDrawer.volumeLabel || ''}
        linodeRegion={attachmentDrawer.linodeRegion || ''}
        onClose={handleCloseAttachDrawer}
      />
      <DestructiveVolumeDialog
        open={destructiveDialog.open}
        volumeLabel={destructiveDialog.volumeLabel}
        linodeLabel={destructiveDialog.linodeLabel}
        linodeId={destructiveDialog.linodeId}
        volumeId={destructiveDialog.volumeId ?? 0}
        mode={destructiveDialog.mode}
        onClose={closeDestructiveDialog}
      />
    </>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      openForEdit,
      openForResize,
      openForClone,
      openForCreating,
      openForConfig,
    },
    dispatch
  );

const connected = connect(undefined, mapDispatchToProps);

export default compose<CombinedProps, Props>(connected)(VolumesLanding);
