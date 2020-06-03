import { Domain } from '@linode/api-v4/lib/domains';
import { compose } from 'ramda';
import * as React from 'react';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableCell from 'src/components/core/TableCell';
import TableRow from 'src/components/core/TableRow';
import Typography from 'src/components/core/Typography';
import Paginate from 'src/components/Paginate';
import PaginationFooter, {
  MIN_PAGE_SIZE
} from 'src/components/PaginationFooter';
import DomainTableRow from 'src/features/Domains/DomainTableRow';
import { useInfinitePageSize } from 'src/hooks/useInfinitePageSize';
import { groupByTags, sortGroups } from 'src/utilities/groupByTags';
import { Handlers } from './DomainActionMenu';
import TableWrapper from './DomainsTableWrapper';

type ClassNames =
  | 'root'
  | 'tagGridRow'
  | 'tagHeaderRow'
  | 'tagHeader'
  | 'tagHeaderOuter'
  | 'paginationCell'
  | 'groupContainer';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    tagGridRow: {
      marginBottom: theme.spacing(2) + theme.spacing(1) / 2
    },
    tagHeaderRow: {
      backgroundColor: theme.bg.main,
      height: 'auto',
      '& td': {
        // This is maintaining the spacing between groups because of how tables handle margin/padding. Adjust with care!
        padding: `${theme.spacing(2) +
          theme.spacing(1) / 2}px 0 ${theme.spacing(1) + 2}px`,
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
  });
interface Props extends Handlers {
  data: Domain[];
  orderBy: string;
  order: 'asc' | 'desc';
  handleOrderChange: (orderBy: string, order?: 'asc' | 'desc') => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const ListGroupedDomains: React.FC<CombinedProps> = props => {
  const {
    data,
    onClone,
    onEdit,
    onRemove,
    order,
    handleOrderChange,
    orderBy,
    classes
  } = props;

  const dataLength = data.length;

  const groupedDomains = compose(sortGroups, groupByTags)(data);
  const tableWrapperProps = { handleOrderChange, order, orderBy, dataLength };

  const { infinitePageSize, setInfinitePageSize } = useInfinitePageSize();

  return (
    <TableWrapper {...tableWrapperProps}>
      {groupedDomains.map(([tag, domains]: [string, Domain[]]) => {
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
                  <React.Fragment>
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
                      {paginatedData.map(domain => (
                        <DomainTableRow
                          key={domain.domain}
                          domain={domain.domain}
                          id={domain.id}
                          onClone={onClone}
                          onEdit={onEdit}
                          onRemove={onRemove}
                          type={domain.type}
                          status={domain.status}
                          lastModified={domain.updated}
                          onDisableOrEnable={props.onDisableOrEnable}
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
                  </React.Fragment>
                );
              }}
            </Paginate>
          </React.Fragment>
        );
      })}
    </TableWrapper>
  );
};

const styled = withStyles(styles);

export default styled(ListGroupedDomains);
