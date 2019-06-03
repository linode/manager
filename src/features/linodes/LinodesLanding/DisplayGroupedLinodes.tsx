import { compose } from 'ramda';
import * as React from 'react';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableCell from 'src/components/core/TableCell';
import TableRow from 'src/components/core/TableRow';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import { OrderByProps } from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import { LinodeConfigSelectionDrawerCallback } from 'src/features/LinodeConfigSelectionDrawer';
import { groupByTags, sortGroups } from 'src/utilities/groupByTags';
import TableWrapper from './TableWrapper';

const DEFAULT_PAGE_SIZE = 25;

type ClassNames =
  | 'root'
  | 'tagGridRow'
  | 'tagHeaderRow'
  | 'tagHeader'
  | 'tagHeaderOuter'
  | 'paginationCell'
  | 'groupContainer';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  tagGridRow: {
    marginBottom: 20
  },
  tagHeaderRow: {
    backgroundColor: theme.bg.main,
    height: 'auto',
    '& td': {
      // This is maintaining the spacing between groups because of how tables handle margin/padding. Adjust with care!
      padding: `${theme.spacing(2) + 4}px 0 ${theme.spacing(1) + 2}px`,
      borderBottom: 'none'
    }
  },
  groupContainer: {
    '&:first-of-type': {
      '& $tagHeaderRow > td': {
        padding: '10px 0'
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

interface Props {
  openConfigDrawer: (
    c: Linode.Config[],
    action: LinodeConfigSelectionDrawerCallback
  ) => void;
  toggleConfirmation: (
    bootOption: Linode.BootAction,
    linodeId: number,
    linodeLabel: string
  ) => void;
  display: 'grid' | 'list';
  component: any;
  data: Linode.Linode[];
  someLinodesHaveMaintenance: boolean;
}

type CombinedProps = Props & OrderByProps & WithStyles<ClassNames>;

const DisplayGroupedLinodes: React.StatelessComponent<
  CombinedProps
> = props => {
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

  const orderedGroupedLinodes = compose(
    sortGroups,
    groupByTags
  )(data);
  const tableWrapperProps = {
    handleOrderChange,
    order,
    orderBy,
    someLinodesHaveMaintenance: props.someLinodesHaveMaintenance
  };

  if (display === 'grid') {
    return (
      <>
        {orderedGroupedLinodes.map(([tag, linodes]) => {
          return (
            <div
              key={tag}
              className={classes.tagGridRow}
              data-qa-tag-header={tag}
            >
              <Grid container>
                <Grid item xs={12}>
                  <div className={classes.tagHeaderOuter}>
                    <Typography
                      variant="h2"
                      component="h3"
                      className={classes.tagHeader}
                    >
                      {tag}
                    </Typography>
                  </div>
                </Grid>
              </Grid>
              <Paginate data={linodes} pageSize={DEFAULT_PAGE_SIZE}>
                {({
                  data: paginatedData,
                  handlePageChange,
                  handlePageSizeChange,
                  page,
                  pageSize,
                  count
                }) => {
                  const finalProps = {
                    ...rest,
                    data: paginatedData,
                    pageSize,
                    page,
                    handlePageSizeChange,
                    handlePageChange,
                    handleOrderChange,
                    order,
                    orderBy
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
                          eventCategory={'linodes landing'}
                        />
                      </Grid>
                    </React.Fragment>
                  );
                }}
              </Paginate>
            </div>
          );
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
              <Paginate data={linodes} pageSize={DEFAULT_PAGE_SIZE}>
                {({
                  data: paginatedData,
                  handlePageChange,
                  handlePageSizeChange,
                  page,
                  pageSize,
                  count
                }) => {
                  const finalProps = {
                    ...rest,
                    data: paginatedData,
                    pageSize,
                    page,
                    handlePageSizeChange,
                    handlePageChange,
                    handleOrderChange,
                    order,
                    orderBy
                  };
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
                        <Component {...finalProps} />
                        {count > DEFAULT_PAGE_SIZE && (
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
                                eventCategory={'linodes landing'}
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
  }

  return null;
};

const styled = withStyles(styles);

export default styled(DisplayGroupedLinodes);
