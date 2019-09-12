import { APIError } from 'linode-js-sdk/lib/types';
import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import Waypoint from 'react-waypoint';
import Breadcrumb from 'src/components/Breadcrumb';
import Box from 'src/components/core/Box';
import Divider from 'src/components/core/Divider';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import DocumentationButton from 'src/components/DocumentationButton';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { OBJECT_STORAGE_DELIMITER as delimiter } from 'src/constants';
import reloadableWithRouter from 'src/features/linodes/LinodesDetail/reloadableWithRouter';
import { getObjectList } from 'src/services/objectStorage/buckets';
import { getQueryParam } from 'src/utilities/queryParams';
import { ExtendedObject, extendObject } from '../utilities';
import ObjectTableContent from './ObjectTableContent';

const page_size = 100;

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  divider: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2),
    backgroundColor: theme.color.grey3
  },
  objectTable: {
    marginTop: theme.spacing(4)
  },
  objectNameColumn: {
    width: '50%'
  }
}));

interface MatchProps {
  clusterId: Linode.ClusterID;
  bucketName: string;
}

type CombinedProps = RouteComponentProps<MatchProps>;

const BucketDetail: React.FC<CombinedProps> = props => {
  const { clusterId, bucketName } = props.match.params;

  const [data, setData] = React.useState<ExtendedObject[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  const [generalError, setGeneralError] = React.useState<
    APIError[] | undefined
  >(undefined);

  // Errors that happen when fetching the next page should be kept separate,
  // since we don't want to bomb the whole object listing table.
  const [nextPageError, setNextPageError] = React.useState<
    APIError[] | undefined
  >(undefined);

  // This lets us know if we've reached the end of our bucket or folder,
  // so that we don't allow for more infinite scrolling.
  const [allObjectsFetched, setAllObjectsFetched] = React.useState<boolean>(
    false
  );

  // The prefix is used to organize objects in a bucket. We grab it from a
  // query param so that it can be bookmarked.
  const prefix = React.useMemo(
    () => getQueryParam(props.location.search, 'prefix'),
    [props.location.search]
  );

  /**
   * Request objects when the prefix changes. This happens under two conditions:
   *
   * 1. When the component mounts.
   * 2. When a folder is clicked (since a query param is added to the URL).
   *
   * The new data REPLACES the old data, since objects in one "folder" shouldn't
   * be in the same table as objects in a different "folder"
   */
  React.useEffect(() => {
    setAllObjectsFetched(false);
    setLoading(true);
    setGeneralError(undefined);
    setData([]);
    getObjectList(clusterId, bucketName, { delimiter, prefix, page_size })
      .then(response => {
        setLoading(false);

        // If there are less results than the page size we requested, we know
        // we've reached the end of the bucket (or folder).
        if (response.data.length < page_size) {
          setAllObjectsFetched(true);
        }

        // Replace the old data with the new data.
        setData(response.data.map(object => extendObject(object, prefix)));
      })
      .catch(err => {
        setLoading(false);
        setGeneralError(err);
      });
  }, [prefix, clusterId, bucketName]);

  /**
   * Request additional objects when the next page is requested.
   * The new objects are appended to the existing objects.
   */
  const getNextPage = () => {
    const tail = data[data.length - 1];
    if (!tail) {
      return;
    }

    setLoading(true);
    setNextPageError(undefined);

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
        setLoading(false);

        // If there are less results than the page size we requested, we know
        // we've reached the end of the bucket (or folder).
        if (response.data.length < page_size) {
          setAllObjectsFetched(true);
        }

        // Append the old data with the new data.
        setData([
          ...data,
          ...response.data.map(object => extendObject(object, prefix))
        ]);
      })
      .catch(err => {
        setLoading(false);
        setNextPageError(err);
      });
  };

  const classes = useStyles();
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
      <Paper className={classes.objectTable}>
        <Table removeLabelonMobile aria-label="List of Bucket Objects">
          <TableHead>
            <TableRow>
              <TableCell className={classes.objectNameColumn}>Object</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>Region</TableCell>
              <TableCell>Last Modified</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <ObjectTableContent
              clusterId={clusterId}
              data={data}
              loading={loading}
              error={generalError}
              nextPageError={nextPageError}
            />
          </TableBody>
        </Table>
        {/* We shouldn't allow infinite scrolling if we're still loading,
        if we've gotten all objects in the bucket (or folder), or if there
        are errors. */}
        {!loading && !allObjectsFetched && !generalError && !nextPageError && (
          <Waypoint onEnter={getNextPage}>
            <div />
          </Waypoint>
        )}
      </Paper>
      {/* Only display this message if there were more than 100 objects to
      begin with, as a matter of UX convention. */}
      {allObjectsFetched && data.length >= 100 && (
        <Typography>You've reached the end of your bucket!</Typography>
      )}
    </>
  );
};

const reloaded = reloadableWithRouter<CombinedProps, MatchProps>(
  (routePropsOld, routePropsNew) => {
    return routePropsOld.location.search !== routePropsNew.location.search;
  }
);

export default reloaded(BucketDetail);
