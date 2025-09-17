import { deliveryCrudPreset } from 'src/mocks/presets/crud/delivery';
import {
  getEvents,
  updateEvents,
} from 'src/mocks/presets/crud/handlers/events';
import { linodeCrudPreset } from 'src/mocks/presets/crud/linodes';

import { cloudNATCrudPreset } from '../crud/cloudnats';
import { domainCrudPreset } from '../crud/domains';
import { firewallCrudPreset } from '../crud/firewalls';
import { kubernetesCrudPreset } from '../crud/kubernetes';
import { nodeBalancerCrudPreset } from '../crud/nodebalancers';
import { placementGroupsCrudPreset } from '../crud/placementGroups';
import { quotasCrudPreset } from '../crud/quotas';
import { supportTicketCrudPreset } from '../crud/supportTickets';
import { volumeCrudPreset } from '../crud/volumes';
import { vpcCrudPreset } from '../crud/vpcs';

import type { MockPresetBaseline } from 'src/mocks/types';

export const baselineCrudPreset: MockPresetBaseline = {
  group: { id: 'General' },
  handlers: [
    ...cloudNATCrudPreset.handlers,
    ...domainCrudPreset.handlers,
    ...deliveryCrudPreset.handlers,
    ...firewallCrudPreset.handlers,
    ...kubernetesCrudPreset.handlers,
    ...linodeCrudPreset.handlers,
    ...placementGroupsCrudPreset.handlers,
    ...quotasCrudPreset.handlers,
    ...supportTicketCrudPreset.handlers,
    ...volumeCrudPreset.handlers,
    ...vpcCrudPreset.handlers,
    ...nodeBalancerCrudPreset.handlers,

    // Events.
    getEvents,
    updateEvents,
  ],
  id: 'baseline:crud',
  label: 'CRUD',
};
