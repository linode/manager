import { volumesQuotaService } from './quotaServices';

import type { VolumesQuota } from '@linode/api-v4';

const createMockVolumesQuota = (
  overrides: Partial<VolumesQuota> = {}
): VolumesQuota => ({
  description: 'Test description',
  quota_id: 'test-quota-id',
  quota_limit: 100,
  quota_name: 'Test Quota',
  quota_type: 'vol-volumes',
  region: null,
  resource_metric: 'volume',
  scope: 'global',
  has_usage: true,
  ...overrides,
});

describe('volumesQuotaService', () => {
  describe('transformFunction', () => {
    const globalTransform =
      volumesQuotaService.scopes.global!.transformFunction!;
    const regionTransform =
      volumesQuotaService.scopes.region!.transformFunction!;

    describe('global scope', () => {
      it('transforms global vol-attachments to "Global Attachment Count"', () => {
        const quota = createMockVolumesQuota({
          quota_type: 'vol-attachments',
          scope: 'global',
          quota_name: 'Block Storage Attachment Limit',
        });

        const result = globalTransform(quota);

        expect(result.quota_name).toBe('Global Attachment Count');
      });

      it('transforms global vol-capacity to "Global Storage Capacity"', () => {
        const quota = createMockVolumesQuota({
          quota_type: 'vol-capacity',
          scope: 'global',
          quota_name: 'Block Storage Capacity',
          resource_metric: 'gigabyte',
        });

        const result = globalTransform(quota);

        expect(result.quota_name).toBe('Global Storage Capacity');
      });

      it('transforms global vol-volumes to "Global Volume Count"', () => {
        const quota = createMockVolumesQuota({
          quota_type: 'vol-volumes',
          scope: 'global',
          quota_name: 'Block Storage Volume Count',
        });

        const result = globalTransform(quota);

        expect(result.quota_name).toBe('Global Volume Count');
      });
    });

    describe('region scope', () => {
      it('transforms regional vol-attachments to "Regional Attachment Count"', () => {
        const quota = createMockVolumesQuota({
          quota_type: 'vol-attachments',
          scope: 'region',
          region: 'us-east',
          quota_name: 'Block Storage Attachment Limit',
        });

        const result = regionTransform(quota);

        expect(result.quota_name).toBe('Regional Attachment Count');
      });

      it('transforms regional vol-capacity to "Regional Storage Capacity"', () => {
        const quota = createMockVolumesQuota({
          quota_type: 'vol-capacity',
          scope: 'region',
          region: 'us-east',
          quota_name: 'Block Storage Capacity',
          resource_metric: 'gigabyte',
        });

        const result = regionTransform(quota);

        expect(result.quota_name).toBe('Regional Storage Capacity');
      });

      it('transforms regional vol-volumes to "Regional Volume Count"', () => {
        const quota = createMockVolumesQuota({
          quota_type: 'vol-volumes',
          scope: 'region',
          region: 'us-east',
          quota_name: 'Block Storage Volume Count',
        });

        const result = regionTransform(quota);

        expect(result.quota_name).toBe('Regional Volume Count');
      });
    });

    describe('fallback behavior for unexpected quota names', () => {
      it('handles unexpected global scope quota by prefixing with "Global"', () => {
        const quota = createMockVolumesQuota({
          quota_type: 'vol-volumes' as VolumesQuota['quota_type'],
          scope: 'global',
          quota_name: 'Some Unexpected Quota Name',
        });

        const unexpectedQuota = {
          ...quota,
          quota_type: 'vol-unknown' as VolumesQuota['quota_type'],
        };

        const result = globalTransform(unexpectedQuota);

        expect(result.quota_name).toBe('Global Some Unexpected Quota Name');
      });

      it('handles unexpected regional scope quota by prefixing with "Regional"', () => {
        const quota = createMockVolumesQuota({
          quota_type: 'vol-volumes' as VolumesQuota['quota_type'],
          scope: 'region',
          region: 'us-east',
          quota_name: 'Some Unexpected Quota Name',
        });

        const unexpectedQuota = {
          ...quota,
          quota_type: 'vol-unknown' as VolumesQuota['quota_type'],
        };

        const result = regionTransform(unexpectedQuota);

        expect(result.quota_name).toBe('Regional Some Unexpected Quota Name');
      });

      it('removes "Block Storage " prefix from fallback names', () => {
        const quota = createMockVolumesQuota({
          quota_type: 'vol-unknown' as VolumesQuota['quota_type'],
          scope: 'global',
          quota_name: 'Block Storage New Feature Limit',
        });

        const result = globalTransform(quota);

        expect(result.quota_name).toBe('Global New Feature Limit');
      });

      it('removes existing "Global " prefix from fallback names to avoid duplication', () => {
        const quota = createMockVolumesQuota({
          quota_type: 'vol-unknown' as VolumesQuota['quota_type'],
          scope: 'global',
          quota_name: 'Global Something',
        });

        const result = globalTransform(quota);

        expect(result.quota_name).toBe('Global Something');
      });

      it('removes existing "Regional " prefix from fallback names to avoid duplication', () => {
        const quota = createMockVolumesQuota({
          quota_type: 'vol-unknown' as VolumesQuota['quota_type'],
          scope: 'region',
          region: 'us-east',
          quota_name: 'Regional Something',
        });

        const result = regionTransform(quota);

        expect(result.quota_name).toBe('Regional Something');
      });
    });

    describe('preserves other quota properties', () => {
      it('does not modify other properties of the quota object', () => {
        const quota = createMockVolumesQuota({
          description: 'Original description',
          quota_id: 'original-id',
          quota_limit: 200,
          quota_type: 'vol-volumes',
          scope: 'global',
          resource_metric: 'volume',
          has_usage: true,
        });

        const result = globalTransform!(quota);

        expect(result.description).toBe('Original description');
        expect(result.quota_id).toBe('original-id');
        expect(result.quota_limit).toBe(200);
        expect(result.quota_type).toBe('vol-volumes');
        expect(result.scope).toBe('global');
        expect(result.resource_metric).toBe('volume');
        expect(result.has_usage).toBe(true);
      });
    });
  });
});
