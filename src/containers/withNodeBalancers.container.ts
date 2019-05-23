import { connect } from 'react-redux';
import { ApplicationState } from 'src/store';

type MapProps<TOuter, TInner> = (
  ownProps: TOuter,
  nodeBalancers: Linode.NodeBalancer[],
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
     *  123: Linode.NodeBalancer,
     *  4234: Linode.NodeBalancer
     * }
     *
     * we want it to look like
     *
     * Linode.NodeBalancer[]
     */
    const nodeBalancers = Object.keys(itemsById).map(
      eachKey => itemsById[eachKey]
    );

    return mapToProps(ownProps, nodeBalancers, loading, error);
  });
