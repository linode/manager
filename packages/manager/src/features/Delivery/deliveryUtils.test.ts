import { destinationType } from '@linode/api-v4';
import { expect } from 'vitest';

import { getDestinationTypeOption } from 'src/features/Delivery/deliveryUtils';
import { destinationTypeOptions } from 'src/features/Delivery/Shared/types';

describe('delivery utils functions', () => {
  describe('getDestinationTypeOption ', () => {
    it('should return option object matching provided value', () => {
      const result = getDestinationTypeOption(
        destinationType.LinodeObjectStorage
      );
      expect(result).toEqual(destinationTypeOptions[1]);
    });

    it('should return undefined when no option is a match', () => {
      const result = getDestinationTypeOption('random value');
      expect(result).toEqual(undefined);
    });
  });
});
