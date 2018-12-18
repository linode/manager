import { compose } from 'ramda';
import * as React from 'react';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableCell from 'src/components/core/TableCell';
import TableRow from 'src/components/core/TableRow';
import TableWrapper from './TableWrapper';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import { OrderByProps } from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import { LinodeConfigSelectionDrawerCallback } from 'src/features/LinodeConfigSelectionDrawer';
import { groupByTags, GroupedBy, NONE } from 'src/utilities/groupByTags';

type ClassNames = 'root' | 'tagGridRow' | 'tagHeaderRow' | 'tagHeader' | 'tagHeaderOuter' | 'paginationCell';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
  },
  tagGridRow: {
    marginBottom: theme.spacing.unit * 3,
  },
  tagHeaderRow: {
    backgroundColor: theme.bg.tableHeader,
    height: 'auto',
    '& td': {
      padding: '8px 15px',
    },
  },
  tagHeader: {
  },
  tagHeaderOuter: {
    backgroundColor: theme.bg.tableHeader,
    padding: '8px 10px',
  },
  paginationCell: {
    paddingTop: 2,
    '& div:first-child': {
      marginTop: 0,
    },
  },
});

interface Props {
  images: Linode.Image[];
  openConfigDrawer: (c: Linode.Config[], action: LinodeConfigSelectionDrawerCallback) => void;
  toggleConfirmation: (bootOption: Linode.BootAction, linodeId: number, linodeLabel: string) => void;
  display: 'grid' | 'list';
  component: any;
  data: Linode.Linode[];
}

type CombinedProps = Props & OrderByProps & WithStyles<ClassNames>;

const DisplayGroupedLinodes: React.StatelessComponent<CombinedProps> = (props) => {
  const {
    data,
    display,
    component: Component,
    order,
    orderBy,
    handleOrderChange,
    classes,
    ...rest
  } = props;

  const orderedGroupedLinodes = compose(sortGroupedLinodes, groupByTags)(data);
  const tableWrapperProps = { handleOrderChange, order, orderBy };

  if (display === 'grid') {
    return (
      <>
        {orderedGroupedLinodes.map(([tag, linodes]) => {
          return (
            <div key={tag} className={classes.tagGridRow}>
              <Grid container>
                <Grid item xs={12}>
                  <div className={classes.tagHeaderOuter}>
                    <Typography className={classes.tagHeader} variant="body2">{tag}</Typography>
                  </div>
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
                        <PaginationFooter
                          count={count}
                          handlePageChange={handlePageChange}
                          handleSizeChange={handlePageSizeChange}
                          pageSize={pageSize}
                          page={page}
                        />
                      </Grid>
                    </React.Fragment>
                  )
                }}
              </Paginate>
            </div>
          )
        })}
      </>
    );
  }

  if (display === 'list') {
    return (
      <TableWrapper {...tableWrapperProps}>
        {orderedGroupedLinodes.map(([tag, linodes]) => {
          return (
            <React.Fragment key={tag}>
              <Paginate data={linodes} pageSize={25}>
                {({ data: paginatedData, handlePageChange, handlePageSizeChange, page, pageSize, count }) => {
                  const finalProps = { ...rest, data: paginatedData, pageSize, page, handlePageSizeChange, handlePageChange, handleOrderChange, order, orderBy, };
                  return (
                    <React.Fragment>
                      <TableBody>
                        <TableRow className={classes.tagHeaderRow}>
                          <TableCell colSpan={7}><Typography className={classes.tagHeader} variant="body2">{tag}</Typography></TableCell>
                        </TableRow>
                        <Component {...finalProps} />
                      </TableBody>
                      {count > 25 && <TableRow>
                        <TableCell colSpan={7} className={classes.paginationCell}>
                          <PaginationFooter
                            count={count}
                            handlePageChange={handlePageChange}
                            handleSizeChange={handlePageSizeChange}
                            pageSize={pageSize}
                            page={page}
                          />
                        </TableCell>
                      </TableRow>}
                    </React.Fragment>
                  )
                }}
              </Paginate>
            </React.Fragment>
          )
        })}
      </TableWrapper>
    );
  }

  return null;
};

const styled = withStyles(styles);

export default styled(DisplayGroupedLinodes);

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
