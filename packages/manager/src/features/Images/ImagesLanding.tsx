import produce from 'immer';
import { deleteImage, Image } from '@linode/api-v4/lib/images';
import { APIError } from '@linode/api-v4/lib/types';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import 'rxjs/add/operator/filter';
import { Subscription } from 'rxjs/Subscription';
import ActionsPanel from 'src/components/ActionsPanel';
import AddNewLink from 'src/components/AddNewLink';
import Breadcrumb from 'src/components/Breadcrumb';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import EntityTable, {
  EntityTableRow,
  HeaderCell
} from 'src/components/EntityTable';
import EntityTable_CMR from 'src/components/EntityTable/EntityTable_CMR';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import LandingHeader from 'src/components/LandingHeader';
import Notice from 'src/components/Notice';
import Placeholder from 'src/components/Placeholder';
import withFeatureFlags, {
  FeatureFlagConsumerProps
} from 'src/containers/withFeatureFlagConsumer.container.ts';
import { ApplicationState } from 'src/store';
import { requestImages as _requestImages } from 'src/store/image/image.requests';
import imageEvents from 'src/store/selectors/imageEvents';
import { getErrorStringOrDefault } from 'src/utilities/errorUtils';
import ImageRow, { ImageWithEvent } from './ImageRow';
import ImageRow_CMR from './ImageRow_CMR';
import { Handlers as ImageHandlers } from './ImagesActionMenu';
import ImagesDrawer, { DrawerMode } from './ImagesDrawer';

type ClassNames = 'root' | 'title';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    title: {
      marginBottom: theme.spacing(1) + theme.spacing(1) / 2
    }
  });

interface State {
  imageDrawer: {
    open: boolean;
    mode: DrawerMode;
    imageID?: string;
    label?: string;
    description?: string;
    selectedDisk: string | null;
    selectedLinode?: number;
  };
  removeDialog: {
    open: boolean;
    submitting: boolean;
    image?: string;
    imageID?: string;
    error?: string;
  };
}

type CombinedProps = FeatureFlagConsumerProps &
  ImageDispatch &
  RouteComponentProps<{}> &
  WithPrivateImages &
  WithSnackbarProps &
  WithStyles<ClassNames>;

const headers: HeaderCell[] = [
  {
    label: 'Image',
    dataColumn: 'label',
    sortable: true,
    widthPercent: 25
  },
  {
    label: 'Created',
    dataColumn: 'created',
    sortable: false,
    widthPercent: 25
  },
  {
    label: 'Expires',
    dataColumn: 'expires',
    sortable: false,
    widthPercent: 15
  },
  {
    label: 'Size',
    dataColumn: 'size',
    sortable: true,
    widthPercent: 25
  },
  {
    label: 'Action Menu',
    visuallyHidden: true,
    dataColumn: '',
    sortable: false,
    widthPercent: 5
  }
];

class ImagesLanding extends React.Component<CombinedProps, State> {
  eventsSub: Subscription;

  state: State = {
    imageDrawer: {
      open: false,
      mode: 'edit',
      label: '',
      description: '',
      selectedDisk: null
    },
    removeDialog: {
      open: false,
      submitting: false
    }
  };

  componentDidMount() {
    if (this.props.imagesLastUpdated === 0 && !this.props.imagesLoading) {
      this.props.requestImages();
    }
  }

  openForCreate = () => {
    this.setState({
      imageDrawer: {
        open: true,
        mode: 'create',
        label: '',
        description: '',
        selectedDisk: null
      }
    });
  };

  openRemoveDialog = (image: string, imageID: string) => {
    this.setState({
      removeDialog: {
        open: true,
        image,
        imageID,
        submitting: false,
        error: undefined
      }
    });
  };

  closeRemoveDialog = () => {
    const { removeDialog } = this.state;
    this.setState({
      removeDialog: { ...removeDialog, open: false }
    });
  };

  openForEdit = (label: string, description: string, imageID: string) => {
    this.setState({
      imageDrawer: {
        open: true,
        mode: 'edit',
        description,
        imageID,
        label,
        selectedDisk: null
      }
    });
  };

  openForRestore = (imageID: string) => {
    this.setState({
      imageDrawer: {
        open: true,
        mode: 'restore',
        imageID,
        selectedDisk: null
      }
    });
  };

  deployNewLinode = (imageID: string) => {
    const { history } = this.props;
    history.push({
      pathname: `/linodes/create/`,
      search: `?type=My%20Images&imageID=${imageID}`,
      state: { selectedImageId: imageID }
    });
  };

  removeImage = () => {
    const { removeDialog } = this.state;
    if (!this.state.removeDialog.imageID) {
      this.setState({
        removeDialog: { ...removeDialog, error: 'Image is not available.' }
      });
      return;
    }
    this.setState({
      removeDialog: {
        ...(removeDialog as any),
        submitting: true,
        errors: undefined
      }
    });
    deleteImage(this.state.removeDialog.imageID)
      .then(() => {
        this.closeRemoveDialog();
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
        this.props.enqueueSnackbar('Image has been scheduled for deletion.', {
          variant: 'info'
        });
      })
      .catch(err => {
        const error = getErrorStringOrDefault(
          err,
          'There was an error deleting the image.'
        );
        this.setState({ removeDialog: { ...removeDialog, error } });
      });
  };

  changeSelectedLinode = (linodeId: number | null) => {
    if (!linodeId) {
      this.setState({
        imageDrawer: {
          ...this.state.imageDrawer,
          selectedDisk: null,
          selectedLinode: undefined
        }
      });
    }
    if (this.state.imageDrawer.selectedLinode !== linodeId) {
      this.setState({
        imageDrawer: {
          ...this.state.imageDrawer,
          selectedDisk: null,
          selectedLinode: linodeId!
        }
      });
    }
  };

  changeSelectedDisk = (disk: string | null) => {
    this.setState({
      imageDrawer: { ...this.state.imageDrawer, selectedDisk: disk }
    });
  };

  setLabel = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      imageDrawer: { ...this.state.imageDrawer, label: e.target.value }
    });
  };

  setDescription = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      imageDrawer: { ...this.state.imageDrawer, description: e.target.value }
    });
  };

  getActions = () => {
    return (
      <ActionsPanel>
        <Button
          buttonType="cancel"
          onClick={this.closeRemoveDialog}
          data-qa-cancel
        >
          Cancel
        </Button>
        <Button
          buttonType="secondary"
          destructive
          loading={this.state.removeDialog.submitting}
          onClick={this.removeImage}
          data-qa-submit
        >
          Confirm
        </Button>
      </ActionsPanel>
    );
  };

  closeImageDrawer = () => {
    this.setState({ imageDrawer: { ...this.state.imageDrawer, open: false } });
  };

  renderImageDrawer = () => {
    const { imageDrawer } = this.state;
    return (
      <ImagesDrawer
        open={imageDrawer.open}
        mode={imageDrawer.mode}
        label={imageDrawer.label}
        description={imageDrawer.description}
        selectedDisk={imageDrawer.selectedDisk}
        selectedLinode={imageDrawer.selectedLinode || null}
        imageID={imageDrawer.imageID}
        changeDisk={this.changeSelectedDisk}
        changeLinode={this.changeSelectedLinode}
        changeLabel={this.setLabel}
        changeDescription={this.setDescription}
        onClose={this.closeImageDrawer}
      />
    );
  };

  render() {
    const {
      classes,
      flags,
      imagesData,
      imagesLoading,
      imagesError
    } = this.props;

    const Table = flags.cmr ? EntityTable_CMR : EntityTable;

    const handlers: ImageHandlers = {
      onRestore: this.openForRestore,
      onDeploy: this.deployNewLinode,
      onEdit: this.openForEdit,
      onDelete: this.openRemoveDialog
    };

    const imageRow: EntityTableRow<Image> = {
      Component: flags.cmr ? ImageRow_CMR : ImageRow,
      data: imagesData ?? [],
      handlers
    };

    if (imagesLoading) {
      return this.renderLoading();
    }

    /** Error State */
    if (imagesError) {
      return this.renderError(imagesError);
    }

    /** Empty State */
    if (!imagesData || imagesData.length === 0) {
      return this.renderEmpty();
    }

    return (
      <React.Fragment>
        {flags.cmr ? (
          // @todo CMR needs an icon for Images
          <LandingHeader
            title="Images"
            entity="Image"
            onAddNew={this.openForCreate}
            docsLink="https://www.linode.com/docs/platform/disk-images/linode-images/"
          />
        ) : (
          <>
            <DocumentTitleSegment segment="Images" />
            <Grid
              container
              justify="space-between"
              alignItems="flex-end"
              updateFor={[classes]}
              style={{ paddingBottom: 0 }}
            >
              <Grid item>
                <Breadcrumb
                  pathname={this.props.location.pathname}
                  labelTitle="Images"
                  className={classes.title}
                />
              </Grid>
              <Grid item>
                <Grid container alignItems="flex-end">
                  <Grid item className="pt0">
                    <AddNewLink
                      onClick={this.openForCreate}
                      label="Add an Image"
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </>
        )}
        <Paper>
          <Table
            entity="image"
            groupByTag={false}
            row={imageRow}
            headers={headers}
          />
        </Paper>
        {this.renderImageDrawer()}
        <ConfirmationDialog
          open={this.state.removeDialog.open}
          title={`Remove ${this.state.removeDialog.image}`}
          onClose={this.closeRemoveDialog}
          actions={this.getActions}
        >
          {this.state.removeDialog.error && (
            <Notice error text={this.state.removeDialog.error} />
          )}
          <Typography>Are you sure you want to remove this image?</Typography>
        </ConfirmationDialog>
      </React.Fragment>
    );
  }

  renderError = (_: APIError[]) => {
    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Images" />
        <ErrorState errorText="There was an error retrieving your images. Please reload and try again." />
      </React.Fragment>
    );
  };

  renderLoading = () => {
    return <CircleProgress />;
  };

  renderEmpty = () => {
    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Images" />
        <Placeholder
          title="Add an Image"
          copy={<EmptyCopy />}
          buttonProps={[
            {
              onClick: this.openForCreate,
              children: 'Add an Image'
            }
          ]}
        />
        {this.renderImageDrawer()}
      </React.Fragment>
    );
  };
}

const EmptyCopy = () => (
  <>
    <Typography variant="subtitle1">
      Adding an image is easy. Click here to
    </Typography>
    <Typography variant="subtitle1">
      <a
        href="https://linode.com/docs/platform/disk-images/linode-images-new-manager/"
        target="_blank"
        aria-describedby="external-site"
        rel="noopener noreferrer"
        className="h-u"
      >
        learn more about Images
      </a>
      &nbsp;or&nbsp;
      <a
        href="https://linode.com/docs/quick-answers/linode-platform/deploy-an-image-to-a-linode"
        target="_blank"
        aria-describedby="external-site"
        rel="noopener noreferrer"
        className="h-u"
      >
        deploy an Image to a Linode.
      </a>
    </Typography>
  </>
);
interface WithPrivateImages {
  imagesData: ImageWithEvent[];
  imagesLoading: boolean;
  imagesError?: APIError[];
  imagesLastUpdated: number;
}

interface ImageDispatch {
  requestImages: () => Promise<Image[]>;
}

const mapDispatchToProps: MapDispatchToProps<ImageDispatch, {}> = (
  dispatch: ThunkDispatch<ApplicationState, undefined, AnyAction>
) => ({
  requestImages: () => dispatch(_requestImages())
});

const withPrivateImages = connect(
  (state: ApplicationState): WithPrivateImages => {
    const { error, itemsById, lastUpdated, loading } = state.__resources.images;
    const events = imageEvents(state.events);
    const privateImagesWithEvents = Object.values(itemsById).reduce(
      (accum, thisImage) =>
        produce(accum, draft => {
          if (!thisImage.is_public) {
            // NB: the secondary_entity returns only the numeric portion of the image ID so we have to interpolate.
            const matchingEvent = events.find(
              thisEvent =>
                thisEvent.secondary_entity &&
                `private/${thisEvent.secondary_entity.id}` === thisImage.id
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
      imagesLastUpdated: lastUpdated
    };
  },
  mapDispatchToProps
);

const styled = withStyles(styles);

export default compose<CombinedProps, {}>(
  styled,
  withFeatureFlags,
  withPrivateImages,
  withRouter,
  withSnackbar
)(ImagesLanding);
