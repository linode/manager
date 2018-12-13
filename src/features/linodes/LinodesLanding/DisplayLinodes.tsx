import * as React from 'react';
import { connect } from 'react-redux';
import Hidden from 'src/components/core/Hidden';
import Grid from 'src/components/Grid';
import Paginate from 'src/components/Paginate';
import PaginationFooter from 'src/components/PaginationFooter';
import { LinodeConfigSelectionDrawerCallback } from 'src/features/LinodeConfigSelectionDrawer';
import CardView from './CardView';
import ListLinodesEmptyState from './ListLinodesEmptyState';
import ListView from './ListView';

interface Props {
  view: undefined | 'grid' | 'list';
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
  const { view, ...rest } = props;

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
    <Paginate data={props.linodesData} pageSize={25}>
      {(paginatedProps) => (
        <React.Fragment>
          <Hidden mdUp>
            <CardView {...rest} {...paginatedProps} />
          </Hidden>
          <Hidden smDown>
            <Component {...rest} {...paginatedProps} />
          </Hidden>
          <Grid item xs={12}>
            {
              <PaginationFooter
                count={paginatedProps.count}
                handlePageChange={paginatedProps.handlePageChange}
                handleSizeChange={paginatedProps.handlePageSizeChange}
                pageSize={paginatedProps.pageSize}
                page={paginatedProps.page}
              />
            }
          </Grid>
        </React.Fragment>
      )}
    </Paginate>
  )
};

const withLinodes = connect((state: ApplicationState) => ({
  linodesData: state.__resources.linodes.entities,
  linodesCount: state.__resources.linodes.results.length,
}))

export default withLinodes(DisplayLinodes);
