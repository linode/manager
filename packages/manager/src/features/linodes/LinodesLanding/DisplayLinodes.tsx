import { Config } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import TableBody from 'src/components/core/TableBody';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import { OrderByProps } from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import { getMinimumPageSizeForNumberOfItems } from 'src/components/PaginationFooter/PaginationFooter';
import { Action } from 'src/features/linodes/PowerActionsDialogOrDrawer';
import { DialogType } from 'src/features/linodes/types';
import useFlags from 'src/hooks/useFlags';
import { useInfinitePageSize } from 'src/hooks/useInfinitePageSize';
import { ExtendedLinode } from '../LinodesDetail/types';
import TableWrapper from './TableWrapper';
import TableWrapper_CMR from './TableWrapper_CMR';
import IconButton from 'src/components/core/IconButton';
import GroupByTag from 'src/assets/icons/group-by-tag.svg';
import TableView from 'src/assets/icons/table-view.svg';

const useStyles = makeStyles((theme: Theme) => ({
  controlHeader: {
    marginBottom: 28,
    display: 'flex',
    justifyContent: 'flex-end',
    backgroundColor: theme.cmrBGColors.bgTableHeader
  },
  toggleButton: {
    padding: 10,
    '&:focus': {
      // Browser default until we get styling direction for focus states
      outline: '1px dotted #999'
    }
  }
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
}

type CombinedProps = Props & OrderByProps;

const DisplayLinodes: React.FC<CombinedProps> = props => {
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
    ...rest
  } = props;

  const flags = useFlags();

  const { infinitePageSize, setInfinitePageSize } = useInfinitePageSize();

  const numberOfLinodesWithMaintenance = data.reduce((acc, thisLinode) => {
    if (thisLinode.maintenance) {
      acc++;
    }
    return acc;
  }, 0);

  return (
    <Paginate
      data={data}
      // If there are more Linodes with maintenance than the current page size, show the minimum
      // page size needed to show ALL Linodes with maintenance.
      pageSize={
        numberOfLinodesWithMaintenance > infinitePageSize
          ? getMinimumPageSizeForNumberOfItems(numberOfLinodesWithMaintenance)
          : infinitePageSize
      }
      pageSizeSetter={setInfinitePageSize}
    >
      {({
        data: paginatedData,
        handlePageChange,
        handlePageSizeChange,
        page,
        pageSize
      }) => {
        const componentProps = {
          ...rest,
          data: paginatedData,
          pageSize,
          page,
          handlePageSizeChange,
          handlePageChange
        };
        const tableWrapperProps = {
          handleOrderChange,
          order,
          orderBy,
          someLinodesHaveMaintenance: props.someLinodesHaveMaintenance,
          dataLength: paginatedData.length
        };
        return (
          <React.Fragment>
            {display === 'list' &&
              (flags.cmr ? (
                <TableWrapper_CMR
                  {...tableWrapperProps}
                  linodeViewPreference={linodeViewPreference}
                  linodesAreGrouped={linodesAreGrouped}
                  toggleLinodeView={toggleLinodeView}
                  toggleGroupLinodes={toggleGroupLinodes}
                >
                  <TableBody>
                    <Component showHead {...componentProps} />
                  </TableBody>
                </TableWrapper_CMR>
              ) : (
                <TableWrapper {...tableWrapperProps}>
                  <TableBody>
                    <Component showHead {...componentProps} />
                  </TableBody>
                </TableWrapper>
              ))}
            {display === 'grid' && (
              <>
                <Grid item xs={12} className={'px0'}>
                  {flags.cmr && (
                    <div className={classes.controlHeader}>
                      <div
                        id="displayViewDescription"
                        className="visually-hidden"
                      >
                        Currently in {linodeViewPreference} view
                      </div>
                      <IconButton
                        aria-label="Toggle display"
                        aria-describedby={'displayViewDescription'}
                        title={`Toggle display`}
                        onClick={toggleLinodeView}
                        disableRipple
                        className={classes.toggleButton}
                      >
                        <TableView />
                      </IconButton>

                      <div id="groupByDescription" className="visually-hidden">
                        {linodesAreGrouped
                          ? 'group by tag is currently enabled'
                          : 'group by tag is currently disabled'}
                      </div>
                      <IconButton
                        aria-label={`Toggle group by tag`}
                        aria-describedby={'groupByDescription'}
                        title={`Toggle group by tag`}
                        onClick={toggleGroupLinodes}
                        disableRipple
                        className={classes.toggleButton}
                      >
                        <GroupByTag />
                      </IconButton>
                    </div>
                  )}
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
                  page={page}
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
