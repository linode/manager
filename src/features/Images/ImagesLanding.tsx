import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { compose, pathOr } from 'ramda';
import * as Rx from 'rxjs/Rx';

import { StyleRulesCallback, Theme, WithStyles, withStyles } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

import ActionsPanel from 'src/components/ActionsPanel';
import AddNewLink from 'src/components/AddNewLink';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import setDocs from 'src/components/DocsSidebar/setDocs';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import Placeholder from 'src/components/Placeholder';
import PromiseLoader, { PromiseLoaderResponse } from 'src/components/PromiseLoader';
import Table from 'src/components/Table';
import { events$ } from 'src/events';
import { sendToast } from 'src/features/ToastNotifications/toasts';
import { deleteImage, getUserImages } from 'src/services/images';


import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

import ImageRow from './ImageRow';
import ImagesDrawer from './ImagesDrawer';

type ClassNames = 'root' | 'title';

const styles: StyleRulesCallback<ClassNames> = (theme: Theme) => ({
  root: {},
  title: {
    marginBottom: theme.spacing.unit * 2,
  },
});

interface Props { }

interface PromiseLoaderProps {
  images: PromiseLoaderResponse<Linode.Image>;
}

interface State {
  images: Linode.Image[];
  error?: Error;
  imageDrawer: {
    open: boolean,
    mode: 'edit' | 'create' | 'delete' | 'deploy',
    imageID?: string,
    label?: string,
    description?: string, 
  };
  removeDialog: {
    open: boolean,
    submitting: boolean,
    image?: string,
    imageID?: string,
    error?: string,
  };
}

type CombinedProps = Props & PromiseLoaderProps & WithStyles<ClassNames> & RouteComponentProps<{}>;

class ImagesLanding extends React.Component<CombinedProps, State> {
  mounted: boolean = false;
  eventsSub: Rx.Subscription;
  state: State = {
    images: pathOr([], ['response', 'data'], this.props.images),
    error: pathOr(undefined, ['error'], this.props.images),
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
    {
      title: 'Linode Images',
      src: 'https://linode.com/docs/platform/linode-images/',
      body: `Linode Images allows you to take snapshots of your disks, 
      and then deploy them to any Linode under your account. 
      This can be useful for bootstrapping a master image for a large deployment, 
      or retaining a disk for a configuration that you may not need running, 
      but wish to return to in the future.`,
    },
    {
      title: 'Deploy an Image to a Linode',
      src: 'https://linode.com/docs/quick-answers/linode-platform/deploy-an-image-to-a-linode/',
      body: `This QuickAnswer will show you how to deploy a Linux distribution to your Linode.`
    }
  ];

  componentDidMount() {
    this.mounted = true;
    
    this.eventsSub = events$
      .filter(event => (
        !event._initial
        && [
          'disk_imagize',
          'image_delete',
        ].includes(event.action)
      ))
      .subscribe((event) => {
        if (event.action === 'disk_imagize' && (event.status === 'finished')) {
          this.refreshImages();
        }

        if (event.action === 'image_delete') {
          sendToast(`Image ${event.entity && event.entity.label} has been deleted.`);
          this.refreshImages();
        }
      });
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  refreshImages = () => {
     getUserImages()
       .then((response) => {
        if (this.mounted) { this.setState({ images: response.data }); }
       });
  }

  componentDidCatch(error: Error) {
    this.setState({ error }, () => { scrollErrorIntoView(); });
  }

  openForCreate = () => {
    this.setState({
      imageDrawer: { open: true, mode: 'create', label: '', description: '', },
    });
  }

  removeImage = () => {
    const { removeDialog } = this.state;
    if (!this.state.removeDialog.imageID) { 
      this.setState({ removeDialog: { ...removeDialog, error: "Image is not available."}});
      return;
     }
    this.setState({ removeDialog: { ...removeDialog, submitting: true, errors: undefined, }});
    deleteImage(this.state.removeDialog.imageID)
      .then(() => {
        this.closeRemoveDialog();
        this.refreshImages();
      })
      .catch((err) => {
        const errors: Linode.ApiFieldError[] = pathOr([], ['response', 'data', 'errors'], err);
        const error: string = errors.length > 0 ? errors[0].reason : "There was an error deleting the image."
        this.setState({ removeDialog:  { ...removeDialog, error} });
      })
  }

  getActions = () => {
    return (
      <ActionsPanel>
        <Button
          variant="raised"
          type="secondary"
          destructive={true}
          loading={this.state.removeDialog.submitting}
          onClick={this.removeImage}
          data-qa-submit
        >
          Confirm
        </Button>
        <Button
          onClick={this.closeRemoveDialog}
          variant="raised"
          color="secondary"
          className="cancel"
          data-qa-cancel
        >
          Cancel
        </Button>
      </ActionsPanel>
    )
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

  closeImageDrawer = () => {
    this.setState({ imageDrawer: { open: false, mode: 'create', label: '', description: '' }});
  }

  renderImageDrawer = () => {
    return <ImagesDrawer
      open={this.state.imageDrawer.open}
      mode={this.state.imageDrawer.mode}
      label={this.state.imageDrawer.label}
      description={this.state.imageDrawer.description}
      imageID={this.state.imageDrawer.imageID}
      onClose={this.closeImageDrawer}
      onSuccess={this.refreshImages}
    />
  }

  render() {
    const { classes } = this.props;
    const { error, images } = this.state;

    /** Error State */
    if (error) {
      return <ErrorState
        errorText="There was an error retrieving your images. Please reload and try again."
      />;
    }

    /** Empty State */
    if (images.length === 0) {
      return (
        <React.Fragment>
          <Placeholder
            title="Add an Image"
            copy="Adding a new image is easy. Click below to add an image."
            buttonProps={{
              onClick: this.openForCreate,
              children: 'Add an Image',
            }}
          />
          {this.state.imageDrawer.open && this.renderImageDrawer()}
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <Grid container justify="space-between" alignItems="flex-end" style={{ marginTop: 8 }} >
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
          <Table>
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
                          onRestore={() => null}
                          onDeploy={() => null}
                          onEdit={this.openForEdit} 
                          onDelete={this.openRemoveDialog}
                          updateFor={[image]} />
              )}
            </TableBody>
          </Table>
        </Paper>
        {this.state.imageDrawer.open && this.renderImageDrawer()}
        <ConfirmationDialog
          open={this.state.removeDialog.open}
          title={`Remove ${this.state.removeDialog.image}`}
          onClose={this.closeRemoveDialog}
          actions={this.getActions}
        >
          { this.state.removeDialog.error &&
          <Notice error text={this.state.removeDialog.error} />
          }
          <Typography>Are you sure you want to remove this image?</Typography>
        </ConfirmationDialog>
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles, { withTheme: true });

const loaded = PromiseLoader<Props>({
  images: props => getUserImages(),
});

export default compose(
  setDocs(ImagesLanding.docs),
  withRouter,
  loaded,
  styled,
)(ImagesLanding);
