import { compose } from 'ramda';
import * as React from 'react';
import TableBody from 'src/components/core/TableBody';
import TableCell from 'src/components/core/TableCell';
import TableRow from 'src/components/core/TableRow';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import { OrderByProps } from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import { LinodeConfigSelectionDrawerCallback } from 'src/features/LinodeConfigSelectionDrawer';
import { groupByTags, GroupedBy, NONE } from 'src/utilities/groupByTags';
import TableWrapper from './TableWrapper';

interface Props {
  images: Linode.Image[];
  openConfigDrawer: (c: Linode.Config[], action: LinodeConfigSelectionDrawerCallback) => void;
  toggleConfirmation: (bootOption: Linode.BootAction, linodeId: number, linodeLabel: string) => void;
  display: 'grid' | 'list';
  component: any;
  data: Linode.Linode[];
}

type CombinedProps = Props & OrderByProps;

const DisplayGroupedLinodes: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    data,
    display,
    component: Component,
    order,
    orderBy,
    handleOrderChange,
    ...rest
  } = props;

  const orderedGroupedLinodes = compose(sortGroupedLinodes, groupByTags)(data);
  const tableWrapperProps = { handleOrderChange, order, orderBy };

  if (display === 'grid') {
    return (
      <>
        {orderedGroupedLinodes.map(([tag, linodes]) => {
          return (
            <React.Fragment key={tag}>
              <Grid container>
                <Grid item xs={12}>
                  <Typography variant="h1">{tag}</Typography>
                </Grid>
              </Grid>
              <Paginate data={linodes} pageSize={25}>
                {({ data: paginatedData, handlePageChange, handlePageSizeChange, page, pageSize, count }) => {
                  const finalProps = {
                    ...rest,
                    data: paginatedData,
                    pageSize,
                    page,
                    handlePageSizeChange,
                    handlePageChange,
                    handleOrderChange,
                    order,
                    orderBy,
                  };
                  return (
                    <React.Fragment>
                      <Component {...finalProps} />
                      <Grid item xs={12}>
                        {
                          <PaginationFooter
                            count={count}
                            handlePageChange={handlePageChange}
                            handleSizeChange={handlePageSizeChange}
                            pageSize={pageSize}
                            page={page}
                          />
                        }
                      </Grid>
                    </React.Fragment>
                  )
                }}
              </Paginate>
            </React.Fragment>
          )
        })}
      </>
    );
  }

  if (display === 'list') {
    return (
      <>
        {orderedGroupedLinodes.map(([tag, linodes]) => {
          return (
            <React.Fragment key={tag}>
              <Paginate data={linodes} pageSize={25}>
                {({ data: paginatedData, handlePageChange, handlePageSizeChange, page, pageSize, count }) => {
                  const finalProps = { ...rest, data: paginatedData, pageSize, page, handlePageSizeChange, handlePageChange, handleOrderChange, order, orderBy, };
                  return (
                    <React.Fragment>
                      <TableWrapper {...tableWrapperProps}>
                        <TableBody>
                          <TableRow>
                            <TableCell colSpan={6}>{tag}</TableCell>
                          </TableRow>
                          <Component {...finalProps} />
                        </TableBody>
                      </TableWrapper>
                      <Grid item xs={12}>
                        {
                          <PaginationFooter
                            count={count}
                            handlePageChange={handlePageChange}
                            handleSizeChange={handlePageSizeChange}
                            pageSize={pageSize}
                            page={page}
                          />
                        }
                      </Grid>
                    </React.Fragment>
                  )
                }}
              </Paginate>
            </React.Fragment>
          )
        })}
      </>
    );
  }

  return null;
};

export default DisplayGroupedLinodes;

/**
 * Moves the NONE to the top, and alphabetically sorts the remainder.
 */
const sortGroupedLinodes = (groups: GroupedBy<Linode.Linode>) => {
  let foundUntaggedIndex;
  let idx = 0;
  const len = groups.length;
  for (; idx < len; idx++) {
    const [tag] = groups[idx];
    if (tag === NONE) {
      foundUntaggedIndex = idx;
      break;
    }
  }

  if (typeof foundUntaggedIndex === 'undefined') {
    return groups;
  }

  return [
    groups[foundUntaggedIndex],
    ...groups
      .filter(([tag]) => tag !== NONE)
      .sort(([a], [b]) => a > b ? 0 : -1),
  ];
}
