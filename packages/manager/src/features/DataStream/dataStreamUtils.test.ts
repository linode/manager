import { expect } from 'vitest';

import { getDestinationTypeOption } from 'src/features/DataStream/dataStreamUtils';
import {
  destinationType,
  destinationTypeOptions,
} from 'src/features/DataStream/Shared/types';

describe('dataStream utils functions', () => {
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
