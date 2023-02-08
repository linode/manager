import { Image, ImageStatus } from '@linode/api-v4/lib/images';
import { APIError } from '@linode/api-v4/lib/types';
import produce from 'immer';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import { partition } from 'ramda';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import ImageIcon from 'src/assets/icons/entityIcons/image.svg';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Hidden from 'src/components/core/Hidden';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import LandingHeader from 'src/components/LandingHeader';
import Link from 'src/components/Link';
import Notice from 'src/components/Notice';
import Placeholder from 'src/components/Placeholder';
import Table from 'src/components/Table/Table';
import TableCell from 'src/components/TableCell/TableCell';
import TableRow from 'src/components/TableRow/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableSortCell from 'src/components/TableSortCell/TableSortCell';
import { useOrder } from 'src/hooks/useOrder';
import { usePagination } from 'src/hooks/usePagination';
import { listToItemsByID } from 'src/queries/base';
import {
  queryKey,
  removeImageFromCache,
  useDeleteImageMutation,
  useImagesQuery,
} from 'src/queries/images';
import { ApplicationState } from 'src/store';
import imageEvents from 'src/store/selectors/imageEvents';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import ImageRow, { ImageWithEvent } from './ImageRow';
import { Handlers as ImageHandlers } from './ImagesActionMenu';
import ImagesDrawer, { DrawerMode } from './ImagesDrawer';

const useStyles = makeStyles((theme: Theme) => ({
  imageTable: {
    marginBottom: theme.spacing(3),
    padding: 0,
  },
  imageTableHeader: {
    padding: theme.spacing(),
    marginLeft: theme.spacing(),
  },
  imageTableSubheader: {
    marginTop: theme.spacing(),
  },
}));

interface ImageDrawerState {
  open: boolean;
  mode: DrawerMode;
  imageID?: string;
  label?: string;
  description?: string;
  selectedDisk: string | null;
  selectedLinode?: number;
}

interface ImageDialogState {
  open: boolean;
  submitting: boolean;
  image?: string;
  imageID?: string;
  error?: string;
  status?: ImageStatus;
}

type CombinedProps = ImageDrawerState &
  ImageDialogState &
  RouteComponentProps<{}> &
  WithSnackbarProps;

const defaultDrawerState = {
  open: false,
  mode: 'edit' as DrawerMode,
  label: '',
  description: '',
  selectedDisk: null,
};

const defaultDialogState = {
  open: false,
  submitting: false,
  image: '',
  imageID: '',
  error: undefined,
};

export const ImagesLanding: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const pagination = usePagination(1, queryKey);

  const { order, orderBy, handleOrderChange } = useOrder(
    {
      orderBy: 'label',
      order: 'asc',
    },
    `${queryKey}-order`
  );

  const filter = {
    ['+order_by']: orderBy,
    ['+order']: order,
  };

  const {
    data: images,
    isLoading: imagesLoading,
    error: imagesError,
  } = useImagesQuery(
    {
      page: pagination.page,
      page_size: pagination.pageSize,
    },
    filter
  );

  const { mutateAsync: deleteImage } = useDeleteImageMutation();

  const eventState = useSelector((state: ApplicationState) => state.events);
  const events = imageEvents(eventState);

  // We want private images and also want the associated events tied in.
  const imagesItemsById = listToItemsByID(images?.data ?? []);
  const imagesData = Object.values(imagesItemsById).reduce(
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

  /**
   * Separate manual Images (created by the user, either from disk or from uploaded file)
   * from automatic Images (created by the backend when a Linode is deleted).
   *
   * This is temporary until the API filtering for machine images is complete. Eventually,
   * we should retire this code and use a React query for `is_mine` && `manual` and a separate
   * query for `is_mine` && `automatic`.
   */

  const [manualImages, automaticImages] = partition(
    (thisImage) => thisImage.type === 'manual',
    imagesData ?? []
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
      open: true,
      submitting: false,
      image,
      imageID,
      error: undefined,
      status,
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
      submitting: true,
      error: undefined,
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
        props.enqueueSnackbar('Image has been scheduled for deletion.', {
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
          submitting: false,
          error: _error,
        }));
      });
  };

  const onCreateButtonClick = () => {
    props.history.push('/images/create');
  };

  const onRetryClick = (
    imageId: string,
    imageLabel: string,
    imageDescription: string
  ) => {
    removeImageFromCache();
    props.history.push('/images/create/upload', {
      imageLabel,
      imageDescription,
    });
  };

  const onCancelFailedClick = (imageId: string) => {
    removeImageFromCache();
  };

  const openForEdit = (label: string, description: string, imageID: string) => {
    setDrawer({
      open: true,
      mode: 'edit',
      description,
      imageID,
      label,
      selectedDisk: null,
    });
  };

  const openForRestore = (imageID: string) => {
    setDrawer({
      open: true,
      mode: 'restore',
      imageID,
      selectedDisk: null,
    });
  };

  const deployNewLinode = (imageID: string) => {
    const { history } = props;
    history.push({
      pathname: `/linodes/create/`,
      search: `?type=Images&imageID=${imageID}`,
      state: { selectedImageId: imageID },
    });
  };

  const changeSelectedLinode = (linodeId: number | null) => {
    setDrawer((prevDrawerState) => ({
      ...prevDrawerState,
      selectedDisk: null,
      selectedLinode: linodeId ?? undefined,
    }));
  };

  const changeSelectedDisk = (disk: string | null) => {
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
      <ActionsPanel>
        <Button buttonType="secondary" onClick={closeDialog} data-qa-cancel>
          {dialogAction === 'cancel' ? 'Keep Image' : 'Cancel'}
        </Button>
        <Button
          buttonType="primary"
          onClick={handleRemoveImage}
          loading={dialog.submitting}
          data-qa-submit
        >
          {dialogAction === 'cancel' ? 'Cancel Upload' : 'Delete Image'}
        </Button>
      </ActionsPanel>
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
        open={drawer.open}
        mode={drawer.mode}
        label={drawer.label}
        description={drawer.description}
        selectedDisk={drawer.selectedDisk}
        selectedLinode={drawer.selectedLinode || null}
        imageId={drawer.imageID}
        changeDisk={changeSelectedDisk}
        changeLinode={changeSelectedLinode}
        changeLabel={setLabel}
        changeDescription={setDescription}
        onClose={closeImageDrawer}
      />
    );
  };

  const handlers: ImageHandlers = {
    onRestore: openForRestore,
    onDeploy: deployNewLinode,
    onEdit: openForEdit,
    onDelete: openDialog,
    onRetry: onRetryClick,
    onCancelFailed: onCancelFailedClick,
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
    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Images" />
        <Placeholder
          title="Images"
          icon={ImageIcon}
          isEntity
          buttonProps={[
            {
              onClick: onCreateButtonClick,
              children: 'Create Image',
            },
          ]}
        >
          <Typography variant="subtitle1">
            Adding an image is easy. Click here to
          </Typography>
          <Typography variant="subtitle1">
            <Link to="https://linode.com/docs/platform/disk-images/linode-images-new-manager/">
              learn more about Images
            </Link>
            &nbsp;or&nbsp;
            <Link to="https://linode.com/docs/quick-answers/linode-platform/deploy-an-image-to-a-linode">
              deploy an Image to a Linode.
            </Link>
          </Typography>
        </Placeholder>
      </React.Fragment>
    );
  };

  if (imagesLoading) {
    return renderLoading();
  }

  /** Error State */
  if (imagesError) {
    return renderError(imagesError);
  }

  /** Empty States */
  if (!imagesData || imagesData.length === 0) {
    return renderEmpty();
  }

  const noManualImages = (
    <TableRowEmptyState message={`No Custom Images to display.`} colSpan={5} />
  );

  const noAutomaticImages = (
    <TableRowEmptyState
      message={`No Recovery Images to display.`}
      colSpan={6}
    />
  );

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Images" />
      <LandingHeader
        title="Images"
        entity="Image"
        onAddNew={onCreateButtonClick}
        docsLink="https://www.linode.com/docs/platform/disk-images/linode-images/"
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
                active={orderBy === 'label'}
                direction={order}
                label="Image"
                handleClick={handleOrderChange}
              >
                Image
              </TableSortCell>
              <Hidden smDown>
                <TableCell>Status</TableCell>
              </Hidden>
              <Hidden smDown>
                <TableCell>Created</TableCell>
              </Hidden>
              <TableSortCell
                active={orderBy === 'size'}
                direction={order}
                label="Size"
                handleClick={handleOrderChange}
              >
                Size
              </TableSortCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {manualImages.length > 0
              ? manualImages.map((manualImage) => (
                  <ImageRow
                    key={manualImage.id}
                    {...manualImage}
                    {...handlers}
                  />
                ))
              : noManualImages}
          </TableBody>
        </Table>
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
                active={orderBy === 'label'}
                direction={order}
                label="Image"
                handleClick={handleOrderChange}
              >
                Image
              </TableSortCell>
              <Hidden smDown>
                <TableCell>Status</TableCell>
              </Hidden>
              <Hidden smDown>
                <TableCell>Created</TableCell>
              </Hidden>
              <TableSortCell
                active={orderBy === 'size'}
                direction={order}
                label="Size"
                handleClick={handleOrderChange}
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
            {automaticImages.length > 0
              ? automaticImages.map((automaticImage) => (
                  <ImageRow
                    key={automaticImage.id}
                    {...automaticImage}
                    {...handlers}
                  />
                ))
              : noAutomaticImages}
          </TableBody>
        </Table>
      </Paper>
      {renderImageDrawer()}
      <ConfirmationDialog
        open={dialog.open}
        title={
          dialogAction === 'cancel'
            ? 'Cancel Upload'
            : `Delete Image ${dialog.image}`
        }
        onClose={closeDialog}
        actions={getActions}
      >
        {dialog.error && <Notice error text={dialog.error} />}
        <Typography>{dialogMessage}</Typography>
      </ConfirmationDialog>
    </React.Fragment>
  );
};

export default compose<CombinedProps, {}>(
  withRouter,
  withSnackbar
)(ImagesLanding);
