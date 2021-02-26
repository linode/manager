import {
  getObjectList,
  getObjectURL,
  ObjectStorageClusterID,
  ObjectStorageObject,
} from '@linode/api-v4/lib/object-storage';
import { APIError } from '@linode/api-v4/lib/types';
import { withSnackbar, WithSnackbarProps } from 'notistack';
import { prop, sortBy } from 'ramda';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Waypoint } from 'react-waypoint';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Grid from 'src/components/core/Grid';
import Hidden from 'src/components/core/Hidden';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import Table from 'src/components/Table/Table_CMR';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import { OBJECT_STORAGE_DELIMITER as delimiter } from 'src/constants';
import bucketRequestsContainer, {
  BucketsRequests,
} from 'src/containers/bucketRequests.container';
import { sendDownloadObjectEvent } from 'src/utilities/ga';
import { getQueryParam } from 'src/utilities/queryParams';
import { truncateMiddle } from 'src/utilities/truncate';
import ObjectUploader from '../ObjectUploader';
import { deleteObject } from '../requests';
import {
  displayName,
  ExtendedObject,
  extendObject,
  generateObjectUrl,
  tableUpdateAction,
} from '../utilities';
import BucketBreadcrumb from './BucketBreadcrumb';
import ObjectDetailDrawer from './ObjectDetailsDrawer';
import ObjectTableContent from './ObjectTableContent';

const page_size = 100;

type ClassNames =
  | 'tableContainer'
  | 'uploaderContainer'
  | 'objectTable'
  | 'nameColumn'
  | 'sizeColumn'
  | 'footer'
  | 'tryAgainText';

const styles = (theme: Theme) =>
  createStyles({
    objectTable: {
      marginTop: theme.spacing(2),
    },
    nameColumn: {
      width: '50%',
    },
    sizeColumn: {
      width: '10%',
    },
    footer: {
      marginTop: theme.spacing(3),
      textAlign: 'center',
      color: theme.color.headline,
    },
    tryAgainText: {
      ...theme.applyLinkStyles,
      color: theme.palette.primary.main,
      textDecoration: 'underline',
      cursor: 'pointer',
    },
  });

interface MatchProps {
  clusterId: ObjectStorageClusterID;
  bucketName: string;
}

type CombinedProps = RouteComponentProps<MatchProps> &
  WithStyles<ClassNames> &
  WithSnackbarProps &
  BucketsRequests;

interface State {
  data: ExtendedObject[];
  loading: boolean;
  allObjectsFetched: boolean;
  nextMarker: string | null;
  deleteObjectDialogOpen: boolean;
  deleteObjectLoading: boolean;
  deleteObjectError?: string;
  generalError?: APIError[];
  nextPageError?: APIError[];
  objectToDelete?: string;
  objectDetailDrawerOpen: boolean;
  selectedObject?: ExtendedObject;
}

export class BucketDetail extends React.Component<CombinedProps, State> {
  state: State = {
    data: [],
    loading: false,
    allObjectsFetched: false,
    nextMarker: null,
    deleteObjectDialogOpen: false,
    deleteObjectLoading: false,
    generalError: undefined,
    nextPageError: undefined,
    objectDetailDrawerOpen: false,
  };

  fetchData() {
    const { clusterId, bucketName } = this.props.match.params;
    const prefix = getQueryParam(this.props.location.search, 'prefix');

    this.setState({
      loading: true,
      generalError: undefined,
      nextPageError: undefined,
      data: [],
    });

    getObjectList(clusterId, bucketName, { delimiter, prefix, page_size })
      .then(response => {
        // If there are less results than the page size we requested, we know
        // we've reached the end of the bucket (or folder).
        const allObjectsFetched = !response.is_truncated;

        // @todo @tdt: Extract this data-manipulation logic out of this
        // component and test.
        const extendedData = response.data.map(object =>
          extendObject(object, prefix)
        );

        this.setState({
          loading: false,
          data: extendedData,
          allObjectsFetched,
          nextMarker: response.next_marker,
        });
      })
      .catch(err => {
        this.setState({
          loading: false,
          generalError: err,
        });
      });
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate(prevProps: CombinedProps) {
    // Request new data when the prefix changes.
    const prevPrefix = getQueryParam(prevProps.location.search, 'prefix');
    const nextPrefix = getQueryParam(this.props.location.search, 'prefix');
    if (prevPrefix !== nextPrefix) {
      this.fetchData();
    }
  }

  getNextPage = () => {
    const { nextMarker } = this.state;

    // If we don't have a nextMarker, there isn't another page to get.
    // This probably won't happen.
    if (!nextMarker) {
      return;
    }

    this.setState({
      loading: true,
      nextPageError: undefined,
    });

    const { clusterId, bucketName } = this.props.match.params;
    const prefix = getQueryParam(this.props.location.search, 'prefix');

    getObjectList(clusterId, bucketName, {
      delimiter,
      prefix,
      // `marker` is used for Object Storage pagination. It is the name of
      // the last file of the current set. Specifying a marker will get you
      // the next page of objects after the marker.
      marker: nextMarker,
      page_size,
    })
      .then(response => {
        const allObjectsFetched = !response.is_truncated;

        // @todo @tdt: Extract this data-manipulation logic out of this
        // component and test.
        const extendedData = response.data.map(object =>
          extendObject(object, prefix)
        );
        const sortedData = sortBy(prop('name'))(extendedData);

        this.setState({
          loading: false,
          data: [...this.state.data, ...sortedData],
          allObjectsFetched,
          nextMarker: response.next_marker,
        });
      })
      .catch(err => {
        this.setState({
          loading: false,
          nextPageError: err,
        });
      });
  };

  handleDownload = async (objectName: string) => {
    const { clusterId, bucketName } = this.props.match.params;

    try {
      const { url } = await getObjectURL(
        clusterId,
        bucketName,
        objectName,
        'GET',
        // Force download with content_disposition: attachment
        { content_disposition: 'attachment' }
      );

      sendDownloadObjectEvent();

      window.location.assign(url);
    } catch (err) {
      this.props.enqueueSnackbar('Error downloading Object', {
        variant: 'error',
      });
    }
  };

  handleClickDelete = (objectName: string) => {
    this.setState({
      objectToDelete: objectName,
      deleteObjectError: undefined,
      deleteObjectDialogOpen: true,
    });
  };

  handleClickDetails = (selectedObject: ExtendedObject) => {
    this.setState({
      selectedObject,
      objectDetailDrawerOpen: true,
    });
  };

  deleteObject = async () => {
    const { clusterId, bucketName } = this.props.match.params;
    const { objectToDelete } = this.state;

    if (!objectToDelete) {
      return;
    }

    this.setState({ deleteObjectLoading: true, deleteObjectError: undefined });

    try {
      const { url } = await getObjectURL(
        clusterId,
        bucketName,
        objectToDelete,
        'DELETE'
      );

      await deleteObject(url);
      // Request the Bucket again so the updated size is reflected on the Bucket Landing page.
      this.props
        .getBucket({ cluster: clusterId, label: bucketName })
        // It's OK to swallow the error here, since this request is for a silent UI update.
        .catch(_ => null);

      this.setState({
        deleteObjectLoading: false,
        deleteObjectDialogOpen: false,
      });
      this.removeOne(objectToDelete);
    } catch (err) {
      this.setState({
        deleteObjectLoading: false,
        // We are unlikely to get back a helpful error message, so we create a
        // generic one here.
        deleteObjectError: 'Unable to delete object.',
      });
    }
  };

  removeOne = (objectName: string) => {
    const updatedData = [...this.state.data];
    const idx = updatedData.findIndex(object => object.name === objectName);
    if (idx > -1) {
      updatedData.splice(idx, 1);
      this.setState({
        data: updatedData,
      });
    }
  };

  maybeAddObjectToTable = (path: string, sizeInBytes: number) => {
    const prefix = getQueryParam(this.props.location.search, 'prefix');
    const action = tableUpdateAction(prefix, path);
    if (action) {
      if (action.type === 'FILE') {
        this.addOneFile(action.name, sizeInBytes);
      } else {
        this.addOneFolder(action.name);
      }
    }
  };

  addOneFile = (objectName: string, sizeInBytes: number) => {
    const prefix = getQueryParam(this.props.location.search, 'prefix');

    const object: ObjectStorageObject = {
      name: prefix + objectName,
      etag: '',
      owner: '',
      last_modified: new Date().toISOString(),
      size: sizeInBytes,
    };

    const extendedObject = extendObject(object, prefix, true);

    const updatedFiles = [...this.state.data];

    // If the file already exists in `data` (i.e. if the file is being
    // overwritten), move it from its current location to the front.
    const idx = updatedFiles.findIndex(
      file => file.name === prefix + objectName
    );
    if (idx > -1) {
      updatedFiles.splice(idx, 1);
      updatedFiles.unshift(extendedObject);
      this.setState({ data: updatedFiles });
    } else {
      this.setState({
        data: [extendedObject, ...this.state.data],
      });
    }
  };

  addOneFolder = (objectName: string) => {
    const prefix = getQueryParam(this.props.location.search, 'prefix');

    const folder: ObjectStorageObject = {
      name: prefix + objectName + '/',
      etag: null,
      owner: null,
      last_modified: null,
      size: null,
    };

    const extendedFolder = extendObject(folder, prefix, true);

    const idx = this.state.data.findIndex(
      object => object.name === prefix + objectName + '/'
    );
    // If the folder isn't already in `data`, add it to the front.
    if (idx === -1) {
      this.setState({ data: [extendedFolder, ...this.state.data] });
    }
  };

  closeDeleteObjectDialog = () => {
    this.setState({
      deleteObjectDialogOpen: false,
    });
  };

  closeObjectDetailsDrawer = () => {
    this.setState({ objectDetailDrawerOpen: false });
  };

  render() {
    const { classes } = this.props;
    const {
      data,
      loading,
      generalError,
      nextPageError,
      allObjectsFetched,
      objectToDelete,
      deleteObjectLoading,
      deleteObjectError,
      deleteObjectDialogOpen,
      selectedObject,
      objectDetailDrawerOpen,
    } = this.state;

    const { bucketName, clusterId } = this.props.match.params;
    const prefix = getQueryParam(this.props.location.search, 'prefix');

    const numOfDisplayedObjects = this.state.data.filter(
      object => object._shouldDisplayObject
    ).length;

    return (
      <>
        <BucketBreadcrumb
          prefix={prefix}
          history={this.props.history}
          bucketName={bucketName}
        />
        <Grid container>
          <Grid item xs={12}>
            <ObjectUploader
              clusterId={clusterId}
              bucketName={bucketName}
              prefix={prefix}
              maybeAddObjectToTable={this.maybeAddObjectToTable}
            />
          </Grid>
          <Grid item xs={12}>
            <>
              <div className={classes.objectTable}>
                <Table aria-label="List of Bucket Objects">
                  <TableHead>
                    <TableRow>
                      <TableCell className={classes.nameColumn}>
                        Object
                      </TableCell>
                      <TableCell className={classes.sizeColumn}>Size</TableCell>
                      <Hidden smDown>
                        <TableCell>Last Modified</TableCell>
                      </Hidden>
                      {/* Empty TableCell for Action Menu */}
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <ObjectTableContent
                      data={data}
                      loading={loading}
                      error={generalError}
                      prefix={prefix}
                      handleClickDownload={this.handleDownload}
                      handleClickDelete={this.handleClickDelete}
                      handleClickDetails={this.handleClickDetails}
                    />
                  </TableBody>
                </Table>
                {/* We shouldn't allow infinite scrolling if we're still loading,
                if we've gotten all objects in the bucket (or folder), or if there
                are errors. */}
                {!loading &&
                  !allObjectsFetched &&
                  !generalError &&
                  !nextPageError &&
                  data.length >= 100 && (
                    <Waypoint onEnter={this.getNextPage}>
                      <div />
                    </Waypoint>
                  )}
              </div>
              {nextPageError && (
                <Typography variant="subtitle2" className={classes.footer}>
                  The next objects in the list failed to load.{' '}
                  <button
                    className={classes.tryAgainText}
                    onClick={this.getNextPage}
                  >
                    Click here to try again.
                  </button>
                </Typography>
              )}

              {allObjectsFetched && numOfDisplayedObjects >= 100 && (
                <Typography variant="subtitle2" className={classes.footer}>
                  Showing all {numOfDisplayedObjects} items
                </Typography>
              )}
              <ConfirmationDialog
                open={deleteObjectDialogOpen}
                onClose={this.closeDeleteObjectDialog}
                title={
                  objectToDelete
                    ? `Delete  ${truncateMiddle(displayName(objectToDelete))}`
                    : 'Delete object'
                }
                actions={() => (
                  <ActionsPanel>
                    <Button
                      buttonType="cancel"
                      onClick={this.closeDeleteObjectDialog}
                      data-qa-cancel
                    >
                      Cancel
                    </Button>
                    <Button
                      buttonType="primary"
                      destructive
                      onClick={this.deleteObject}
                      data-qa-submit-rebuild
                      loading={deleteObjectLoading}
                    >
                      Delete
                    </Button>
                  </ActionsPanel>
                )}
                error={deleteObjectError}
              >
                Are you sure you want to delete this object?
              </ConfirmationDialog>
            </>
          </Grid>
        </Grid>
        <ObjectDetailDrawer
          open={objectDetailDrawerOpen}
          onClose={this.closeObjectDetailsDrawer}
          bucketName={bucketName}
          clusterId={clusterId}
          displayName={selectedObject?._displayName}
          name={selectedObject?.name}
          lastModified={selectedObject?.last_modified}
          size={selectedObject?.size}
          url={
            selectedObject
              ? generateObjectUrl(clusterId, bucketName, selectedObject.name)
                  .absolute
              : undefined
          }
        />
      </>
    );
  }
}

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, RouteComponentProps<MatchProps>>(
  styled,
  withSnackbar,
  bucketRequestsContainer
);

export default enhanced(BucketDetail);
