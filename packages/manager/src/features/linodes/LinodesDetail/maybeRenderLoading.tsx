import { connect } from 'react-redux';
import { compose } from 'recompose';
import { MapState } from 'src/store/types';

const isLoading = (state: { loading: boolean; lastUpdated: number }) =>
  state.lastUpdated === 0 && state.loading;

interface OuterProps {
  configsLoading: boolean;
  disksLoading: boolean;
  linodeId: number;
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
    notifications,
    linodeConfigs,
    linodeDisks
  } = state.__resources;
  const { configsLoading, disksLoading, linodeId } = ownProps;

  return {
    loading:
      configsLoading ||
      disksLoading ||
      isLoading(linodes) ||
      isLoading(types) ||
      isLoading(notifications) ||
      (linodeConfigs[linodeId] && isLoading(linodeConfigs[linodeId])) ||
      (linodeDisks[linodeId] && isLoading(linodeDisks[linodeId]))
  };
};

/**
 * Collect relevant loading states from Redux, configs request, and disks requests.
 *
 * If any are true, render the loading component. (early return)
 */
export default compose(connect(collectLoadingState));
