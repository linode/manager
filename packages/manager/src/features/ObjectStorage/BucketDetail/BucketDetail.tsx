import { APIError } from 'linode-js-sdk/lib/types';
import { prop, sortBy } from 'ramda';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import Waypoint from 'react-waypoint';
import ActionsPanel from 'src/components/ActionsPanel';
import Breadcrumb from 'src/components/Breadcrumb';
import Button from 'src/components/Button';
import ConfirmationDialog from 'src/components/ConfirmationDialog';
import Box from 'src/components/core/Box';
import Divider from 'src/components/core/Divider';
import Grid from 'src/components/core/Grid';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import DocumentationButton from 'src/components/DocumentationButton';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { OBJECT_STORAGE_DELIMITER as delimiter } from 'src/constants';
import { getObjectList } from 'src/services/objectStorage/buckets';
import { getObjectURL } from 'src/services/objectStorage/objects';
import { getQueryParam } from 'src/utilities/queryParams';
import { truncateMiddle } from 'src/utilities/truncate';
import ObjectUploader from '../ObjectUploader';
import { deleteObject } from '../requests';
import { displayName, ExtendedObject, extendObject } from '../utilities';
import BucketBreadcrumb from './BucketBreadcrumb';
import ObjectTableContent from './ObjectTableContent';

const page_size = 100;

type ClassNames =
  | 'divider'
  | 'tableContainer'
  | 'uploaderContainer'
  | 'objectTable'
  | 'nameColumn'
  | 'sizeColumn'
  | 'updatedColumn'
  | 'footer'
  | 'tryAgainText';

const styles = (theme: Theme) =>
  createStyles({
    divider: {
      marginTop: theme.spacing(4),
      marginBottom: theme.spacing(2),
      backgroundColor: theme.color.grey3
    },
    objectTable: {
      marginTop: theme.spacing(2)
    },
    nameColumn: {
      width: '60%'
    },
    sizeColumn: {
      width: '20%'
    },
    updatedColumn: {
      width: '20%'
    },
    footer: {
      marginTop: theme.spacing(3),
      textAlign: 'center',
      color: theme.color.headline
    },
    tryAgainText: {
      color: theme.palette.primary.main,
      textDecoration: 'underline',
      cursor: 'pointer'
    },
    tableContainer: {
      [theme.breakpoints.up('lg')]: {
        order: 1
      }
    },
    uploaderContainer: {
      [theme.breakpoints.up('lg')]: {
        order: 2
      }
    }
  });

interface MatchProps {
  clusterId: Linode.ClusterID;
  bucketName: string;
}

type CombinedProps = RouteComponentProps<MatchProps> & WithStyles<ClassNames>;

interface State {
  data: ExtendedObject[];
  loading: boolean;
  allObjectsFetched: boolean;
  deleteObjectDialogOpen: boolean;
  deleteObjectLoading: boolean;
  deleteObjectError?: string;
  generalError?: APIError[];
  nextPageError?: APIError[];
  objectToDelete?: string;
}

export class BucketDetail extends React.Component<CombinedProps, {}> {
  state: State = {
    data: [],
    loading: false,
    allObjectsFetched: false,
    deleteObjectDialogOpen: false,
    deleteObjectLoading: false,
    generalError: undefined,
    nextPageError: undefined
  };

  fetchData() {
    const { clusterId, bucketName } = this.props.match.params;
    const prefix = getQueryParam(this.props.location.search, 'prefix');

    this.setState({
      allObjectsFetched: false,
      loading: true,
      generalError: undefined,
      nextPageError: undefined,
      data: []
    });

    getObjectList(clusterId, bucketName, { delimiter, prefix, page_size })
      .then(response => {
        // If there are less results than the page size we requested, we know
        // we've reached the end of the bucket (or folder).
        const allObjectsFetched =
          response.data.length < page_size ? true : false;

        // @todo @tdt: Extract this data-manipulation logic out of this
        // component and test.
        const extendedData = response.data.map(object =>
          extendObject(object, prefix)
        );
        const sortedData = sortBy(prop('name'))(extendedData);

        this.setState({
          loading: false,
          data: sortedData,
          allObjectsFetched
        });
      })
      .catch(err => {
        this.setState({
          loading: false,
          generalError: err
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
    const { data } = this.state;
    const tail = data[data.length - 1];
    if (!tail) {
      return;
    }

    this.setState({
      loading: true,
      nextPageError: undefined
    });

    const { clusterId, bucketName } = this.props.match.params;
    const prefix = getQueryParam(this.props.location.search, 'prefix');

    getObjectList(clusterId, bucketName, {
      delimiter,
      prefix,
      // `marker` is used for Object Storage pagination. It is the name of
      // the last file of the current set. Specifying a marker will get you
      // the next page of objects after the marker.
      marker: tail.name,
      page_size
    })
      .then(response => {
        // If there are less results than the page size we requested, we know
        // we've reached the end of the bucket (or folder).
        const allObjectsFetched =
          response.data.length < page_size ? true : false;

        // @todo @tdt: Extract this data-manipulation logic out of this
        // component and test.
        const extendedData = response.data.map(object =>
          extendObject(object, prefix)
        );
        const sortedData = sortBy(prop('name'))(extendedData);

        this.setState({
          loading: false,
          data: [...this.state.data, ...sortedData],
          allObjectsFetched
        });
      })
      .catch(err => {
        this.setState({
          loading: false,
          nextPageError: err
        });
      });
  };

  handleClickDelete = (objectName: string) => {
    this.setState({
      objectToDelete: objectName,
      deleteObjectDialogOpen: true
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

      this.setState({
        deleteObjectLoading: false,
        deleteObjectDialogOpen: false
      });
      this.removeOne(objectToDelete);
    } catch (err) {
      this.setState({
        deleteObjectLoading: false,
        // We are unlikely to get back a helpful error message, so we create a
        // generic one here.
        deleteObjectError: 'Unable to delete object.'
      });
    }
  };

  removeOne = (objectName: string) => {
    const updatedData = [...this.state.data];
    const idx = updatedData.findIndex(object => object.name === objectName);
    if (idx > -1) {
      updatedData.splice(idx, 1);
      this.setState({
        data: updatedData
      });
    }
  };

  openDeleteObjectDialog = () => {
    this.setState({ deleteObjectDialogOpen: true });
  };

  updateInPlace() {
    const { bucketName, clusterId } = this.props.match.params;
    const prefix = getQueryParam(this.props.location.search, 'prefix');

    // @todo: If there are exactly 100 objects already, what do we do? Set a marker?
    getObjectList(clusterId, bucketName, { delimiter, prefix, page_size }).then(
      response => {
        // Replace the old data with the new data.
        this.setState({
          data: response.data.map(object => extendObject(object, prefix))
        });
      }
    );
    // @todo: Do we need to catch this?
  }

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
      deleteObjectDialogOpen
    } = this.state;

    const { bucketName, clusterId } = this.props.match.params;
    const prefix = getQueryParam(this.props.location.search, 'prefix');

    const numOfDisplayedObjects = this.state.data.filter(
      object => object._shouldDisplayObject
    ).length;

    return (
      <>
        <Box display="flex" flexDirection="row" justifyContent="space-between">
          <Breadcrumb
            // The actual pathname doesn't match what we want in the Breadcrumb,
            // so we create a custom one.
            pathname={`/object-storage/${bucketName}`}
            crumbOverrides={[
              {
                position: 1,
                label: 'Object Storage'
              }
            ]}
            labelOptions={{ noCap: true }}
          />
          {/* @todo: What should this link be? */}
          <DocumentationButton href="https://www.linode.com/docs/platform/object-storage/how-to-use-object-storage/" />
        </Box>
        <Divider className={classes.divider} />

        <BucketBreadcrumb
          prefix={prefix}
          history={this.props.history}
          bucketName={bucketName}
        />
        <Grid container>
          <Grid item xs={12} lg={4} className={classes.uploaderContainer}>
            <ObjectUploader
              clusterId={clusterId}
              bucketName={bucketName}
              prefix={prefix}
              update={() => this.updateInPlace()}
            />
          </Grid>
          <Grid item xs={12} lg={8} className={classes.tableContainer}>
            <>
              <Paper className={classes.objectTable}>
                <Table removeLabelonMobile aria-label="List of Bucket Objects">
                  <TableHead>
                    <TableRow>
                      <TableCell className={classes.nameColumn}>
                        Object
                      </TableCell>
                      <TableCell className={classes.sizeColumn}>Size</TableCell>
                      <TableCell>Last Modified</TableCell>
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
                      handleClickDelete={this.handleClickDelete}
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
              </Paper>
              {nextPageError && (
                <Typography variant="subtitle2" className={classes.footer}>
                  The next objects in the list failed to load.{' '}
                  <span
                    className={classes.tryAgainText}
                    onClick={this.getNextPage}
                  >
                    Click here to try again.
                  </span>
                </Typography>
              )}

              {/* Only display this message if there were more than 100 objects. */}
              {allObjectsFetched && numOfDisplayedObjects > 100 && (
                <Typography variant="subtitle2" className={classes.footer}>
                  Showing all {numOfDisplayedObjects} items
                </Typography>
              )}
              <ConfirmationDialog
                open={deleteObjectDialogOpen}
                onClose={this.openDeleteObjectDialog}
                title={
                  objectToDelete
                    ? `Delete  ${truncateMiddle(displayName(objectToDelete))}`
                    : 'Delete object'
                }
                actions={() => (
                  <ActionsPanel>
                    <Button
                      buttonType="cancel"
                      onClick={this.openDeleteObjectDialog}
                      data-qa-cancel
                    >
                      Cancel
                    </Button>
                    <Button
                      buttonType="secondary"
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
      </>
    );
  }
}

const styled = withStyles(styles);

export default styled(BucketDetail);
