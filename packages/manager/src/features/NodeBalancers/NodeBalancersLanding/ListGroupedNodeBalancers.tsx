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
import PaginationFooter from 'src/components/PaginationFooter';
import { groupByTags, sortGroups } from 'src/utilities/groupByTags';
import NodeBalancersLandingTableRows from './NodeBalancersLandingTableRows';
import TableWrapper from './NodeBalancersTableWrapper';

const DEFAULT_PAGE_SIZE = 25;

type ClassNames =
  | 'ip'
  | 'nameCell'
  | 'nodeStatus'
  | 'nodeStatus'
  | 'ports'
  | 'tagGroup'
  | 'title'
  | 'transferred'
  | 'groupContainer'
  | 'tagHeaderRow'
  | 'tagHeader'
  | 'paginationCell';

const styles = (theme: Theme) =>
  createStyles({
    ip: { width: '30%', minWidth: 200 },
    nameCell: { width: '15%', minWidth: 150 },
    nodeStatus: { width: '10%', minWidth: 100 },
    ports: { width: '10%', minWidth: 50 },
    tagGroup: {
      flexDirection: 'row-reverse',
      marginBottom: theme.spacing(1) - 2
    },
    title: { marginBottom: theme.spacing(2) },
    transferred: { width: '10%', minWidth: 100 },
    groupContainer: {
      '&:first-of-type': {
        '& $tagHeaderRow > td': {
          padding: '10px 0'
        }
      }
    },
    tagHeaderRow: {
      backgroundColor: theme.bg.main,
      height: 'auto',
      '& td': {
        // This is maintaining the spacing between groups because of how tables handle margin/padding. Adjust with care!
        padding: '20px 0 10px',
        borderBottom: 'none'
      }
    },
    tagHeader: {
      marginBottom: 2
    },
    paginationCell: {
      paddingTop: 2,
      '& div:first-child': {
        marginTop: 0
      }
    }
  });

interface Props {
  data: Linode.NodeBalancerWithConfigs[];
  orderBy: string;
  order: 'asc' | 'desc';
  handleOrderChange: (orderBy: string, order?: 'asc' | 'desc') => void;
  toggleDialog: (id: number, label: string) => void;
}

type CombinedProps = Props & WithStyles<ClassNames>;
const ListGroupedNodeBalancers: React.StatelessComponent<
  CombinedProps
> = props => {
  const {
    classes,
    data,
    orderBy,
    order,
    handleOrderChange,
    toggleDialog
  } = props;

  const groupedNodeBalancers = compose(
    sortGroups,
    groupByTags
  )(data);
  const tableWrapperProps = { handleOrderChange, order, orderBy };

  return (
    <TableWrapper {...tableWrapperProps}>
      {groupedNodeBalancers.map(([tag, nodeBalancers]) => {
        return (
          <React.Fragment key={tag}>
            <Paginate data={nodeBalancers} pageSize={DEFAULT_PAGE_SIZE}>
              {({
                count,
                data: paginatedData,
                handlePageChange,
                handlePageSizeChange,
                page,
                pageSize
              }) => {
                return (
                  <React.Fragment>
                    <TableBody
                      className={classes.groupContainer}
                      data-qa-tag-header={tag}
                    >
                      <TableRow className={classes.tagHeaderRow}>
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
                      <NodeBalancersLandingTableRows
                        toggleDialog={toggleDialog}
                        data={paginatedData}
                      />
                    </TableBody>
                    {count > DEFAULT_PAGE_SIZE && (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className={classes.paginationCell}
                        >
                          <PaginationFooter
                            count={count}
                            page={page}
                            pageSize={pageSize}
                            handlePageChange={handlePageChange}
                            handleSizeChange={handlePageSizeChange}
                            eventCategory="nodebalancers landing"
                          />
                        </TableCell>
                      </TableRow>
                    )}
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

export default styled(ListGroupedNodeBalancers);
