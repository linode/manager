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
import Pagey, { PaginationProps } from 'src/components/Pagey';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
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
    width: '60%'
  }
}));

type CombinedProps = RouteComponentProps<{
  clusterId: Linode.ClusterID;
  bucketName: string;
}> &
  PaginationProps<Linode.Object>;

const BucketDetail: React.FC<CombinedProps> = props => {
  React.useEffect(() => {
    props.request();
  }, []);

  const { clusterId, bucketName } = props.match.params;

  const classes = useStyles();

  return (
    <>
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Breadcrumb
          pathname={`/object-storage/${bucketName}`}
          crumbOverrides={[
            {
              position: 1,
              label: 'Object Storage'
            }
          ]}
          labelOptions={{ noCap: true }}
        />
        <DocumentationButton href="https://www.linode.com/docs/platform/object-storage/how-to-use-object-storage/" />
      </Box>
      <Divider className={classes.divider} />
      <Paper className={classes.objectTable}>
        <Table aria-label="List of Bucket Objects">
          <TableHead>
            <TableRow data-qa-table-head>
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
              data={props.data || []}
              loading={props.loading}
              error={props.error}
            />
          </TableBody>
        </Table>
      </Paper>
      <PaginationFooter
        page={props.page}
        count={props.count}
        pageSize={props.pageSize}
        handlePageChange={props.handlePageChange}
        handleSizeChange={props.handlePageSizeChange}
        eventCategory="bucket detail"
      />
    </>
  );
};

const updatedRequest = (ownProps: CombinedProps, params: any, filters: any) => {
  const { clusterId, bucketName } = ownProps.match.params;

  return getBucketObjects(clusterId, bucketName, params, filters).then(
    response => response
  );
};

const paginated = Pagey(updatedRequest);

export default paginated(BucketDetail);
