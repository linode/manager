import { Event, Image, ImageStatus } from '@linode/api-v4';
import { APIError } from '@linode/api-v4/lib/types';
import { Theme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';
import produce from 'immer';
import { useSnackbar } from 'notistack';
import * as React from 'react';
import { useQueryClient } from 'react-query';
import { useHistory } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { CircleProgress } from 'src/components/CircleProgress';
import { ConfirmationDialog } from 'src/components/ConfirmationDialog/ConfirmationDialog';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { ErrorState } from 'src/components/ErrorState/ErrorState';
import { Hidden } from 'src/components/Hidden';
import { LandingHeader } from 'src/components/LandingHeader';
import { Notice } from 'src/components/Notice/Notice';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Paper } from 'src/components/Paper';
import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableSortCell } from 'src/components/TableSortCell';
import { Typography } from 'src/components/Typography';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { listToItemsByID } from 'src/queries/base';
import { useEventsInfiniteQuery } from 'src/queries/events/events';
import {
  queryKey,
  removeImageFromCache,
  useDeleteImageMutation,
  useImagesQuery,
} from 'src/queries/images';
import {
  isEventImageUpload,
  isEventInProgressDiskImagize,
} from 'src/queries/events/event.helpers';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';

import ImageRow, { ImageWithEvent } from './ImageRow';
import { Handlers as ImageHandlers } from './ImagesActionMenu';
import { DrawerMode, ImagesDrawer } from './ImagesDrawer';
import { ImagesLandingEmptyState } from './ImagesLandingEmptyState';

const useStyles = makeStyles()((theme: Theme) => ({
  imageTable: {
    marginBottom: theme.spacing(3),
    padding: 0,
  },
  imageTableHeader: {
    marginLeft: theme.spacing(),
    padding: theme.spacing(),
  },
  imageTableSubheader: {
    marginTop: theme.spacing(),
  },
}));

interface ImageDrawerState {
  description?: string;
  imageID?: string;
  label?: string;
  mode: DrawerMode;
  open: boolean;
  selectedDisk: null | string;
  selectedLinode?: number;
}

interface ImageDialogState {
  error?: string;
  image?: string;
  imageID?: string;
  open: boolean;
  status?: ImageStatus;
  submitting: boolean;
}

type CombinedProps = ImageDrawerState & ImageDialogState;

const defaultDrawerState = {
  description: '',
  label: '',
  mode: 'edit' as DrawerMode,
  open: false,
  selectedDisk: null,
};

const defaultDialogState = {
  error: undefined,
  image: '',
  imageID: '',
  open: false,
  submitting: false,
};

export const ImagesLanding: React.FC<CombinedProps> = () => {
  const { classes } = useStyles();
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();

  const queryClient = useQueryClient();

  // Pagination, order, and query hooks for manual/custom images
  const paginationForManualImages = usePagination(
    1,
    `${queryKey}-manual`,
    'manual'
  );
  const {
    handleOrderChange: handleManualImagesOrderChange,
    order: manualImagesOrder,
    orderBy: manualImagesOrderBy,
  } = useOrder(
    {
      order: 'asc',
      orderBy: 'label',
    },
    `${queryKey}-manual-order`,
    'manual'
  );

  const manualImagesFilter = {
    ['+order']: manualImagesOrder,
    ['+order_by']: manualImagesOrderBy,
  };

  const {
    data: manualImages,
    error: manualImagesError,
    isLoading: manualImagesLoading,
  } = useImagesQuery(
    {
      page: paginationForManualImages.page,
      page_size: paginationForManualImages.pageSize,
    },
    {
      ...manualImagesFilter,
      is_public: false,
      type: 'manual',
    }
  );

  // Pagination, order, and query hooks for automatic/recovery images
  const paginationForAutomaticImages = usePagination(
    1,
    `${queryKey}-automatic`,
    'automatic'
  );
  const {
    handleOrderChange: handleAutomaticImagesOrderChange,
    order: automaticImagesOrder,
    orderBy: automaticImagesOrderBy,
  } = useOrder(
    {
      order: 'asc',
      orderBy: 'label',
    },
    `${queryKey}-automatic-order`,
    'automatic'
  );

  const automaticImagesFilter = {
    ['+order']: automaticImagesOrder,
    ['+order_by']: automaticImagesOrderBy,
  };

  const {
    data: automaticImages,
    error: automaticImagesError,
    isLoading: automaticImagesLoading,
  } = useImagesQuery(
    {
      page: paginationForAutomaticImages.page,
      page_size: paginationForAutomaticImages.pageSize,
    },
    {
      ...automaticImagesFilter,
      is_public: false,
      type: 'automatic',
    }
  );

  const { mutateAsync: deleteImage } = useDeleteImageMutation();

  const { events } = useEventsInfiniteQuery();

  const imageEvents =
    events?.filter(
      (event) =>
        isEventInProgressDiskImagize(event) || isEventImageUpload(event)
    ) ?? [];

  // Private images with the associated events tied in.
  const manualImagesData = getImagesWithEvents(
    manualImages?.data ?? [],
    imageEvents
  );

  // Automatic images with the associated events tied in.
  const automaticImagesData = getImagesWithEvents(
    automaticImages?.data ?? [],
    imageEvents
  );

  const [drawer, setDrawer] = React.useState<ImageDrawerState>(
    defaultDrawerState
  );

  const [dialog, setDialogState] = React.useState<ImageDialogState>(
    defaultDialogState
  );

  const dialogAction = dialog.status === 'pending_upload' ? 'cancel' : 'delete';
  const dialogMessage =
    dialogAction === 'cancel'
      ? 'Are you sure you want to cancel this Image upload?'
      : 'Are you sure you want to delete this Image?';

  const openDialog = (image: string, imageID: string, status: ImageStatus) => {
    setDialogState({
      error: undefined,
      image,
      imageID,
      open: true,
      status,
      submitting: false,
    });
  };

  const closeDialog = () => {
    setDialogState({ ...dialog, open: false });
  };

  const handleRemoveImage = () => {
    if (!dialog.imageID) {
      setDialogState((dialog) => ({
        ...dialog,
        error: 'Image is not available.',
      }));
    }
    setDialogState((dialog) => ({
      ...dialog,
      error: undefined,
      submitting: true,
    }));

    deleteImage({ imageId: dialog.imageID! })
      .then(() => {
        closeDialog();
        /**
         * request generated by the Pagey HOC.
         *
         * We're making a request here because the image is being
         * optimistically deleted on the API side, so a GET to /images
         * will not return the image scheduled for deletion. This request
         * is ensuring the image is removed from the list, to prevent the user
         * from taking any action on the Image.
         */
        // this.props.onDelete();
        enqueueSnackbar('Image has been scheduled for deletion.', {
          variant: 'info',
        });
      })
      .catch((err) => {
        const _error = getErrorStringOrDefault(
          err,
          'There was an error deleting the image.'
        );
        setDialogState((dialog) => ({
          ...dialog,
          error: _error,
          submitting: false,
        }));
      });
  };

  const onRetryClick = (
    imageId: string,
    imageLabel: string,
    imageDescription: string
  ) => {
    removeImageFromCache(queryClient);
    history.push('/images/create/upload', {
      imageDescription,
      imageLabel,
    });
  };

  const onCancelFailedClick = () => {
    removeImageFromCache(queryClient);
  };

  const openForEdit = (label: string, description: string, imageID: string) => {
    setDrawer({
      description,
      imageID,
      label,
      mode: 'edit',
      open: true,
      selectedDisk: null,
    });
  };

  const openForRestore = (imageID: string) => {
    setDrawer({
      imageID,
      mode: 'restore',
      open: true,
      selectedDisk: null,
    });
  };

  const deployNewLinode = (imageID: string) => {
    history.push({
      pathname: `/linodes/create/`,
      search: `?type=Images&imageID=${imageID}`,
      state: { selectedImageId: imageID },
    });
  };

  const changeSelectedLinode = (linodeId: null | number) => {
    setDrawer((prevDrawerState) => ({
      ...prevDrawerState,
      selectedDisk: null,
      selectedLinode: linodeId ?? undefined,
    }));
  };

  const changeSelectedDisk = (disk: null | string) => {
    setDrawer((prevDrawerState) => ({
      ...prevDrawerState,
      selectedDisk: disk,
    }));
  };

  const setLabel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setDrawer((prevDrawerState) => ({
      ...prevDrawerState,
      label: value,
    }));
  };

  const setDescription = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDrawer((prevDrawerState) => ({
      ...prevDrawerState,
      description: value,
    }));
  };

  const getActions = () => {
    return (
      <ActionsPanel
        primaryButtonProps={{
          'data-testid': 'submit',
          label: dialogAction === 'cancel' ? 'Cancel Upload' : 'Delete Image',
          loading: dialog.submitting,
          onClick: handleRemoveImage,
        }}
        secondaryButtonProps={{
          'data-testid': 'cancel',
          label: dialogAction === 'cancel' ? 'Keep Image' : 'Cancel',
          onClick: closeDialog,
        }}
      />
    );
  };

  const closeImageDrawer = () => {
    setDrawer((prevDrawerState) => ({
      ...prevDrawerState,
      open: false,
    }));
  };

  const renderImageDrawer = () => {
    return (
      <ImagesDrawer
        changeDescription={setDescription}
        changeDisk={changeSelectedDisk}
        changeLabel={setLabel}
        changeLinode={changeSelectedLinode}
        description={drawer.description}
        imageId={drawer.imageID}
        label={drawer.label}
        mode={drawer.mode}
        onClose={closeImageDrawer}
        open={drawer.open}
        selectedDisk={drawer.selectedDisk}
        selectedLinode={drawer.selectedLinode || null}
      />
    );
  };

  const handlers: ImageHandlers = {
    onCancelFailed: onCancelFailedClick,
    onDelete: openDialog,
    onDeploy: deployNewLinode,
    onEdit: openForEdit,
    onRestore: openForRestore,
    onRetry: onRetryClick,
  };

  const renderError = (_: APIError[]) => {
    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Images" />
        <ErrorState errorText="There was an error retrieving your images. Please reload and try again." />
      </React.Fragment>
    );
  };

  const renderLoading = () => {
    return <CircleProgress />;
  };

  const renderEmpty = () => {
    return <ImagesLandingEmptyState />;
  };

  if (manualImagesLoading || automaticImagesLoading) {
    return renderLoading();
  }

  /** Error State */
  if (manualImagesError) {
    return renderError(manualImagesError);
  }

  if (automaticImagesError) {
    return renderError(automaticImagesError);
  }

  /** Empty States */
  if (
    (!manualImagesData || manualImagesData.length === 0) &&
    (!automaticImagesData || automaticImagesData.length === 0)
  ) {
    return renderEmpty();
  }

  const noManualImages = (
    <TableRowEmpty colSpan={5} message={`No Custom Images to display.`} />
  );

  const noAutomaticImages = (
    <TableRowEmpty colSpan={6} message={`No Recovery Images to display.`} />
  );

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Images" />
      <LandingHeader
        docsLink="https://www.linode.com/docs/platform/disk-images/linode-images/"
        entity="Image"
        onButtonClick={() => history.push('/images/create')}
        title="Images"
      />
      <Paper className={classes.imageTable}>
        <div className={classes.imageTableHeader}>
          <Typography variant="h3">Custom Images</Typography>
          <Typography className={classes.imageTableSubheader}>
            These are images you manually uploaded or captured from an existing
            Linode disk.
          </Typography>
        </div>
        <Table>
          <TableHead>
            <TableRow>
              <TableSortCell
                active={manualImagesOrderBy === 'label'}
                direction={manualImagesOrder}
                handleClick={handleManualImagesOrderChange}
                label="label"
              >
                Image
              </TableSortCell>
              <Hidden smDown>
                <TableCell>Status</TableCell>
              </Hidden>
              <Hidden smDown>
                <TableSortCell
                  active={manualImagesOrderBy === 'created'}
                  direction={manualImagesOrder}
                  handleClick={handleManualImagesOrderChange}
                  label="created"
                >
                  Created
                </TableSortCell>
              </Hidden>
              <TableSortCell
                active={manualImagesOrderBy === 'size'}
                direction={manualImagesOrder}
                handleClick={handleManualImagesOrderChange}
                label="size"
              >
                Size
              </TableSortCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {manualImagesData.length > 0
              ? manualImagesData.map((manualImage) => (
                  <ImageRow
                    key={manualImage.id}
                    {...manualImage}
                    {...handlers}
                  />
                ))
              : noManualImages}
          </TableBody>
        </Table>
        <PaginationFooter
          count={manualImages?.results ?? 0}
          eventCategory="Custom Images Table"
          handlePageChange={paginationForManualImages.handlePageChange}
          handleSizeChange={paginationForManualImages.handlePageSizeChange}
          page={paginationForManualImages.page}
          pageSize={paginationForManualImages.pageSize}
        />
      </Paper>
      <Paper className={classes.imageTable}>
        <div className={classes.imageTableHeader}>
          <Typography variant="h3">Recovery Images</Typography>
          <Typography className={classes.imageTableSubheader}>
            These are images we automatically capture when Linode disks are
            deleted. They will be deleted after the indicated expiration date.
          </Typography>
        </div>
        <Table>
          <TableHead>
            <TableRow>
              <TableSortCell
                active={automaticImagesOrderBy === 'label'}
                direction={automaticImagesOrder}
                handleClick={handleAutomaticImagesOrderChange}
                label="label"
              >
                Image
              </TableSortCell>
              <Hidden smDown>
                <TableCell>Status</TableCell>
              </Hidden>
              <Hidden smDown>
                <TableSortCell
                  active={automaticImagesOrderBy === 'created'}
                  direction={automaticImagesOrder}
                  handleClick={handleAutomaticImagesOrderChange}
                  label="created"
                >
                  Created
                </TableSortCell>
              </Hidden>
              <TableSortCell
                active={automaticImagesOrderBy === 'size'}
                direction={automaticImagesOrder}
                handleClick={handleAutomaticImagesOrderChange}
                label="size"
              >
                Size
              </TableSortCell>
              <Hidden smDown>
                <TableCell>Expires</TableCell>
              </Hidden>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {automaticImagesData.length > 0
              ? automaticImagesData.map((automaticImage) => (
                  <ImageRow
                    key={automaticImage.id}
                    {...automaticImage}
                    {...handlers}
                  />
                ))
              : noAutomaticImages}
          </TableBody>
        </Table>
        <PaginationFooter
          count={automaticImages?.results ?? 0}
          eventCategory="Recovery Images Table"
          handlePageChange={paginationForAutomaticImages.handlePageChange}
          handleSizeChange={paginationForAutomaticImages.handlePageSizeChange}
          page={paginationForAutomaticImages.page}
          pageSize={paginationForAutomaticImages.pageSize}
        />
      </Paper>
      {renderImageDrawer()}
      <ConfirmationDialog
        title={
          dialogAction === 'cancel'
            ? 'Cancel Upload'
            : `Delete Image ${dialog.image}`
        }
        actions={getActions}
        onClose={closeDialog}
        open={dialog.open}
      >
        {dialog.error && <Notice text={dialog.error} variant="error" />}
        <Typography>{dialogMessage}</Typography>
      </ConfirmationDialog>
    </React.Fragment>
  );
};

export default ImagesLanding;

const getImagesWithEvents = (images: Image[], events: Event[]) => {
  const itemsById = listToItemsByID(images ?? []);
  return Object.values(itemsById).reduce(
    (accum, thisImage: Image) =>
      produce(accum, (draft: any) => {
        if (!thisImage.is_public) {
          // NB: the secondary_entity returns only the numeric portion of the image ID so we have to interpolate.
          const matchingEvent = events.find(
            (thisEvent) =>
              `private/${thisEvent.secondary_entity?.id}` === thisImage.id ||
              (`private/${thisEvent.entity?.id}` === thisImage.id &&
                thisEvent.status === 'failed')
          );
          if (matchingEvent) {
            draft.push({ ...thisImage, event: matchingEvent });
          } else {
            draft.push(thisImage);
          }
        }
      }),
    []
  ) as ImageWithEvent[];
};
