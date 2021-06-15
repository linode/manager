import { Image, ImageStatus } from '@linode/api-v4/lib/images';
import { APIError } from '@linode/api-v4/lib/types';
import produce from 'immer';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import { partition } from 'ramda';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import ImageIcon from 'src/assets/icons/entityIcons/image.svg';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { EntityTableRow, HeaderCell } from 'src/components/EntityTable';
import EntityTable from 'src/components/EntityTable/EntityTable_CMR';
import ErrorState from 'src/components/ErrorState';
import LandingHeader from 'src/components/LandingHeader';
import Link from 'src/components/Link';
import Notice from 'src/components/Notice';
import { Order } from 'src/components/Pagey';
import Placeholder from 'src/components/Placeholder';
import useReduxLoad from 'src/hooks/useReduxLoad';
import { ApplicationState } from 'src/store';
import { DeleteImagePayload } from 'src/store/image/image.actions';
import {
  deleteImage as _deleteImage,
  requestImages as _requestImages,
} from 'src/store/image/image.requests';
import imageEvents from 'src/store/selectors/imageEvents';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import ImageRow, { ImageWithEvent } from './ImageRow';
import { Handlers as ImageHandlers } from './ImagesActionMenu';
import ImagesDrawer, { DrawerMode } from './ImagesDrawer';
import ImagesPricingBanner from './ImagesPricingBanner';
import ImageUploadSuccessDialog from './ImageUploadSuccessDialog';

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

/**
 * @todo remove conditional cell sizes when we're no longer relying on a flag here.
 */
const getHeaders = (
  tableType: 'automatic' | 'manual',
  flagEnabled: boolean = true
): HeaderCell[] =>
  [
    {
      label: 'Image',
      dataColumn: 'label',
      sortable: true,
      widthPercent: flagEnabled ? 20 : 25,
    },
    flagEnabled
      ? {
          label: 'Status',
          dataColumn: 'status',
          sortable: true,
          widthPercent: 15,
          hideOnMobile: true,
        }
      : null,
    {
      label: 'Created',
      dataColumn: 'created',
      sortable: false,
      widthPercent: flagEnabled ? 15 : 20,
      hideOnMobile: true,
    },
    {
      label: 'Size',
      dataColumn: 'size',
      sortable: true,
      widthPercent: flagEnabled ? 15 : 20,
    },
    tableType === 'automatic'
      ? {
          label: 'Expires',
          dataColumn: 'expires',
          sortable: false,
          widthPercent: 15,
          hideOnMobile: true,
        }
      : null,
    {
      label: 'Action Menu',
      visuallyHidden: true,
      dataColumn: '',
      sortable: false,
      widthPercent: 35,
    },
  ].filter(Boolean) as HeaderCell[];

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

type CombinedProps = ImageDispatch &
  ImageDrawerState &
  ImageDialogState &
  RouteComponentProps<{}> &
  WithPrivateImages &
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
  useReduxLoad(['images']);

  const classes = useStyles();
  const {
    imagesData,
    imagesLoading,
    imagesError,
    deleteImage,
    history,
    location,
  } = props;

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

  const [successDialogOpen, setSuccessDialogOpen] = React.useState(false);
  const [uploadURL, setUploadURL] = React.useState<string | undefined>();

  const handleCloseSuccessDialog = () => {
    setSuccessDialogOpen(false);
    window.setTimeout(() => setUploadURL(undefined), 500);
    history.replace({ state: undefined });
  };

  React.useEffect(() => {
    if (location.state?.upload_url) {
      setSuccessDialogOpen(true);
      setUploadURL(location.state.upload_url);
    }
  }, [location]);

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

    deleteImage({ imageID: dialog.imageID! })
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
        <Button buttonType="cancel" onClick={closeDialog} data-qa-cancel>
          {dialogAction === 'cancel' ? 'Keep Image' : 'Cancel'}
        </Button>
        <Button
          buttonType="primary"
          destructive
          loading={dialog.submitting}
          onClick={handleRemoveImage}
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
        imageID={drawer.imageID}
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
  };

  // @todo remove this check after Machine Images is in GA
  // This is used instead of a feature flag, since there is no
  // customer tag for this feature; if status is returned from the API,
  // we want to include it in the table.
  const machineImagesEnabled = imagesData.some((thisImage) =>
    thisImage.hasOwnProperty('status')
  );

  const manualHeaders = getHeaders('manual', machineImagesEnabled);
  const automaticHeaders = getHeaders('automatic', machineImagesEnabled);

  const initialOrder = {
    order: 'asc' as Order,
    orderBy: 'label',
  };

  const manualImageRow: EntityTableRow<Image> = {
    Component: ImageRow,
    data: manualImages,
    loading: false,
    lastUpdated: 100,
    handlers,
  };

  const autoImageRow: EntityTableRow<Image> = {
    Component: ImageRow,
    data: automaticImages,
    loading: false,
    lastUpdated: 100,
    handlers,
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

  /** Empty State */
  if (!imagesData || imagesData.length === 0) {
    return renderEmpty();
  }

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Images" />
      <ImagesPricingBanner />
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
            {machineImagesEnabled
              ? `These are images you manually uploaded or captured from an existing Linode disk.`
              : `These are images you captured from an existing Linode disk.`}
          </Typography>
        </div>
        <EntityTable
          entity="image"
          row={manualImageRow}
          headers={manualHeaders}
          emptyMessage={'No Custom Images to display.'}
          initialOrder={initialOrder}
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
        <EntityTable
          entity="image"
          row={autoImageRow}
          headers={automaticHeaders}
          emptyMessage={'No Recovery Images to display.'}
          initialOrder={initialOrder}
        />
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
      <ImageUploadSuccessDialog
        isOpen={successDialogOpen}
        onClose={handleCloseSuccessDialog}
        url={uploadURL ?? ''}
      />
    </React.Fragment>
  );
};
interface WithPrivateImages {
  imagesData: ImageWithEvent[];
  imagesLoading: boolean;
  imagesError?: APIError[];
  imagesLastUpdated: number;
}

interface ImageDispatch {
  deleteImage: (imageID: DeleteImagePayload) => Promise<{}>;
  requestImages: () => Promise<Image[]>;
}

const mapDispatchToProps: MapDispatchToProps<ImageDispatch, {}> = (
  dispatch: ThunkDispatch<ApplicationState, undefined, AnyAction>
) => ({
  deleteImage: (imageID: DeleteImagePayload) => dispatch(_deleteImage(imageID)),
  requestImages: () => dispatch(_requestImages()),
});

const withPrivateImages = connect(
  (state: ApplicationState): WithPrivateImages => {
    const { error, itemsById, lastUpdated, loading } = state.__resources.images;
    const events = imageEvents(state.events);
    const privateImagesWithEvents = Object.values(itemsById).reduce(
      (accum, thisImage) =>
        produce(accum, (draft) => {
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
      [] as ImageWithEvent[]
    );
    return {
      imagesData: privateImagesWithEvents,
      imagesLoading: loading,
      imagesError: error?.read,
      imagesLastUpdated: lastUpdated,
    };
  },
  mapDispatchToProps
);

export default compose<CombinedProps, {}>(
  withPrivateImages,
  withRouter,
  withSnackbar
)(ImagesLanding);
