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
import {
  getObjectList,
  ObjectListParams
} from 'src/services/objectStorage/buckets';
import { getQueryParam } from 'src/utilities/queryParams';
import { ExtendedObject, extendObject } from '../utilities';
import ObjectTableContent from './ObjectTableContent';

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

type CombinedProps = RouteComponentProps<{
  clusterId: Linode.ClusterID;
  bucketName: string;
}>;

const BucketDetail: React.FC<CombinedProps> = props => {
  const { clusterId, bucketName } = props.match.params;

  const [data, setData] = React.useState<ExtendedObject[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<Linode.ApiFieldError[] | undefined>(
    undefined
  );

  const [allObjectsFetched, setAllObjectsFetched] = React.useState<boolean>(
    false
  );

  const prefix = React.useMemo(
    () => getQueryParam(props.location.search, 'prefix'),
    [props.location.search]
  );

  /**
   * Request objects with the prefix changes. This happens in one of two ways:
   * 1. On component mount
   * 2. When a folder is clicked (since a query param is added to the URL)
   *
   * The new objects REPLACE the old objects.
   */
  React.useEffect(() => {
    const params: ObjectListParams = {
      delimiter: '/',
      prefix
    };

    setAllObjectsFetched(false);
    setLoading(true);
    setError(undefined);
    getObjectList(clusterId, bucketName, params)
      .then(response => {
        setLoading(false);
        if (response.data.length < 100) {
          setAllObjectsFetched(true);
        }
        setData(response.data.map(object => extendObject(object)));
      })
      .catch(err => {
        setLoading(false);
        setError(err);
      });
  }, [props.location.search]);

  /**
   * Request additional objects when the next page is requested.
   * The new objects do NOT replace the old objects, but instead are appended.
   */
  const getNextPage = () => {
    const tail = data[data.length - 1];
    if (!tail) {
      return;
    }
    setLoading(true);
    setError(undefined);

    const params: ObjectListParams = {
      delimiter: '/',
      prefix,
      marker: tail.name
    };

    getObjectList(clusterId, bucketName, params)
      .then(response => {
        setLoading(false);
        if (response.data.length < 100) {
          setAllObjectsFetched(true);
        }
        setData([
          ...data,
          ...response.data.map(object => extendObject(object))
        ]);
      })
      .catch(err => {
        setLoading(false);
        setError(err);
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
              bucketName={bucketName}
              data={data}
              loading={loading}
              error={error}
              prefix={prefix}
            />
          </TableBody>
        </Table>
        {!loading && !allObjectsFetched && (
          <Waypoint onEnter={getNextPage}>
            <div />
          </Waypoint>
        )}
      </Paper>
      {allObjectsFetched && data.length >= 100 && (
        <Typography>You've reached the end of your bucket!</Typography>
      )}
    </>
  );
};

export default BucketDetail;
