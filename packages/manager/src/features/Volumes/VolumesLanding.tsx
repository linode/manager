import { Event } from '@linode/api-v4/lib/account';
import { Config } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { compose } from 'recompose';
import { Dispatch, bindActionCreators } from 'redux';

import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { LandingHeader } from 'src/components/LandingHeader';
import { LandingLoading } from 'src/components/LandingLoading/LandingLoading';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { ProductInformationBanner } from 'src/components/ProductInformationBanner/ProductInformationBanner';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { useVolumesQuery } from 'src/queries/volumes';
import {
  LinodeOptions,
  Origin as VolumeDrawerOrigin,
  openForClone,
  openForConfig,
  openForCreating,
  openForEdit,
  openForResize,
} from 'src/store/volumeForm';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';

import { DestructiveVolumeDialog } from './DestructiveVolumeDialog';
import { UpgradeVolumeDialog } from './UpgradeVolumeDialog';
import { VolumeAttachmentDrawer } from './VolumeAttachmentDrawer';
import { VolumeTableRow } from './VolumeTableRow';
import { ActionHandlers as VolumeHandlers } from './VolumesActionMenu';
import { VolumesLandingEmptyState } from './VolumesLandingEmptyState';

interface Props {
  fromLinodes?: boolean;
  isVolumesLanding?: boolean;
  linodeConfigs?: Config[];
  linodeId?: number;
  linodeLabel?: string;
  linodeRegion?: string;
  readOnly?: boolean;
  recentEvent?: Event;
  removeBreadCrumb?: boolean;
}

interface DispatchProps {
  openForClone: (
    volumeId: number,
    volumeLabel: string,
    volumeSize: number,
    volumeRegion: string
  ) => void;
  openForConfig: (volumeLabel: string, volumePath: string) => void;
  openForCreating: (
    origin: VolumeDrawerOrigin,
    linodeOptions?: LinodeOptions
  ) => void;
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
}

type CombinedProps = Props & DispatchProps;

const preferenceKey = 'volumes';

export const VolumesLanding = (props: CombinedProps) => {
  const history = useHistory();

  const pagination = usePagination(1, preferenceKey);

  const { handleOrderChange, order, orderBy } = useOrder(
    {
      order: 'desc',
      orderBy: 'label',
    },
    `${preferenceKey}-order`
  );

  const filter = {
    ['+order']: order,
    ['+order_by']: orderBy,
  };

  const { data: volumes, error, isLoading } = useVolumesQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filter
  );

  const { openForClone, openForConfig, openForEdit, openForResize } = props;

  const [upgradeVolumeDialog, setUpgradeVolumeDialog] = React.useState({
    open: false,
    volumeId: 0,
    volumeLabel: '',
  });

  const [attachmentDrawer, setAttachmentDrawer] = React.useState({
    linodeRegion: '',
    open: false,
    volumeId: 0,
    volumeLabel: '',
  });

  const [destructiveDialog, setDestructiveDialog] = React.useState<{
    linodeId?: number;
    linodeLabel?: string;
    mode: 'delete' | 'detach';
    open: boolean;
    volumeId?: number;
    volumeLabel: string;
  }>({
    linodeId: undefined,
    linodeLabel: undefined,
    mode: 'detach',
    open: false,
    volumeId: 0,
    volumeLabel: '',
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
      linodeRegion: regionID,
      open: true,
      volumeId,
      volumeLabel: label,
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
      error: '',
      linodeId,
      linodeLabel,
      mode: 'detach',
      open: true,
      volumeId,
      volumeLabel,
    }));
  };

  const handleDelete = (volumeId: number, volumeLabel: string) => {
    setDestructiveDialog((destructiveDialog) => ({
      ...destructiveDialog,
      error: '',
      linodeLabel: '',
      mode: 'delete',
      open: true,
      volumeId,
      volumeLabel,
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
    return <LandingLoading />;
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
    return (
      <>
        <ProductInformationBanner bannerLocation="Volumes" />
        <VolumesLandingEmptyState />
      </>
    );
  }

  const handlers: VolumeHandlers = {
    handleAttach,
    handleDelete,
    handleDetach,
    handleUpgrade,
    openForClone,
    openForConfig,
    openForEdit,
    openForResize,
  };

  return (
    <>
      <DocumentTitleSegment segment="Volumes" />
      <ProductInformationBanner bannerLocation="Volumes" />
      <LandingHeader
        docsLink="https://www.linode.com/docs/platform/block-storage/how-to-use-block-storage-with-your-linode/"
        entity="Volume"
        onButtonClick={() => history.push('/volumes/create')}
        title="Volumes"
      />
      <Table>
        <TableHead>
          <TableRow>
            <TableSortCell
              active={orderBy === 'label'}
              direction={order}
              handleClick={handleOrderChange}
              label="label"
            >
              Label
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'status'}
              direction={order}
              handleClick={handleOrderChange}
              label="status"
            >
              Status
            </TableSortCell>
            <TableCell>Region</TableCell>
            <TableSortCell
              active={orderBy === 'size'}
              direction={order}
              handleClick={handleOrderChange}
              label="size"
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
        eventCategory="Volumes Table"
        handlePageChange={pagination.handlePageChange}
        handleSizeChange={pagination.handlePageSizeChange}
        page={pagination.page}
        pageSize={pagination.pageSize}
      />
      <UpgradeVolumeDialog
        id={upgradeVolumeDialog.volumeId}
        label={upgradeVolumeDialog.volumeLabel}
        onClose={closeUpgradeVolumeDialog}
        open={upgradeVolumeDialog.open}
      />
      <VolumeAttachmentDrawer
        linodeRegion={attachmentDrawer.linodeRegion || ''}
        onClose={handleCloseAttachDrawer}
        open={attachmentDrawer.open}
        volumeId={attachmentDrawer.volumeId || 0}
        volumeLabel={attachmentDrawer.volumeLabel || ''}
      />
      <DestructiveVolumeDialog
        linodeId={destructiveDialog.linodeId}
        linodeLabel={destructiveDialog.linodeLabel}
        mode={destructiveDialog.mode}
        onClose={closeDestructiveDialog}
        open={destructiveDialog.open}
        volumeId={destructiveDialog.volumeId ?? 0}
        volumeLabel={destructiveDialog.volumeLabel}
      />
    </>
  );
};

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      openForClone,
      openForConfig,
      openForCreating,
      openForEdit,
      openForResize,
    },
    dispatch
  );

const connected = connect(undefined, mapDispatchToProps);

export default compose<CombinedProps, Props>(connected)(VolumesLanding);
