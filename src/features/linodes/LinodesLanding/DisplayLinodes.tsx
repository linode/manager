import * as React from 'react';
import { connect } from 'react-redux';
import Hidden from 'src/components/core/Hidden';
import Grid from 'src/components/Grid';
import OrderBy from 'src/components/OrderBy';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import { LinodeConfigSelectionDrawerCallback } from 'src/features/LinodeConfigSelectionDrawer';
import CardView from './CardView';
import ListLinodesEmptyState from './ListLinodesEmptyState';
import ListView from './ListView';

interface Props {
  view?: 'grid' | 'list';
  images: Linode.Image[];
  openConfigDrawer: (c: Linode.Config[], action: LinodeConfigSelectionDrawerCallback) => void;
  toggleConfirmation: (bootOption: Linode.BootAction, linodeId: number, linodeLabel: string) => void;
}

interface WithLinodes {
  linodesData: Linode.Linode[];
  linodesCount: number;
};

type CombinedProps =
  & Props
  & WithLinodes;

const DisplayLinodes: React.StatelessComponent<CombinedProps> = (props) => {
  const { view, linodesCount, ...rest } = props;

  if (props.linodesCount === 0) {
    return <ListLinodesEmptyState />
  }

  const Component = view
    ? view === 'grid'
      ? CardView
      : ListView
    : props.linodesCount >= 3
      ? ListView
      : CardView;

  return (
    <OrderBy data={props.linodesData} order={'asc'} orderBy={'label'}>
      {({ data, handleOrderChange, order, orderBy }) => (
        <Paginate data={data} pageSize={25}>
          {({ data, handlePageChange, handlePageSizeChange, page, pageSize }) => {
            const finalProps = {
              ...rest,
              data,
              pageSize,
              page,
              handlePageSizeChange,
              handlePageChange,
              handleOrderChange,
              order,
              orderBy,
            };
            return (
              <React.Fragment>
                <Hidden mdUp>
                  <CardView {...finalProps} />
                </Hidden>
                <Hidden smDown>
                  <Component showHead {...finalProps} />
                </Hidden>
                <Grid item xs={12}>
                  {
                    <PaginationFooter
                      count={linodesCount}
                      handlePageChange={handlePageChange}
                      handleSizeChange={handlePageSizeChange}
                      pageSize={pageSize}
                      page={page}
                    />
                  }
                </Grid>
              </React.Fragment>
            )
          }}
        </Paginate>
      )}
    </OrderBy>
  )
};

const withLinodes = connect((state: ApplicationState) => ({
  linodesData: state.__resources.linodes.entities,
  linodesCount: state.__resources.linodes.results.length,
}))

export default withLinodes(DisplayLinodes);
