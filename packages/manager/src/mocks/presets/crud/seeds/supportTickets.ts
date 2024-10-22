import { getSeedsCountMap } from 'src/dev-tools/utils';
import { supportTicketFactory } from 'src/factories';
import { mswDB } from 'src/mocks/indexedDB';

import type { MockSeeder, MockState } from 'src/mocks/types';

export const supportTicketsSeeder: MockSeeder = {
  canUpdateCount: true,
  desc: 'Support Tickets Seeds',
  group: { id: 'Support Tickets' },
  id: 'support-tickets:crud',
  label: 'Support Tickets',

  seeder: async (mockState: MockState) => {
    const seedsCountMap = getSeedsCountMap();
    const count = seedsCountMap[supportTicketsSeeder.id] ?? 0;
    const supportTickets = supportTicketFactory.buildList(count);

    const updatedMockState = {
      ...mockState,
      supportTickets: mockState.supportTickets.concat(supportTickets),
    };

    await mswDB.saveStore(updatedMockState, 'seedState');

    return updatedMockState;
  },
};
