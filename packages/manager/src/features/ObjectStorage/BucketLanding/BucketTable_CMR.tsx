import { ObjectStorageBucket } from '@linode/api-v4/lib/object-storage';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/TableRow/TableRow_CMR';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table/Table_CMR';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import TableSortCell from 'src/components/TableSortCell/TableSortCell_CMR';
import BucketTableRow from './BucketTableRow_CMR';
import Hidden from 'src/components/core/Hidden';
import Grid from 'src/components/core/Grid';
import AddNewLink from 'src/components/AddNewLink/AddNewLink_CMR';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.color.white
  },
  objBucketHeader: {
    margin: 0,
    width: '100%'
  },
  headline: {
    marginTop: 8,
    marginBottom: 8,
    marginLeft: 15,
    lineHeight: '1.5rem'
  },
  addNewWrapper: {
    [theme.breakpoints.down('xs')]: {
      marginLeft: -(theme.spacing(1) + theme.spacing(1) / 2),
      padding: 5
    },
    '&.MuiGrid-item': {
      padding: 5
    }
  },
  label: {
    paddingLeft: 65
  }
}));

interface Props {
  data: ObjectStorageBucket[];
  orderBy: string;
  order: 'asc' | 'desc';
  handleOrderChange: (orderBy: string, order?: 'asc' | 'desc') => void;
  openBucketDrawer: () => void;
  handleClickRemove: (bucket: ObjectStorageBucket) => void;
  handleClickDetails: (bucket: ObjectStorageBucket) => void;
}

type CombinedProps = Props;

export const BucketTable: React.FC<CombinedProps> = props => {
  const {
    data,
    orderBy,
    order,
    handleOrderChange,
    openBucketDrawer,
    handleClickRemove,
    handleClickDetails
  } = props;

  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Grid container justify="flex-end" className={classes.objBucketHeader}>
        <Grid item className={classes.addNewWrapper}>
          <AddNewLink onClick={openBucketDrawer} label="Create a Bucket..." />
        </Grid>
      </Grid>
      {/* <LandingHeader
        title="Buckets"
        entity="Bucket"
        onAddNew={openBucketDrawer}
        iconType="bucket"
        docsLink="https://www.linode.com/docs/platform/object-storage/"
      /> */}
      <Paginate data={data} pageSize={25}>
        {({
          data: paginatedData,
          count,
          handlePageChange,
          handlePageSizeChange,
          page,
          pageSize
        }) => (
          <React.Fragment>
            <Table aria-label="List of your Buckets">
              <TableHead>
                <TableRow>
                  <TableSortCell
                    active={orderBy === 'label'}
                    label="label"
                    direction={order}
                    handleClick={handleOrderChange}
                    data-qa-name
                  >
                    Name
                  </TableSortCell>
                  <Hidden xsDown>
                    <TableSortCell
                      active={orderBy === 'cluster'}
                      label="cluster"
                      direction={order}
                      handleClick={handleOrderChange}
                      data-qa-region
                    >
                      Region
                    </TableSortCell>
                  </Hidden>
                  <Hidden smDown>
                    <TableSortCell
                      active={orderBy === 'created'}
                      label="created"
                      direction={order}
                      handleClick={handleOrderChange}
                      data-qa-created
                    >
                      Created
                    </TableSortCell>
                  </Hidden>
                  <TableSortCell
                    active={orderBy === 'size'}
                    label="size"
                    direction={order}
                    handleClick={handleOrderChange}
                    data-qa-size
                  >
                    Size
                  </TableSortCell>
                  <Hidden smDown>
                    <TableSortCell
                      active={orderBy === 'objects'}
                      label="objects"
                      direction={order}
                      handleClick={handleOrderChange}
                      data-qa-objects
                    >
                      Objects
                    </TableSortCell>
                  </Hidden>

                  {/* Empty TableCell for ActionMenu*/}
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                <RenderData
                  data={paginatedData}
                  onRemove={handleClickRemove}
                  onDetails={handleClickDetails}
                />
              </TableBody>
            </Table>

            <PaginationFooter
              count={count}
              page={page}
              pageSize={pageSize}
              handlePageChange={handlePageChange}
              handleSizeChange={handlePageSizeChange}
              eventCategory="object storage landing"
            />
          </React.Fragment>
        )}
      </Paginate>
    </div>
  );
};

interface RenderDataProps {
  data: ObjectStorageBucket[];
  onRemove: (bucket: ObjectStorageBucket) => void;
  onDetails: (bucket: ObjectStorageBucket) => void;
}

const RenderData: React.FC<RenderDataProps> = props => {
  const { data, onRemove, onDetails } = props;

  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {data.map(bucket => (
        <BucketTableRow
          {...bucket}
          key={`${bucket.label}-${bucket.cluster}`}
          onRemove={() => onRemove(bucket)}
          onDetails={() => onDetails(bucket)}
        />
      ))}
    </>
  );
};

export default BucketTable;
