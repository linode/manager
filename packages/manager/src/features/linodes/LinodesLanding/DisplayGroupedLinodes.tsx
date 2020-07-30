import { Config } from '@linode/api-v4/lib/linodes';
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
import Grid from 'src/components/Grid';
import { OrderByProps } from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import PaginationFooter, {
  MIN_PAGE_SIZE
} from 'src/components/PaginationFooter';
import { getMinimumPageSizeForNumberOfItems } from 'src/components/PaginationFooter/PaginationFooter';
import { Action } from 'src/features/linodes/PowerActionsDialogOrDrawer';
import { DialogType } from 'src/features/linodes/types';
import { useInfinitePageSize } from 'src/hooks/useInfinitePageSize';
import { groupByTags, sortGroups } from 'src/utilities/groupByTags';
import { ExtendedLinode } from '../LinodesDetail/types';
import useFlags from 'src/hooks/useFlags';
import TableWrapper from './TableWrapper';
import TableWrapper_CMR from './TableWrapper_CMR';

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
      [theme.breakpoints.up('md')]: {
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
  openDialog: (type: DialogType, linodeID: number, linodeLabel: string) => void;
  openPowerActionDialog: (
    bootAction: Action,
    linodeID: number,
    linodeLabel: string,
    linodeConfigs: Config[]
  ) => void;
  display: 'grid' | 'list';
  component: any;
  data: ExtendedLinode[];
  someLinodesHaveMaintenance: boolean;
}

type CombinedProps = Props & OrderByProps & WithStyles<ClassNames>;

const DisplayGroupedLinodes: React.FC<CombinedProps> = props => {
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

  const flags = useFlags();

  const dataLength = data.length;

  const orderedGroupedLinodes = compose(sortGroups, groupByTags)(data);
  const tableWrapperProps = {
    handleOrderChange,
    order,
    orderBy,
    someLinodesHaveMaintenance: props.someLinodesHaveMaintenance,
    dataLength
  };

  const { infinitePageSize, setInfinitePageSize } = useInfinitePageSize();
  const numberOfLinodesWithMaintenance = data.reduce((acc, thisLinode) => {
    if (thisLinode.maintenance) {
      acc++;
    }
    return acc;
  }, 0);

  if (display === 'grid') {
    return (
      // eslint-disable-next-line
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
              <Paginate
                data={linodes}
                // If there are more Linodes with maintenance than the current page size, show the minimum
                // page size needed to show ALL Linodes with maintenance.
                pageSize={
                  numberOfLinodesWithMaintenance > infinitePageSize
                    ? getMinimumPageSizeForNumberOfItems(
                        numberOfLinodesWithMaintenance
                      )
                    : infinitePageSize
                }
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
                          showAll
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
      // eslint-disable-next-line
      <React.Fragment>
        {flags.cmr ? (
          <TableWrapper_CMR {...tableWrapperProps}>
            {orderedGroupedLinodes.map(([tag, linodes]) => {
              return (
                <React.Fragment key={tag}>
                  <Paginate
                    data={linodes}
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
                          <Component {...finalProps} />
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
                                  eventCategory={'linodes landing'}
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
          </TableWrapper_CMR>
        ) : (
          <TableWrapper {...tableWrapperProps}>
            {orderedGroupedLinodes.map(([tag, linodes]) => {
              return (
                <React.Fragment key={tag}>
                  <Paginate
                    data={linodes}
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
                          <Component {...finalProps} />
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
                                  eventCategory={'linodes landing'}
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
          </TableWrapper>
        )}
      </React.Fragment>
    );
  }

  return null;
};

const styled = withStyles(styles);

export default styled(DisplayGroupedLinodes);
