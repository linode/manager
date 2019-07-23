import { linode4, linodes } from 'src/__data__/linodes';
import {
  linodeFromGroupedItems,
  linodeFromItems,
  linodesToGroupedItems,
  linodesToItems
} from './LinodeSelect';

describe('utilities', () => {
  describe('linodesToItems', () => {
    const items = linodesToItems(linodes);
    it('includes a value with the Linode ID', () => {
      items.forEach(item => {
        expect(item.value).toBe(item.data.id);
      });
    });

    it('includes a label with the Linode label', () => {
      items.forEach(item => {
        expect(item.label).toBe(item.data.label);
      });
    });
  });

  describe('linodeFromItems', () => {
    const items = linodesToItems(linodes);
    it('returns the Linode with the given ID', () => {
      expect(linodeFromItems(items, 2020755)).toHaveProperty('value', 2020755);
    });
    it('returns `null` when there is no Linode found', () => {
      expect(linodeFromItems(items, 0)).toBe(null);
    });
  });

  describe('linodeToGroupedItems', () => {
    // Adding `linode4` to see one in another region
    const groupedItems = linodesToGroupedItems([...linodes, linode4]);
    it('returns one groupedItem for each region, with the formatted region name as label.', () => {
      expect(groupedItems).toHaveLength(2);
      expect(groupedItems[0].label).toBe('Newark, NJ');
      expect(groupedItems[1].label).toBe('London, UK');
    });

    it('includes all options in a specific regions in each group', () => {
      groupedItems[0].options.forEach(option => {
        expect(option.data.region).toBe('us-east-1a');
      });
      groupedItems[1].options.forEach(option => {
        expect(option.data.region).toBe('eu-west');
      });
    });

    it("works even if there's only one region", () => {
      // These are all in the same region.
      const oneGroupOfItems = linodesToGroupedItems(linodes);
      expect(oneGroupOfItems).toHaveLength(1);
    });
  });

  describe('linodeFromGroupedItems', () => {
    // Adding `linode4` to see one in another region
    const groupedItems = linodesToGroupedItems([...linodes, linode4]);
    it('finds a specific Linode in a set of grouped items', () => {
      const foundLinode = linodeFromGroupedItems(groupedItems, 12345);
      expect(foundLinode).toHaveProperty('value', 12345);
    });

    it('returns `null` when there is no Linode found', () => {
      expect(linodeFromGroupedItems(groupedItems, 0)).toBe(null);
    });

    it("works even if there's only one region", () => {
      // These are all in the same region.
      const oneGroupOfItems = linodesToGroupedItems(linodes);
      const foundLinode = linodeFromGroupedItems(oneGroupOfItems, 2020755);
      expect(foundLinode).toHaveProperty('value', 2020755);
    });
  });
});
