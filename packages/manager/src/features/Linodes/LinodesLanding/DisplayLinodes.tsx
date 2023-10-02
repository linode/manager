import Grid from '@mui/material/Unstable_Grid2';
import * as React from 'react';
import { useLocation } from 'react-router-dom';

import GridView from 'src/assets/icons/grid-view.svg';
import GroupByTag from 'src/assets/icons/group-by-tag.svg';
import { OrderByProps } from 'src/components/OrderBy';
import Paginate, { PaginationProps } from 'src/components/Paginate';
import { getMinimumPageSizeForNumberOfItems } from 'src/components/PaginationFooter/PaginationFooter';
import { PaginationFooter } from 'src/components/PaginationFooter/PaginationFooter';
import { TableBody } from 'src/components/TableBody';
import { Tooltip } from 'src/components/Tooltip';
import { Action } from 'src/features/Linodes/PowerActionsDialogOrDrawer';
import { DialogType } from 'src/features/Linodes/types';
import { useInfinitePageSize } from 'src/hooks/useInfinitePageSize';
import { LinodeWithMaintenance } from 'src/utilities/linodes';
import { getQueryParamsFromQueryString } from 'src/utilities/queryParams';

import {
  StyledControlHeader,
  StyledToggleButton,
} from './DisplayLinodes.styles';
import TableWrapper from './TableWrapper';

import type { Config } from '@linode/api-v4/lib/linodes';

export interface RenderLinodesProps
  extends PaginationProps<LinodeWithMaintenance> {
  data: Props['data'];
  openDialog: Props['openDialog'];
  openPowerActionDialog: Props['openPowerActionDialog'];
  showHead?: boolean;
}

interface Props {
  component: React.ComponentType<RenderLinodesProps>;
  data: LinodeWithMaintenance[];
  display: 'grid' | 'list';
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

type CombinedProps = Props & OrderByProps<LinodeWithMaintenance>;

export const DisplayLinodes = React.memo((props: CombinedProps) => {
  const {
    component: Component,
    data,
    display,
    handleOrderChange,
    linodeViewPreference,
    linodesAreGrouped,
    order,
    orderBy,
    toggleGroupLinodes,
    toggleLinodeView,
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
  const count = data.length;
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
            )}
            {display === 'grid' && (
              <>
                <Grid className={'px0'} xs={12}>
                  <StyledControlHeader isGroupedByTag={linodesAreGrouped}>
                    <div
                      className="visually-hidden"
                      id="displayViewDescription"
                    >
                      Currently in {linodeViewPreference} view
                    </div>
                    <Tooltip placement="top" title="List view">
                      <StyledToggleButton
                        aria-describedby={'displayViewDescription'}
                        aria-label="Toggle display"
                        disableRipple
                        isActive={true}
                        onClick={toggleLinodeView}
                        size="large"
                      >
                        <GridView />
                      </StyledToggleButton>
                    </Tooltip>

                    <div className="visually-hidden" id="groupByDescription">
                      {linodesAreGrouped
                        ? 'group by tag is currently enabled'
                        : 'group by tag is currently disabled'}
                    </div>
                    <Tooltip placement="top-end" title="Group by tag">
                      <StyledToggleButton
                        aria-describedby={'groupByDescription'}
                        aria-label={`Toggle group by tag`}
                        disableRipple
                        isActive={linodesAreGrouped}
                        onClick={toggleGroupLinodes}
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
