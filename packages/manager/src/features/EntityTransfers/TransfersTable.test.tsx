import { entityTransferFactory } from 'src/factories/entityTransfers';
import { formatEntitiesCell } from './RenderTransferRow';

const entityTransfer1 = entityTransferFactory.build();
const entityTransfer1Entities = Object.entries(entityTransfer1.entities)[0];

const entityTransfer2 = entityTransferFactory.build({
  entities: {
    linodes: [95],
  },
});
const entityTransfer2Entities = Object.entries(entityTransfer2.entities)[0];

const entityTransfer3 = entityTransferFactory.build({
  entities: {
    linodes: [20, 25, 30, 35, 40, 45, 50, 55, 60, 65],
  },
});
const entityTransfer3Entities = Object.entries(entityTransfer3.entities)[0];

// for when transfer capabilities get added for other entities
// const entityTransfer2 = entityTransferFactory.build({
//   entities: {
//     linodes: [0, 1, 2, 3],
//     domains: [4, 5],
//     volumes: [6, 7, 8, 9, 10]
//   }
// });

describe('TransfersTable component', () => {
  describe('formatEntitiesCell helper function', () => {
    it('should return the correct string entry for the given entity transfer', () => {
      expect(formatEntitiesCell(entityTransfer1Entities)).toEqual('4 Linodes');
      expect(formatEntitiesCell(entityTransfer2Entities)).toEqual('1 Linode');
      expect(formatEntitiesCell(entityTransfer3Entities)).toEqual('10 Linodes');
    });
  });
});
