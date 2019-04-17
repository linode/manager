import * as React from 'react';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  WithStyles,
  withStyles
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableRow from 'src/components/TableRow';
import TableSortCell from 'src/components/TableSortCell';
import BucketTableRow from './BucketTableRow';

type ClassNames = 'root' | 'label';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  label: {
    paddingLeft: 65
  }
});

interface Props {
  data: Linode.Bucket[];
  orderBy: string;
  order: 'asc' | 'desc';
  handleOrderChange: (orderBy: string, order?: 'asc' | 'desc') => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

export const ListBuckets: React.StatelessComponent<CombinedProps> = props => {
  const { data, orderBy, order, handleOrderChange, classes } = props;
  return (
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
          <Paper>
            <Table removeLabelonMobile aria-label="List of your Buckets">
              <TableHead>
                <TableRow>
                  <TableSortCell
                    active={orderBy === 'label'}
                    label="label"
                    direction={order}
                    handleClick={handleOrderChange}
                    className={classes.label}
                    data-qa-name
                  >
                    Name
                  </TableSortCell>
                  <TableSortCell
                    active={orderBy === 'size'}
                    label="size"
                    direction={order}
                    handleClick={handleOrderChange}
                    data-qa-size
                  >
                    Size
                  </TableSortCell>
                  <TableSortCell
                    active={orderBy === 'region'}
                    label="region"
                    direction={order}
                    handleClick={handleOrderChange}
                    data-qa-region
                  >
                    Region
                  </TableSortCell>
                  <TableSortCell
                    active={orderBy === 'created'}
                    label="created"
                    direction={order}
                    handleClick={handleOrderChange}
                    data-qa-created
                  >
                    Created
                  </TableSortCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <RenderData data={paginatedData} />
              </TableBody>
            </Table>
          </Paper>
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
  );
};

interface RenderDataProps {
  data: Linode.Bucket[];
}

const RenderData: React.StatelessComponent<RenderDataProps> = props => {
  const { data } = props;

  return (
    <>
      {data.map(bucket => (
        <BucketTableRow
          key={bucket.label}
          label={bucket.label}
          objects={bucket.objects}
          region={bucket.region}
          size={bucket.size}
          hostname={bucket.hostname}
          created={bucket.created}
        />
      ))}
    </>
  );
};

const styled = withStyles(styles);

export default styled(ListBuckets);
