import { NodeBalancer } from 'linode-js-sdk/lib/nodebalancers';
import { APIError } from 'linode-js-sdk/lib/types';
import { connect } from 'react-redux';
import { ApplicationState } from 'src/store';

type MapProps<TOuter, TInner> = (
  ownProps: TOuter,
  nodeBalancers: NodeBalancer[],
  loading: boolean,
  error?: APIError[]
) => TInner;

export default <TInner extends {}, TOuter extends {}>(
  mapToProps: MapProps<TOuter, TInner>
) =>
  connect((state: ApplicationState, ownProps: TOuter) => {
    const { loading, error, itemsById } = state.__resources.nodeBalancers;

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
      error?.read ?? undefined
    );
  });
