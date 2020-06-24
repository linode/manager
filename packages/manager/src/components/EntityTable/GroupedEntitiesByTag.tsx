import { compose } from 'ramda';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import Typography from 'src/components/core/Typography';
import Paginate from 'src/components/Paginate';
import PaginationFooter, {
  MIN_PAGE_SIZE
} from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import { useInfinitePageSize } from 'src/hooks/useInfinitePageSize';
import { groupByTags, sortGroups } from 'src/utilities/groupByTags';
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
      borderBottom: 'none'
    }
  },
  groupContainer: {
    [theme.breakpoints.up('md')]: {
      '& $tagHeaderRow > td': {
        padding: `${theme.spacing(1) + 2}px 0`
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
  const { data, entity, handlers, headerCells, RowComponent } = props;
  const groupedEntities = compose(sortGroups, groupByTags)(data);
  const classes = useStyles();
  const { infinitePageSize, setInfinitePageSize } = useInfinitePageSize();

  return (
    <Table aria-label={`List of ${entity}`}>
      <TableHead>
        <TableRow>{headerCells}</TableRow>
      </TableHead>
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
                    <TableRow className={classes.tagHeaderRow} role="cell">
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
};

export default GroupedEntitiesByTag;
