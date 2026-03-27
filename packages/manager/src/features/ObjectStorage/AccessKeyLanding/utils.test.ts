import {
  generateUpdatePayload,
  hasAccessBeenSelectedForAllBuckets,
  hasLabelOrRegionsChanged,
} from './utils';

import type { DisplayedAccessKeyScope, FormState } from './OMC_AccessKeyDrawer';
import type { ObjectStorageKey } from '@linode/api-v4/lib/object-storage';

describe('generateUpdatePayload', () => {
  const initialValues: FormState = {
    bucket_access: [],
    label: 'initialLabel',
    regions: ['region1', 'region2'],
  };

  it('should return empty object if no changes', () => {
    const updatedValues = { ...initialValues };
    expect(generateUpdatePayload(updatedValues, initialValues)).toEqual({});
  });

  it('should return updated label if only label changed', () => {
    const updatedValues = { ...initialValues, label: 'newLabel' };
    expect(generateUpdatePayload(updatedValues, initialValues)).toEqual({
      label: 'newLabel',
    });
  });

  it('should return updated regions if only regions changed', () => {
    const updatedValues = { ...initialValues, regions: ['region3', 'region4'] };
    expect(generateUpdatePayload(updatedValues, initialValues)).toEqual({
      regions: ['region3', 'region4'],
    });
  });

  it('should return updated label and regions if both changed', () => {
    const updatedValues = {
      bucket_access: [],
      label: 'newLabel',
      regions: ['region3', 'region4'],
    };
    expect(generateUpdatePayload(updatedValues, initialValues)).toEqual({
      label: 'newLabel',
      regions: ['region3', 'region4'],
    });
  });
});

describe('hasLabelOrRegionsChanged', () => {
  const updatedValues: FormState = {
    bucket_access: [],
    label: 'initialLabel',
    regions: ['region3', 'region4'],
  };
  const initialValues: ObjectStorageKey = {
    access_key: '',
    bucket_access: null,
    id: 0,
    label: updatedValues.label,
    limited: false,
    regions: [
      { id: 'region3', s3_endpoint: '' },
      { id: 'region4', s3_endpoint: '' },
    ],

    secret_key: '',
  };

  it('returns false when both label and regions are unchanged', () => {
    expect(hasLabelOrRegionsChanged(updatedValues, initialValues)).toBe(false);
  });

  it('returns true when only the label has changed', () => {
    expect(
      hasLabelOrRegionsChanged(
        { ...updatedValues, label: 'newLabel' },
        initialValues
      )
    ).toBe(true);
  });

  it('returns true when only the regions have changed', () => {
    expect(
      hasLabelOrRegionsChanged(
        {
          ...updatedValues,
          regions: ['region5'],
        },
        initialValues
      )
    ).toBe(true);
  });

  it('returns true when both label and regions have changed', () => {
    expect(
      hasLabelOrRegionsChanged(
        { ...updatedValues, label: 'newLabel', regions: ['region5'] },
        initialValues
      )
    ).toBe(true);
  });
});

describe('hasAccessBeenSelectedForAllBuckets', () => {
  const bucketWithoutAccessSelected: DisplayedAccessKeyScope = {
    bucket_name: 'obj-bucket-1',
    cluster: 'us-lax-1',
    permissions: null,
    region: 'us-lax',
  };

  const bucketWithAccessSelected: DisplayedAccessKeyScope = {
    bucket_name: 'obj-bucket-1',
    cluster: 'us-lax-1',
    permissions: 'read_only',
    region: 'us-lax',
  };

  it('returns false if any buckets have permission set to null', () => {
    const bucket_access = [
      bucketWithAccessSelected,
      bucketWithoutAccessSelected,
    ];
    expect(hasAccessBeenSelectedForAllBuckets(bucket_access)).toBe(false);
  });

  it('returns true if all buckets have permission set to a value other than null', () => {
    const bucket_access = [bucketWithAccessSelected, bucketWithAccessSelected];
    expect(hasAccessBeenSelectedForAllBuckets(bucket_access)).toBe(true);
  });

  it('returns true if buckets are null', () => {
    const bucket_access = null;
    expect(hasAccessBeenSelectedForAllBuckets(bucket_access)).toBe(true);
  });

  it('returns true if there are no buckets', () => {
    const bucket_access: DisplayedAccessKeyScope[] = [];
    expect(hasAccessBeenSelectedForAllBuckets(bucket_access)).toBe(true);
  });
});
