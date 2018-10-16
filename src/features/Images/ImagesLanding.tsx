import { compose, pathOr } from 'ramda';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import 'rxjs/add/operator/filter';
import { Subscription } from 'rxjs/Subscription';

import Paper from '@material-ui/core/Paper';
import { StyleRulesCallback, WithStyles, withStyles } from '@material-ui/core/styles';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

import ActionsPanel from 'src/components/ActionsPanel';
import AddNewLink from 'src/components/AddNewLink';
import Button from 'src/components/Button';
import CircleProgress from 'src/components/CircleProgress';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import setDocs from 'src/components/DocsSidebar/setDocs';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import paginate, { PaginationProps } from 'src/components/Pagey';
import PaginationFooter from 'src/components/PaginationFooter';
import Placeholder from 'src/components/Placeholder';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import { Images } from 'src/documentation';
import { events$ } from 'src/events';
import { sendToast } from 'src/features/ToastNotifications/toasts';
import { deleteImage, getImages } from 'src/services/images';

import ImageRow from './ImageRow';
import ImagesDrawer from './ImagesDrawer';

type ClassNames = 'root' | 'title';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
});

interface State {
  imageDrawer: {
    open: boolean,
    mode: 'edit' | 'create' | 'restore',
    imageID?: string,
    label?: string,
    description?: string,
    selectedLinode?: string,
    selectedDisk?: string,
  };
  removeDialog: {
    open: boolean,
    submitting: boolean,
    image?: string,
    imageID?: string,
    error?: string,
  };
}

type CombinedProps = PaginationProps<Linode.Image>
  & WithStyles<ClassNames>
  & RouteComponentProps<{}>;

class ImagesLanding extends React.Component<CombinedProps, State> {
  mounted: boolean = false;

  eventsSub: Subscription;

  state: State = {
    imageDrawer: {
      open: false,
      mode: 'edit',
      label: '',
      description: '',
    },
    removeDialog: {
      open: false,
      submitting: false,
    },
  };

  static docs: Linode.Doc[] = [
    Images,
    {
      title: 'Deploy an Image to a Linode',
      src: 'https://linode.com/docs/quick-answers/linode-platform/deploy-an-image-to-a-linode/',
      body: `This QuickAnswer will show you how to deploy a Linux distribution to your Linode.`
    }
  ];

  componentDidMount() {
    this.mounted = true;

    /* request that is generated by the Pagey HOC */
    this.props.request();

    this.eventsSub = events$
      .filter(event => (
        !event._initial
        && [
          'disk_imagize',
          'image_delete',
        ].includes(event.action)
      ))
      .subscribe((event) => {
        /*
         * The reason that we're displaying toasts for creating image
         * events, opposed to display a progress bar is this:
         * 
         * On the event data, the entity.id that comes back for image
         * events is the ID of the Linode it's associated with, rather
         * than the actual image ID.
         * 
         * Because of this, there's no way to match the event entity ID
         * to any ID returned from GET /images
         * 
         * So the alternative is to display a toast when the event is done
         */
        if (event.action === 'disk_imagize' && event.status === 'finished') {
          sendToast('Image created successfully.');
          /* generated request by Pagey HOC */
          this.props.request();
        }

        if (event.action === 'image_delete' && event.status === 'notification') {
          sendToast('Image has been deleted successfully.');
          /* generated request by Pagey HOC */
          this.props.request();
        }
      });
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  openForCreate = () => {
    this.setState({
      imageDrawer: { open: true, mode: 'create', label: '', description: '', },
    });
  }

  openRemoveDialog = (image: string, imageID: string) => {
    this.setState({
      removeDialog: { open: true, image, imageID, submitting: false, error: undefined, },
    });
  }

  closeRemoveDialog = () => {
    const { removeDialog } = this.state;
    this.setState({
      removeDialog: { ...removeDialog, open: false, },
    });
  }

  openForEdit = (label: string, description: string, imageID: string) => {
    this.setState({
      imageDrawer: {
        open: true,
        mode: 'edit',
        description,
        imageID,
        label,
      }
    })
  }

  openForRestore = (imageID: string) => {
    this.setState({
      imageDrawer: {
        open: true,
        mode: 'restore',
        imageID,
      }
    })
  }

  deployNewLinode = (imageID: string) => {
    const { history } = this.props;
    history.push({
      pathname: '/linodes/create',
      state: { selectedImageId: imageID, selectedTab: 0, initTab: 1 },
    });
  }

  removeImage = () => {
    const { removeDialog } = this.state;
    if (!this.state.removeDialog.imageID) {
      this.setState({ removeDialog: { ...removeDialog, error: "Image is not available." } });
      return;
    }
    this.setState({ removeDialog: { ...removeDialog, submitting: true, errors: undefined, } });
    deleteImage(this.state.removeDialog.imageID)
      .then(() => {
        this.closeRemoveDialog();
        /**
         * request generated by the Pagey HOC.
         * 
         * We're making a request here because the image is being
         * optimisitcally deleted on the API side, so a GET to /images
         * will not return the image scheduled for deletion. This request
         * is ensuring the image is removed from the list, to prevent the user
         * from taking any action on the Image.
         */
        this.props.onDelete();
        sendToast('Image has been scheduled for deletion.');
      })
      .catch((err) => {
        const errors: Linode.ApiFieldError[] = pathOr([], ['response', 'data', 'errors'], err);
        const error: string = errors.length > 0 ? errors[0].reason : "There was an error deleting the image."
        this.setState({ removeDialog: { ...removeDialog, error } });
      })
  }

  changeSelectedLinode = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (this.state.imageDrawer.selectedLinode !== e.target.value) {
      this.setState({ imageDrawer: { ...this.state.imageDrawer, selectedDisk: 'none', selectedLinode: e.target.value } });
    }
  }

  changeSelectedDisk = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ imageDrawer: { ...this.state.imageDrawer, selectedDisk: e.target.value } });
  }

  setLabel = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ imageDrawer: { ...this.state.imageDrawer, label: e.target.value } });
  }

  setDescription = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ imageDrawer: { ...this.state.imageDrawer, description: e.target.value } });
  }

  getActions = () => {
    return (
      <ActionsPanel>
        <Button type="cancel" onClick={this.closeRemoveDialog} data-qa-cancel>Cancel</Button>
        <Button
          type="secondary"
          destructive
          loading={this.state.removeDialog.submitting}
          onClick={this.removeImage}
          data-qa-submit
        >
          Confirm
        </Button>
      </ActionsPanel>
    )
  }

  closeImageDrawer = () => {
    this.setState({ imageDrawer: { ...this.state.imageDrawer, open: false, } });
  }

  renderImageDrawer = () => {
    const { imageDrawer } = this.state;
    return <ImagesDrawer
      open={imageDrawer.open}
      mode={imageDrawer.mode}
      label={imageDrawer.label}
      description={imageDrawer.description}
      selectedDisk={imageDrawer.selectedDisk}
      selectedLinode={imageDrawer.selectedLinode}
      imageID={imageDrawer.imageID}
      changeDisk={this.changeSelectedDisk}
      changeLinode={this.changeSelectedLinode}
      changeLabel={this.setLabel}
      changeDescription={this.setDescription}
      onClose={this.closeImageDrawer}
      onSuccess={this.props.request}
    />
  }

  render() {
    const {
      error,
      data: images,
      loading,
      classes,
      count,
      page,
      pageSize,
      handlePageChange,
      handlePageSizeChange
    } = this.props;

    if (loading) {
      return this.renderLoading();
    }

    /** Error State */
    if (error) {
      return this.renderError(error);
    }

    /** Empty State */
    if (count === 0 || !images) {
      return this.renderEmpty();
    }

    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Images" />
        <Grid container justify="space-between" alignItems="flex-end" style={{ marginTop: 8 }} updateFor={[]}>
          <Grid item>
            <Typography variant="headline" data-qa-title className={classes.title}>
              Images
            </Typography>
          </Grid>
          <Grid item>
            <Grid container alignItems="flex-end">
              <Grid item>
                <AddNewLink
                  onClick={this.openForCreate}
                  label="Add an Image"
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Paper>
          <Table aria-label="List of Your Images">
            <TableHead>
              <TableRow>
                <TableCell data-qa-image-name-header>Label</TableCell>
                <TableCell data-qa-image-date-header>Date Created</TableCell>
                <TableCell data-qa-image-size-header>Size</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {images.map((image, idx) =>
                <ImageRow key={idx}
                  image={image}
                  onRestore={this.openForRestore}
                  onDeploy={this.deployNewLinode}
                  onEdit={this.openForEdit}
                  onDelete={this.openRemoveDialog}
                  updateFor={[image]} />
              )}
            </TableBody>
          </Table>
        </Paper>
        <PaginationFooter
          count={count}
          handlePageChange={handlePageChange}
          handleSizeChange={handlePageSizeChange}
          page={page}
          pageSize={pageSize}
        />
        {this.renderImageDrawer()}
        <ConfirmationDialog
          open={this.state.removeDialog.open}
          title={`Remove ${this.state.removeDialog.image}`}
          onClose={this.closeRemoveDialog}
          actions={this.getActions}
        >
          {this.state.removeDialog.error &&
            <Notice error text={this.state.removeDialog.error} />
          }
          <Typography>Are you sure you want to remove this image?</Typography>
        </ConfirmationDialog>
      </React.Fragment>
    );
  }

  renderError = (e: Error) => {
    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Images" />
        <ErrorState
          errorText="There was an error retrieving your images. Please reload and try again."
        />
      </React.Fragment>
    );
  }

  renderLoading = () => {
    return (<CircleProgress />);
  }

  renderEmpty = () => {
    return (
      <React.Fragment>
        <DocumentTitleSegment segment="Images" />
        <Placeholder
          title="Add an Image"
          copy="Adding a new image is easy. Click below to add an image."
          buttonProps={{
            onClick: this.openForCreate,
            children: 'Add an Image',
          }}
        />
        {this.renderImageDrawer()}
      </React.Fragment>
    );
  };
}

const updatedRequest = (ownProps: any, params: any, filter: any) => {
  return {
    request: () => getImages(params, { is_public: false })
      .then(response => response),
    cancel: null
  }
}

const paginated = paginate(updatedRequest);

const styled = withStyles(styles, { withTheme: true });

export default compose(
  setDocs(ImagesLanding.docs),
  withRouter,
  styled,
  paginated
)(ImagesLanding);
