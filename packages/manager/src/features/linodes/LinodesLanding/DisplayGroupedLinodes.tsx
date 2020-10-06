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
import IconButton from 'src/components/core/IconButton';
import Tooltip from 'src/components/core/Tooltip';
import GroupByTag from 'src/assets/icons/group-by-tag.svg';
import TableView from 'src/assets/icons/table-view.svg';

type ClassNames =
  | 'root'
  | 'tagGridRow'
  | 'tagHeaderRow'
  | 'tagHeader'
  | 'tagHeaderOuter'
  | 'paginationCell'
  | 'groupContainer'
  | 'controlHeader'
  | 'toggleButton';

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
    },
    controlHeader: {
      backgroundColor: theme.bg.controlHeader,
      marginBottom: 28,
      display: 'flex',
      justifyContent: 'flex-end'
    },
    toggleButton: {
      padding: 10,
      '&:focus': {
        // Browser default until we get styling direction for focus states
        outline: '1px dotted #999'
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
  toggleLinodeView: () => 'grid' | 'list';
  toggleGroupLinodes: () => boolean;
  linodeViewPreference: 'grid' | 'list';
  linodesAreGrouped: boolean;
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
    toggleLinodeView,
    toggleGroupLinodes,
    linodeViewPreference,
    linodesAreGrouped,
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
      <>
        <Grid item xs={12} className={'px0'}>
          {flags.cmr && (
            <div className={classes.controlHeader}>
              <div id="displayViewDescription" className="visually-hidden">
                Currently in {linodeViewPreference} view
              </div>
              <Tooltip placement="top" title="List view">
                <IconButton
                  aria-label="Toggle display"
                  aria-describedby={'displayViewDescription'}
                  onClick={toggleLinodeView}
                  disableRipple
                  className={classes.toggleButton}
                >
                  <TableView />
                </IconButton>
              </Tooltip>

              <div id="groupByDescription" className="visually-hidden">
                {linodesAreGrouped
                  ? 'group by tag is currently enabled'
                  : 'group by tag is currently disabled'}
              </div>
              <Tooltip placement="top-end" title="Ungroup by tag">
                <IconButton
                  aria-label={`Toggle group by tag`}
                  aria-describedby={'groupByDescription'}
                  onClick={toggleGroupLinodes}
                  disableRipple
                  className={classes.toggleButton}
                >
                  <GroupByTag />
                </IconButton>
              </Tooltip>
            </div>
          )}
        </Grid>
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
          <TableWrapper_CMR
            {...tableWrapperProps}
            linodeViewPreference="list"
            linodesAreGrouped={true}
            toggleLinodeView={toggleLinodeView}
            toggleGroupLinodes={toggleGroupLinodes}
          >
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
