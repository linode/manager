import { Tooltip } from '@linode/ui';
import { Box } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import { useLocation } from 'react-router-dom';

import GridView from 'src/assets/icons/grid-view.svg';
import GroupByTag from 'src/assets/icons/group-by-tag.svg';
import Paginate from 'src/components/Paginate';
import { getMinimumPageSizeForNumberOfItems } from 'src/components/PaginationFooter/PaginationFooter';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { Paper } from 'src/components/Paper';
import { useIsGeckoEnabled } from 'src/components/RegionSelect/RegionSelect.utils';
import { TableBody } from 'src/components/TableBody';
import { useInfinitePageSize } from 'src/hooks/useInfinitePageSize';
import { getQueryParamsFromQueryString } from 'src/utilities/queryParams';

import {
  StyledControlHeader,
  StyledToggleButton,
} from './DisplayLinodes.styles';
import { RegionTypeFilter } from './RegionTypeFilter';
import TableWrapper from './TableWrapper';

import type { Config } from '@linode/api-v4/lib/linodes';
import type { OrderByProps } from 'src/components/OrderBy';
import type { PaginationProps } from 'src/components/Paginate';
import type { Action } from 'src/features/Linodes/PowerActionsDialogOrDrawer';
import type { DialogType } from 'src/features/Linodes/types';
import type { LinodeWithMaintenance } from 'src/utilities/linodes';
import type { BaseQueryParams } from 'src/utilities/queryParams';
import type { RegionFilter } from 'src/utilities/storage';

interface QueryParams extends BaseQueryParams {
  page: string;
}

export interface RenderLinodesProps
  extends PaginationProps<LinodeWithMaintenance> {
  data: DisplayLinodesProps['data'];
  openDialog: DisplayLinodesProps['openDialog'];
  openPowerActionDialog: DisplayLinodesProps['openPowerActionDialog'];
  showHead?: boolean;
}

interface DisplayLinodesProps extends OrderByProps<LinodeWithMaintenance> {
  component: React.ComponentType<RenderLinodesProps>;
  data: LinodeWithMaintenance[];
  display: 'grid' | 'list';
  handleRegionFilter: (regionFilter: RegionFilter) => void;
  linodeViewPreference: 'grid' | 'list';
  linodesAreGrouped: boolean;
  openDialog: (type: DialogType, linodeID: number, linodeLabel: string) => void;
  openPowerActionDialog: (
    bootAction: Action,
    linodeID: number,
    linodeLabel: string,
    linodeConfigs: Config[]
  ) => void;
  someLinodesHaveMaintenance: boolean;
  toggleGroupLinodes: () => boolean;
  toggleLinodeView: () => 'grid' | 'list';
  updatePageUrl: (page: number) => void;
}

export const DisplayLinodes = React.memo((props: DisplayLinodesProps) => {
  const {
    component: Component,
    data,
    display,
    handleOrderChange,
    handleRegionFilter,
    linodeViewPreference,
    linodesAreGrouped,
    order,
    orderBy,
    toggleGroupLinodes,
    toggleLinodeView,
    updatePageUrl,
    ...rest
  } = props;

  const displayViewDescriptionId = React.useId();
  const groupByDescriptionId = React.useId();
  const { infinitePageSize, setInfinitePageSize } = useInfinitePageSize();

  const numberOfLinodesWithMaintenance = React.useMemo(() => {
    return data.reduce((acc, thisLinode) => {
      if (thisLinode.maintenance) {
        acc++;
      }
      return acc;
    }, 0);
  }, [JSON.stringify(data)]);

  const count = data.length;

  const pageSize =
    numberOfLinodesWithMaintenance > infinitePageSize
      ? getMinimumPageSizeForNumberOfItems(numberOfLinodesWithMaintenance)
      : infinitePageSize;
  const maxPageNumber = Math.ceil(count / pageSize);

  const { search } = useLocation();
  const params = getQueryParamsFromQueryString<QueryParams>(search);
  const queryPage = Math.min(Number(params.page), maxPageNumber) || 1;

  const { isGeckoLAEnabled } = useIsGeckoEnabled();

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
          handlePageChange,
          handlePageSizeChange,
          page,
          pageSize,
        };
        const tableWrapperProps = {
          dataLength: paginatedData.length,
          handleOrderChange,
          order,
          orderBy,
          someLinodesHaveMaintenance: props.someLinodesHaveMaintenance,
        };
        return (
          <React.Fragment>
            {display === 'list' && (
              <>
                {isGeckoLAEnabled && (
                  <Paper sx={{ padding: 1 }}>
                    <RegionTypeFilter handleRegionFilter={handleRegionFilter} />
                  </Paper>
                )}
                <TableWrapper
                  {...tableWrapperProps}
                  linodeViewPreference={linodeViewPreference}
                  linodesAreGrouped={linodesAreGrouped}
                  toggleGroupLinodes={toggleGroupLinodes}
                  toggleLinodeView={toggleLinodeView}
                >
                  <TableBody>
                    <Component showHead {...componentProps} />
                  </TableBody>
                </TableWrapper>
              </>
            )}
            {display === 'grid' && (
              <>
                <Grid className={'px0'} xs={12}>
                  {isGeckoLAEnabled && (
                    <Paper sx={{ padding: 1 }}>
                      <RegionTypeFilter
                        handleRegionFilter={handleRegionFilter}
                      />
                    </Paper>
                  )}
                  <StyledControlHeader>
                    <div
                      className="visually-hidden"
                      id={displayViewDescriptionId}
                    >
                      Currently in {linodeViewPreference} view
                    </div>
                    <Box>
                      <Tooltip placement="top" title="List view">
                        <StyledToggleButton
                          aria-describedby={displayViewDescriptionId}
                          aria-label="Toggle display"
                          disableRipple
                          isActive={true}
                          onClick={toggleLinodeView}
                          size="large"
                        >
                          <GridView />
                        </StyledToggleButton>
                      </Tooltip>
                      <div
                        className="visually-hidden"
                        id={groupByDescriptionId}
                      >
                        {linodesAreGrouped
                          ? 'group by tag is currently enabled'
                          : 'group by tag is currently disabled'}
                      </div>
                      <Tooltip placement="top-end" title="Group by tag">
                        <StyledToggleButton
                          aria-describedby={groupByDescriptionId}
                          aria-label="Toggle group by tag"
                          disableRipple
                          isActive={linodesAreGrouped}
                          onClick={toggleGroupLinodes}
                          size="large"
                        >
                          <GroupByTag />
                        </StyledToggleButton>
                      </Tooltip>
                    </Box>
                  </StyledControlHeader>
                </Grid>
                <Component showHead {...componentProps} />
              </>
            )}
            <Grid xs={12}>
              {
                <PaginationFooter
                  count={data.length}
                  eventCategory={'linodes landing'}
                  handlePageChange={handlePageChange}
                  handleSizeChange={handlePageSizeChange}
                  page={queryPage}
                  pageSize={pageSize}
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
