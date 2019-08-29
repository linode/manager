import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import Breadcrumb from 'src/components/Breadcrumb';
import Box from 'src/components/core/Box';
import Divider from 'src/components/core/Divider';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import DocumentationButton from 'src/components/DocumentationButton';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { useAPIRequest } from 'src/hooks/useAPIRequest';
import { getBucketObjects } from 'src/services/objectStorage/buckets';
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

  const { data, error, loading } = useAPIRequest<Linode.Object[]>(
    () =>
      getBucketObjects(clusterId, bucketName).then(response => response.data),
    []
  );

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
            />
          </TableBody>
        </Table>
      </Paper>
    </>
  );
};

export default BucketDetail;
