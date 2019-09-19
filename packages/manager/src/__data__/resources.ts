import { Domain } from 'linode-js-sdk/lib/domains';
import { Linode } from 'linode-js-sdk/lib/linodes';
import { domains, linodes } from 'src/__data__';

export default {
  linodes: {
    loading: false,
    lastUpdated: 0,
    results: [linodes.map((linode: Linode) => linode.id)],
    entities: linodes
  },
  volumes: {
    loading: false,
    lastUpdated: 0,
    results: [],
    entities: []
  },
  nodebalancers: {
    loading: false,
    lastUpdated: 0,
    results: [],
    entities: []
  },
  domains: {
    loading: false,
    lastUpdated: 0,
    results: [domains.map((domain: Domain) => domain.id)],
    entities: domains
  },
  images: {
    loading: false,
    lastUpdated: 0,
    results: [],
    entities: []
  },
  types: {
    loading: false,
    lastUpdated: 0,
    results: [],
    entities: []
  }
};
