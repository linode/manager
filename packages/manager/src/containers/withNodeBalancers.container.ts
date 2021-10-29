import { connect } from 'react-redux';
import { ApplicationState } from 'src/store';

export default () =>
  connect((state: ApplicationState) => {
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

    return {
      nodeBalancersData: nodeBalancers,
      nodeBalancersLoading: loading,
      nodeBalancersError: error?.read,
      nodeBalancersLastUpdated: lastUpdated,
      nodeBalancersResults: results,
    };
  });
