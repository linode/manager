import * as React from 'react';
import { connect } from 'react-redux';
import { branch, compose, renderComponent } from 'recompose';
import CircleProgress from 'src/components/CircleProgress';
import { MapState } from 'src/store/types';

const isLoading = (state: { loading: boolean; lastUpdated: number }) =>
  state.lastUpdated === 0 && state.loading;

interface OutterProps {
  configsLoading: boolean;
  disksLoading: boolean;
}

interface InnerProps {
  loading: boolean;
}

const collectLoadingState: MapState<InnerProps, OutterProps> = (
  state,
  ownProps
) => {
  const { linodes, types, volumes, notifications } = state.__resources;
  const { configsLoading, disksLoading } = ownProps;

  return {
    loading:
      configsLoading ||
      disksLoading ||
      isLoading(linodes) ||
      isLoading(types) ||
      isLoading(volumes) ||
      isLoading(notifications)
  };
};

export default compose(
  connect(collectLoadingState),
  branch(({ loading }) => loading, renderComponent(() => <CircleProgress />))
);
