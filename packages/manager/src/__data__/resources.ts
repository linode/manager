import { Domain } from '@linode/api-v4/lib/domains';
import { Linode } from '@linode/api-v4/lib/linodes';

import { domains, linodes } from 'src/__data__';

export default {
  domains: {
    entities: domains,
    lastUpdated: 0,
    loading: false,
    results: [domains.map((domain: Domain) => domain.id)],
  },
  images: {
    entities: [],
    lastUpdated: 0,
    loading: false,
    results: [],
  },
  linodes: {
    entities: linodes,
    lastUpdated: 0,
    loading: false,
    results: [linodes.map((linode: Linode) => linode.id)],
  },
  nodebalancers: {
    entities: [],
    lastUpdated: 0,
    loading: false,
    results: [],
  },
  types: {
    entities: [],
    lastUpdated: 0,
    loading: false,
    results: [],
  },
  volumes: {
    entities: [],
    lastUpdated: 0,
    loading: false,
    results: [],
  },
};
