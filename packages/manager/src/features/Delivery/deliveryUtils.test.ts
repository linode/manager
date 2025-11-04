import { destinationType } from '@linode/api-v4';
import { expect } from 'vitest';

import {
  getDestinationPayloadDetails,
  getDestinationTypeOption,
} from 'src/features/Delivery/deliveryUtils';
import { destinationTypeOptions } from 'src/features/Delivery/Shared/types';

import type {
  AkamaiObjectStorageDetailsExtended,
  AkamaiObjectStorageDetailsPayload,
} from '@linode/api-v4';

describe('delivery utils functions', () => {
  describe('getDestinationTypeOption ', () => {
    it('should return option object matching provided value', () => {
      const result = getDestinationTypeOption(
        destinationType.AkamaiObjectStorage
      );
      expect(result).toEqual(destinationTypeOptions[1]);
    });

    it('should return undefined when no option is a match', () => {
      const result = getDestinationTypeOption('random value');
      expect(result).toEqual(undefined);
    });
  });

  describe('getDestinationPayloadDetails ', () => {
    const testDetails: AkamaiObjectStorageDetailsExtended = {
      path: 'testpath',
      access_key_id: 'keyId',
      access_key_secret: 'secret',
      bucket_name: 'name',
      host: 'host',
    };

    it('should return payload details with path', () => {
      const result = getDestinationPayloadDetails(
        testDetails
      ) as AkamaiObjectStorageDetailsPayload;

      expect(result.path).toEqual(testDetails.path);
    });

    it('should return details without path property', () => {
      const result = getDestinationPayloadDetails({
        ...testDetails,
        path: '',
      }) as AkamaiObjectStorageDetailsPayload;

      expect(result.path).toEqual(undefined);
    });
  });
});
