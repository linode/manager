import { Config } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { useLocation } from 'react-router-dom';
import TableBody from 'src/components/core/TableBody';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import { OrderByProps } from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import { getMinimumPageSizeForNumberOfItems } from 'src/components/PaginationFooter/PaginationFooter';
import { Action } from 'src/features/linodes/PowerActionsDialogOrDrawer';
import { DialogType } from 'src/features/linodes/types';
import { useInfinitePageSize } from 'src/hooks/useInfinitePageSize';
import { ExtendedLinode } from '../LinodesDetail/types';
import TableWrapper from './TableWrapper';
import IconButton from 'src/components/core/IconButton';
import Tooltip from 'src/components/core/Tooltip';
import GroupByTag from 'src/assets/icons/group-by-tag.svg';
import TableView from 'src/assets/icons/table-view.svg';
import { getParamsFromUrl } from 'src/utilities/queryParams';

const useStyles = makeStyles((theme: Theme) => ({
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
  table: {
    // tableLayout: 'fixed'
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
  count: number;
  display: 'grid' | 'list';
  component: any;
  data: ExtendedLinode[];
  someLinodesHaveMaintenance: boolean;
  toggleLinodeView: () => 'grid' | 'list';
  toggleGroupLinodes: () => boolean;
  linodeViewPreference: 'grid' | 'list';
  linodesAreGrouped: boolean;
  updatePageUrl: (page: number) => void;
}

type CombinedProps = Props & OrderByProps;

const DisplayLinodes: React.FC<CombinedProps> = (props) => {
  const classes = useStyles();
  const {
    count,
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
    updatePageUrl,
    ...rest
  } = props;

  const { infinitePageSize, setInfinitePageSize } = useInfinitePageSize();
  const numberOfLinodesWithMaintenance = data.reduce((acc, thisLinode) => {
    if (thisLinode.maintenance) {
      acc++;
    }
    return acc;
  }, 0);
  const pageSize =
    numberOfLinodesWithMaintenance > infinitePageSize
      ? getMinimumPageSizeForNumberOfItems(numberOfLinodesWithMaintenance)
      : infinitePageSize;
  const maxPageNumber = Math.ceil(count / pageSize);

  const { search } = useLocation();
  const params = getParamsFromUrl(search);
  const queryPage = Math.min(Number(params.page), maxPageNumber) || 1;

  return (
    <Paginate
      data={data}
      page={queryPage}
      // If there are more Linodes with maintenance than the current page size, show the minimum
      // page size needed to show ALL Linodes with maintenance.
      pageSize={pageSize}
      pageSizeSetter={setInfinitePageSize}
      updatePageUrl={updatePageUrl}
    >
      {({
        data: paginatedData,
        handlePageChange,
        handlePageSizeChange,
        page,
        pageSize,
      }) => {
        const componentProps = {
          ...rest,
          data: paginatedData,
          pageSize,
          page,
          handlePageSizeChange,
          handlePageChange,
        };
        const tableWrapperProps = {
          handleOrderChange,
          order,
          orderBy,
          someLinodesHaveMaintenance: props.someLinodesHaveMaintenance,
          dataLength: paginatedData.length,
        };
        return (
          <React.Fragment>
            {display === 'list' && (
              <TableWrapper
                {...tableWrapperProps}
                linodeViewPreference={linodeViewPreference}
                linodesAreGrouped={linodesAreGrouped}
                toggleLinodeView={toggleLinodeView}
                toggleGroupLinodes={toggleGroupLinodes}
                tableProps={{ tableClass: classes.table }}
              >
                <TableBody>
                  <Component showHead {...componentProps} />
                </TableBody>
              </TableWrapper>
            )}
            {display === 'grid' && (
              <>
                <Grid item xs={12} className={'px0'}>
                  <div className={classes.controlHeader}>
                    <div
                      id="displayViewDescription"
                      className="visually-hidden"
                    >
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
                    <Tooltip placement="top-end" title="Group by tag">
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
                <Component showHead {...componentProps} />
              </>
            )}
            <Grid item xs={12}>
              {
                <PaginationFooter
                  count={data.length}
                  handlePageChange={handlePageChange}
                  handleSizeChange={handlePageSizeChange}
                  pageSize={pageSize}
                  page={queryPage}
                  eventCategory={'linodes landing'}
                  showAll
                />
              }
            </Grid>
          </React.Fragment>
        );
      }}
    </Paginate>
  );
};

export default React.memo(DisplayLinodes);
