import { entityTransferFactory } from 'src/factories/entityTransfers';
import capitalize from 'src/utilities/capitalize';
import { pluralize } from 'src/utilities/pluralize';
import { formatEntitiesCell } from './TransfersTable';

const entityTransfer1 = entityTransferFactory.build();
const entityTransfer1Entities = Object.entries(entityTransfer1.entities)[0];

// for when transfer capabilities get added for other entities
// const entityTransfer2 = entityTransferFactory.build({
//   entities: {
//     linodes: [0, 1, 2, 3],
//     domains: [4, 5],
//     volumes: [6, 7, 8, 9, 10]
//   }
// });

const entityTransferList1 = entityTransferFactory.buildList(2);
const combinedEntityTransferList = entityTransferList1.concat(
  entityTransferFactory.buildList(2, {
    entities: {
      linodes: [95]
    }
  })
);

describe('TransfersTable component', () => {
  describe('formatEntitiesCell helper function', () => {
    it('should return the correct string entry for the given entity transfer', () => {
      expect(formatEntitiesCell(entityTransfer1Entities)).toEqual('4 Linodes');
    });

    it('should return the correct string entries for multiple entities', () => {
      combinedEntityTransferList.map(entry => {
        const entryListOfEntities = Object.entries(entry['entities'])[0];

        const entityCount = entryListOfEntities[1].length;

        const entityName = capitalize(entryListOfEntities[0]); // This is plural
        const entityNameSingular = capitalize(
          entityName.substring(0, entityName.length - 1)
        );

        const pluralized = pluralize(
          entityNameSingular,
          entityName,
          entityCount
        );

        expect(formatEntitiesCell(entryListOfEntities)).toEqual(pluralized);
      });
    });
  });
});
