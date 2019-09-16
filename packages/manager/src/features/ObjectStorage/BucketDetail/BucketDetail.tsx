import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import Waypoint from 'react-waypoint';
import Breadcrumb from 'src/components/Breadcrumb';
import Box from 'src/components/core/Box';
import Divider from 'src/components/core/Divider';
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
import { getQueryParam } from 'src/utilities/queryParams';
import { ExtendedObject, extendObject } from '../utilities';
import BucketBreadcrumb from './BucketBreadcrumb';
import ObjectTableContent from './ObjectTableContent';

const page_size = 100;

type ClassNames =
  | 'divider'
  | 'objectTable'
  | 'nameColumn'
  | 'sizeColumn'
  | 'nextPageError'
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
      width: '50%'
    },
    sizeColumn: {
      width: '11%'
    },
    nextPageError: {
      marginTop: theme.spacing(3),
      textAlign: 'center',
      color: theme.color.headline
    },
    tryAgainText: {
      color: theme.palette.primary.main,
      textDecoration: 'underline',
      cursor: 'pointer'
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
  generalError?: APIError[];
  nextPageError?: APIError[];
}

export class BucketDetail extends React.Component<CombinedProps, {}> {
  state: State = {
    data: [],
    loading: false,
    allObjectsFetched: false
  };

  fetchData() {
    const { clusterId, bucketName } = this.props.match.params;
    const prefix = getQueryParam(this.props.location.search, 'prefix');

    this.setState({
      allObjectsFetched: false,
      loading: true,
      generalError: undefined,
      data: []
    });

    getObjectList(clusterId, bucketName, { delimiter, prefix, page_size })
      .then(response => {
        // If there are less results than the page size we requested, we know
        // we've reached the end of the bucket (or folder).
        const allObjectsFetched =
          response.data.length < page_size ? true : false;

        this.setState({
          loading: false,
          data: response.data.map(object => extendObject(object, prefix)),
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
    if (prevProps.location.search !== this.props.location.search) {
      this.fetchData();
    }
  }

  getNextPage() {
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

        this.setState({
          loading: false,
          data: [
            ...this.state.data,
            ...response.data.map(object => extendObject(object, prefix))
          ],
          allObjectsFetched
        });
      })
      .catch(err => {
        this.setState({
          loading: false,
          nextPage: err
        });
      });
  }

  render() {
    const { bucketName } = this.props.match.params;
    const prefix = getQueryParam(this.props.location.search, 'prefix');
    const { classes } = this.props;
    const {
      data,
      loading,
      generalError,
      nextPageError,
      allObjectsFetched
    } = this.state;

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
        <Paper className={classes.objectTable}>
          <Table removeLabelonMobile aria-label="List of Bucket Objects">
            <TableHead>
              <TableRow>
                <TableCell className={classes.nameColumn}>Object</TableCell>
                <TableCell className={classes.sizeColumn}>Size</TableCell>
                <TableCell>Last Modified</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <ObjectTableContent
                data={data}
                loading={loading}
                error={generalError}
                prefix={prefix}
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
              <Waypoint onEnter={() => this.getNextPage()}>
                <div />
              </Waypoint>
            )}
        </Paper>
        {nextPageError && (
          <Typography variant="subtitle2" className={classes.nextPageError}>
            The next objects in the list failed to load.{' '}
            <span className={classes.tryAgainText} onClick={this.getNextPage}>
              Click here to try again.
            </span>
          </Typography>
        )}

        {/* Only display this message if there were more than 100 objects to
        begin with, as a matter of UX convention. */}
        {allObjectsFetched && data.length >= 100 && (
          <Typography>You've reached the end of your bucket!</Typography>
        )}
      </>
    );
  }
}

const styled = withStyles(styles);

export default styled(BucketDetail);
