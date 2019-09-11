import { NodeBalancer } from 'linode-js-sdk/lib/nodebalancers';
import { connect } from 'react-redux';
import { ApplicationState } from 'src/store';

type MapProps<TOuter, TInner> = (
  ownProps: TOuter,
  nodeBalancers: NodeBalancer[],
  loading: boolean,
  error?: Linode.ApiFieldError[]
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
    const nodeBalancers = Object.keys(itemsById).map(
      eachKey => itemsById[eachKey]
    );

    return mapToProps(
      ownProps,
      nodeBalancers,
      loading,
      error ? error.read : undefined
    );
  });
