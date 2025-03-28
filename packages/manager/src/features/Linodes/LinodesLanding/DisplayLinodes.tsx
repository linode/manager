import { Box, CircleProgress, IconButton, Paper, Tooltip } from '@linode/ui';
import { getQueryParamsFromQueryString } from '@linode/utilities';
import Grid from '@mui/material/Grid';
import * as React from 'react';
import { useLocation } from 'react-router-dom';

import GridView from 'src/assets/icons/grid-view.svg';
import GroupByTag from 'src/assets/icons/group-by-tag.svg';
import Paginate from 'src/components/Paginate';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { getMinimumPageSizeForNumberOfItems } from 'src/components/PaginationFooter/PaginationFooter.utils';
import { useIsGeckoEnabled } from 'src/components/RegionSelect/RegionSelect.utils';
import { TableBody } from 'src/components/TableBody';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { useFlags } from 'src/hooks/useFlags';
import { useInfinitePageSize } from 'src/hooks/useInfinitePageSize';

import { StyledControlHeader } from './DisplayLinodes.styles';
import { RegionTypeFilter } from './RegionTypeFilter';
import TableWrapper from './TableWrapper';

import type { Config } from '@linode/api-v4/lib/linodes';
import type { BaseQueryParams } from '@linode/utilities';
import type { OrderByProps } from 'src/components/OrderBy';
import type { PaginationProps } from 'src/components/Paginate';
import type { Action } from 'src/features/Linodes/PowerActionsDialogOrDrawer';
import type { DialogType } from 'src/features/Linodes/types';
import type { LinodeWithMaintenance } from 'src/utilities/linodes';
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
  filteredLinodesLoading: boolean;
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
    filteredLinodesLoading,
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
  const flags = useFlags();

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

  const { isGeckoLAEnabled } = useIsGeckoEnabled(flags);

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
                  <Paper
                    sx={{ borderBottom: 0, padding: 1 }}
                    variant="outlined"
                  >
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
                    {filteredLinodesLoading ? (
                      <TableRowLoading columns={7} />
                    ) : (
                      <Component showHead {...componentProps} />
                    )}
                  </TableBody>
                </TableWrapper>
              </>
            )}
            {display === 'grid' && (
              <>
                <Grid className={'px0'} size={12}>
                  {isGeckoLAEnabled && (
                    <Paper
                      sx={{ borderBottom: 0, padding: 1 }}
                      variant="outlined"
                    >
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
                        <IconButton
                          aria-describedby={displayViewDescriptionId}
                          aria-label="Toggle display"
                          className="MuiIconButton-isActive"
                          disableRipple
                          onClick={toggleLinodeView}
                        >
                          <GridView />
                        </IconButton>
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
                        <IconButton
                          className={
                            linodesAreGrouped ? 'MuiIconButton-isActive' : ''
                          }
                          sx={(theme) => ({
                            ':hover': {
                              color: theme.tokens.color.Brand[60],
                            },
                            color:
                              theme.tokens.component.Table.HeaderNested.Icon,
                          })}
                          aria-describedby={groupByDescriptionId}
                          aria-label="Toggle group by tag"
                          disableRipple
                          onClick={toggleGroupLinodes}
                        >
                          <GroupByTag />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </StyledControlHeader>
                </Grid>
                {filteredLinodesLoading ? (
                  <CircleProgress />
                ) : (
                  <Component showHead {...componentProps} />
                )}
              </>
            )}
            <Grid size={12}>
              {
                <PaginationFooter
                  sx={{
                    border: 0,
                  }}
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
