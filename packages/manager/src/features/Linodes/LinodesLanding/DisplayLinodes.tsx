import { Config } from '@linode/api-v4/lib/linodes';
import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { TableBody } from 'src/components/TableBody';
import Grid from '@mui/material/Unstable_Grid2';
import { OrderByProps } from 'src/components/OrderBy';
import Paginate, { PaginationProps } from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { getMinimumPageSizeForNumberOfItems } from 'src/components/PaginationFooter/PaginationFooter';
import { Action } from 'src/features/Linodes/PowerActionsDialogOrDrawer';
import { DialogType } from 'src/features/Linodes/types';
import { useInfinitePageSize } from 'src/hooks/useInfinitePageSize';
import TableWrapper from './TableWrapper';
import { Tooltip } from 'src/components/Tooltip';
import GroupByTag from 'src/assets/icons/group-by-tag.svg';
import GridView from 'src/assets/icons/grid-view.svg';
import { getQueryParamsFromQueryString } from 'src/utilities/queryParams';
import { LinodeWithMaintenanceAndDisplayStatus } from 'src/store/linodes/types';
import { LinodeWithMaintenance } from 'src/store/linodes/linodes.helpers';
import {
  StyledControlHeader,
  StyledToggleButton,
} from './DisplayLinodes.styles';

export interface RenderLinodesProps extends PaginationProps {
  data: Props['data'];
  showHead?: boolean;
  openDialog: Props['openDialog'];
  openPowerActionDialog: Props['openPowerActionDialog'];
}

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
  component: React.ComponentType<RenderLinodesProps>;
  data: LinodeWithMaintenance[];
  someLinodesHaveMaintenance: boolean;
  toggleLinodeView: () => 'grid' | 'list';
  toggleGroupLinodes: () => boolean;
  linodeViewPreference: 'grid' | 'list';
  linodesAreGrouped: boolean;
  updatePageUrl: (page: number) => void;
}

type CombinedProps = Props &
  OrderByProps<LinodeWithMaintenanceAndDisplayStatus>;

export const DisplayLinodes = React.memo((props: CombinedProps) => {
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
  const numberOfLinodesWithMaintenance = React.useMemo(() => {
    return data.reduce((acc, thisLinode) => {
      if (thisLinode.maintenance) {
        acc++;
      }
      return acc;
    }, 0);
  }, [JSON.stringify(data)]);
  const pageSize =
    numberOfLinodesWithMaintenance > infinitePageSize
      ? getMinimumPageSizeForNumberOfItems(numberOfLinodesWithMaintenance)
      : infinitePageSize;
  const maxPageNumber = Math.ceil(count / pageSize);

  const { search } = useLocation();
  const params = getQueryParamsFromQueryString(search);
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
          count,
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
              >
                <TableBody>
                  <Component showHead {...componentProps} />
                </TableBody>
              </TableWrapper>
            )}
            {display === 'grid' && (
              <>
                <Grid xs={12} className={'px0'}>
                  <StyledControlHeader isGroupedByTag={linodesAreGrouped}>
                    <div
                      id="displayViewDescription"
                      className="visually-hidden"
                    >
                      Currently in {linodeViewPreference} view
                    </div>
                    <Tooltip placement="top" title="List view">
                      <StyledToggleButton
                        aria-label="Toggle display"
                        aria-describedby={'displayViewDescription'}
                        disableRipple
                        isActive={true}
                        onClick={toggleLinodeView}
                        size="large"
                      >
                        <GridView />
                      </StyledToggleButton>
                    </Tooltip>

                    <div id="groupByDescription" className="visually-hidden">
                      {linodesAreGrouped
                        ? 'group by tag is currently enabled'
                        : 'group by tag is currently disabled'}
                    </div>
                    <Tooltip placement="top-end" title="Group by tag">
                      <StyledToggleButton
                        aria-label={`Toggle group by tag`}
                        aria-describedby={'groupByDescription'}
                        onClick={toggleGroupLinodes}
                        disableRipple
                        isActive={linodesAreGrouped}
                        size="large"
                      >
                        <GroupByTag />
                      </StyledToggleButton>
                    </Tooltip>
                  </StyledControlHeader>
                </Grid>
                <Component showHead {...componentProps} />
              </>
            )}
            <Grid xs={12}>
              {
                <PaginationFooter
                  count={data.length}
                  handlePageChange={handlePageChange}
                  handleSizeChange={handlePageSizeChange}
                  pageSize={pageSize}
                  page={queryPage}
                  eventCategory={'linodes landing'}
                  // Disabling showAll as it is impacting page performance.
                  showAll={false}
                />
              }
            </Grid>
          </React.Fragment>
        );
      }}
    </Paginate>
  );
});
