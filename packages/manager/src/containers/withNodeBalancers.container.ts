import { NodeBalancer } from '@linode/api-v4/lib/nodebalancers';
import { APIError } from '@linode/api-v4/lib/types';
import { connect } from 'react-redux';
import { ApplicationState } from 'src/store';

type MapProps<TOuter, TInner> = (
  ownProps: TOuter,
  nodeBalancers: NodeBalancer[],
  loading: boolean,
  results: number,
  lastUpdated: number,
  error?: APIError[]
) => TInner;

export default <TInner extends {}, TOuter extends {}>(
  mapToProps: MapProps<TOuter, TInner>
) =>
  connect((state: ApplicationState, ownProps: TOuter) => {
    const {
      lastUpdated,
      loading,
      error,
      itemsById,
      results,
    } = state.__resources.nodeBalancers;

    /** itemsById looks like this
     *
     * {
     *  123: NodeBalancer,
     *  4234: NodeBalancer
     * }
     *
     * we want it to look like
     *
     * NodeBalancer[]
     */
    const nodeBalancers = Object.values(itemsById);

    return mapToProps(
      ownProps,
      nodeBalancers,
      loading,
      results,
      lastUpdated,
      error?.read ?? undefined
    );
  });
