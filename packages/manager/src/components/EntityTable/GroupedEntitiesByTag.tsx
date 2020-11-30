import { compose } from 'ramda';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableRow from 'src/components/core/TableRow';
import Typography from 'src/components/core/Typography';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import PaginationFooter, {
  MIN_PAGE_SIZE
} from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import { useInfinitePageSize } from 'src/hooks/useInfinitePageSize';
import { groupByTags, sortGroups } from 'src/utilities/groupByTags';
import EntityTableHeader from './EntityTableHeader';
import { ListProps } from './types';

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  tagGridRow: {
    marginBottom: theme.spacing(2) + theme.spacing(1) / 2
  },
  tagHeaderRow: {
    backgroundColor: theme.bg.main,
    height: 'auto',
    '& td': {
      // This is maintaining the spacing between groups because of how tables handle margin/padding. Adjust with care!
      padding: `${theme.spacing(2) + theme.spacing(1) / 2}px 0 ${theme.spacing(
        1
      ) + 2}px`,
      borderBottom: 'none',
      borderTop: 'none'
    }
  },
  groupContainer: {
    [theme.breakpoints.up('md')]: {
      '& $tagHeaderRow > td': {
        padding: `${theme.spacing(1) + 2}px 0`,
        borderTop: 'none'
      }
    }
  },
  tagHeader: {
    marginBottom: 2
  },
  tagHeaderOuter: {},
  paginationCell: {
    paddingTop: 2,
    '& div:first-child': {
      marginTop: 0
    }
  }
}));

export type CombinedProps = ListProps;

export const GroupedEntitiesByTag: React.FC<CombinedProps> = props => {
  const { data, entity, handlers, headers, initialOrder, RowComponent } = props;
  const classes = useStyles();
  const { infinitePageSize, setInfinitePageSize } = useInfinitePageSize();

  return (
    <OrderBy
      data={data}
      orderBy={initialOrder?.orderBy}
      order={initialOrder?.order}
    >
      {({ data: orderedData, handleOrderChange, order, orderBy }) => {
        const groupedEntities = compose(sortGroups, groupByTags)(orderedData);

        return (
          <Table aria-label={`List of ${entity}`}>
            <EntityTableHeader
              headers={headers}
              handleOrderChange={handleOrderChange}
              order={order}
              orderBy={orderBy}
            />
            {groupedEntities.map(([tag, domains]: [string, any[]]) => {
              return (
                <React.Fragment key={tag}>
                  <Paginate
                    data={domains}
                    pageSize={infinitePageSize}
                    pageSizeSetter={setInfinitePageSize}
                  >
                    {({
                      data: paginatedData,
                      handlePageChange,
                      handlePageSizeChange,
                      page,
                      pageSize,
                      count
                    }) => {
                      return (
                        <TableBody
                          className={classes.groupContainer}
                          data-qa-tag-header={tag}
                        >
                          <TableRow
                            className={classes.tagHeaderRow}
                            role="cell"
                          >
                            <TableCell colSpan={7}>
                              <Typography
                                variant="h2"
                                component="h3"
                                className={classes.tagHeader}
                              >
                                {tag}
                              </Typography>
                            </TableCell>
                          </TableRow>
                          {paginatedData.map(thisEntity => (
                            <RowComponent
                              key={thisEntity.id}
                              {...thisEntity}
                              {...handlers}
                            />
                          ))}
                          {count > MIN_PAGE_SIZE && (
                            <TableRow>
                              <TableCell
                                colSpan={7}
                                className={classes.paginationCell}
                              >
                                <PaginationFooter
                                  count={count}
                                  handlePageChange={handlePageChange}
                                  handleSizeChange={handlePageSizeChange}
                                  pageSize={pageSize}
                                  page={page}
                                  eventCategory={'domains landing'}
                                  showAll
                                />
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      );
                    }}
                  </Paginate>
                </React.Fragment>
              );
            })}
          </Table>
        );
      }}
    </OrderBy>
  );
};

export default GroupedEntitiesByTag;
