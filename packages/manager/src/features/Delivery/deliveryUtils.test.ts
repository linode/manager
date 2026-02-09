import {
  authenticationType,
  contentType,
  destinationType,
  streamType,
} from '@linode/api-v4';
import { expect } from 'vitest';

import {
  getAuthenticationTypeOption,
  getContentTypeOption,
  getDestinationPayloadDetails,
  getDestinationTypeOption,
  getStreamTypeOption,
} from 'src/features/Delivery/deliveryUtils';
import {
  authenticationTypeOptions,
  contentTypeOptions,
  destinationTypeOptions,
  streamTypeOptions,
} from 'src/features/Delivery/Shared/types';

import type {
  AkamaiObjectStorageDetailsExtended,
  AkamaiObjectStorageDetailsPayload,
  CustomHTTPSDetails,
} from '@linode/api-v4';

describe('delivery utils functions', () => {
  describe('getDestinationTypeOption ', () => {
    it('should return option for CustomHttps', () => {
      const result = getDestinationTypeOption(destinationType.CustomHttps);
      expect(result).toEqual(destinationTypeOptions[0]);
    });
    it('should return option option for AkamaiObjectStorage', () => {
      const result = getDestinationTypeOption(
        destinationType.AkamaiObjectStorage
      );
      expect(result).toEqual(destinationTypeOptions[1]);
    });

    it('should return undefined when no option is a match', () => {
      const result = getDestinationTypeOption('invalid');
      expect(result).toBeUndefined();
    });
  });

  describe('getStreamTypeOption', () => {
    it('should return option for AuditLogs', () => {
      const result = getStreamTypeOption(streamType.AuditLogs);
      expect(result).toEqual(streamTypeOptions[0]);
    });

    it('should return option for LKEAuditLogs', () => {
      const result = getStreamTypeOption(streamType.LKEAuditLogs);
      expect(result).toEqual(streamTypeOptions[1]);
    });

    it('should return undefined when no option is a match', () => {
      const result = getStreamTypeOption('invalid');
      expect(result).toBeUndefined();
    });
  });

  describe('getAuthenticationTypeOption', () => {
    it('should return option for basic authentication', () => {
      const result = getAuthenticationTypeOption(authenticationType.Basic);
      expect(result).toEqual(authenticationTypeOptions[0]);
    });

    it('should return option for none authentication', () => {
      const result = getAuthenticationTypeOption(authenticationType.None);
      expect(result).toEqual(authenticationTypeOptions[1]);
    });

    it('should return undefined when no option is a match', () => {
      const result = getAuthenticationTypeOption('invalid');
      expect(result).toBeUndefined();
    });
  });

  describe('getContentTypeOption', () => {
    it('should return option for application/json', () => {
      const result = getContentTypeOption(contentType.Json);
      expect(result).toEqual(contentTypeOptions[0]);
    });

    it('should return option for application/json; charset=utf-8', () => {
      const result = getContentTypeOption(contentType.JsonUtf8);
      expect(result).toEqual(contentTypeOptions[1]);
    });

    it('should return undefined when no option is a match', () => {
      const result = getContentTypeOption('invalid');
      expect(result).toBeUndefined();
    });
  });

  describe('given getDestinationPayloadDetails ', () => {
    describe('and AkamaiObjectStorage destination type ', () => {
      const baseAkamaiObjectStorageDetails: AkamaiObjectStorageDetailsExtended =
        {
          path: 'testpath',
          access_key_id: 'keyId',
          access_key_secret: 'secret',
          bucket_name: 'name',
          host: 'host',
        };

      it('should return payload details with path', () => {
        const result = getDestinationPayloadDetails(
          baseAkamaiObjectStorageDetails,
          destinationType.AkamaiObjectStorage
        ) as AkamaiObjectStorageDetailsPayload;

        expect(result.path).toEqual(baseAkamaiObjectStorageDetails.path);
      });

      it('should return details without path property', () => {
        const result = getDestinationPayloadDetails(
          {
            ...baseAkamaiObjectStorageDetails,
            path: '',
          },
          destinationType.AkamaiObjectStorage
        ) as AkamaiObjectStorageDetailsPayload;

        expect(result.path).toEqual(undefined);
      });
    });

    describe('and CustomHttps destination type', () => {
      const baseCustomHTTPSDetails: CustomHTTPSDetails = {
        authentication: {
          type: 'none',
        },
        data_compression: 'gzip',
        endpoint_url: 'https://example.com',
      };

      it('should return details unchanged when all optional fields are populated', () => {
        const details: CustomHTTPSDetails = {
          ...baseCustomHTTPSDetails,
          content_type: 'application/json',
          client_certificate_details: {
            client_ca_certificate: 'cert',
            client_certificate: 'cert',
            client_private_key: 'key',
            tls_hostname: 'hostname',
          },
        };

        const result = getDestinationPayloadDetails(
          details,
          destinationType.CustomHttps
        );

        expect(result).toEqual(details);
      });

      it('should omit content_type when it is null', () => {
        const details: CustomHTTPSDetails = {
          ...baseCustomHTTPSDetails,
          content_type: null,
        };

        const result = getDestinationPayloadDetails(
          details,
          destinationType.CustomHttps
        ) as CustomHTTPSDetails;

        expect(result.content_type).toBeUndefined();
      });

      it('should omit client_certificate_details when all its properties are empty strings', () => {
        const details: CustomHTTPSDetails = {
          ...baseCustomHTTPSDetails,
          client_certificate_details: {
            client_ca_certificate: '',
            client_certificate: '',
            client_private_key: '',
            tls_hostname: '',
          },
        };

        const result = getDestinationPayloadDetails(
          details,
          destinationType.CustomHttps
        ) as CustomHTTPSDetails;

        expect(result.client_certificate_details).toBeUndefined();
      });

      it('should omit client_certificate_details when all its properties are not defined', () => {
        const details: CustomHTTPSDetails = {
          ...baseCustomHTTPSDetails,
          client_certificate_details: {},
        };

        const result = getDestinationPayloadDetails(
          details,
          destinationType.CustomHttps
        ) as CustomHTTPSDetails;

        expect(result.client_certificate_details).toBeUndefined();
      });

      it('should omit client_certificate_details when any of its properties is empty', () => {
        const details: CustomHTTPSDetails = {
          ...baseCustomHTTPSDetails,
          client_certificate_details: {
            client_ca_certificate: 'some-cert',
            client_certificate: '',
            client_private_key: 'key',
            tls_hostname: 'hostname',
          },
        };

        const result = getDestinationPayloadDetails(
          details,
          destinationType.CustomHttps
        ) as CustomHTTPSDetails;

        expect(result.client_certificate_details).toBeUndefined();
      });

      it('should keep client_certificate_details when all properties have values', () => {
        const details: CustomHTTPSDetails = {
          ...baseCustomHTTPSDetails,
          client_certificate_details: {
            client_ca_certificate: 'ca-cert',
            client_certificate: 'cert',
            client_private_key: 'key',
            tls_hostname: 'hostname',
          },
        };

        const result = getDestinationPayloadDetails(
          details,
          destinationType.CustomHttps
        ) as CustomHTTPSDetails;

        expect(result.client_certificate_details).toBeDefined();
        expect(result.client_certificate_details).toEqual(
          details.client_certificate_details
        );
      });

      it('should omit both content_type and client_certificate_details when both are empty', () => {
        const details: CustomHTTPSDetails = {
          ...baseCustomHTTPSDetails,
          content_type: null,
          client_certificate_details: {
            client_ca_certificate: '',
            client_certificate: '',
            client_private_key: '',
            tls_hostname: '',
          },
        };

        const result = getDestinationPayloadDetails(
          details,
          destinationType.CustomHttps
        ) as CustomHTTPSDetails;

        expect(result.content_type).toBeUndefined();
        expect(result.client_certificate_details).toBeUndefined();
      });
    });
  });
});
