import * as React from 'react';
import { connect } from 'react-redux';
import { branch, compose, renderComponent } from 'recompose';
import CircleProgress from 'src/components/CircleProgress';
import { MapState } from 'src/store/types';

const isLoading = (state: { loading: boolean; lastUpdated: number }) =>
  state.lastUpdated === 0 && state.loading;

interface OuterProps {
  configsLoading: boolean;
  disksLoading: boolean;
}

interface InnerProps {
  loading: boolean;
}

const collectLoadingState: MapState<InnerProps, OuterProps> = (
  state,
  ownProps
) => {
  const {
    linodes,
    types,
    volumes,
    notifications,
    linodeConfigs,
    linodeDisks
  } = state.__resources;
  const { configsLoading, disksLoading } = ownProps;

  return {
    loading:
      configsLoading ||
      disksLoading ||
      isLoading(linodes) ||
      isLoading(types) ||
      isLoading(volumes) ||
      isLoading(notifications) ||
      isLoading(linodeConfigs) ||
      isLoading(linodeDisks)
  };
};

/**
 * Collect relevant loading states from Redux, configs request, and disks requests.
 *
 * If any are true, render the loading component. (early return)
 */
export default compose(
  connect(collectLoadingState),
  branch(({ loading }) => loading, renderComponent(() => <CircleProgress />))
);
