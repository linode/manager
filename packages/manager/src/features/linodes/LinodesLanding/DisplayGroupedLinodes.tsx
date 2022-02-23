import { Config } from '@linode/api-v4/lib/linodes';
import { compose } from 'ramda';
import * as React from 'react';
import GroupByTag from 'src/assets/icons/group-by-tag.svg';
import TableView from 'src/assets/icons/table-view.svg';
import IconButton from 'src/components/core/IconButton';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableCell from 'src/components/core/TableCell';
import Tooltip from 'src/components/core/Tooltip';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import { OrderByProps } from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import PaginationFooter, {
  MIN_PAGE_SIZE,
} from 'src/components/PaginationFooter';
import { getMinimumPageSizeForNumberOfItems } from 'src/components/PaginationFooter/PaginationFooter';
import TableRow from 'src/components/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import { Action } from 'src/features/linodes/PowerActionsDialogOrDrawer';
import { DialogType } from 'src/features/linodes/types';
import { useInfinitePageSize } from 'src/hooks/useInfinitePageSize';
import { groupByTags, sortGroups } from 'src/utilities/groupByTags';
import { ExtendedLinode } from '../LinodesDetail/types';
import TableWrapper from './TableWrapper';

const useStyles = makeStyles((theme: Theme) => ({
  tagGridRow: {
    marginBottom: 20,
  },
  tagHeaderRow: {
    backgroundColor: theme.bg.main,
    height: 'auto',
    '& td': {
      // This is maintaining the spacing between groups because of how tables handle margin/padding. Adjust with care!
      padding: `${theme.spacing(2) + 4}px 0 2px`,
      borderBottom: 'none',
      borderTop: 'none',
    },
  },
  groupContainer: {
    [theme.breakpoints.up('md')]: {
      '& $tagHeaderRow > td': {
        padding: '10px 0 2px',
        borderTop: 'none',
      },
    },
  },
  tagHeader: {
    marginBottom: 2,
    marginLeft: theme.spacing(),
  },
  paginationCell: {
    padding: 0,
  },
  controlHeader: {
    marginBottom: 28,
    display: 'flex',
    justifyContent: 'flex-end',
    backgroundColor: theme.bg.tableHeader,
  },
  toggleButton: {
    color: '#d2d3d4',
    padding: 10,
    '&:focus': {
      // Browser default until we get styling direction for focus states
      outline: '1px dotted #999',
    },
  },
}));

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
  isVLAN?: boolean;
}

type CombinedProps = Props & OrderByProps;

const DisplayGroupedLinodes: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();

  const {
    data,
    display,
    component: Component,
    order,
    orderBy,
    handleOrderChange,
    toggleLinodeView,
    toggleGroupLinodes,
    linodeViewPreference,
    linodesAreGrouped,
    isVLAN,
    ...rest
  } = props;

  const dataLength = data.length;

  const orderedGroupedLinodes = compose(sortGroups, groupByTags)(data);
  const tableWrapperProps = {
    handleOrderChange,
    order,
    orderBy,
    someLinodesHaveMaintenance: props.someLinodesHaveMaintenance,
    dataLength,
    isVLAN,
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
        </Grid>
        {orderedGroupedLinodes.length === 0 ? (
          <Typography style={{ textAlign: 'center' }}>
            No items to display.
          </Typography>
        ) : null}
        {orderedGroupedLinodes.map(([tag, linodes]) => {
          return (
            <div
              key={tag}
              className={classes.tagGridRow}
              data-qa-tag-header={tag}
            >
              <Grid container>
                <Grid item xs={12}>
                  <Typography
                    variant="h2"
                    component="h3"
                    className={classes.tagHeader}
                  >
                    {tag}
                  </Typography>
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
                  count,
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
                    orderBy,
                    isVLAN,
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
      <TableWrapper
        {...tableWrapperProps}
        linodeViewPreference="list"
        linodesAreGrouped={true}
        toggleLinodeView={toggleLinodeView}
        toggleGroupLinodes={toggleGroupLinodes}
      >
        {orderedGroupedLinodes.length === 0 ? (
          <TableBody>
            <TableRowEmptyState colSpan={12} />
          </TableBody>
        ) : null}
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
                  count,
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
                    orderBy,
                    isVLAN,
                  };
                  return (
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
    );
  }

  return null;
};

export default DisplayGroupedLinodes;
