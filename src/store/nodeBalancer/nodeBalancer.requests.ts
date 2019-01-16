import * as Bluebird from 'bluebird';
import { normalize, schema } from 'normalizr';
import { getNodeBalancerConfigs, getNodeBalancers } from 'src/services/nodebalancers';
import { getAll } from 'src/utilities/getAll';
import { createRequestThunk } from '../store.helpers';
import { getAllNodeBalancersActions } from './nodeBalancer.actions';

const nodeBalancerConfigSchema = new schema.Entity(`nodeBalancerConfigs`);

const nodeBalancerSchema = new schema.Entity(
  `nodeBalancers`,
  { configs: [nodeBalancerConfigSchema] },
  {
    mergeStrategy: (left: Linode.NodeBalancerWithConfigIDs, right: Linode.NodeBalancerWithConfigIDs) => {
      return {
        ...left,
        ...right,
        configs: [...(left.configs || []), ...(right.configs || [])]
      }
    },
  }
);

const _getAll = getAll<Linode.NodeBalancer>(getNodeBalancers);

const _getAllConfig = (id: number) => getAll<Linode.NodeBalancerConfig>(() => getNodeBalancerConfigs(id))();

const getAllNodeBalancersRequest = () => _getAll()
  .then(({ data: nodeBalancers }) => {
    return Bluebird.map(nodeBalancers, (nodeBalancer) => {
      return _getAllConfig(nodeBalancer.id)
        .then(({ data: nodeBalancerConfigs }) => {
          return {
            ...nodeBalancer,
            configs: nodeBalancerConfigs || [],
          };
        });
    });
  })
  .then((response) => normalize(response, [nodeBalancerSchema]))

export const getAllNodeBalancers = createRequestThunk(
  getAllNodeBalancersActions,
  getAllNodeBalancersRequest,
);
